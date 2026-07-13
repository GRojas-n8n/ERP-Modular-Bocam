/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Evaluación Económica de Gerencia Técnica por Proveedor
 * Spec:  openspec/changes/evaluacion-economica-gt-por-proveedor/
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (EventBus falla silenciosamente)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) => res.json({ success: true, data: { tiene_suficiencia: true } }));
  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function patch(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function put(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Cuadro EN_APROBACION_GT con 3 proveedores cotizando el mismo renglón (misma insumo_id). */
async function seedCuadroTresProveedores(tenantIdOverride?: string) {
  const tenantId = tenantIdOverride ?? randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const insumoId = randomUUID();

  const proveedores = await Promise.all([1, 2, 3].map(n => prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-GT3-${n}-${Date.now().toString().slice(-6)}`,
      razon_social: `Proveedor GT3 Test ${n}`,
      estatus: 'ACTIVO',
    },
  })));

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-GT3-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'EN_APROBACION_GT',
      revision: 'A',
      evaluacion_residente_id: userId,
      fecha_evaluacion_tecnica: new Date(),
      firmado_por: userId,
      fecha_firma: new Date(),
      veredicto_residente: 'Los 3 proveedores cumplen técnicamente.',
      primera_opcion_proveedor_id: proveedores[0].id_proveedor,
    },
  });

  const detalles = await Promise.all(proveedores.map((p, i) => prisma.comparativaDetalle.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      cuadro_id: cuadro.id_cuadro,
      proveedor_id: p.id_proveedor,
      insumo_id: insumoId,
      precio_ofertado: `${1000 + i * 100}.0000`,
      es_ganador: i === 0,
      evaluacion_tecnica: 'C',
      comentario_tecnico: 'Cumple especificación.',
    },
  })));

  return { tenantId, proyectoId, userId, cuadroId: cuadro.id_cuadro, proveedores, detalles };
}

// ── Test: evaluar-gt guarda por proveedor sin finalizar ─────────────────────

async function testEvaluarGtGuardaPorProveedorSinFinalizar() {
  const seeded = await seedCuadroTresProveedores();
  try {
    const tokenGT = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'] });

    const r = await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`, tokenGT, {
      evaluaciones: [
        { detalle_id: seeded.detalles[0].id_detalle, aprobacion_gt: 'C', comentario_gt: 'Mejor precio.' },
        { detalle_id: seeded.detalles[1].id_detalle, aprobacion_gt: 'NC', comentario_gt: 'Precio elevado.' },
      ],
    });
    assert.equal(r.status, 200, 'evaluar-gt debe retornar 200');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'EN_APROBACION_GT', 'El cuadro no debe finalizar al guardar evaluaciones');

    const detalle3 = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: seeded.detalles[2].id_detalle } });
    assert.equal(detalle3?.aprobacion_gt, 'PENDIENTE', 'El tercer proveedor (no enviado) debe seguir PENDIENTE');

    console.log('ok - evaluar-gt guarda evaluaciones por proveedor sin finalizar el cuadro');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test: revisar-gt exige evaluar a todos los proveedores ──────────────────

async function testRevisarGtExigeTodosEvaluados() {
  const seeded = await seedCuadroTresProveedores();
  try {
    const tokenGT = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'] });

    // Solo evalúa 2 de 3 proveedores
    await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`, tokenGT, {
      evaluaciones: [
        { detalle_id: seeded.detalles[0].id_detalle, aprobacion_gt: 'C', comentario_gt: 'OK' },
        { detalle_id: seeded.detalles[1].id_detalle, aprobacion_gt: 'NC', comentario_gt: 'No.' },
      ],
    });

    const r = await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/revisar-gt`, tokenGT, {});
    assert.equal(r.status, 400, 'revisar-gt debe rechazar con 400 si falta evaluar un proveedor');
    const body = (await r.json()) as any;
    assert.ok(body.message.includes('1'), `El mensaje debe indicar cuántos faltan. Mensaje: "${body.message}"`);

    const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: seeded.cuadroId } });
    assert.equal(cuadro?.estado, 'EN_APROBACION_GT', 'El cuadro debe permanecer en EN_APROBACION_GT');

    console.log('ok - revisar-gt exige evaluar a todos los proveedores antes de finalizar');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test: "?" de GT crea revisión que hereda evaluación técnica ─────────────

