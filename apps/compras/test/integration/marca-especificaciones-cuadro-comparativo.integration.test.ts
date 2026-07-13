/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: marca/modelo y especificación de la requisición se
 * prepueblan en el Cuadro Comparativo al crearlo.
 * Spec:  openspec/changes/marca-especificaciones-cuadro-comparativo/specs/
 * Tareas: 1.1, 2.3, 2.4 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (EventBus falla silenciosamente)
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
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.especificacionDetalleReq.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedRequisicionConItem(overrides: {
  especificacion_marca_modelo?: string | null;
  especificacion_detalle?: string | null;
} = {}) {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const insumoId = randomUUID();

  const requisicion = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `REQ-SPEC-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      solicitante_id: userId,
      estado: 'APROBADA',
    },
  });

  await prisma.requisicionItem.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: requisicion.id_requisicion,
      insumo_id: insumoId,
      cantidad: 1,
      especificacion_marca_modelo: overrides.especificacion_marca_modelo ?? null,
      especificacion_detalle: overrides.especificacion_detalle ?? null,
    },
  });

  return { tenantId, proyectoId, userId, requisicionId: requisicion.id_requisicion, insumoId };
}

async function postComparativa(requisicionId: string, token: string) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requisicion_id: requisicionId }),
  });
}

// ── Test 1.1 / 2.3: marca y especificación de la requisición se prepueblan ──

async function testPrepoblaMarcaYEspecificacion() {
  const seeded = await seedRequisicionConItem({
    especificacion_marca_modelo: 'Mirage, United Appliances, Carrier o equivalente.',
    especificacion_detalle: 'Suministro e instalación integral, garantía mínima 10 años en compresor.',
  });
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const r = await postComparativa(seeded.requisicionId, token);
    assert.equal(r.status, 201, 'POST /comparativas debe retornar 201');

    const linea = await prisma.comparativaLinea.findFirst({
      where: { tenant_id: seeded.tenantId, insumo_id: seeded.insumoId },
    });
    assert.ok(linea, 'Debe existir una ComparativaLinea para el ítem');
    assert.equal(linea!.marca_modelo_ref, 'Mirage, United Appliances, Carrier o equivalente.');
    assert.equal(linea!.especificaciones_requeridas, 'Suministro e instalación integral, garantía mínima 10 años en compresor.');

    console.log('ok - 1.1/2.3 marca y especificación de la requisición se prepueblan en el cuadro');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 2.3: EspecificacionDetalleReq (estructurado) tiene prioridad sobre el ──
// texto libre de la requisición ──────────────────────────────────────────────

async function testEspecificacionEstructuradaTienePrioridad() {
  const seeded = await seedRequisicionConItem({
    especificacion_detalle: 'Texto libre de la requisición, no debe usarse.',
  });
  try {
    const item = await prisma.requisicionItem.findFirst({ where: { requisicion_id: seeded.requisicionId } });
    await prisma.especificacionDetalleReq.create({
      data: {
        tenant_id: seeded.tenantId,
        proyecto_id: seeded.proyectoId,
        detalle_id: item!.id_item,
        descripcion: 'Especificación estructurada 1',
        orden: 1,
      },
    });

    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const r = await postComparativa(seeded.requisicionId, token);
    assert.equal(r.status, 201);

    const linea = await prisma.comparativaLinea.findFirst({
      where: { tenant_id: seeded.tenantId, insumo_id: seeded.insumoId },
    });
    assert.ok(linea);
    assert.equal(linea!.especificaciones_requeridas, 'Especificación estructurada 1');

    console.log('ok - 2.3 EspecificacionDetalleReq tiene prioridad sobre el texto libre de la requisición');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 2.4: sin marca/especificación capturadas, ambos campos quedan null ──

async function testSinEspecificacionesQuedaNull() {
  const seeded = await seedRequisicionConItem();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const r = await postComparativa(seeded.requisicionId, token);
    assert.equal(r.status, 201);

    const linea = await prisma.comparativaLinea.findFirst({
      where: { tenant_id: seeded.tenantId, insumo_id: seeded.insumoId },
    });
    assert.ok(linea);
    assert.equal(linea!.marca_modelo_ref, null);
    assert.equal(linea!.especificaciones_requeridas, null);

    console.log('ok - 2.4 sin marca/especificación capturadas, ambos campos quedan null (sin regresión)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testPrepoblaMarcaYEspecificacion();
    await testEspecificacionEstructuradaTienePrioridad();
    await testSinEspecificacionesQuedaNull();
    console.log('\nTodos los tests pasaron.');
  } finally {
    await teardown();
  }
}

main().catch((err) => {
  console.error('FALLO:', err);
  process.exitCode = 1;
});
