/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: selección automática de proveedor ganador al aprobar
 * GT + generación de Orden de Compra para renglones de texto libre (imprevisto)
 * Spec:  openspec/changes/generar-oc-imprevisto-y-ganador-automatico/
 * Tarea: 1.2 y 1.3 del tasks.md — escritos ANTES del fix, primero en rojo.
 *
 * Bug real de producción reproducido aquí: `es_ganador` nunca se marcaba en la
 * práctica (dependía de un clic manual en la tabla de precios, ya bloqueada al
 * llegar a APROBADO_GT), y `convertir-oc` excluía cualquier renglón sin
 * insumo_id (texto libre/imprevisto) — ambos bloqueaban por completo la
 * generación de la OC para el caso real reportado por el usuario.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env), migración
 * imprevisto_oc_y_ganador_automatico aplicada.
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
  'postgresql://postgres:bocam_dev_password@127.0.0.1:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let gtServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) => res.json({ success: true, data: { tiene_suficiencia: true } }));
  finanzasStub.post('/api/v1/finanzas/comprometer-fondos', (_req, res) => res.json({ success: true, data: { status: 'COMPROMETIDO' } }));
  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const gtStub = express();
  gtStub.use(express.json());
  gtStub.get('/api/v1/gerencia-tecnica/partidas/:id/saldo', (_req, res) => res.json({ success: true, data: { monto_disponible: 999999, estado_tope: 'NORMAL', bloqueo_automatico: false } }));
  gtStub.post('/api/v1/gerencia-tecnica/partidas/:id/comprometer', (_req, res) => res.json({ success: true }));
  const gtStarted = await startHttpApp(gtStub);
  gtServer = gtStarted.server;
  process.env.GT_URL = `${gtStarted.baseUrl}/api/v1/gerencia-tecnica`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
  await stopHttpApp(gtServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

function patch(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function post(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Requisición imprevisto (texto libre) + Cuadro EN_APROBACION_GT con 2 proveedores
 *  cotizando el mismo renglón (sin insumo_id, con detalle_req_id) — mismo patrón que el
 *  cuadro real de producción que reportó el bug. */
async function seedCuadroTextoLibre() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const req = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `REQ-GANADOR-${Date.now().toString().slice(-6)}`,
      solicitante_id: userId,
      estado: 'COMPRADA', // no relevante para este test, no se verifica aquí
      tipo: 'NORMAL',
    },
  });

  const item = await prisma.requisicionItem.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: req.id_requisicion,
      cantidad: '3.0000',
      es_imprevisto: true,
      descripcion_libre: 'Bomba centrífuga imprevisto',
      unidad_libre: 'PZA',
    },
  });

  const [provA, provB] = await Promise.all([1, 2].map(n => prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFCGAN${n}${Date.now().toString().slice(-6)}`,
      razon_social: `Proveedor Ganador Test ${n}`,
      estatus: 'ACTIVO',
    },
  })));

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: req.id_requisicion,
      codigo: `CC-GANADOR-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'EN_APROBACION_GT',
      primera_opcion_proveedor_id: provA.id_proveedor,
      veredicto_residente: 'Proveedor A recomendado.',
    },
  });

  const [detalleA, detalleB] = await Promise.all([
    prisma.comparativaDetalle.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro,
        proveedor_id: provA.id_proveedor, detalle_req_id: item.id_item,
        precio_ofertado: '3000.0000', evaluacion_tecnica: 'C',
      },
    }),
    prisma.comparativaDetalle.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro,
        proveedor_id: provB.id_proveedor, detalle_req_id: item.id_item,
        precio_ofertado: '2800.0000', evaluacion_tecnica: 'C',
      },
    }),
  ]);

  return { tenantId, proyectoId, userId, cuadroId: cuadro.id_cuadro, reqId: req.id_requisicion, provA, provB, detalleA, detalleB };
}

// ── Test 1.2: revisar-gt marca es_ganador automáticamente (primera opción aprobada) ──

