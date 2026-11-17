/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Ciclo de revisión por letra a nivel característica
 * Spec:  openspec/changes/evaluacion-tecnica-por-especificacion/specs/
 * Tareas: 5.1–5.3, 5.5 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env), migración
 *           20260711090000_add_evaluacion_especificacion aplicada
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
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
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.evaluacionEspecificacion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.especificacionDetalleReq.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadroConDuda() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoId = randomUUID();
  const detalleReqId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFC${Date.now()}`, razon_social: 'Proveedor Revision', estatus: 'ACTIVO' },
  });

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-REV-${Date.now()}`,
      estado: 'EN_EVALUACION_TECNICA',
      revision: 'A',
      lineas: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: insumoId, detalle_req_id: detalleReqId }] },
      detalles: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedor.id_proveedor, insumo_id: insumoId, precio_ofertado: '100.0000' }] },
    },
  });

  const espec = await prisma.especificacionDetalleReq.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, detalle_id: detalleReqId, descripcion: 'Resistencia mínima', orden: 0 },
  });

  await prisma.evaluacionEspecificacion.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro,
      especificacion_id: espec.id_especificacion, proveedor_id: proveedor.id_proveedor,
      evaluacion_tecnica: '?', pregunta_residente: '¿Cuál es la resistencia real certificada?', creado_por: randomUUID(),
    },
  });

  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro, especId: espec.id_especificacion, proveedorId: proveedor.id_proveedor };
}

// ── 5.1 + 5.3: crea revisión siguiente y clona las evaluaciones ────────────

async function testCreaRevisionYClona() {
  const s = await seedCuadroConDuda();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/revision-con-preguntas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 201);
    const body = (await response.json()) as any;
    assert.equal(body.data.revision_label, 'B');

    const original = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: s.cuadroId } });
    assert.equal(original?.estado, 'REVISION_SOLICITADA');

    const nuevoId = body.data.nueva_revision_id as string;
    const evalsClonadas = await prisma.evaluacionEspecificacion.findMany({ where: { cuadro_id: nuevoId } });
    assert.equal(evalsClonadas.length, 1, 'la evaluación por característica debe clonarse al cuadro nuevo');
    assert.equal(evalsClonadas[0].evaluacion_tecnica, 'PENDIENTE', 'se resetea a PENDIENTE');
    assert.equal(evalsClonadas[0].pregunta_residente, '¿Cuál es la resistencia real certificada?', 'hereda la pregunta');

    console.log('ok - 5.1/5.3: revision-con-preguntas crea revisión B y clona las evaluaciones por característica');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 5.2: sin ninguna característica en "?" -> 400 ───────────────────────────

async function testSinDudasNoCreaRevision() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const cuadro = await prisma.cuadroComparativo.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: randomUUID(), codigo: `CC-NODUDA-${Date.now()}`, estado: 'EN_EVALUACION_TECNICA' },
  });
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['residencia'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadro.id_cuadro}/revision-con-preguntas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 400);
    console.log('ok - 5.2: sin ninguna característica en "?" -> 400, no crea revisión');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 5.5: responder-preguntas persiste en la característica exacta ──────────

async function testResponderPreguntaPorCaracteristica() {
  const s = await seedCuadroConDuda();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });

    const crearRevision = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/revision-con-preguntas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const { data } = (await crearRevision.json()) as any;
    const nuevoId = data.nueva_revision_id as string;

    const tokenCompras = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['procurement'] });
    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${nuevoId}/responder-preguntas`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenCompras}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuestas_especificacion: [{ especificacion_id: s.especId, proveedor_id: s.proveedorId, respuesta_compras: 'El proveedor confirmó 300 kg/cm².' }] }),
    });

    assert.equal(response.status, 200);
    const evalRespondida = await prisma.evaluacionEspecificacion.findFirst({ where: { cuadro_id: nuevoId, especificacion_id: s.especId, proveedor_id: s.proveedorId } });
    assert.equal(evalRespondida?.respuesta_compras, 'El proveedor confirmó 300 kg/cm².');

    console.log('ok - 5.5: responder-preguntas guarda la respuesta en la característica×proveedor exacta');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testCreaRevisionYClona();             // 5.1, 5.3
    await testSinDudasNoCreaRevision();          // 5.2
    await testResponderPreguntaPorCaracteristica(); // 5.5
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - revision-especificaciones integration tests');
  console.error(error);
  process.exitCode = 1;
});
