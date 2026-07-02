/**
 * Tests de Integración: Calidad — Aislamiento por Centro de Costos
 *
 * Verifica que NC, Auditorías y Documentos están estrictamente aislados por
 * proyecto_id extraído del JWT. Un usuario con token de proyecto A no debe
 * ver ni operar sobre datos de proyecto B.
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/aislamiento-proyecto.integration.test.ts
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
  await prisma.versionDocumento.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.documento.deleteMany({ where: { tenant_id: tenantId } });
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

// ── Test 4.1: NC creada en proyecto A no visible desde proyecto B ─────────────
async function testNcAisladaPorProyecto() {
  const tenantId = randomUUID();
  const proyA    = randomUUID();
  const proyB    = randomUUID();
  const userId   = randomUUID();
  const tokenA   = signTenantToken({ userId, tenantId, proyectoId: proyA, roles: ['calidad'] });
  const tokenB   = signTenantToken({ userId, tenantId, proyectoId: proyB, roles: ['calidad'] });

  try {
    // Crear NC con token del proyecto A
    const create = await api('POST', '/api/v1/calidad/no-conformidades', tokenA, {
      titulo: 'NC exclusiva de proyecto A', fuente: 'INTERNA', responsable_id: userId,
    });
    assert.equal(create.status, 201, 'Crear NC debe retornar 201');
    const ncId = create.body.data.id_nc;

    // GET listado desde proyecto B → no debe incluir la NC de A
    const listB = await api('GET', '/api/v1/calidad/no-conformidades', tokenB);
    assert.equal(listB.status, 200);
    const idsEnB = (listB.body.data as any[]).map((n: any) => n.id_nc);
    assert.ok(!idsEnB.includes(ncId), 'NC de proyecto A no debe aparecer en listado de proyecto B');

    // GET por ID desde proyecto B → 404
    const getB = await api('GET', `/api/v1/calidad/no-conformidades/${ncId}`, tokenB);
    assert.equal(getB.status, 404, 'NC de proyecto A no accesible desde proyecto B → 404');

    // GET por ID desde proyecto A → 200
    const getA = await api('GET', `/api/v1/calidad/no-conformidades/${ncId}`, tokenA);
    assert.equal(getA.status, 200, 'NC accesible desde su propio proyecto → 200');

    console.log('  ✓ NC aislada por proyecto (listado y GET por ID)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 4.2: Auditoría creada en proyecto A no visible desde proyecto B ───────
async function testAuditoriaAisladaPorProyecto() {
  const tenantId = randomUUID();
  const proyA    = randomUUID();
  const proyB    = randomUUID();
  const userId   = randomUUID();
  const tokenA   = signTenantToken({ userId, tenantId, proyectoId: proyA, roles: ['calidad'] });
  const tokenB   = signTenantToken({ userId, tenantId, proyectoId: proyB, roles: ['calidad'] });

  try {
    // Crear auditoría con token del proyecto A
    const create = await api('POST', '/api/v1/calidad/auditorias', tokenA, {
      titulo: 'Auditoría exclusiva de proyecto A', auditor_lider_id: userId,
    });
    assert.equal(create.status, 201, 'Crear auditoría debe retornar 201');
    const audId = create.body.data.id_auditoria;

    // GET listado desde proyecto B → no debe incluir la auditoría de A
    const listB = await api('GET', '/api/v1/calidad/auditorias', tokenB);
    assert.equal(listB.status, 200);
    const idsEnB = (listB.body.data as any[]).map((a: any) => a.id_auditoria);
    assert.ok(!idsEnB.includes(audId), 'Auditoría de proyecto A no debe aparecer en listado de proyecto B');

    // GET por ID desde proyecto A → 200
    const getA = await api('GET', `/api/v1/calidad/auditorias/${audId}`, tokenA);
    assert.equal(getA.status, 200, 'Auditoría accesible desde su propio proyecto → 200');

    console.log('  ✓ Auditoría aislada por proyecto (listado verificado)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 4.3: GET /documentos/:id con token de proyecto incorrecto → 404 ──────
async function testDocumentoAisladoPorProyecto() {
  const tenantId = randomUUID();
  const proyA    = randomUUID();
  const proyB    = randomUUID();
  const userId   = randomUUID();
  const tokenA   = signTenantToken({ userId, tenantId, proyectoId: proyA, roles: ['calidad', 'admin'] });
  const tokenB   = signTenantToken({ userId, tenantId, proyectoId: proyB, roles: ['calidad', 'admin'] });

  try {
    // Crear documento con token del proyecto A
    const create = await api('POST', '/api/v1/calidad/documentos', tokenA, {
      titulo: 'Doc exclusivo de proyecto A',
      tipo: 'PROCEDIMIENTO',
      codigo: `PROC-${randomUUID().slice(0, 6).toUpperCase()}`,
      responsable_id: userId,
    });
    assert.equal(create.status, 201, 'Crear documento debe retornar 201');
    const docId = create.body.data.id_documento;

    // GET por ID desde proyecto B → 404
    const getB = await api('GET', `/api/v1/calidad/documentos/${docId}`, tokenB);
    assert.equal(getB.status, 404, 'Documento de proyecto A no accesible desde proyecto B → 404');

    // PATCH desde proyecto B → 404
    const patchB = await api('PATCH', `/api/v1/calidad/documentos/${docId}`, tokenB, { titulo: 'Intento B' });
    assert.equal(patchB.status, 404, 'PATCH de documento de proyecto A desde B → 404');

    // GET desde proyecto A → 200
    const getA = await api('GET', `/api/v1/calidad/documentos/${docId}`, tokenA);
    assert.equal(getA.status, 200, 'Documento accesible desde su propio proyecto → 200');

    console.log('  ✓ Documento aislado por proyecto (GET y PATCH desde proyecto incorrecto → 404)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 4.4: POST ignora proyecto_id del body — usa el del JWT ───────────────
async function testProyectoIdDelBodyIgnorado() {
  const tenantId   = randomUUID();
  const proyJwt    = randomUUID();
  const proyFalso  = randomUUID(); // lo que el body intentaría inyectar
  const userId     = randomUUID();
  const token      = signTenantToken({ userId, tenantId, proyectoId: proyJwt, roles: ['calidad'] });

  try {
    // Intentar crear NC con proyecto_id diferente en el body
    const create = await api('POST', '/api/v1/calidad/no-conformidades', token, {
      titulo: 'NC con proyecto_id en body',
      fuente: 'INTERNA',
      responsable_id: userId,
      proyecto_id: proyFalso, // debe ser ignorado
    });
    assert.equal(create.status, 201, 'Crear NC debe retornar 201');
    const ncId = create.body.data.id_nc;

    // Verificar en DB que se guardó con el proyecto_id del JWT, no del body
    const nc = await prisma.noConformidad.findUnique({ where: { id_nc: ncId } });
    assert.ok(nc, 'NC debe existir en DB');
    assert.equal(nc!.proyecto_id, proyJwt, 'proyecto_id en DB debe venir del JWT, no del body');
    assert.notEqual(nc!.proyecto_id, proyFalso, 'proyecto_id del body debe ser ignorado');

    console.log('  ✓ proyecto_id del body ignorado — se usa el del JWT');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Runner ────────────────────────────────────────────────────────────────────
async function main() {
  await setup();
  console.log('\nAislamiento por proyecto — Tests de integración (Calidad):');
  const tests = [
    testNcAisladaPorProyecto,
    testAuditoriaAisladaPorProyecto,
    testDocumentoAisladoPorProyecto,
    testProyectoIdDelBodyIgnorado,
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
