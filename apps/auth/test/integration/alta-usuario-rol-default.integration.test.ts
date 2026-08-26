/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: rol por defecto en alta de usuarios sin `roles`
 * explícito — POST /api/v1/auth/register y POST /api/v1/auth/admin/users
 * Spec:  openspec/changes/fix-default-rol-residente-legacy/specs/catalogo-de-roles/
 * Tareas: 2.1, 2.2, 2.3
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
  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Tenant Test Rol Default', rfc: `RFC${Date.now().toString().slice(-9)}` } });
}

async function cleanupTenant(tenantId: string) {
  await prisma.user.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

function adminToken(tenantId: string) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
}

async function post(pathUrl: string, token: string | undefined, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// ── POST /api/v1/auth/register ───────────────────────────────────────────────

async function testRegisterSinRolAsignaResidencia() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const email = `register-sin-rol-${Date.now()}@bocam.test`;
    const r = await post('/api/v1/auth/register', undefined, {
      email, password: 'ClaveSegura123!', nombre: 'Nuevo Residente', tenant_id: tenantId,
    });
    assert.equal(r.status, 201, 'el alta pública sin roles debe crear el usuario');

    const enBd = await prisma.user.findUniqueOrThrow({
      where: { tenant_id_email: { tenant_id: tenantId, email } },
    });
    assert.deepEqual(enBd.rol_global, ['residencia'], 'el default sin rol explícito debe ser el rol canónico, no el alias resident');
    console.log('ok - register: alta sin roles asigna rol_global ["residencia"]');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── POST /api/v1/auth/admin/users ────────────────────────────────────────────

async function testAdminUsersSinRolAsignaResidencia() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const email = `admin-users-sin-rol-${Date.now()}@bocam.test`;
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), {
      email, password: 'ClaveSegura123!', nombre: 'Nuevo Residente',
    });
    assert.equal(r.status, 201, 'el alta por admin sin roles debe crear el usuario');

    const enBd = await prisma.user.findUniqueOrThrow({
      where: { tenant_id_email: { tenant_id: tenantId, email } },
    });
    assert.deepEqual(enBd.rol_global, ['residencia'], 'el default sin rol explícito debe ser el rol canónico, no el alias resident');
    console.log('ok - admin/users POST: alta sin roles asigna rol_global ["residencia"]');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testAdminUsersConRolExplicitoNoSeVeAfectado() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const email = `admin-users-rol-explicito-${Date.now()}@bocam.test`;
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), {
      email, password: 'ClaveSegura123!', nombre: 'Comprador', roles: ['procurement'],
    });
    assert.equal(r.status, 201);

    const enBd = await prisma.user.findUniqueOrThrow({
      where: { tenant_id_email: { tenant_id: tenantId, email } },
    });
    assert.deepEqual(enBd.rol_global, ['procurement'], 'un rol explícito no debe ser reemplazado por el default');
    console.log('ok - admin/users POST: rol explícito sigue respetándose (no-regresión)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testRegisterSinRolAsignaResidencia();
    await testAdminUsersSinRolAsignaResidencia();
    await testAdminUsersConRolExplicitoNoSeVeAfectado();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - alta-usuario-rol-default integration tests');
  console.error(error);
  process.exitCode = 1;
});
