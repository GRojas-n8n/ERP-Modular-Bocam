/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: GET /api/v1/personal/residentes-disponibles
 * Spec:  openspec/changes/mejoras-ux-personal-rh/specs/asignacion-residente-empleado/
 * Tarea: 3.1-3.4 del tasks.md
 *
 * Cross-servicio: levanta `auth` real además de `personal` (proxy real).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de personal y de auth)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { PrismaClient as AuthPrismaClient } from '../../../auth/src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const personalDbUrl =
  process.env.PERSONAL_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=personal';
const authDbUrl =
  process.env.AUTH_DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=auth';

const prisma = new PrismaClient({ datasources: { db: { url: personalDbUrl } } });
const authPrisma = new AuthPrismaClient({ datasources: { db: { url: authDbUrl } } });

let personalServer: Server | undefined;
let personalBaseUrl = '';
let authServer: Server | undefined;
let authBaseUrl = '';

async function setup() {
  delete process.env.REDIS_URL;
  process.env.DATABASE_URL = authDbUrl;
  const authModule = await import('../../../auth/src/main');
  const startedAuth = await startHttpApp(authModule.app);
  authServer = startedAuth.server;
  authBaseUrl = startedAuth.baseUrl;

  process.env.DATABASE_URL = personalDbUrl;
  process.env.AUTH_SERVICE_URL = authBaseUrl;
  const personalModule = await import('../../src/main');
  const startedPersonal = await startHttpApp(personalModule.app);
  personalServer = startedPersonal.server;
  personalBaseUrl = startedPersonal.baseUrl;
}

async function teardown() {
  await stopHttpApp(personalServer);
  await stopHttpApp(authServer);
  await prisma.$disconnect();
  await authPrisma.$disconnect();
}

async function cleanupTenantAuth(tenantId: string) {
  await authPrisma.user.deleteMany({ where: { tenant_id: tenantId } });
  await authPrisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function get(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

// ── Test 3.1: personal_rh obtiene la lista que devuelve auth vía proxy ─────

async function testPersonalRhObtieneListaViaProxy() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    await authPrisma.tenant.create({
      data: { id_tenant: tenantId, nombre: 'Tenant Test Residentes Disponibles', rfc: `RFC${Date.now().toString().slice(-9)}` },
    });
    await authPrisma.user.create({
      data: {
        tenant_id: tenantId,
        email: `residente-${Date.now()}@bocam.local`,
        password_hash: 'hash-no-usado',
        nombre: 'Residente Disponible Uno',
        rol_global: ['residencia'],
        activo: true,
      },
    });

    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await get('/api/v1/personal/residentes-disponibles', token);
    assert.equal(r.status, 200, 'personal_rh debe poder obtener el directorio de residentes vía proxy');
    const body = (await r.json()) as any;
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].nombre, 'Residente Disponible Uno');

    console.log('ok - 3.1 personal_rh obtiene la lista de residentes vía proxy a auth');
  } finally {
    await cleanupTenantAuth(tenantId);
  }
}

// ── Test 3.2: rol sin permiso recibe 403 ─────────────────────────────────────

async function testRolSinPermisoRecibe403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const r = await get(
    '/api/v1/personal/residentes-disponibles',
    signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] })
  );
  assert.equal(r.status, 403, 'rol residencia no debe poder consultar el directorio de residentes disponibles');
  console.log('ok - 3.2 rol sin permiso (residencia) recibe 403');
}

// ── Test 3.3: auth no disponible → error controlado, no 500 crudo ──────────

async function testAuthNoDisponibleErrorControlado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const authServiceUrlOriginal = process.env.AUTH_SERVICE_URL;
  try {
    process.env.AUTH_SERVICE_URL = 'http://127.0.0.1:1'; // puerto que nadie escucha
    const r = await get(
      '/api/v1/personal/residentes-disponibles',
      signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] })
    );
    assert.equal(r.status, 502, 'auth no disponible debe responder un error controlado (502), no un 500 crudo');
    const body = (await r.json()) as any;
    assert.equal(body.success, false);
    console.log('ok - 3.3 auth no disponible responde error controlado (502), no 500 crudo');
  } finally {
    process.env.AUTH_SERVICE_URL = authServiceUrlOriginal;
  }
}

async function main() {
  await setup();
  try {
    await testPersonalRhObtieneListaViaProxy();
    await testRolSinPermisoRecibe403();
    await testAuthNoDisponibleErrorControlado();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - residentes-disponibles integration tests');
  console.error(error);
  process.exitCode = 1;
});
