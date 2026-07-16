/**
 * Tests de Integración: GET /partidas/:concepto_id/movimientos — GT
 * Ver openspec/changes/trazabilidad-partida-gt-cp
 *
 * Runner: npm run test:integration
 * Requiere: PostgreSQL corriendo (DATABASE_URL → schema gerencia_tecnica)
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
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

let server: Server | undefined;
let baseUrl = '';

const TENANT_ID   = randomUUID();
const PROYECTO_ID = randomUUID();
const USER_ID     = randomUUID();

function token(roles = ['admin']) {
  return signTenantToken({ userId: USER_ID, tenantId: TENANT_ID, proyectoId: PROYECTO_ID, roles });
}

async function fetch_(path: string, opts: RequestInit = {}, roles = ['admin']) {
  const { default: fetch } = await import('node-fetch');
  return fetch(`${baseUrl}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token(roles)}`,
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
  await prisma.saldoMovimiento.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.saldoPartida.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.concepto.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: TENANT_ID } });
  await stopHttpApp(server);
  await prisma.$disconnect();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function crearPresupuestoConConcepto(): Promise<{ presupuestoId: string; conceptoId: string }> {
  const presupuesto = await prisma.presupuestoBase.create({
    data: {
      id: randomUUID(),
      tenant_id:  TENANT_ID,
      proyecto_id: PROYECTO_ID,
      estado:     'BORRADOR',
      importe_total: 0,
    },
  });

  const conceptoId = randomUUID();
  await prisma.concepto.create({
    data: {
      id: conceptoId,
      tenant_id:      TENANT_ID,
      proyecto_id:    PROYECTO_ID,
      presupuesto_id: presupuesto.id,
      clave:          'MOV-001',
      descripcion:    'Concepto de prueba movimientos',
      unidad_medida:  'M2',
      cantidad:       1,
      precio_unitario: 100_000,
      importe:        100_000,
    },
  });

  await prisma.presupuestoBase.update({
    where: { id: presupuesto.id },
    data: { importe_total: 100_000 },
  });

  return { presupuestoId: presupuesto.id, conceptoId };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test_movimientos_lista_completa_orden_desc() {
  const { presupuestoId, conceptoId } = await crearPresupuestoConConcepto();
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const ocId = randomUUID();
  await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 60_000, referencia_id: ocId, referencia_codigo: 'OC-TEST-100', tipo: 'OC' }),
  });
  await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/ejercer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 20_000, referencia_id: ocId, tipo: 'OC' }),
  });

  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/movimientos`);
  assert.equal(res.status, 200, 'GET /partidas/:id/movimientos debe retornar 200');

  const body = await res.json() as any;
  assert.ok(body.success, 'response.success debe ser true');
  const movimientos: any[] = body.data;
  assert.equal(movimientos.length, 2, 'debe haber 2 movimientos (comprometer + ejercer)');

  // Orden desc por created_at: el más reciente (ejercer) primero
  assert.equal(movimientos[0].tipo, 'EJERCER_OC');
  assert.equal(Number(movimientos[0].delta), 20_000);
  assert.equal(movimientos[0].referencia_id, ocId);

  assert.equal(movimientos[1].tipo, 'OC');
  assert.equal(Number(movimientos[1].delta), 60_000);
  assert.equal(movimientos[1].referencia_codigo, 'OC-TEST-100');
  console.log('✓ GET /partidas/:id/movimientos retorna el historial completo ordenado desc');
}

async function test_movimientos_404_sin_saldo_partida() {
  const conceptoId = randomUUID();
  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/movimientos`);
  assert.equal(res.status, 404);
  const body = await res.json() as any;
  assert.equal(body.error?.code || body.code, 'SALDO_NO_INICIALIZADO');
  console.log('✓ GET /partidas/:id/movimientos retorna 404 si no existe SaldoPartida');
}

async function test_movimientos_vacio_sin_movimientos() {
  const { presupuestoId, conceptoId } = await crearPresupuestoConConcepto();
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/movimientos`);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.deepEqual(body.data, [], 'partida sin movimientos debe retornar lista vacía');
  console.log('✓ GET /partidas/:id/movimientos retorna [] cuando la partida no tiene movimientos aún');
}

async function test_movimientos_403_rol_sin_acceso() {
  const { presupuestoId, conceptoId } = await crearPresupuestoConConcepto();
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/movimientos`, {}, ['compras']);
  assert.equal(res.status, 403, 'rol sin acceso debe recibir 403');
  console.log('✓ GET /partidas/:id/movimientos retorna 403 para roles no autorizados');
}

// ─── Runner ───────────────────────────────────────────────────────────────────

(async () => {
  await setup();
  let passed = 0;
  let failed = 0;
  const tests = [
    test_movimientos_lista_completa_orden_desc,
    test_movimientos_404_sin_saldo_partida,
    test_movimientos_vacio_sin_movimientos,
    test_movimientos_403_rol_sin_acceso,
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
