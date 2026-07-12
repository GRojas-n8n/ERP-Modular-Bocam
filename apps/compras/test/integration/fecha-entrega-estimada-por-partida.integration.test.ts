/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: fecha_entrega_estimada por partida en ComparativaDetalle
 * Spec:  openspec/changes/fecha-entrega-estimada-por-partida/
 * Tareas: 2.1-2.3 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 *           Migración fecha_entrega_estimada_por_partida aplicada
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999'; // EventBus falla silenciosamente

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({
  datasources: { db: { url: comprasDbUrl } },
});

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
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadro() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-FE-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'BORRADOR',
    },
  });

  return { tenantId, proyectoId, userId, cuadroId: cuadro.id_cuadro };
}

async function putCotizaciones(cuadroId: string, token: string, proveedorNombre: string, precios: Array<{ insumo_id: string; precio: number; fecha_entrega_estimada?: string }>) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadroId}/cotizaciones`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proveedores: [{ nombre: proveedorNombre, precios }],
    }),
  });
}

// ── Test 2.1: fecha_entrega_estimada se persiste asociada a la línea/proveedor ──

async function testFechaEntregaSePersiste() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const insumoId = randomUUID();
    const fecha = '2026-08-15';

    const r = await putCotizaciones(seeded.cuadroId, token, 'Proveedor Fecha Entrega', [
      { insumo_id: insumoId, precio: 1500, fecha_entrega_estimada: fecha },
    ]);
    assert.equal(r.status, 200, 'PUT cotizaciones debe retornar 200');

    const detalle = await prisma.comparativaDetalle.findFirst({
      where: { cuadro_id: seeded.cuadroId, insumo_id: insumoId },
    });
    assert.ok(detalle, 'Debe existir el detalle persistido');
    assert.ok(detalle!.fecha_entrega_estimada, 'fecha_entrega_estimada debe estar poblada');
    assert.equal(
      detalle!.fecha_entrega_estimada!.toISOString().slice(0, 10),
      fecha,
      'la fecha persistida debe coincidir con la enviada',
    );

    console.log('ok - 2.1 fecha_entrega_estimada se persiste asociada a la línea/proveedor correcta');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 2.2: sin fecha_entrega_estimada, el precio se persiste igual con fecha null ──

async function testSinFechaEntregaNoBloquea() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const insumoId = randomUUID();

    const r = await putCotizaciones(seeded.cuadroId, token, 'Proveedor Sin Fecha', [
      { insumo_id: insumoId, precio: 800 },
    ]);
    assert.equal(r.status, 200);

    const detalle = await prisma.comparativaDetalle.findFirst({
      where: { cuadro_id: seeded.cuadroId, insumo_id: insumoId },
    });
    assert.ok(detalle, 'Debe existir el detalle persistido');
    assert.equal(Number(detalle!.precio_ofertado), 800);
    assert.equal(detalle!.fecha_entrega_estimada, null, 'fecha_entrega_estimada debe quedar null');

    console.log('ok - 2.2 guardar sin fecha_entrega_estimada persiste el precio igual, con fecha null');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 2.3: nueva-revision clona fecha_entrega_estimada al cuadro de la nueva revisión ──

async function testNuevaRevisionClonaFechaEntrega() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const insumoId = randomUUID();
    const fecha = '2026-09-01';

    await putCotizaciones(seeded.cuadroId, token, 'Proveedor Revision', [
      { insumo_id: insumoId, precio: 2000, fecha_entrega_estimada: fecha },
    ]);

    const detalleOriginal = await prisma.comparativaDetalle.findFirstOrThrow({
      where: { cuadro_id: seeded.cuadroId, insumo_id: insumoId },
    });

    // revision-con-preguntas solo se puede crear desde EN_EVALUACION_TECNICA —
    // se fuerza el estado directo por Prisma para aislar el test del resto del
    // flujo de transición (ya cubierto por otros tests de integración).
    await prisma.cuadroComparativo.update({
      where: { id_cuadro: seeded.cuadroId },
      data: { estado: 'EN_EVALUACION_TECNICA' },
    });

    const residenteToken = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['residencia'] });
    const rRevision = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${seeded.cuadroId}/revision-con-preguntas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${residenteToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluaciones: [{ detalle_id: detalleOriginal.id_detalle, evaluacion_tecnica: '?', pregunta_residente: '¿Confirmas la fecha de entrega?' }],
      }),
    });
    assert.equal(rRevision.status, 201, 'POST revision-con-preguntas debe retornar 201');
    const body = await rRevision.json() as any;
    const nuevoCuadroId = body.data.id_cuadro;

    const detalleClonado = await prisma.comparativaDetalle.findFirst({
      where: { cuadro_id: nuevoCuadroId, insumo_id: insumoId },
    });
    assert.ok(detalleClonado, 'Debe existir el detalle clonado en la nueva revisión');
    assert.ok(detalleClonado!.fecha_entrega_estimada, 'fecha_entrega_estimada debe clonarse');
    assert.equal(
      detalleClonado!.fecha_entrega_estimada!.toISOString().slice(0, 10),
      fecha,
      'la fecha clonada debe coincidir con la original',
    );

    console.log('ok - 2.3 revision-con-preguntas clona fecha_entrega_estimada al cuadro de la nueva revisión');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testFechaEntregaSePersiste();          // 2.1
    await testSinFechaEntregaNoBloquea();          // 2.2
    await testNuevaRevisionClonaFechaEntrega();    // 2.3
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - fecha-entrega-estimada-por-partida integration tests');
  console.error(error);
  process.exitCode = 1;
});
