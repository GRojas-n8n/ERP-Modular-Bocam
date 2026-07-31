/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: resolución de residente_nombre en GET .../residentes
 * Spec:  openspec/changes/mejoras-ux-personal-rh/specs/asignacion-residente-empleado/
 * Tarea: 2.1-2.4 del tasks.md
 *
 * Cross-servicio: levanta `auth` real además de `personal`, porque el bug es
 * que `personal` llama a una ruta de `auth` que no existe.
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
  // Construir los dos PrismaClient de este archivo (arriba) ya disparó el
  // auto-load de dotenv de sus respectivos .env vía schemaEnvPath, dejando
  // process.env.DATABASE_URL con el valor del último que se construyó (dotenv
  // no sobreescribe una env var ya definida). Los `db.ts` internos de cada
  // servicio (auth y personal) construyen su propio PrismaClient leyendo
  // process.env.DATABASE_URL directamente — hay que fijarlo explícitamente
  // antes de importar cada módulo para que cada uno apunte a su propio schema.
  //
  // apps/personal/.env también define REDIS_URL (no lo usa personal hoy, pero
  // contamina process.env). apps/auth/src/main.ts sí lo usa (rate limiter con
  // RedisStore) y, si lo ve seteado, intenta un cliente Redis que aquí nunca
  // se conecta — se limpia antes de importar auth para que caiga al
  // MemoryStore, igual que en el resto de sus tests de integración.
  delete process.env.REDIS_URL;
  process.env.DATABASE_URL = authDbUrl;
  const authModule = await import('../../../auth/src/main');
  const startedAuth = await startHttpApp(authModule.app);
  authServer = startedAuth.server;
  authBaseUrl = startedAuth.baseUrl;

  process.env.DATABASE_URL = personalDbUrl;
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

async function cleanupTenantPersonal(tenantId: string) {
  await prisma.asignacionResidente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function cleanupTenantAuth(tenantId: string) {
  await authPrisma.user.deleteMany({ where: { tenant_id: tenantId } });
  await authPrisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function crearEmpleado(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Residente',
      rfc: `TRN${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

async function post(pathUrl: string, token: string, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
async function get(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

// ── Test 2.1/2.3: con auth sano, residente_nombre se resuelve de verdad ────

async function testResuelveNombreConAuthSano() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    await authPrisma.tenant.create({
      data: { id_tenant: tenantId, nombre: 'Tenant Test Resolución Nombre', rfc: `RFC${Date.now().toString().slice(-9)}` },
    });
    const residente = await authPrisma.user.create({
      data: {
        tenant_id: tenantId,
        email: `residente-${Date.now()}@bocam.local`,
        password_hash: 'hash-no-usado',
        nombre: 'Residente De Prueba',
        rol_global: ['residencia'],
        activo: true,
      },
    });

    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    process.env.AUTH_SERVICE_URL = authBaseUrl;
    await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residente.id_usuario });

    const rList = await get(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh);
    assert.equal(rList.status, 200);
    const body = (await rList.json()) as any;
    assert.equal(body.data.parcial, false, 'con auth respondiendo, no debe marcarse parcial');
    assert.equal(body.data.asignaciones.length, 1);
    assert.equal(body.data.asignaciones[0].residente_nombre, 'Residente De Prueba', 'debe resolver el nombre real, no null');

    console.log('ok - 2.1/2.3 residente_nombre se resuelve de verdad con auth sano');
  } finally {
    await cleanupTenantPersonal(tenantId);
    await cleanupTenantAuth(tenantId);
  }
}

// ── Test 2.4: auth caído sigue degradando a parcial:true sin 500 ───────────

async function testAuthCaidoSigueDegradandoSinRomper() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const residenteId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    process.env.AUTH_SERVICE_URL = 'http://127.0.0.1:1'; // puerto que nadie escucha
    await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residenteId });

    const rList = await get(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh);
    assert.equal(rList.status, 200, 'auth caído no debe tumbar el endpoint con 500');
    const body = (await rList.json()) as any;
    assert.equal(body.data.parcial, true, 'auth caído debe degradar a parcial:true');
    assert.equal(body.data.asignaciones[0].residente_nombre, null);

    console.log('ok - 2.4 auth caído sigue degradando a parcial:true sin 500 (regresión evitada)');
  } finally {
    process.env.AUTH_SERVICE_URL = authBaseUrl;
    await cleanupTenantPersonal(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testResuelveNombreConAuthSano();
    await testAuthCaidoSigueDegradandoSinRomper();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - resolucion-nombre-residente integration tests');
  console.error(error);
  process.exitCode = 1;
});
