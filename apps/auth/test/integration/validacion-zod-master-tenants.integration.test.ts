/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación Zod — POST /api/v1/master/tenants y
 * PATCH /api/v1/master/tenants/:id
 * Spec:  openspec/changes/validacion-zod-endpoints-auth/specs/validacion-entrada-zod/
 * Tareas: 4.2, 4.3
 *
 * requireMasterSecret NO se toca por este change — sigue siendo el gate de
 * autenticación de estos endpoints; Zod solo valida la forma del body, y
 * corre tras requireMasterSecret en la cadena de middlewares.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.MASTER_SECRET = process.env.MASTER_SECRET || 'clave-maestra-test-zod';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const authDbUrl = process.env.DATABASE_URL!;
const prisma = new PrismaClient({ datasources: { db: { url: authDbUrl } } });
const MASTER_SECRET = process.env.MASTER_SECRET!;

let authServer: Server | undefined;
let authBaseUrl = '';

async function setup() {
  const authModule = await import('../../src/main');
  const started = await startHttpApp(authModule.app);
  authServer = started.server;
  authBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(authServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function post(pathUrl: string, body: object, secret = MASTER_SECRET) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patch(pathUrl: string, body: object, secret = MASTER_SECRET) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── POST /api/v1/master/tenants ──────────────────────────────────────────────

async function testCrearTenantPayloadValidoSigueFuncionando() {
  const nombre = `Tenant Master Zod ${Date.now()}`;
  const r = await post('/api/v1/master/tenants', { nombre, plan: 'PROFESIONAL' });
  assert.equal(r.status, 201, 'un payload con la misma forma que hoy debe seguir aceptándose');
  const body = (await r.json()) as any;
  assert.equal(body.data.nombre, nombre);
  await cleanupTenant(body.data.id_tenant);
  console.log('ok - master/tenants POST: payload válido sigue funcionando igual que antes');
}

async function testCrearTenantRechazaNombreFaltante() {
  const r = await post('/api/v1/master/tenants', { plan: 'BASICO' });
  assert.equal(r.status, 400, 'nombre faltante debe rechazarse con 400');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((d: any) => d.field === 'nombre'));
  console.log('ok - master/tenants POST: nombre faltante responde 400 VALIDATION_ERROR');
}

async function testCrearTenantRechazaNombreComoNumero() {
  const r = await post('/api/v1/master/tenants', { nombre: 12345 });
  assert.equal(r.status, 400, 'nombre como número debe rechazarse con 400');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  console.log('ok - master/tenants POST: nombre con forma inesperada (número) responde 400 VALIDATION_ERROR');
}

async function testCrearTenantSecretoInvalidoSigueSiendo401AntesQueLaValidacion() {
  // requireMasterSecret debe seguir corriendo — un secreto inválido con un
  // body también inválido debe seguir siendo 401, no 400 (auth antes que
  // validación de forma).
  const r = await post('/api/v1/master/tenants', {}, 'secreto-incorrecto');
  assert.equal(r.status, 401, 'un secreto maestro inválido debe seguir respondiendo 401 sin importar el body');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'MASTER_UNAUTHORIZED');
  console.log('ok - master/tenants POST: requireMasterSecret sigue intacto (401 antes que VALIDATION_ERROR)');
}

// ── PATCH /api/v1/master/tenants/:id ─────────────────────────────────────────

async function testActualizarTenantPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Original Master Zod', rfc: `RFC${Date.now().toString().slice(-9)}` } });
  try {
    const r = await patch(`/api/v1/master/tenants/${tenantId}`, { nombre: 'Actualizado Master Zod', activo: false });
    assert.equal(r.status, 200, 'un payload de PATCH con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.data.nombre, 'Actualizado Master Zod');
    assert.equal(body.data.activo, false);
    console.log('ok - master/tenants PATCH: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testActualizarTenantRechazaActivoComoString() {
  const tenantId = randomUUID();
  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Original Master Zod 2', rfc: `RFC${Date.now().toString().slice(-9)}` } });
  try {
    const r = await patch(`/api/v1/master/tenants/${tenantId}`, { activo: 'si' });
    assert.equal(r.status, 400, 'activo como string debe rechazarse con 400');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details.some((d: any) => d.field === 'activo'));

    const enBd = await prisma.tenant.findUniqueOrThrow({ where: { id_tenant: tenantId } });
    assert.equal(enBd.activo, true, 'el update NO debe haberse ejecutado contra Prisma');
    console.log('ok - master/tenants PATCH: activo con forma inesperada (string) responde 400 VALIDATION_ERROR sin tocar Prisma');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCrearTenantPayloadValidoSigueFuncionando();
    await testCrearTenantRechazaNombreFaltante();
    await testCrearTenantRechazaNombreComoNumero();
    await testCrearTenantSecretoInvalidoSigueSiendo401AntesQueLaValidacion();
    await testActualizarTenantPayloadValidoSigueFuncionando();
    await testActualizarTenantRechazaActivoComoString();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-zod-master-tenants integration tests');
  console.error(error);
  process.exitCode = 1;
});
