/**
 * Tests: rol 'finanzas' (no 'finance') debe autorizar los endpoints protegidos
 * de contabilidad. Reproduce el bug gemelo de fix-rol-finance-vs-finanzas-en-finanzas
 * (PR #76) para apps/contabilidad/src/main.ts.
 * Runner: node -r ts-node/register/transpile-only test/integration/rbac-rol-finanzas.integration.test.ts
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
process.env.CONTABILIDAD_DATABASE_URL = process.env.CONTABILIDAD_DATABASE_URL
  || process.env.DATABASE_URL?.replace('schema=finanzas', 'schema=contabilidad')
  || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

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
}

async function call(method: string, path: string, token: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: method === 'GET' ? undefined : JSON.stringify({}),
  });
  return { status: res.status, body: (await res.json().catch(() => null)) as any };
}

function tokenWithRoles(roles: string[]) {
  return signTenantToken({
    userId: randomUUID(),
    tenantId: randomUUID(),
    proyectoId: randomUUID(),
    roles,
  });
}

/** Un endpoint representativo por cada grupo cubierto en el spec. */
const ENDPOINTS: Array<{ group: string; method: string; path: string }> = [
  { group: 'asientos/cuentas/dashboard', method: 'GET',  path: '/api/v1/contabilidad/asientos' },
  { group: 'reportes',                   method: 'GET',  path: '/api/v1/contabilidad/reportes/balanza-comprobacion' },
  { group: 'conciliar-cfdi',             method: 'POST', path: `/api/v1/contabilidad/asientos/${randomUUID()}/conciliar-cfdi` },
  { group: 'conciliaciones-fiscales',    method: 'GET',  path: '/api/v1/contabilidad/conciliaciones-fiscales/monitoreo/sat-pendientes' },
  { group: 'conciliaciones-bancarias',   method: 'POST', path: `/api/v1/contabilidad/asientos/${randomUUID()}/conciliar-banco` },
];

async function testRolFinanzasNoRecibeForbiddenPorRol() {
  for (const { group, method, path } of ENDPOINTS) {
    const token = tokenWithRoles(['finanzas']);
    const res = await call(method, path, token);
    assert.notEqual(res.status, 403,
      `[${group}] usuario con rol 'finanzas' no debe recibir 403 por rol en ${method} ${path} (recibido: ${res.status} ${JSON.stringify(res.body?.error)})`);
    console.log(`  ✓ [${group}] rol 'finanzas' no es rechazado por rol`);
  }
}

async function testRolFinanceEnInglesSigueRechazado() {
  for (const { group, method, path } of ENDPOINTS) {
    const token = tokenWithRoles(['finance']);
    const res = await call(method, path, token);
    assert.equal(res.status, 403,
      `[${group}] usuario con rol inexistente 'finance' (sin finanzas/admin/superintendent) debe recibir 403 en ${method} ${path}`);
    assert.equal(res.body?.error?.code, 'AUTH_FORBIDDEN',
      `[${group}] el 403 debe traer código AUTH_FORBIDDEN`);
    console.log(`  ✓ [${group}] rol 'finance' (inexistente, sin roles reales) sigue rechazado`);
  }
}

async function main() {
  await setup();
  console.log('\nRBAC rol finanzas (contabilidad) — Tests integración:');
  const tests = [testRolFinanzasNoRecibeForbiddenPorRol, testRolFinanceEnInglesSigueRechazado];
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
