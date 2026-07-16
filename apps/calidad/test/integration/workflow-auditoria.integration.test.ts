/**
 * Tests de Integración: Calidad — Workflow Auditoría Interna (cancelación exclusiva de admin)
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/workflow-auditoria.integration.test.ts
 * Requiere: PostgreSQL con schema calidad (CALIDAD_DATABASE_URL)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl =
  process.env.CALIDAD_DATABASE_URL ||
  process.env.DATABASE_URL         ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=calidad';

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
  await prisma.auditoriaInterna.deleteMany({ where: { tenant_id: tenantId } });
}

async function api(method: string, path: string, token: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

// ── Test: cancelación solo admin ──────────────────────────────────────────────
async function testCancelacionAdmin() {
  const tenantId  = randomUUID();
  const proyId    = randomUUID();
  const userId    = randomUUID();
  const tokenCal  = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });
  const tokenAdm  = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['admin'] });

  try {
    const create = await api('POST', '/api/v1/calidad/auditorias', tokenAdm, {
      titulo: 'Auditoría test cancelación', auditor_lider_id: userId,
    });
    assert.equal(create.status, 201, 'Crear auditoría debe retornar 201');
    const audId = create.body.data.id_auditoria;

    // Rol calidad no puede cancelar → 403
    const intentoCal = await api('PATCH', `/api/v1/calidad/auditorias/${audId}`, tokenCal, { estado: 'CANCELADA' });
    assert.equal(intentoCal.status, 403, 'rol calidad no puede cancelar — debe 403');

    // Admin sí puede cancelar
    const cancelar = await api('PATCH', `/api/v1/calidad/auditorias/${audId}`, tokenAdm, { estado: 'CANCELADA' });
    assert.equal(cancelar.status, 200, 'Admin puede cancelar — debe 200');
    assert.equal(cancelar.body.data.estado, 'CANCELADA');

    console.log('  ✓ cancelación solo admin (rol calidad → 403, admin → 200)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Runner ───────────────────────────────────────────────────────────────────
async function main() {
  await setup();
  console.log('\nWorkflow Auditoría — Tests de integración:');
  const tests = [testCancelacionAdmin];
  let passed = 0;
  let failed = 0;
  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${test.name}: ${err.message}`);
      failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed\n`);
  await teardown();
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
