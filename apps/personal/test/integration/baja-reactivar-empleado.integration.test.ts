/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: baja y reactivación de Empleado
 * Spec:  openspec/changes/wire-baja-reactivar-empleado/specs/baja-reactivar-empleado/
 * Tarea: 1.2-1.4 del tasks.md
 *
 * `PATCH /empleados/:id/baja` ya existía pero sin cobertura dedicada (solo
 * un caso dentro de rbac-endpoints-personal-sin-rol). Este archivo cubre el
 * nuevo endpoint `/reactivar` y confirma que `/baja` sigue funcionando igual.
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
  await prisma.empleado.updateMany({ where: { tenant_id: tenantId }, data: { cuadrilla_id: null } });
  await prisma.cuadrilla.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string, cuadrillaId?: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'BajaReactivar',
      rfc: `TBR${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
      cuadrilla_id: cuadrillaId,
    },
  });
}

async function patch(path: string, token: string) {
  return fetch(`${personalBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

// ── 1.2 — reactivar un empleado dado de baja ────────────────────────────────

async function testReactivarEmpleadoDadoDeBaja() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

  try {
    const emp = await crearEmpleado(tenantId);
    await prisma.empleado.update({ where: { id_empleado: emp.id_empleado }, data: { estado: 'BAJA', fecha_baja: new Date() } });

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}/reactivar`, token);
    assert.equal(r.status, 200, 'reactivar un empleado dado de baja debe responder 200');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'ACTIVO', 'el empleado debe transicionar a ACTIVO');
    assert.equal(body.data.fecha_baja, null, 'fecha_baja debe limpiarse');

    console.log('ok - PATCH /empleados/:id/reactivar transiciona BAJA -> ACTIVO y limpia fecha_baja');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.3 — rol sin permiso no puede reactivar ────────────────────────────────

async function testReactivarSinPermisoEs403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['control_obra'] });

  try {
    const emp = await crearEmpleado(tenantId);
    await prisma.empleado.update({ where: { id_empleado: emp.id_empleado }, data: { estado: 'BAJA', fecha_baja: new Date() } });

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}/reactivar`, token);
    assert.equal(r.status, 403, 'rol sin personal_rh/admin debe recibir 403 al reactivar');

    const sinCambios = await prisma.empleado.findUnique({ where: { id_empleado: emp.id_empleado } });
    assert.equal(sinCambios?.estado, 'BAJA', 'el empleado debe seguir en BAJA');

    console.log('ok - PATCH /empleados/:id/reactivar: 403 sin rol, no modifica el empleado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.1b — reactivar no restaura la cuadrilla anterior ──────────────────────

async function testReactivarNoRestauraCuadrilla() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

  try {
    const cuadrilla = await prisma.cuadrilla.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, nombre: 'Cuadrilla Test', codigo: 'CUA-TEST', especialidad: 'General' },
    });
    const emp = await crearEmpleado(tenantId, cuadrilla.id_cuadrilla);

    const rBaja = await patch(`/api/v1/personal/empleados/${emp.id_empleado}/baja`, token);
    assert.equal(rBaja.status, 200);
    const bodyBaja = (await rBaja.json()) as any;
    assert.equal(bodyBaja.data.cuadrilla_id, null, 'baja debe quitar la cuadrilla');

    const rReactivar = await patch(`/api/v1/personal/empleados/${emp.id_empleado}/reactivar`, token);
    assert.equal(rReactivar.status, 200);
    const bodyReactivar = (await rReactivar.json()) as any;
    assert.equal(bodyReactivar.data.estado, 'ACTIVO');
    assert.equal(bodyReactivar.data.cuadrilla_id, null, 'reactivar no debe restaurar la cuadrilla anterior');

    console.log('ok - reactivar deja al empleado ACTIVO sin restaurar su cuadrilla previa');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.4 — regresión: /baja sigue funcionando igual que antes ───────────────

async function testBajaSigueFuncionandoIgual() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const emp = await crearEmpleado(tenantId);

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}/baja`, token);
    assert.equal(r.status, 200, '/baja debe seguir respondiendo 200');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'BAJA');
    assert.equal(body.data.cuadrilla_id, null);
    assert.ok(body.data.fecha_baja, 'fecha_baja debe quedar establecida');

    console.log('ok - PATCH /empleados/:id/baja sigue funcionando sin cambios (regresión)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testReactivarEmpleadoDadoDeBaja();
    await testReactivarSinPermisoEs403();
    await testReactivarNoRestauraCuadrilla();
    await testBajaSigueFuncionandoIgual();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - baja-reactivar-empleado integration tests');
  console.error(error);
  process.exitCode = 1;
});
