/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: la especificación técnica del Cuadro Comparativo se
 * resuelve en vivo desde el RequisicionItem de origen (detalle_req_id), no
 * desde una copia editable independiente.
 * Spec: openspec/changes/simplificar-ux-requisicion-a-oc/specs/especificacion-tecnica-fuente-unica/
 * Tareas: 1.1, 1.2, 1.5, 1.6 del tasks.md
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
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedRequisicionConItem() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const insumoId = randomUUID();

  const requisicion = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `REQ-FUENTE-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      solicitante_id: userId,
      estado: 'APROBADA',
    },
  });

  const item = await prisma.requisicionItem.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: requisicion.id_requisicion,
      insumo_id: insumoId,
      cantidad: 1,
      especificacion_marca_modelo: 'Marca original del Residente',
      especificacion_detalle: 'Detalle original del Residente',
    },
  });

  return { tenantId, proyectoId, userId, requisicionId: requisicion.id_requisicion, insumoId, itemId: item.id_item };
}

async function postComparativa(requisicionId: string, token: string) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requisicion_id: requisicionId }),
  });
}

async function getComparativa(id: string, token: string) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function putLinea(id: string, insumoId: string, token: string, body: Record<string, unknown>) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${id}/lineas/${insumoId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Test 1.1: el GET resuelve la especificación en vivo desde RequisicionItem ──

async function testGetResuelveEspecificacionEnVivo() {
  const seeded = await seedRequisicionConItem();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const create = await postComparativa(seeded.requisicionId, token);
    assert.equal(create.status, 201);
    const created = await create.json();
    const cuadroId = created.data.id_cuadro;

    // El Residente corrige la especificación DESPUÉS de crear el cuadro.
    await prisma.requisicionItem.update({
      where: { id_item: seeded.itemId },
      data: { especificacion_marca_modelo: 'Marca corregida', especificacion_detalle: 'Detalle corregido' },
    });

    const get = await getComparativa(cuadroId, token);
    assert.equal(get.status, 200);
    const body = await get.json();
    const linea = body.data.lineas_detalle.find((l: any) => l.insumo_id === seeded.insumoId);
    assert.ok(linea, 'Debe existir la línea del ítem');
    assert.equal(linea.especificacion_marca_modelo, 'Marca corregida', 'Debe reflejar el valor vigente del RequisicionItem, no el copiado al crear el cuadro');
    assert.equal(linea.especificacion_detalle, 'Detalle corregido');

    console.log('ok - 1.1 GET resuelve especificación en vivo desde RequisicionItem');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.2: renglón legacy sin detalle_req_id usa el valor copiado como respaldo ──

async function testGetUsaCopiaComoRespaldoSinDetalleReqId() {
  const seeded = await seedRequisicionConItem();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const create = await postComparativa(seeded.requisicionId, token);
    const created = await create.json();
    const cuadroId = created.data.id_cuadro;

    // Simula un cuadro creado antes de esta capability: sin detalle_req_id.
    await prisma.comparativaLinea.updateMany({
      where: { cuadro_id: cuadroId, insumo_id: seeded.insumoId },
      data: { detalle_req_id: null, marca_modelo_ref: 'Marca copiada legacy', especificaciones_requeridas: 'Detalle copiado legacy' },
    });

    const get = await getComparativa(cuadroId, token);
    const body = await get.json();
    const linea = body.data.lineas_detalle.find((l: any) => l.insumo_id === seeded.insumoId);
    assert.equal(linea.especificacion_marca_modelo, null, 'Sin detalle_req_id no hay resolución en vivo');
    assert.equal(linea.marca_modelo_ref, 'Marca copiada legacy', 'El valor copiado histórico sigue disponible como respaldo');

    console.log('ok - 1.2 renglón legacy sin detalle_req_id usa el valor copiado como respaldo');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.5: PUT de línea con detalle_req_id se rechaza (fuente única) ──

async function testPutLineaRechazaConDetalleReqId() {
  const seeded = await seedRequisicionConItem();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const create = await postComparativa(seeded.requisicionId, token);
    const created = await create.json();
    const cuadroId = created.data.id_cuadro;

    const put = await putLinea(cuadroId, seeded.insumoId, token, {
      marca_modelo_ref: 'Intento de edición directa',
      especificaciones_requeridas: 'No debería guardarse',
    });
    assert.equal(put.status, 400, 'Debe rechazar la edición cuando la línea tiene detalle_req_id');

    const linea = await prisma.comparativaLinea.findFirst({ where: { cuadro_id: cuadroId, insumo_id: seeded.insumoId } });
    assert.notEqual(linea!.marca_modelo_ref, 'Intento de edición directa', 'El valor no debe haberse modificado');

    console.log('ok - 1.5 PUT de línea con detalle_req_id se rechaza');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.6: PUT de línea legacy sin detalle_req_id se acepta igual que hoy ──

async function testPutLineaAceptaSinDetalleReqId() {
  const seeded = await seedRequisicionConItem();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const create = await postComparativa(seeded.requisicionId, token);
    const created = await create.json();
    const cuadroId = created.data.id_cuadro;

    await prisma.comparativaLinea.updateMany({
      where: { cuadro_id: cuadroId, insumo_id: seeded.insumoId },
      data: { detalle_req_id: null },
    });

    const put = await putLinea(cuadroId, seeded.insumoId, token, {
      marca_modelo_ref: 'Edición legacy permitida',
      especificaciones_requeridas: 'Sigue funcionando',
    });
    assert.equal(put.status, 200, 'Debe seguir aceptando edición en líneas sin detalle_req_id');

    const linea = await prisma.comparativaLinea.findFirst({ where: { cuadro_id: cuadroId, insumo_id: seeded.insumoId } });
    assert.equal(linea!.marca_modelo_ref, 'Edición legacy permitida');

    console.log('ok - 1.6 PUT de línea legacy sin detalle_req_id se acepta');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testGetResuelveEspecificacionEnVivo();
    await testGetUsaCopiaComoRespaldoSinDetalleReqId();
    await testPutLineaRechazaConDetalleReqId();
    await testPutLineaAceptaSinDetalleReqId();
    console.log('\nTodos los tests pasaron.');
  } finally {
    await teardown();
  }
}

main().catch((err) => {
  console.error('FALLO:', err);
  process.exitCode = 1;
});
