/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación de longitud de campos de texto de Usuario
 * Spec:  openspec/changes/fix-auth-validacion-longitud-usuario/specs/validacion-entrada-zod/
 * Tarea: 1.1-1.2 del tasks.md
 *
 * Mismo bug ya corregido en Personal (fix-personal-validacion-longitud-empleado)
 * y Compras (fix-compras-validacion-longitud-proveedor): un email/nombre más
 * largo que la columna (VARCHAR(255)/VARCHAR(150)) hacía que
 * POST/PATCH /admin/users respondieran 500 con el mensaje crudo de Prisma.
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
  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Tenant Test Longitud Usuario', rfc: `RFC${Date.now().toString().slice(-9)}` } });
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

// ── 1.1 — alta de usuario con email más largo que la columna ───────────────

async function testCrearUsuarioConEmailDemasiadoLargo() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const emailLargo = `${'x'.repeat(250)}@bocam.test`; // > 255 caracteres
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), {
      email: emailLargo, password: 'ClaveSegura123!', nombre: 'Usuario Prueba',
    });

    assert.equal(r.status, 400, 'debe responder 400, no 500 con el mensaje crudo de Prisma');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(
      body.error.details?.some((d: any) => d.field === 'email'),
      'el detalle debe nombrar el campo email'
    );

    const creado = await prisma.user.findFirst({ where: { tenant_id: tenantId } });
    assert.equal(creado, null, 'no debe crearse ningún registro');

    console.log('ok - POST /admin/users con email demasiado largo responde 400 claro, sin crear el registro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.1b — alta de usuario con campos dentro del límite sigue funcionando ──

async function testCrearUsuarioConCamposValidosSigueFuncionando() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const email = `usuario-valido-${Date.now()}@bocam.test`;
    const r = await post('/api/v1/auth/admin/users', adminToken(tenantId), {
      email, password: 'ClaveSegura123!', nombre: 'Usuario Válido',
    });

    assert.equal(r.status, 201, 'un alta con campos dentro del límite no debe verse afectada por el fix');
    console.log('ok - POST /admin/users con campos válidos sigue creando el usuario con normalidad');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.2 — edición de usuario con nombre más largo que la columna ───────────

async function testActualizarUsuarioConNombreDemasiadoLargo() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  const userId = randomUUID();
  await prisma.user.create({
    data: { id_usuario: userId, tenant_id: tenantId, email: `patch-longitud-${Date.now()}@bocam.test`, password_hash: 'x', nombre: 'Original', rol_global: ['resident'] },
  });
  try {
    const nombreLargo = 'X'.repeat(151); // > 150 caracteres

    const r = await patch(`/api/v1/auth/admin/users/${userId}`, adminToken(tenantId), { nombre: nombreLargo });

    assert.equal(r.status, 400, 'debe responder 400, no 500 con el mensaje crudo de Prisma');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(
      body.error.details?.some((d: any) => d.field === 'nombre'),
      'el detalle debe nombrar el campo nombre'
    );

    const sinCambios = await prisma.user.findUnique({ where: { id_usuario: userId } });
    assert.equal(sinCambios?.nombre, 'Original', 'el registro no debe modificarse');

    console.log('ok - PATCH /admin/users/:id con nombre demasiado largo responde 400 claro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCrearUsuarioConEmailDemasiadoLargo();
    await testCrearUsuarioConCamposValidosSigueFuncionando();
    await testActualizarUsuarioConNombreDemasiadoLargo();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-longitud-usuario integration tests');
  console.error(error);
  process.exitCode = 1;
});
