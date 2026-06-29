/**
 * Tests de Integración: Calidad — Conversión Hallazgo → NC
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/hallazgo-a-nc.integration.test.ts
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
  await prisma.accionCorrectiva.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.noConformidad.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.hallazgoAuditoria.deleteMany({ where: { tenant_id: tenantId } });
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

async function crearAuditoriaConHallazgo(token: string, tenantId: string, userId: string) {
  const aud = await api('POST', '/api/v1/calidad/auditorias', token, {
    titulo: `Auditoría test ${randomUUID().slice(0, 8)}`,
    auditor_lider_id: userId,
  });
  const audId = aud.body.data.id_auditoria;

  const hall = await api('POST', `/api/v1/calidad/auditorias/${audId}/hallazgos`, token, {
    descripcion: 'Hallazgo MAYOR: proceso de compras sin procedimiento escrito',
    tipo: 'MAYOR',
    proceso_afectado: 'Compras',
  });
  return { audId, halId: hall.body.data.id_hallazgo };
}

// ── Test: conversión exitosa hallazgo → NC ────────────────────────────────────
async function testConversionExitosa() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });

  try {
    const { audId, halId } = await crearAuditoriaConHallazgo(token, tenantId, userId);

    const res = await api('POST', `/api/v1/calidad/auditorias/${audId}/hallazgos/${halId}/crear-nc`, token, {
      responsable_id: userId,
    });
    assert.equal(res.status, 201, 'Crear NC desde hallazgo debe retornar 201');
    assert.ok(res.body.data.nc.id_nc, 'Debe incluir la NC creada');
    assert.equal(res.body.data.nc.fuente, 'AUDITORIA', 'Fuente debe ser AUDITORIA');
    assert.equal(res.body.data.nc.estado, 'ABIERTA', 'NC debe iniciar ABIERTA');
    assert.equal(res.body.data.hallazgo.nc_id, res.body.data.nc.id_nc, 'Hallazgo debe tener nc_id asignado');

    console.log('  ✓ conversión exitosa hallazgo → NC');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: idempotencia — segunda llamada retorna 409 ─────────────────────────
async function testIdempotencia() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });

  try {
    const { audId, halId } = await crearAuditoriaConHallazgo(token, tenantId, userId);

    const primera = await api('POST', `/api/v1/calidad/auditorias/${audId}/hallazgos/${halId}/crear-nc`, token, {});
    assert.equal(primera.status, 201, 'Primera llamada debe retornar 201');
    const ncIdOriginal = primera.body.data.nc.id_nc;

    const segunda = await api('POST', `/api/v1/calidad/auditorias/${audId}/hallazgos/${halId}/crear-nc`, token, {});
    assert.equal(segunda.status, 409, 'Segunda llamada debe retornar 409');
    assert.equal(segunda.body.codigo, 'HALLAZGO_YA_TIENE_NC', 'Código de error correcto');
    assert.equal(segunda.body.nc_id, ncIdOriginal, 'nc_id del 409 debe coincidir con la NC original');

    console.log('  ✓ idempotencia (segunda llamada → 409 con nc_id)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: hallazgo no encontrado → 404 ───────────────────────────────────────
async function testHallazgoNoEncontrado() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });

  try {
    const aud = await api('POST', '/api/v1/calidad/auditorias', token, {
      titulo: 'Auditoría sin hallazgo', auditor_lider_id: userId,
    });
    const audId = aud.body.data.id_auditoria;
    const fakeHallazgoId = randomUUID();

    const res = await api('POST', `/api/v1/calidad/auditorias/${audId}/hallazgos/${fakeHallazgoId}/crear-nc`, token, {});
    assert.equal(res.status, 404, 'Hallazgo inexistente debe retornar 404');
    assert.equal(res.body.codigo, 'HALLAZGO_NOT_FOUND', 'Código correcto');

    console.log('  ✓ hallazgo no encontrado → 404');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: PATCH auditoría workflow ────────────────────────────────────────────
async function testAuditoriaWorkflow() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const tokenCal = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });
  const tokenAdm = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['admin'] });

  try {
    const aud = await api('POST', '/api/v1/calidad/auditorias', tokenCal, {
      titulo: 'Auditoría workflow test', auditor_lider_id: userId,
    });
    const audId = aud.body.data.id_auditoria;

    // PROGRAMADA → EN_CURSO
    const iniciar = await api('PATCH', `/api/v1/calidad/auditorias/${audId}`, tokenCal, { estado: 'EN_CURSO' });
    assert.equal(iniciar.status, 200);
    assert.equal(iniciar.body.data.estado, 'EN_CURSO');

    // EN_CURSO → COMPLETADA
    const completar = await api('PATCH', `/api/v1/calidad/auditorias/${audId}`, tokenCal, { estado: 'COMPLETADA' });
    assert.equal(completar.status, 200);
    assert.equal(completar.body.data.estado, 'COMPLETADA');

    // COMPLETADA → cualquier otra → 422
    const invalida = await api('PATCH', `/api/v1/calidad/auditorias/${audId}`, tokenAdm, { estado: 'EN_CURSO' });
    assert.equal(invalida.status, 422, 'COMPLETADA no puede retroceder');

    console.log('  ✓ workflow auditoría (PROGRAMADA → EN_CURSO → COMPLETADA, bloqueo retroceso)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: PATCH hallazgo estado ───────────────────────────────────────────────
async function testHallazgoEstado() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();
  const token    = signTenantToken({ userId, tenantId, proyectoId: proyId, roles: ['calidad'] });

  try {
    const { audId, halId } = await crearAuditoriaConHallazgo(token, tenantId, userId);

    const patch = await api('PATCH', `/api/v1/calidad/auditorias/${audId}/hallazgos/${halId}`, token, {
      estado: 'EN_SEGUIMIENTO',
      evidencia: 'Foto tomada en sitio',
    });
    assert.equal(patch.status, 200);
    assert.equal(patch.body.data.estado, 'EN_SEGUIMIENTO');
    assert.equal(patch.body.data.evidencia, 'Foto tomada en sitio');

    // Hallazgo de otra auditoría → 404
    const otroAudId = randomUUID();
    const invalido = await api('PATCH', `/api/v1/calidad/auditorias/${otroAudId}/hallazgos/${halId}`, token, { estado: 'CERRADO' });
    assert.equal(invalido.status, 404, 'Hallazgo no perteneciente a la auditoría → 404');

    console.log('  ✓ PATCH hallazgo estado (actualización OK, pertenencia verificada)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Runner ───────────────────────────────────────────────────────────────────
async function main() {
  await setup();
  console.log('\nHallazgo → NC — Tests de integración:');
  const tests = [
    testConversionExitosa,
    testIdempotencia,
    testHallazgoNoEncontrado,
    testAuditoriaWorkflow,
    testHallazgoEstado,
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
