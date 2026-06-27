/**
 * Tests de Integración: Almacén — Eventos RabbitMQ
 * Spec: openspec/specs/almacen-eventos-oc
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/almacen-eventos-oc.integration.test.ts
 * Requiere: PostgreSQL (DATABASE_URL → schema almacen)
 * No requiere: RabbitMQ
 */

// CRÍTICO: env vars antes del import dinámico de main.ts
process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import type { BocamEvent } from '../../../../packages/event-bus/src';

const dbUrl =
  process.env.ALMACEN_DATABASE_URL ||
  process.env.DATABASE_URL         ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=almacen';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let handleOcRecibidaTotal:   (e: BocamEvent) => Promise<void>;
let handleOcRecibidaParcial: (e: BocamEvent) => Promise<void>;

async function setup() {
  const mod = await import('../../src/main');
  handleOcRecibidaTotal   = mod.handleOcRecibidaTotal;
  handleOcRecibidaParcial = mod.handleOcRecibidaParcial;
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function cleanupTenant(tenantId: string) {
  await prisma.movimientoAlmacen.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.itemInventario.deleteMany({ where: { tenant_id: tenantId } });
}

function buildOcEvent(opts: {
  tenantId:    string;
  proyectoId:  string;
  ocId:        string;
  insumoId:    string;
  cantidad:    number;
  field:       'cantidad_recibida' | 'cantidad_recibida_parcial';
}): BocamEvent {
  return {
    event_type: opts.field === 'cantidad_recibida' ? 'compras.oc_recibida_total' : 'compras.oc_recibida_parcial',
    timestamp: new Date().toISOString(),
    context: {
      tenant_id:   opts.tenantId,
      proyecto_id: opts.proyectoId,
      user_id:     randomUUID(),
    },
    payload: {
      orden_compra_id: opts.ocId,
      items: [
        {
          insumo_id:   opts.insumoId,
          clave:       'INS-EVT-001',
          descripcion: 'Insumo evento OC',
          unidad:      'PZA',
          categoria:   'MATERIAL',
          [opts.field]: opts.cantidad,
        },
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
async function testOcRecibidaTotalCreaIngreso() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const ocId       = randomUUID();
  const insumoId   = randomUUID();

  try {
    const event = buildOcEvent({ tenantId, proyectoId, ocId, insumoId, cantidad: 50, field: 'cantidad_recibida' });
    await handleOcRecibidaTotal(event);

    const movimiento = await prisma.movimientoAlmacen.findFirst({
      where: { tenant_id: tenantId, referencia: ocId, tipo: 'INGRESO' },
    });
    assert.ok(movimiento, 'Debe crearse un INGRESO al procesar oc_recibida_total');
    assert.equal(Number(movimiento!.cantidad), 50);

    const item = await prisma.itemInventario.findFirst({
      where: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: insumoId },
    });
    assert.ok(item, 'Debe crearse ItemInventario si no existía');
    assert.equal(Number(item!.stock_actual), 50, 'stock_actual debe ser 50 tras el INGRESO');

    console.log('[OK] testOcRecibidaTotalCreaIngreso');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testOcRecibidaParcialCreaIngreso() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const ocId       = randomUUID();
  const insumoId   = randomUUID();

  try {
    const event = buildOcEvent({
      tenantId, proyectoId, ocId, insumoId, cantidad: 20, field: 'cantidad_recibida_parcial',
    });
    await handleOcRecibidaParcial(event);

    const movimiento = await prisma.movimientoAlmacen.findFirst({
      where: { tenant_id: tenantId, referencia: ocId, tipo: 'INGRESO' },
    });
    assert.ok(movimiento, 'oc_recibida_parcial debe crear INGRESO');
    assert.equal(Number(movimiento!.cantidad), 20);

    console.log('[OK] testOcRecibidaParcialCreaIngreso');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testIdempotencia() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const ocId       = randomUUID();
  const insumoId   = randomUUID();

  try {
    const event = buildOcEvent({ tenantId, proyectoId, ocId, insumoId, cantidad: 30, field: 'cantidad_recibida' });

    await handleOcRecibidaTotal(event);
    await handleOcRecibidaTotal(event);

    const movimientos = await prisma.movimientoAlmacen.findMany({
      where: { tenant_id: tenantId, referencia: ocId, tipo: 'INGRESO' },
    });
    assert.equal(movimientos.length, 1, 'Idempotencia: exactamente 1 INGRESO aunque el evento llegue dos veces');

    const item = await prisma.itemInventario.findFirst({
      where: { tenant_id: tenantId, insumo_id: insumoId },
    });
    assert.equal(Number(item!.stock_actual), 30, 'stock_actual no debe duplicarse');

    console.log('[OK] testIdempotencia');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEventoSinItems() {
  const event: BocamEvent = {
    event_type: 'compras.oc_recibida_total',
    timestamp: new Date().toISOString(),
    context: { tenant_id: randomUUID(), proyecto_id: randomUUID(), user_id: randomUUID() },
    payload: { orden_compra_id: randomUUID(), items: [] },
  };

  await handleOcRecibidaTotal(event);
  console.log('[OK] testEventoSinItems');
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await setup();

  const tests = [
    testOcRecibidaTotalCreaIngreso,
    testOcRecibidaParcialCreaIngreso,
    testIdempotencia,
    testEventoSinItems,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (err: any) {
      failed++;
      console.error(`[FAIL] ${test.name}: ${err.message}`);
      if (process.env.VERBOSE) console.error(err);
    }
  }

  await prisma.$disconnect();

  console.log(`\nResultados: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
