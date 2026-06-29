/**
 * Tests: GET /reportes/balanza-comprobacion + estado-resultados + balance-general
 * Runner: node -r ts-node/register/transpile-only test/integration/reportes.balanza.integration.test.ts
 * Requiere: PostgreSQL contabilidad + seed de cuentas
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

async function api(method: string, path: string, token: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return { status: res.status, body: (await res.json().catch(() => null)) as any };
}

async function testBalanzaComprobacion() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['finance'] });

  try {
    await handleEstimacionAprobadaEvent({
      event_type: 'control_obra.estimacion_aprobada',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyId, user_id: userId },
      payload:    { estimacion_id: randomUUID(), codigo: 'EST-BAL', monto_total: 500000 },
    } as any);

    const res = await api('GET', `/api/v1/contabilidad/reportes/balanza-comprobacion?desde=2020-01-01&hasta=2099-12-31`, token);
    assert.equal(res.status, 200, 'Balanza debe retornar 200');
    assert.ok(Array.isArray(res.body.data?.cuentas), 'data.cuentas debe ser array');
    assert.ok(typeof res.body.data?.total_cargo === 'number', 'total_cargo debe ser number');
    assert.ok(typeof res.body.data?.cuadrado === 'boolean', 'cuadrado debe ser boolean');

    console.log('  ✓ GET /reportes/balanza-comprobacion retorna 200 con estructura correcta');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEstadoResultados() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['finance'] });

  try {
    const res = await api('GET', `/api/v1/contabilidad/reportes/estado-resultados`, token);
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.data?.utilidad_neta === 'number', 'utilidad_neta debe ser number');
    console.log('  ✓ GET /reportes/estado-resultados retorna 200');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testBalanceGeneral() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['finance'] });

  try {
    const res = await api('GET', `/api/v1/contabilidad/reportes/balance-general`, token);
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.data?.activos === 'number', 'activos debe ser number');
    assert.ok(typeof res.body.data?.pasivos === 'number', 'pasivos debe ser number');
    console.log('  ✓ GET /reportes/balance-general retorna 200');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCuentas() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['finance'] });

  try {
    const res = await api('GET', `/api/v1/contabilidad/cuentas`, token);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data), 'cuentas debe ser array');
    if (res.body.data.length > 0) {
      assert.ok(res.body.data[0].clave, 'cuenta debe tener clave');
      assert.ok(res.body.data[0].nombre, 'cuenta debe tener nombre');
    }
    console.log(`  ✓ GET /cuentas retorna 200 (${res.body.data.length} cuentas)`);
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  console.log('\nReportes Contables — Tests integración:');
  const tests = [testCuentas, testBalanzaComprobacion, testEstadoResultados, testBalanceGeneral];
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
