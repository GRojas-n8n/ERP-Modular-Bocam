/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación Zod — POST /api/v1/auth/switch-project
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

async function cleanupTenant(tenantId: string) {
  await prisma.userProjectAccess.deleteMany({ where: { user: { tenant_id: tenantId } } });
  await prisma.user.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function post(pathUrl: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function testPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  const userId = randomUUID();
  const proyectoId = randomUUID();

  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Tenant Test Switch Zod', rfc: `RFC${Date.now().toString().slice(-9)}` } });
  await prisma.user.create({
    data: { id_usuario: userId, tenant_id: tenantId, email: `switch-zod-${Date.now()}@bocam.test`, password_hash: 'no-usado', nombre: 'U', rol_global: ['admin'] },
  });
  await prisma.proyecto.create({
    data: { id_proyecto: proyectoId, tenant_id: tenantId, codigo_centro_costos: `CC-${Date.now()}`, nombre_oficial: 'Proyecto Switch Zod' },
  });
  await prisma.userProjectAccess.create({ data: { user_id: userId, proyecto_id: proyectoId } });

  try {
    const token = signTenantToken({ userId, tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const r = await post('/api/v1/auth/switch-project', token, { proyecto_id: proyectoId });
    assert.equal(r.status, 200, 'un payload con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.data.proyecto_id, proyectoId);
    console.log('ok - switch-project: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testRechazaProyectoIdComoArreglo() {
  const token = signTenantToken({ userId: randomUUID(), tenantId: randomUUID(), proyectoId: randomUUID(), roles: ['admin'] });
  const r = await post('/api/v1/auth/switch-project', token, { proyecto_id: ['no-deberia-ser-arreglo'] });
  assert.equal(r.status, 400, 'proyecto_id como arreglo debe rechazarse con 400');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((d: any) => d.field === 'proyecto_id'));
  console.log('ok - switch-project: proyecto_id con forma inesperada (arreglo) responde 400 VALIDATION_ERROR');
}

async function testRechazaProyectoIdFaltante() {
  const token = signTenantToken({ userId: randomUUID(), tenantId: randomUUID(), proyectoId: randomUUID(), roles: ['admin'] });
  const r = await post('/api/v1/auth/switch-project', token, {});
  assert.equal(r.status, 400);
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  console.log('ok - switch-project: proyecto_id faltante responde 400 VALIDATION_ERROR');
}

async function main() {
  await setup();
  try {
    await testPayloadValidoSigueFuncionando();
    await testRechazaProyectoIdComoArreglo();
    await testRechazaProyectoIdFaltante();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-zod-switch-project integration tests');
  console.error(error);
  process.exitCode = 1;
});
