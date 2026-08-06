/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación Zod — login, register, refresh
 * Spec:  openspec/changes/validacion-zod-endpoints-auth/specs/validacion-entrada-zod/
 * Tareas: 4.2, 4.3
 *
 * Verifica que introducir validación Zod en POST /login, /register y /refresh
 * no cambia el contrato de éxito (payload válido sigue funcionando igual), y
 * que un payload con forma inesperada (campo faltante, objeto en vez de
 * string) responde 400 con VALIDATION_ERROR sin llegar a Prisma.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

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
  await prisma.refreshToken.deleteMany({ where: { user: { tenant_id: tenantId } } });
  await prisma.user.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function post(pathUrl: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── POST /api/v1/auth/login ──────────────────────────────────────────────────

async function testLoginPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  const plainPassword = 'ClaveSegura123!';
  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre: 'Tenant Test Login Zod', rfc: `RFC${Date.now().toString().slice(-9)}` },
  });
  await prisma.user.create({
    data: {
      tenant_id: tenantId,
      email: `login-zod-${Date.now()}@bocam.test`,
      password_hash: await bcrypt.hash(plainPassword, 4),
      nombre: 'Usuario Login Zod',
      rol_global: ['admin'],
    },
  });
  const user = await prisma.user.findFirstOrThrow({ where: { tenant_id: tenantId } });

  try {
    const r = await post('/api/v1/auth/login', {
      email: user.email,
      password: plainPassword,
      tenant_id: tenantId,
    });
    assert.equal(r.status, 200, 'un payload de login con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.success, true);
    assert.ok(body.data.access_token, 'debe emitir access_token');
    console.log('ok - login: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testLoginRechazaPasswordConFormaInesperada() {
  const r = await post('/api/v1/auth/login', {
    email: 'cualquiera@bocam.test',
    password: { esto: 'no debería ser un objeto' },
    tenant_id: randomUUID(),
  });
  assert.equal(r.status, 400, 'password como objeto debe rechazarse con 400, no llegar a bcrypt/Prisma');
  const body = (await r.json()) as any;
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((d: any) => d.field === 'password'));
  console.log('ok - login: password con forma inesperada (objeto) responde 400 VALIDATION_ERROR');
}

async function testLoginRechazaTenantIdFaltante() {
  const r = await post('/api/v1/auth/login', { email: 'a@b.com', password: 'x' });
  assert.equal(r.status, 400);
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((d: any) => d.field === 'tenant_id'));
  console.log('ok - login: tenant_id faltante responde 400 VALIDATION_ERROR');
}

// ── POST /api/v1/auth/register ───────────────────────────────────────────────

async function testRegisterPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre: 'Tenant Test Register Zod', rfc: `RFC${Date.now().toString().slice(-9)}` },
  });
  try {
    const email = `register-zod-${Date.now()}@bocam.test`;
    const r = await post('/api/v1/auth/register', {
      email, password: 'ClaveSegura123!', nombre: 'Usuario Nuevo', tenant_id: tenantId,
    });
    assert.equal(r.status, 201, 'un payload de register con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.email, email);
    console.log('ok - register: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testRegisterRechazaEmailComoObjeto() {
  const r = await post('/api/v1/auth/register', {
    email: { nested: true }, password: 'x', nombre: 'Y', tenant_id: randomUUID(),
  });
  assert.equal(r.status, 400, 'email como objeto debe rechazarse con 400');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((d: any) => d.field === 'email'));
  console.log('ok - register: email con forma inesperada (objeto) responde 400 VALIDATION_ERROR');
}

async function testRegisterRechazaNombreFaltante() {
  const r = await post('/api/v1/auth/register', {
    email: 'x@y.com', password: 'x', tenant_id: randomUUID(),
  });
  assert.equal(r.status, 400);
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((d: any) => d.field === 'nombre'));
  console.log('ok - register: nombre faltante responde 400 VALIDATION_ERROR');
}

// ── POST /api/v1/auth/refresh ────────────────────────────────────────────────

async function testRefreshRechazaTokenComoNumero() {
  const r = await post('/api/v1/auth/refresh', { refresh_token: 123456 });
  assert.equal(r.status, 400, 'refresh_token como número debe rechazarse con 400');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((d: any) => d.field === 'refresh_token'));
  console.log('ok - refresh: refresh_token con forma inesperada (número) responde 400 VALIDATION_ERROR');
}

async function testRefreshRechazaTokenFaltante() {
  const r = await post('/api/v1/auth/refresh', {});
  assert.equal(r.status, 400);
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  console.log('ok - refresh: refresh_token faltante responde 400 VALIDATION_ERROR');
}

async function testRefreshInvalidoPeroBienFormadoSigueRespondiendo401() {
  // Un refresh_token bien formado (string) que no existe en BD debe seguir
  // respondiendo 401 AUTH_REFRESH_INVALID como antes de este change — Zod no
  // debe interceptar este camino, solo el de forma/tipo incorrecta.
  const r = await post('/api/v1/auth/refresh', { refresh_token: 'token-que-no-existe-en-bd' });
  assert.equal(r.status, 401, 'un refresh_token bien formado pero inexistente debe seguir siendo 401, no 400');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'AUTH_REFRESH_INVALID');
  console.log('ok - refresh: token bien formado pero inválido sigue respondiendo 401 (comportamiento preexistente intacto)');
}

async function main() {
  await setup();
  try {
    await testLoginPayloadValidoSigueFuncionando();
    await testLoginRechazaPasswordConFormaInesperada();
    await testLoginRechazaTenantIdFaltante();
    await testRegisterPayloadValidoSigueFuncionando();
    await testRegisterRechazaEmailComoObjeto();
    await testRegisterRechazaNombreFaltante();
    await testRefreshRechazaTokenComoNumero();
    await testRefreshRechazaTokenFaltante();
    await testRefreshInvalidoPeroBienFormadoSigueRespondiendo401();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-zod-login-register-refresh integration tests');
  console.error(error);
  process.exitCode = 1;
});
