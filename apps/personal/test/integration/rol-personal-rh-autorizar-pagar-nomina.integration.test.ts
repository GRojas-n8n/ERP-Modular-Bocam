/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: rol real 'personal_rh' en autorizar/pagar pre-nómina
 * Spec:  openspec/changes/fix-rol-rh-manager-vs-personal-rh-nomina/specs/control-acceso-autorizacion-nomina/
 * Tarea: 1.1-1.4 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const personalDbUrl =
  process.env.PERSONAL_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=personal';

const prisma = new PrismaClient({ datasources: { db: { url: personalDbUrl } } });

let personalServer: Server | undefined;
let personalBaseUrl = '';

async function setup() {
  const personalModule = await import('../../src/main');
  const started = await startHttpApp(personalModule.app);
  personalServer = started.server;
  personalBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(personalServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.preNominaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.preNomina.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function patch(path: string, token: string) {
  return fetch(`${personalBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
}

async function crearEmpleadoYCalcularPrenomina(tenantId: string, proyectoId: string, userId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  await prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test',
      apellido_paterno: 'Personal_RH',
      rfc: `TPR${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });

  const tokenAdmin = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });
  const r = await fetch(`${personalBaseUrl}/api/v1/personal/prenominas/calcular`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      periodo_inicio: '2026-07-13',
      periodo_fin: '2026-07-19',
      periodo_tipo: 'SEMANAL',
    }),
  });
  assert.equal(r.status, 201, 'debe poder calcular la pre-nómina de setup');
  const body = (await r.json()) as any;
  return body.data.id_prenomina as string;
}

// ── Test: personal_rh autoriza una pre-nómina CALCULADA ─────────────────────

async function testPersonalRhAutorizaPreNomina() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const idPrenomina = await crearEmpleadoYCalcularPrenomina(tenantId, proyectoId, userId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await patch(`/api/v1/personal/prenominas/${idPrenomina}/autorizar`, tokenRh);
    assert.equal(r.status, 200, 'personal_rh debe poder autorizar (no 403)');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'AUTORIZADA', 'la pre-nómina debe transicionar a AUTORIZADA');

    console.log('ok - usuario con rol personal_rh autoriza una pre-nómina CALCULADA');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: personal_rh marca como pagada una pre-nómina AUTORIZADA ──────────

async function testPersonalRhPagaPreNomina() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const idPrenomina = await crearEmpleadoYCalcularPrenomina(tenantId, proyectoId, userId);
    // Autorizar directo vía Prisma (el endpoint autorizar es el que está en rojo en el test anterior).
    await prisma.preNomina.update({
      where: { id_prenomina: idPrenomina },
      data: { estado: 'AUTORIZADA', autorizado_por: userId, fecha_autorizacion: new Date() },
    });

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await patch(`/api/v1/personal/prenominas/${idPrenomina}/pagar`, tokenRh);
    assert.equal(r.status, 200, 'personal_rh debe poder marcar como pagada (no 403)');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'PAGADA', 'la pre-nómina debe transicionar a PAGADA');

    console.log('ok - usuario con rol personal_rh marca una pre-nómina AUTORIZADA como pagada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: rol sin personal_rh/admin recibe 403 en ambos endpoints ──────────

async function testRolSinPermisoEs403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const idPrenomina = await crearEmpleadoYCalcularPrenomina(tenantId, proyectoId, userId);
    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });

    const rAutorizar = await patch(`/api/v1/personal/prenominas/${idPrenomina}/autorizar`, tokenSinPermiso);
    assert.equal(rAutorizar.status, 403, 'rol sin personal_rh/admin debe recibir 403 en autorizar');

    await prisma.preNomina.update({
      where: { id_prenomina: idPrenomina },
      data: { estado: 'AUTORIZADA', autorizado_por: userId, fecha_autorizacion: new Date() },
    });
    const rPagar = await patch(`/api/v1/personal/prenominas/${idPrenomina}/pagar`, tokenSinPermiso);
    assert.equal(rPagar.status, 403, 'rol sin personal_rh/admin debe recibir 403 en pagar');

    console.log('ok - rol sin personal_rh/admin (residencia) recibe 403 en autorizar y pagar');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testPersonalRhAutorizaPreNomina();
    await testPersonalRhPagaPreNomina();
    await testRolSinPermisoEs403();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rol-personal-rh-autorizar-pagar-nomina integration tests');
  console.error(error);
  process.exitCode = 1;
});
