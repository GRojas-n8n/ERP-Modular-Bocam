/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Directorio de usuarios del tenant filtrado por rol
 * Spec:  openspec/changes/mejoras-ux-personal-rh/specs/directorio-usuarios-por-rol/
 * Tarea: 1.1-1.5 del tasks.md
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

async function cleanupTenant(tenantId: string) {
  await prisma.user.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function seedTenant(tenantId: string) {
  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre: 'Tenant Test Directorio', rfc: `RFC${Date.now().toString().slice(-9)}` },
  });
}

async function crearUsuario(tenantId: string, roles: string[], activo = true, nombre = 'Usuario Test') {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.user.create({
    data: {
      tenant_id: tenantId,
      email: `test-${sufijo}@bocam.local`,
      password_hash: 'hash-no-usado-en-este-test',
      nombre,
      rol_global: roles,
      activo,
    },
  });
}

async function get(pathUrl: string, token: string) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Test 1.1: personal_rh lista usuarios con rol residencia ─────────────────

async function testPersonalRhListaUsuariosPorRol() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const residente = await crearUsuario(tenantId, ['residencia'], true, 'Residente Uno');
    await crearUsuario(tenantId, ['compras'], true, 'Comprador Uno');

    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['personal_rh'] });
    const r = await get('/api/v1/auth/usuarios?rol=residencia', token);
    assert.equal(r.status, 200, 'personal_rh debe poder listar usuarios por rol');
    const body = (await r.json()) as any;
    assert.equal(body.data.length, 1, 'solo debe listar al usuario con rol residencia');
    const u = body.data[0];
    assert.equal(u.id, residente.id_usuario);
    assert.equal(u.nombre, 'Residente Uno');
    assert.ok(u.email);
    assert.deepEqual(Object.keys(u).sort(), ['email', 'id', 'nombre'], 'solo debe exponer id/nombre/email');

    console.log('ok - 1.1 personal_rh lista usuarios con rol residencia con campos mínimos');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.2: usuario inactivo no aparece en el listado ─────────────────────

async function testUsuarioInactivoNoAparece() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    await crearUsuario(tenantId, ['residencia'], false, 'Residente Inactivo');

    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['personal_rh'] });
    const r = await get('/api/v1/auth/usuarios?rol=residencia', token);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.length, 0, 'usuario inactivo no debe aparecer en el listado');

    console.log('ok - 1.2 usuario inactivo no aparece en el listado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.3: falta el query param rol ───────────────────────────────────────

async function testFaltaQueryParamRol() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['personal_rh'] });
    const r = await get('/api/v1/auth/usuarios', token);
    assert.equal(r.status, 400, 'sin query param rol debe responder 400');

    console.log('ok - 1.3 falta el query param rol responde 400');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.4: rol sin permiso recibe 403 ─────────────────────────────────────

async function testRolSinPermisoRecibe403() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['residencia'] });
    const r = await get('/api/v1/auth/usuarios?rol=residencia', token);
    assert.equal(r.status, 403, 'rol residencia no debe poder listar el directorio de usuarios');

    console.log('ok - 1.4 rol sin permiso (residencia) recibe 403');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.5: aislamiento por tenant ─────────────────────────────────────────

async function testAislamientoPorTenant() {
  const tenantId1 = randomUUID();
  const tenantId2 = randomUUID();
  await seedTenant(tenantId1);
  await seedTenant(tenantId2);
  try {
    const residenteT1 = await crearUsuario(tenantId1, ['residencia'], true, 'Residente Tenant Uno');
    await crearUsuario(tenantId2, ['residencia'], true, 'Residente Tenant Dos');

    const token = signTenantToken({ userId: randomUUID(), tenantId: tenantId1, proyectoId: randomUUID(), roles: ['personal_rh'] });
    const r = await get('/api/v1/auth/usuarios?rol=residencia', token);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.length, 1, 'solo debe ver al usuario de su propio tenant');
    assert.equal(body.data[0].id, residenteT1.id_usuario);

    console.log('ok - 1.5 aislamiento por tenant: cada tenant solo ve el suyo');
  } finally {
    await cleanupTenant(tenantId1);
    await cleanupTenant(tenantId2);
  }
}

async function main() {
  await setup();
  try {
    await testPersonalRhListaUsuariosPorRol();
    await testUsuarioInactivoNoAparece();
    await testFaltaQueryParamRol();
    await testRolSinPermisoRecibe403();
    await testAislamientoPorTenant();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - directorio-usuarios-por-rol integration tests');
  console.error(error);
  process.exitCode = 1;
});