async function testGanadorAutomaticoPrimeraOpcionAprobada() {
  const seeded = await seedCuadroTextoLibre();
  try {
    const tokenGT = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'] });

    // Ambos proveedores aprobados económicamente (C) — primera opción (provA) debe ganar.
    const rEval = await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`, tokenGT, {
      evaluaciones: [
        { detalle_id: seeded.detalleA.id_detalle, aprobacion_gt: 'C', comentario_gt: 'Recomendado por Residente, precio razonable.' },
        { detalle_id: seeded.detalleB.id_detalle, aprobacion_gt: 'C', comentario_gt: 'También cumple.' },
      ],
    });
    assert.equal(rEval.status, 200);

    const rFinal = await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/revisar-gt`, tokenGT, {});
    assert.equal(rFinal.status, 200, 'revisar-gt debe finalizar correctamente');
    const body = (await rFinal.json()) as any;
    assert.equal(body.data.estado, 'APROBADO_GT');

    const detalleA = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: seeded.detalleA.id_detalle } });
    const detalleB = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: seeded.detalleB.id_detalle } });
    assert.equal(detalleA?.es_ganador, true, 'La primera opción (provA) debe marcarse como ganadora automáticamente');
    assert.equal(detalleB?.es_ganador, false, 'El otro proveedor no debe quedar marcado como ganador');

    console.log('ok - revisar-gt marca es_ganador automáticamente en la primera opción aprobada, sin clic manual');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.2: primera opción rechazada económicamente, segunda opción no aplica -> menor precio ──

async function testGanadorAutomaticoDesempatePorPrecio() {
  const seeded = await seedCuadroTextoLibre();
  try {
    const tokenGT = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'] });

    // Primera opción (provA, $3000) rechazada económicamente; provB ($2800) aprobado.
    await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`, tokenGT, {
      evaluaciones: [
        { detalle_id: seeded.detalleA.id_detalle, aprobacion_gt: 'NC', comentario_gt: 'Precio elevado, se rechaza.' },
        { detalle_id: seeded.detalleB.id_detalle, aprobacion_gt: 'C', comentario_gt: 'Mejor precio, se aprueba.' },
      ],
    });
    const rFinal = await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/revisar-gt`, tokenGT, {});
    assert.equal(rFinal.status, 200);

    const detalleA = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: seeded.detalleA.id_detalle } });
    const detalleB = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: seeded.detalleB.id_detalle } });
    assert.equal(detalleA?.es_ganador, false, 'La primera opción rechazada económicamente no debe ganar');
    assert.equal(detalleB?.es_ganador, true, 'El único proveedor aprobado debe ganar');

    console.log('ok - revisar-gt cae a menor precio entre aprobados cuando la primera opción es rechazada económicamente');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.3: convertir-oc genera la OC para un renglón de texto libre (imprevisto) ──

async function testConvertirOcRenglonTextoLibre() {
  const seeded = await seedCuadroTextoLibre();
  try {
    const tokenGT = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'] });
    await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`, tokenGT, {
      evaluaciones: [
        { detalle_id: seeded.detalleA.id_detalle, aprobacion_gt: 'C', comentario_gt: 'Aprobado.' },
        { detalle_id: seeded.detalleB.id_detalle, aprobacion_gt: 'NC', comentario_gt: 'Rechazado.' },
      ],
    });
    await patch(`/api/v1/compras/comparativas/${seeded.cuadroId}/revisar-gt`, tokenGT, {});

    const tokenProc = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const rConvert = await post(`/api/v1/compras/comparativas/${seeded.cuadroId}/convertir-oc`, tokenProc, { presupuesto_id: randomUUID() });
    const bodyConvert = (await rConvert.json()) as any;
    assert.equal(rConvert.status, 201, `convertir-oc debe retornar 201, obtuvo ${rConvert.status}: ${JSON.stringify(bodyConvert)}`);

    const orden = await prisma.ordenCompra.findFirst({ where: { tenant_id: seeded.tenantId, proveedor_id: seeded.provA.id_proveedor } });
    assert.ok(orden, 'Debe existir una OrdenCompra para el proveedor ganador (texto libre)');
    assert.equal(orden!.estado, 'EMITIDA');

    const items = await prisma.ordenCompraItem.findMany({ where: { orden_id: orden!.id_orden } });
    assert.equal(items.length, 1, 'Debe existir 1 item de OC para el renglón de texto libre');
    assert.equal(items[0].insumo_id, null, 'insumo_id debe ser null para el item de texto libre');
    assert.equal(items[0].detalle_req_id, seeded.detalleA.detalle_req_id ?? undefined, 'detalle_req_id debe vincular al RequisicionItem real');
    assert.equal(items[0].descripcion_libre, 'Bomba centrífuga imprevisto');
    assert.equal(items[0].unidad_libre, 'PZA');
    assert.equal(Number(items[0].cantidad), 3, 'La cantidad debe venir de la Requisición real, no un default');

    console.log('ok - convertir-oc genera la OC correctamente para un renglón de texto libre (imprevisto)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testGanadorAutomaticoPrimeraOpcionAprobada();
    await testGanadorAutomaticoDesempatePorPrecio();
    await testConvertirOcRenglonTextoLibre();
  } finally {
    await teardown();
  }
}

void main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('not ok - ganador-automatico-y-oc-texto-libre integration tests');
    console.error(error);
    process.exit(1);
  });