async function testRevisionConPreguntasGtHeredaEvaluacionTecnica() {
  const seeded = await seedCuadroTresProveedores();
  try {
    const tokenGT = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'] });

    const r = await post(`/api/v1/compras/comparativas/${seeded.cuadroId}/revision-con-preguntas-gt`, tokenGT, {
      evaluaciones: [
        { detalle_id: seeded.detalles[0].id_detalle, aprobacion_gt: 'C', comentario_gt: 'Aprobado.' },
        { detalle_id: seeded.detalles[1].id_detalle, aprobacion_gt: '?', pregunta_gt: '¿Puede sostener este precio con entrega en 15 días?' },
      ],
    });
    assert.equal(r.status, 201, 'revision-con-preguntas-gt debe retornar 201');
    const body = (await r.json()) as any;
    assert.equal(body.data.revision_label, 'B', 'La nueva revisión debe ser B (siguiente letra tras A)');

    const nuevoCuadro = await prisma.cuadroComparativo.findUnique({
      where: { id_cuadro: body.data.nueva_revision_id },
      include: { detalles: { orderBy: { precio_ofertado: 'asc' } } },
    });
    assert.equal(nuevoCuadro?.estado, 'EN_APROBACION_GT', 'El cuadro nuevo SHALL nacer en EN_APROBACION_GT, no BORRADOR');
    assert.equal(nuevoCuadro?.revision_padre_id, seeded.cuadroId, 'Debe referenciar al cuadro original');

    // La evaluación técnica (C) se conserva tal cual — NO se reinicia a PENDIENTE
    for (const d of nuevoCuadro!.detalles) {
      assert.equal(d.evaluacion_tecnica, 'C', `evaluacion_tecnica debe conservarse como C, no PENDIENTE (detalle ${d.id_detalle})`);
    }

    // aprobacion_gt sí se reinicia a PENDIENTE, pero el "?" hereda su pregunta_gt
    const detalleConPregunta = nuevoCuadro!.detalles.find(d => d.proveedor_id === seeded.proveedores[1].id_proveedor);
    assert.equal(detalleConPregunta?.aprobacion_gt, 'PENDIENTE', 'aprobacion_gt debe reiniciarse a PENDIENTE en la revisión nueva');
    assert.equal(detalleConPregunta?.pregunta_gt, '¿Puede sostener este precio con entrega en 15 días?', 'pregunta_gt debe heredarse en la revisión nueva');

    // El cuadro original queda en REVISION_SOLICITADA
    const original = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: seeded.cuadroId } });
    assert.equal(original?.estado, 'REVISION_SOLICITADA', 'El cuadro original debe pasar a REVISION_SOLICITADA');

    // Preservó firma/veredicto/selección del Residente
    assert.equal(nuevoCuadro?.firmado_por, seeded.userId, 'Debe heredar firmado_por del original');
    assert.equal(nuevoCuadro?.primera_opcion_proveedor_id, seeded.proveedores[0].id_proveedor, 'Debe heredar la selección de proveedor del Residente');

    console.log('ok - revision-con-preguntas-gt crea revisión que hereda evaluación técnica y nace en EN_APROBACION_GT');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test: responder-preguntas-gt ─────────────────────────────────────────────

async function testResponderPreguntasGt() {
  const seeded = await seedCuadroTresProveedores();
  try {
    const tokenGT = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'] });
    const tokenProcurement = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const rRevision = await post(`/api/v1/compras/comparativas/${seeded.cuadroId}/revision-con-preguntas-gt`, tokenGT, {
      evaluaciones: [
        { detalle_id: seeded.detalles[0].id_detalle, aprobacion_gt: '?', pregunta_gt: '¿Puede bajar el precio?' },
      ],
    });
    const nuevaRevisionId = (await rRevision.json() as any).data.nueva_revision_id;

    const nuevoDetalle = await prisma.comparativaDetalle.findFirst({
      where: { cuadro_id: nuevaRevisionId, proveedor_id: seeded.proveedores[0].id_proveedor },
    });

    const r = await put(`/api/v1/compras/comparativas/${nuevaRevisionId}/responder-preguntas-gt`, tokenProcurement, {
      respuestas: [{ detalle_id: nuevoDetalle!.id_detalle, respuesta_gt: 'Sí, puede bajar 5%.' }],
    });
    assert.equal(r.status, 200, 'responder-preguntas-gt debe retornar 200');

    const actualizado = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: nuevoDetalle!.id_detalle } });
    assert.equal(actualizado?.respuesta_gt, 'Sí, puede bajar 5%.', 'respuesta_gt debe guardarse');

    console.log('ok - responder-preguntas-gt guarda la respuesta de Compras a la pregunta de GT');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testEvaluarGtGuardaPorProveedorSinFinalizar();
    await testRevisarGtExigeTodosEvaluados();
    await testRevisionConPreguntasGtHeredaEvaluacionTecnica();
    await testResponderPreguntasGt();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - evaluacion-economica-gt-por-proveedor integration tests');
  console.error(error);
  process.exitCode = 1;
});
