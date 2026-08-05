/**
 * ---------------------------------------------------------------------------
 * Test de Integración: rol 'finanzas' en POST /api/v1/auth/switch-project
 * Spec:  openspec/changes/fix-rol-finance-vs-finanzas-restante/
 *
 * El chequeo `isGlobalRole` de switch-project comparaba contra
 * ['admin', 'superintendent', 'finance', 'procurement'] — 'finance' (inglés)
 * no existe en el sistema, el rol real es 'finanzas' (español). Un usuario
 * de Finanzas sin un registro explícito en proyectos_acceso para el
 * proyecto destino recibía 403 en vez de que se le reconociera como rol
 * global (igual que admin/superintendent/procurement).
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

async function post(pathUrl: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function testRolFinanzasCambiaDeProyectoSinAccesoExplicito() {
  const tenantId = randomUUID();
  const userId = randomUUID();
  const proyectoDestinoId = randomUUID();

  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre: 'Tenant Test Finanzas Switch', rfc: `RFC${Date.now().toString().slice(-9)}` },
  });
  await prisma.user.create({
    data: {
      id_usuario: userId,
      tenant_id: tenantId,
      email: `finanzas-${Date.now()}@bocam.test`,
      password_hash: 'hash-no-usado-en-este-test',
      nombre: 'Usuario Finanzas Test',
      rol_global: ['finanzas'],
    },
  });
  await prisma.proyecto.create({
    data: {
      id_proyecto: proyectoDestinoId,
      tenant_id: tenantId,
      codigo_centro_costos: `CC-TEST-${Date.now()}`,
      nombre_oficial: 'Proyecto Destino Test Finanzas',
    },
  });
  // Deliberadamente SIN crear UserProjectAccess: el usuario no tiene acceso
  // explícito al proyecto destino, solo su rol_global.

  try {
    const token = signTenantToken({ userId, tenantId, proyectoId: randomUUID(), roles: ['finanzas'] });

    const r = await post('/api/v1/auth/switch-project', token, { proyecto_id: proyectoDestinoId });

    assert.notEqual(
      r.status, 403,
      `Un usuario con rol_global 'finanzas' (sin acceso explícito registrado) recibió 403 al cambiar ` +
      `de proyecto activo. El chequeo isGlobalRole sigue comparando contra 'finance' (inglés) en vez ` +
      `de 'finanzas' (español).`
    );
    assert.equal(r.status, 200, 'debe poder cambiar de proyecto activo como rol global');

    console.log('ok - POST /switch-project reconoce a finanzas como rol global');
  } finally {
    await prisma.userProjectAccess.deleteMany({ where: { user_id: userId } });
    await prisma.user.deleteMany({ where: { id_usuario: userId } });
    await prisma.proyecto.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
  }
}

async function main() {
  await setup();
  try {
    await testRolFinanzasCambiaDeProyectoSinAccesoExplicito();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rbac-rol-finanzas-switch-project integration tests');
  console.error(error);
  process.exitCode = 1;
});
