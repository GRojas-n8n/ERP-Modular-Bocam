/**
 * Tests de Integración: Calidad — Workflow NC (transiciones de estado ISO 9001)
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/workflow-nc.integration.test.ts
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

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function waitFor(fn: () => Promise<void>, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { await fn(); return; } catch { await delay(200); }
  }
  await fn();
}

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
  await prisma.accionCorrectiva.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.noConformidad.deleteMany({ where: { tenant_id: tenantId } });
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

// ── Test: transición libre ABIERTA → EN_ANALISIS ──────────────────────────────
async function testTransicionLibre() {
  const tenantId  = randomUUID();
  const proyId    = randomUUID();
  const userId    = randomUUID();
  const token     = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });

  try {
    const create = await api('POST', '/api/v1/calidad/no-conformidades', token, {
      titulo: 'NC test transicion libre', fuente: 'INTERNA', responsable_id: userId,
    });
    assert.equal(create.status, 201, 'Crear NC debe retornar 201');
    const ncId = create.body.data.id_nc;

    const patch = await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, token, { estado: 'EN_ANALISIS' });
    assert.equal(patch.status, 200, 'ABIERTA → EN_ANALISIS debe retornar 200');
    assert.equal(patch.body.data.estado, 'EN_ANALISIS', 'Estado debe ser EN_ANALISIS');

    console.log('  ✓ transición libre ABIERTA → EN_ANALISIS');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: transición bloqueada por precondición ───────────────────────────────
async function testTransicionBloqueada() {
  const tenantId  = randomUUID();
  const proyId    = randomUUID();
  const userId    = randomUUID();
  const tokenCal  = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });

  try {
    // Crear NC y avanzar a ACCION_CORRECTIVA
    const create = await api('POST', '/api/v1/calidad/no-conformidades', tokenCal, {
      titulo: 'NC test bloqueo', fuente: 'INTERNA', responsable_id: userId,
    });
    const ncId = create.body.data.id_nc;
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { estado: 'EN_ANALISIS' });
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { estado: 'ACCION_CORRECTIVA' });

    // Intentar pasar a EN_VERIFICACION sin acciones COMPLETADAS → debe fallar 422
    const patch = await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { estado: 'EN_VERIFICACION' });
    assert.equal(patch.status, 422, 'Debe retornar 422 si no hay acciones completadas');
    assert.equal(patch.body.codigo, 'NC_SIN_ACCIONES_COMPLETADAS', 'Código de error correcto');

    console.log('  ✓ transición bloqueada (NC_SIN_ACCIONES_COMPLETADAS)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: cierre exitoso con verificación ────────────────────────────────────
async function testCierreConVerificacion() {
  const tenantId  = randomUUID();
  const proyId    = randomUUID();
  const userId    = randomUUID();
  const tokenCal  = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });

  try {
    const create = await api('POST', '/api/v1/calidad/no-conformidades', tokenCal, {
      titulo: 'NC test cierre', fuente: 'INTERNA', responsable_id: userId,
    });
    const ncId = create.body.data.id_nc;

    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { estado: 'EN_ANALISIS' });
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { estado: 'ACCION_CORRECTIVA' });

    // Crear y completar una acción
    const accion = await api('POST', `/api/v1/calidad/no-conformidades/${ncId}/acciones`, tokenCal, {
      descripcion: 'Acción correctiva de prueba', responsable_id: userId,
    });
    const aidId = accion.body.data.id_accion;
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}/acciones/${aidId}`, tokenCal, { estado: 'COMPLETADA' });

    // Ahora debe poder pasar a EN_VERIFICACION
    const toVerif = await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { estado: 'EN_VERIFICACION' });
    assert.equal(toVerif.status, 200, 'EN_VERIFICACION debe ser 200 con acción COMPLETADA');

    // Verificar la acción
    const verificar = await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}/acciones/${aidId}`, tokenCal, { estado: 'VERIFICADA' });
    assert.equal(verificar.status, 200);
    assert.ok(verificar.body.data.verificado_por, 'verificado_por debe estar poblado');
    assert.ok(verificar.body.data.fecha_verificacion, 'fecha_verificacion debe estar poblada');

    // Cerrar NC
    const cierre = await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { estado: 'CERRADA' });
    assert.equal(cierre.status, 200, 'Cierre debe retornar 200');
    assert.equal(cierre.body.data.estado, 'CERRADA');
    assert.ok(cierre.body.data.fecha_cierre, 'fecha_cierre debe estar poblada');

    console.log('  ✓ cierre exitoso con verificación de acción');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: reapertura solo admin ───────────────────────────────────────────────
async function testReaperturaAdmin() {
  const tenantId  = randomUUID();
  const proyId    = randomUUID();
  const userId    = randomUUID();
  const tokenCal  = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });
  const tokenAdm  = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['admin'] });

  try {
    const create = await api('POST', '/api/v1/calidad/no-conformidades', tokenAdm, {
      titulo: 'NC test reapertura', fuente: 'INTERNA', responsable_id: userId,
    });
    const ncId = create.body.data.id_nc;

    // Avanzar a CERRADA manualmente via admin
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenAdm, { estado: 'EN_ANALISIS' });
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenAdm, { estado: 'ACCION_CORRECTIVA' });
    const accion = await api('POST', `/api/v1/calidad/no-conformidades/${ncId}/acciones`, tokenAdm, {
      descripcion: 'Acción', responsable_id: userId,
    });
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}/acciones/${accion.body.data.id_accion}`, tokenAdm, { estado: 'COMPLETADA' });
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenAdm, { estado: 'EN_VERIFICACION' });
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}/acciones/${accion.body.data.id_accion}`, tokenAdm, { estado: 'VERIFICADA' });
    await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenAdm, { estado: 'CERRADA' });

    // Rol calidad no puede reabrir → 403
    const intentoCal = await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenCal, { reabrir: true });
    assert.equal(intentoCal.status, 403, 'rol calidad no puede reabrir — debe 403');

    // Admin sí puede reabrir
    const reabrir = await api('PATCH', `/api/v1/calidad/no-conformidades/${ncId}`, tokenAdm, { reabrir: true });
    assert.equal(reabrir.status, 200, 'Admin puede reabrir — debe 200');
    assert.equal(reabrir.body.data.estado, 'ABIERTA');
    assert.equal(reabrir.body.data.fecha_cierre, null, 'fecha_cierre debe limpiarse');

    console.log('  ✓ reapertura solo admin (rol calidad → 403, admin → 200)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Runner ───────────────────────────────────────────────────────────────────
async function main() {
  await setup();
  console.log('\nWorkflow NC — Tests de integración:');
  const tests = [
    testTransicionLibre,
    testTransicionBloqueada,
    testCierreConVerificacion,
    testReaperturaAdmin,
  ];
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
