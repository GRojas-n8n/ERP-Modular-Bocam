/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: el Residente puede corregir la especificación simple
 * (marca/modelo + detalle) de un ítem de Requisición después de crearla,
 * mientras la Requisición esté PENDIENTE o APROBADA — no una vez COMPRADA.
 * Spec: openspec/changes/simplificar-ux-requisicion-a-oc/specs/especificacion-tecnica-fuente-unica/
 * Tareas: 1.8, 1.9 del tasks.md
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
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

async function seed(estado: string) {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const requisicion = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `REQ-EDIT-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      solicitante_id: userId,
      estado,
    },
  });

  const item = await prisma.requisicionItem.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: requisicion.id_requisicion,
      insumo_id: randomUUID(),
      cantidad: 1,
      especificacion_marca_modelo: 'Original',
      especificacion_detalle: 'Original detalle',
    },
  });

  return { tenantId, proyectoId, userId, requisicionId: requisicion.id_requisicion, itemId: item.id_item };
}

async function putEspecificacionSimple(reqId: string, itemId: string, token: string, body: Record<string, unknown>) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/requisiciones/${reqId}/items/${itemId}/especificacion-simple`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function testAceptaEdicionEnPendiente() {
  const seeded = await seed('PENDIENTE');
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['residencia'] });
    const r = await putEspecificacionSimple(seeded.requisicionId, seeded.itemId, token, {
      especificacion_marca_modelo: 'Corregida',
      especificacion_detalle: 'Detalle corregido',
    });
    assert.equal(r.status, 200);
    const item = await prisma.requisicionItem.findUnique({ where: { id_item: seeded.itemId } });
    assert.equal(item!.especificacion_marca_modelo, 'Corregida');
    console.log('ok - 1.8 acepta edición con Requisición PENDIENTE');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function testAceptaEdicionEnAprobada() {
  const seeded = await seed('APROBADA');
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['residencia'] });
    const r = await putEspecificacionSimple(seeded.requisicionId, seeded.itemId, token, {
      especificacion_marca_modelo: 'Corregida tras aprobar',
      especificacion_detalle: 'Detalle corregido tras aprobar',
    });
    assert.equal(r.status, 200);
    const item = await prisma.requisicionItem.findUnique({ where: { id_item: seeded.itemId } });
    assert.equal(item!.especificacion_marca_modelo, 'Corregida tras aprobar');
    console.log('ok - 1.8 acepta edición con Requisición APROBADA');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function testRechazaEdicionEnComprada() {
  const seeded = await seed('COMPRADA');
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['residencia'] });
    const r = await putEspecificacionSimple(seeded.requisicionId, seeded.itemId, token, {
      especificacion_marca_modelo: 'No debería guardarse',
    });
    assert.equal(r.status, 400);
    const item = await prisma.requisicionItem.findUnique({ where: { id_item: seeded.itemId } });
    assert.equal(item!.especificacion_marca_modelo, 'Original', 'No debe modificarse cuando la requisición está COMPRADA');
    console.log('ok - 1.8 rechaza edición con Requisición COMPRADA');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAceptaEdicionEnPendiente();
    await testAceptaEdicionEnAprobada();
    await testRechazaEdicionEnComprada();
    console.log('\nTodos los tests pasaron.');
  } finally {
    await teardown();
  }
}

main().catch((err) => {
  console.error('FALLO:', err);
  process.exitCode = 1;
});
