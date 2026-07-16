/**
 * Tests de Integración: filtro ?concepto_id= en GET /api/v1/finanzas/movimientos
 * Ver openspec/changes/trazabilidad-partida-gt-cp.
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/movimientos-por-concepto.integration.test.ts
 * Requiere: PostgreSQL corriendo (DATABASE_URL → schema finanzas)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL          ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

let server: Server | undefined;
let baseUrl = '';

const TENANT_ID   = randomUUID();
const PROYECTO_ID = randomUUID();
const USER_ID     = randomUUID();

function token() {
  return signTenantToken({ userId: USER_ID, tenantId: TENANT_ID, proyectoId: PROYECTO_ID, roles: ['admin'] });
}

async function fetch_(path: string, opts: RequestInit = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(`${baseUrl}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      'x-tenant-id':   TENANT_ID,
      'x-proyecto-id': PROYECTO_ID,
      ...(opts.headers as Record<string, string> || {}),
    },
  });
}

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await prisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.presupuestoAsignado.deleteMany({ where: { tenant_id: TENANT_ID } });
  await stopHttpApp(server);
  await prisma.$disconnect();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function crearPresupuestoConMovimiento(conceptoId: string): Promise<{ presupuestoId: string; movimientoId: string }> {
  const presupuesto = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id:   TENANT_ID,
      proyecto_id: PROYECTO_ID,
      codigo:      `PRES-${conceptoId.slice(0, 8)}`,
      descripcion: 'Presupuesto de prueba por partida',
      monto_autorizado: 100_000,
      monto_disponible: 100_000,
      capitulo:    'MATERIALES',
      estatus:     'ACTIVO',
      concepto_id: conceptoId,
      concepto_clave: 'MOV-001',
    },
  });

  const movimiento = await prisma.movimientoPresupuestal.create({
    data: {
      tenant_id:      TENANT_ID,
      proyecto_id:    PROYECTO_ID,
      presupuesto_id: presupuesto.id_presupuesto,
      tipo:           'COMPROMISO',
      concepto:       'OC de prueba',
      monto:          40_000,
      referencia_modulo: 'compras',
      referencia_entidad: 'OrdenCompra',
      referencia_id:  randomUUID(),
      referencia_codigo: 'OC-TEST-200',
      usuario_id:     USER_ID,
    },
  });

  return { presupuestoId: presupuesto.id_presupuesto, movimientoId: movimiento.id_movimiento };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test_filtro_concepto_id_retorna_movimientos_del_presupuesto() {
  const conceptoId = randomUUID();
  const { presupuestoId, movimientoId } = await crearPresupuestoConMovimiento(conceptoId);

  const res = await fetch_(`/api/v1/finanzas/movimientos?concepto_id=${conceptoId}`);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.equal(body.data.length, 1, 'debe retornar el movimiento del presupuesto sincronizado a esa partida');
  assert.equal(body.data[0].id_movimiento, movimientoId);
  assert.equal(body.data[0].presupuesto_id, presupuestoId);
  console.log('✓ GET /movimientos?concepto_id= retorna los movimientos del presupuesto sincronizado');
}

async function test_filtro_concepto_id_sin_presupuesto_sincronizado() {
  const conceptoIdSinPresupuesto = randomUUID();
  const res = await fetch_(`/api/v1/finanzas/movimientos?concepto_id=${conceptoIdSinPresupuesto}`);
  assert.equal(res.status, 200, 'ausencia de sincronización no es un error del cliente');
  const body = await res.json() as any;
  assert.deepEqual(body.data, [], 'debe retornar lista vacía, no 404');
  console.log('✓ GET /movimientos?concepto_id= retorna [] cuando no hay presupuesto sincronizado (no 404)');
}

async function test_presupuesto_id_tiene_precedencia_sobre_concepto_id() {
  const conceptoId = randomUUID();
  const { presupuestoId, movimientoId } = await crearPresupuestoConMovimiento(conceptoId);

  // presupuesto_id explícito con un concepto_id inventado que no resolvería nada —
  // si presupuesto_id gana, igual debe retornar el movimiento real.
  const res = await fetch_(`/api/v1/finanzas/movimientos?presupuesto_id=${presupuestoId}&concepto_id=${randomUUID()}`);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].id_movimiento, movimientoId);
  console.log('✓ GET /movimientos con ambos filtros: presupuesto_id tiene precedencia (comportamiento existente)');
}

// ─── Runner ───────────────────────────────────────────────────────────────────

(async () => {
  await setup();
  let passed = 0;
  let failed = 0;
  const tests = [
    test_filtro_concepto_id_retorna_movimientos_del_presupuesto,
    test_filtro_concepto_id_sin_presupuesto_sincronizado,
    test_presupuesto_id_tiene_precedencia_sobre_concepto_id,
  ];

  for (const t of tests) {
    try {
      await t();
      passed++;
    } catch (err: any) {
      console.error(`✗ ${t.name}:`, err.message);
      failed++;
    }
  }

  await teardown();
  console.log(`\n━━━ ${passed + failed} tests | ${passed} passed | ${failed} failed ━━━`);
  process.exit(failed > 0 ? 1 : 0);
})();
