/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: límite absoluto de duración de sesión (refresh token)
 * Spec:  openspec/changes/sesion-jwt-inactividad/
 * Tareas: 1.2-1.4 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.JWT_MAX_SESSION_HOURS = '16';

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

async function seedUsuario() {
  const tenantId = randomUUID();
  const email = `test-${Date.now()}@sesion.local`;
  const password = 'Test.2026';
  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Tenant Sesión Test', rfc: `RFC${Date.now().toString().slice(-9)}` } });
  await prisma.user.create({
    data: {
      tenant_id: tenantId,
      email,
      password_hash: await bcrypt.hash(password, 4),
      nombre: 'Usuario Sesión Test',
      rol_global: ['admin'],
    },
  });
  return { tenantId, email, password };
}

async function login(email: string, password: string, tenantId: string) {
  return fetch(`${authBaseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenant_id: tenantId }),
  });
}

async function refresh(refreshToken: string) {
  return fetch(`${authBaseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// ── Test 1.2: login puebla sesion_iniciada_en ────────────────────────────────

async function testLoginPueblaSesionIniciadaEn() {
  const seeded = await seedUsuario();
  try {
    const r = await login(seeded.email, seeded.password, seeded.tenantId);
    assert.equal(r.status, 200, 'login debe ser exitoso');
    const body = (await r.json()) as any;

    const usuario = await prisma.user.findFirst({ where: { tenant_id: seeded.tenantId } });
    const tokenHash = require('crypto').createHash('sha256').update(body.data.refresh_token).digest('hex');
    const refreshRow = await prisma.refreshToken.findFirst({ where: { user_id: usuario!.id_usuario, token_hash: tokenHash } });
    assert.ok(refreshRow?.sesion_iniciada_en, 'sesion_iniciada_en debe quedar poblado en el login');

    console.log('ok - 1.2 login puebla sesion_iniciada_en en el refresh token');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.3: refresh dentro del límite rota y conserva sesion_iniciada_en ──

async function testRefreshConservaSesionIniciadaEn() {
  const seeded = await seedUsuario();
  try {
    const rLogin = await login(seeded.email, seeded.password, seeded.tenantId);
    const bodyLogin = (await rLogin.json()) as any;

    const usuario = await prisma.user.findFirst({ where: { tenant_id: seeded.tenantId } });
    const tokenHashOriginal = require('crypto').createHash('sha256').update(bodyLogin.data.refresh_token).digest('hex');
    const original = await prisma.refreshToken.findFirst({ where: { user_id: usuario!.id_usuario, token_hash: tokenHashOriginal } });

    const rRefresh = await refresh(bodyLogin.data.refresh_token);
    assert.equal(rRefresh.status, 200, 'refresh dentro del límite debe ser exitoso');
    const bodyRefresh = (await rRefresh.json()) as any;

    const tokenHashNuevo = require('crypto').createHash('sha256').update(bodyRefresh.data.refresh_token).digest('hex');
    const nuevo = await prisma.refreshToken.findFirst({ where: { user_id: usuario!.id_usuario, token_hash: tokenHashNuevo } });

    assert.equal(nuevo?.sesion_iniciada_en?.toISOString(), original?.sesion_iniciada_en?.toISOString(), 'el nuevo refresh token debe conservar el mismo sesion_iniciada_en del login original, no uno recalculado');

    console.log('ok - 1.3 refresh dentro del límite conserva sesion_iniciada_en sin recalcular');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.4: refresh fuera del límite responde 401 ──────────────────────────

async function testRefreshFueraDeLimiteResponde401() {
  const seeded = await seedUsuario();
  try {
    const rLogin = await login(seeded.email, seeded.password, seeded.tenantId);
    const bodyLogin = (await rLogin.json()) as any;

    const usuario = await prisma.user.findFirst({ where: { tenant_id: seeded.tenantId } });
    const tokenHash = require('crypto').createHash('sha256').update(bodyLogin.data.refresh_token).digest('hex');

    // Simular que la sesión inició hace 20h (excede el límite de 16h configurado).
    await prisma.refreshToken.updateMany({
      where: { user_id: usuario!.id_usuario, token_hash: tokenHash },
      data: { sesion_iniciada_en: new Date(Date.now() - 20 * 60 * 60 * 1000) },
    });

    const r = await refresh(bodyLogin.data.refresh_token);
    assert.equal(r.status, 401, 'refresh con sesión iniciada hace más de JWT_MAX_SESSION_HOURS debe responder 401');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'AUTH_REFRESH_INVALID');

    // El token usado debe quedar revocado (no reutilizable).
    const despues = await prisma.refreshToken.findFirst({ where: { user_id: usuario!.id_usuario, token_hash: tokenHash } });
    assert.equal(despues?.revoked, true, 'el refresh token debe quedar revocado tras el intento fallido por límite de sesión');

    console.log('ok - 1.4 refresh fuera del límite absoluto de sesión responde 401 y revoca el token');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testLoginPueblaSesionIniciadaEn();        // 1.2
    await testRefreshConservaSesionIniciadaEn();     // 1.3
    await testRefreshFueraDeLimiteResponde401();     // 1.4
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - sesion-jwt-inactividad integration tests');
  console.error(error);
  process.exitCode = 1;
});
