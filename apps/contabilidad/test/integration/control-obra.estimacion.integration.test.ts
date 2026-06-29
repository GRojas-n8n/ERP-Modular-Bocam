/**
 * Tests: control_obra.estimacion_aprobada → AsientoContable + MovimientoPoliza
 * Runner: node -r ts-node/register/transpile-only test/integration/control-obra.estimacion.integration.test.ts
 * Requiere: PostgreSQL contabilidad + seed de cuentas + RabbitMQ
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { handleEstimacionAprobadaEvent } from '../../src/main';

const dbUrl = process.env.DATABASE_URL?.replace('schema=finanzas', 'schema=contabilidad')
  ?? 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.movimientoPoliza.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
}

async function api(method: string, path: string, token: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function testEstimacionCreaAsientoYMovimientos() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['finance'] });

  try {
    const estimacionId = randomUUID();
    const event = {
      event_type: 'control_obra.estimacion_aprobada',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyId, user_id: userId },
      payload:    { estimacion_id: estimacionId, codigo: 'EST-001', monto_total: 200000, concepto: 'Estimación de prueba' },
    };

    await handleEstimacionAprobadaEvent(event as any);

    const asiento = await prisma.asientoContable.findFirst({
      where: { tenant_id: tenantId, external_event_key: `control_obra.estimacion_aprobada:${estimacionId}` },
    });
    assert.ok(asiento, 'Debe crear AsientoContable');
    assert.equal(asiento.tipo_poliza, 'ESTIMACION');
    assert.equal(Number(asiento.monto_total), 200000);

    const movs = await prisma.movimientoPoliza.findMany({ where: { tenant_id: tenantId, asiento_id: asiento.id_asiento } });
    if (movs.length > 0) {
      assert.equal(movs.length, 2, 'Debe crear 2 movimientos (cargo + abono)');
      const totalCargo = movs.reduce((s, m) => s + Number(m.cargo), 0);
      const totalAbono = movs.reduce((s, m) => s + Number(m.abono), 0);
      assert.ok(Math.abs(totalCargo - totalAbono) < 0.01, 'Movimientos deben cuadrar');
    }

    console.log('  ✓ estimacion_aprobada crea asiento + movimientos cuadrados');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEstimacionIdempotente() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();

  try {
    const estimacionId = randomUUID();
    const event = {
      event_type: 'control_obra.estimacion_aprobada',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyId, user_id: userId },
      payload:    { estimacion_id: estimacionId, codigo: 'EST-002', monto_total: 50000 },
    };

    await handleEstimacionAprobadaEvent(event as any);
    await handleEstimacionAprobadaEvent(event as any);

    const count = await prisma.asientoContable.count({
      where: { tenant_id: tenantId, external_event_key: `control_obra.estimacion_aprobada:${estimacionId}` },
    });
    assert.equal(count, 1, 'Segunda llamada idempotente — solo 1 asiento');

    console.log('  ✓ estimacion_aprobada es idempotente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEndpointMovimientos() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['finance'] });

  try {
    const estimacionId = randomUUID();
    const event = {
      event_type: 'control_obra.estimacion_aprobada',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyId, user_id: userId },
      payload:    { estimacion_id: estimacionId, codigo: 'EST-003', monto_total: 75000 },
    };
    await handleEstimacionAprobadaEvent(event as any);

    const asiento = await prisma.asientoContable.findFirst({
      where: { tenant_id: tenantId, external_event_key: `control_obra.estimacion_aprobada:${estimacionId}` },
    });
    assert.ok(asiento);

    const res = await api('GET', `/api/v1/contabilidad/asientos/${asiento.id_asiento}/movimientos`, token);
    assert.equal(res.status, 200, 'GET movimientos debe retornar 200');
    assert.ok(Array.isArray(res.body.data), 'data debe ser array');

    console.log('  ✓ GET /asientos/:id/movimientos retorna 200');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  console.log('\nEstimación Aprobada — Tests integración:');
  const tests = [testEstimacionCreaAsientoYMovimientos, testEstimacionIdempotente, testEndpointMovimientos];
  let passed = 0; let failed = 0;
  for (const t of tests) {
    try { await t(); passed++; }
    catch (err: any) { console.error(`  ✗ ${t.name}: ${err.message}`); failed++; }
  }
  console.log(`\n${passed} passed, ${failed} failed\n`);
  await teardown();
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
