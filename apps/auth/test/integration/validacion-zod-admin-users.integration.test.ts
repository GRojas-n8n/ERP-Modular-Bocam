/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación Zod — POST /api/v1/auth/admin/users y
 * PATCH /api/v1/auth/admin/users/:id
 * Spec:  openspec/changes/validacion-zod-endpoints-auth/specs/validacion-entrada-zod/
 * Tareas: 4.2, 4.3
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const authDbUrl = process.env.DATABASE_URL!;
const prisma = new PrismaClient({ datasources: { db: { url: authDbUrl } } });

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

async function seedTenant(tenantId: string) {
  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Tenant Test Admin Users Zod', rfc: `RFC${Date.now().toString().slice(-9)}` } });
}

async function cleanupTenant(tenantId: string) {
  await prisma.user.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

function adminToken(tenantId: string) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
}

async function post(pathUrl: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patch(pathUrl: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── POST /api/v1/auth/admin/users ────────────────────────────────────────────

async function testCrearUsuarioPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const email = `admin-users-zod-${Date.now()}@bocam.test`;
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), {
      email, password: 'ClaveSegura123!', nombre: 'Nuevo Usuario', roles: ['residencia'],
    });
    assert.equal(r.status, 201, 'un payload con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.data.email, email);
    console.log('ok - admin/users POST: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCrearUsuarioRechazaRolesComoString() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), {
      email: 'x@y.com', password: 'x', nombre: 'Y', roles: 'admin',
    });
    assert.equal(r.status, 400, 'roles como string (no arreglo) debe rechazarse con 400');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details.some((d: any) => d.field === 'roles'));
    console.log('ok - admin/users POST: roles con forma inesperada (string) responde 400 VALIDATION_ERROR');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCrearUsuarioSinRolesDefaultAResidenciaNoAlias() {
  // rbac-migracion-alias-resident-technical-compras: el default de rol_global
  // cuando no se envía `roles` debía ser el alias 'resident'. Debe ser el rol
  // canónico 'residencia'.
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const email = `admin-users-default-rol-${Date.now()}@bocam.test`;
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), {
      email, password: 'ClaveSegura123!', nombre: 'Sin Rol Explicito',
    });
    assert.equal(r.status, 201);
    const body = (await r.json()) as any;
    assert.deepEqual(body.data.roles, ['residencia'], 'el default de rol_global sin roles explícitos debe ser residencia, no el alias resident');
    console.log('ok - admin/users POST: sin roles explícitos, el default es residencia (no el alias resident)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCrearUsuarioRechazaEmailFaltante() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), { password: 'x', nombre: 'Y' });
    assert.equal(r.status, 400);
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    console.log('ok - admin/users POST: email faltante responde 400 VALIDATION_ERROR');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── PATCH /api/v1/auth/admin/users/:id ───────────────────────────────────────

async function testActualizarUsuarioPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  const userId = randomUUID();
  await prisma.user.create({
    data: { id_usuario: userId, tenant_id: tenantId, email: `patch-zod-${Date.now()}@bocam.test`, password_hash: 'x', nombre: 'Original', rol_global: ['residencia'] },
  });
  try {
    const r = await patch(`/api/v1/auth/admin/users/${userId}`, adminToken(tenantId), { nombre: 'Actualizado', activo: false });
    assert.equal(r.status, 200, 'un payload de PATCH con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.data.nombre, 'Actualizado');
    assert.equal(body.data.activo, false);
    console.log('ok - admin/users PATCH: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testActualizarUsuarioRechazaActivoComoString() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  const userId = randomUUID();
  await prisma.user.create({
    data: { id_usuario: userId, tenant_id: tenantId, email: `patch-zod-2-${Date.now()}@bocam.test`, password_hash: 'x', nombre: 'Original', rol_global: ['residencia'] },
  });
  try {
    const r = await patch(`/api/v1/auth/admin/users/${userId}`, adminToken(tenantId), { activo: 'si' });
    assert.equal(r.status, 400, 'activo como string (no boolean) debe rechazarse con 400');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details.some((d: any) => d.field === 'activo'));

    const enBd = await prisma.user.findUniqueOrThrow({ where: { id_usuario: userId } });
    assert.equal(enBd.activo, true, 'el update NO debe haberse ejecutado contra Prisma');
    console.log('ok - admin/users PATCH: activo con forma inesperada (string) responde 400 VALIDATION_ERROR sin tocar Prisma');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCrearUsuarioPayloadValidoSigueFuncionando();
    await testCrearUsuarioRechazaRolesComoString();
    await testCrearUsuarioSinRolesDefaultAResidenciaNoAlias();
    await testCrearUsuarioRechazaEmailFaltante();
    await testActualizarUsuarioPayloadValidoSigueFuncionando();
    await testActualizarUsuarioRechazaActivoComoString();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-zod-admin-users integration tests');
  console.error(error);
  process.exitCode = 1;
});
