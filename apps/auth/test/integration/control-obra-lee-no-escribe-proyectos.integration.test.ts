/**
 * ---------------------------------------------------------------------------
 * Test de Integración: control_obra puede LEER el listado de Proyectos
 * (visibilidad desde su propio menú) pero NO crear/editar — esa capacidad
 * sigue exclusiva de admin/gerencia_tecnica/control_proyectos.
 *
 * Spec: openspec/changes/acceso-proyectos-gt-control-obra/
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

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
  await prisma.proyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function seedTenant(tenantId: string) {
  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre: 'Tenant Test control_obra Proyectos', rfc: `RFC${Date.now().toString().slice(-9)}` },
  });
}

async function get(pathUrl: string, token: string) {
  return fetch(`${authBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function post(pathUrl: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function testControlObraPuedeLeerPeroNoCrear() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['control_obra'] });

    const rGet = await get('/api/v1/auth/admin/proyectos', token);
    assert.equal(rGet.status, 200, 'control_obra debe poder leer el listado de Proyectos (visibilidad desde su propio menú)');

    const rPost = await post('/api/v1/auth/admin/proyectos', token, {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: randomUUID(),
      nombre_oficial: 'Intento no autorizado desde control_obra',
    });
    assert.equal(rPost.status, 403, 'control_obra NO debe poder crear un centro de costos — esa capacidad sigue exclusiva de admin/gerencia_tecnica/control_proyectos');

    const enBd = await prisma.proyecto.findMany({ where: { tenant_id: tenantId } });
    assert.equal(enBd.length, 0, 'no debe haberse creado ningún proyecto');

    console.log('ok - control_obra lee Proyectos (200) pero no puede crear (403)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testControlObraPuedeLeerPeroNoCrear();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - control-obra-lee-no-escribe-proyectos integration tests');
  console.error(error);
  process.exitCode = 1;
});
