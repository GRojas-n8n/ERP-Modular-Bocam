/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: RBAC en endpoints de gestión de personal sin guardia
 * Spec:  openspec/changes/fix-rbac-endpoints-personal-sin-rol/specs/control-acceso-gestion-personal/
 * Tarea: 2.1-2.7 del tasks.md
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
  await prisma.asignacionFrente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.updateMany({ where: { tenant_id: tenantId }, data: { cuadrilla_id: null } });
  await prisma.cuadrilla.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function post(pathUrl: string, token: string, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patch(pathUrl: string, token: string, body: unknown = {}) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function crearEmpleado(tenantId: string, salario = 300) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'RBAC',
      rfc: `TRB${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: salario,
      estado: 'ACTIVO',
    },
  });
}

async function crearCuadrilla(tenantId: string, proyectoId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.cuadrilla.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId,
      nombre: 'Cuadrilla Test', codigo: `CUA-T${sufijo}`,
      especialidad: 'Cimentación', estado: 'ACTIVA',
    },
  });
}

// ── Test 1: alta individual de empleado ─────────────────────────────────────

async function testAltaEmpleado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const rSinPermiso = await post('/api/v1/personal/empleados', tokenSinPermiso, {
      nombre: 'Juan', apellido_paterno: 'Pérez', rfc: `JPX${sufijo}A`,
      puesto: 'Obrero', salario_diario: 300,
    });
    assert.equal(rSinPermiso.status, 403, 'rol sin personal_rh/admin debe recibir 403 al dar de alta');

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rRh = await post('/api/v1/personal/empleados', tokenRh, {
      nombre: 'Juan', apellido_paterno: 'Pérez', rfc: `JPX${sufijo}B`,
      puesto: 'Obrero', salario_diario: 300,
    });
    assert.equal(rRh.status, 201, 'personal_rh debe poder dar de alta un empleado');

    console.log('ok - POST /empleados: 403 sin rol, 201 con personal_rh');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2: baja de empleado ─────────────────────────────────────────────────

async function testBajaEmpleado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['control_obra'] });
    const rSinPermiso = await patch(`/api/v1/personal/empleados/${emp.id_empleado}/baja`, tokenSinPermiso);
    assert.equal(rSinPermiso.status, 403, 'rol sin personal_rh/admin debe recibir 403 al dar de baja');

    const tokenAdmin = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });
    const rAdmin = await patch(`/api/v1/personal/empleados/${emp.id_empleado}/baja`, tokenAdmin);
    assert.equal(rAdmin.status, 200, 'admin debe poder dar de baja un empleado');
    const body = (await rAdmin.json()) as any;
    assert.equal(body.data.estado, 'BAJA', 'el empleado debe transicionar a BAJA');

    console.log('ok - PATCH /empleados/:id/baja: 403 sin rol, 200 con admin');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 3: creación de cuadrilla ────────────────────────────────────────────

async function testCrearCuadrilla() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const rSinPermiso = await post('/api/v1/personal/cuadrillas', tokenSinPermiso, {
      nombre: 'Cuadrilla Alfa', especialidad: 'Estructura',
    });
    assert.equal(rSinPermiso.status, 403, 'rol sin personal_rh/admin debe recibir 403 al crear cuadrilla');

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rRh = await post('/api/v1/personal/cuadrillas', tokenRh, {
      nombre: 'Cuadrilla Alfa', especialidad: 'Estructura',
    });
    assert.equal(rRh.status, 201, 'personal_rh debe poder crear una cuadrilla');

    console.log('ok - POST /cuadrillas: 403 sin rol, 201 con personal_rh');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 4: asignar empleados a cuadrilla ────────────────────────────────────

async function testAsignarCuadrilla() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const cuadrilla = await crearCuadrilla(tenantId, proyectoId);
    const emp = await crearEmpleado(tenantId);

    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['control_obra'] });
    const rSinPermiso = await post(`/api/v1/personal/cuadrillas/${cuadrilla.id_cuadrilla}/asignar`, tokenSinPermiso, {
      empleado_ids: [emp.id_empleado],
    });
    assert.equal(rSinPermiso.status, 403, 'rol sin personal_rh/admin debe recibir 403 al asignar a cuadrilla');

    const tokenAdmin = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });
    const rAdmin = await post(`/api/v1/personal/cuadrillas/${cuadrilla.id_cuadrilla}/asignar`, tokenAdmin, {
      empleado_ids: [emp.id_empleado],
    });
    assert.equal(rAdmin.status, 200, 'admin debe poder asignar empleados a una cuadrilla');

    console.log('ok - POST /cuadrillas/:id/asignar: 403 sin rol, 200 con admin');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 5: crear asignación a frente de trabajo ─────────────────────────────

async function testCrearAsignacionFrente() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);

    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const rSinPermiso = await post('/api/v1/personal/asignaciones', tokenSinPermiso, {
      empleado_id: emp.id_empleado, frente_trabajo: 'Frente 1 — Cimentación',
    });
    assert.equal(rSinPermiso.status, 403, 'rol sin personal_rh/admin debe recibir 403 al crear asignación a frente');

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rRh = await post('/api/v1/personal/asignaciones', tokenRh, {
      empleado_id: emp.id_empleado, frente_trabajo: 'Frente 1 — Cimentación',
    });
    assert.equal(rRh.status, 201, 'personal_rh debe poder crear una asignación a frente');

    console.log('ok - POST /asignaciones: 403 sin rol, 201 con personal_rh');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 6: calcular pre-nómina ──────────────────────────────────────────────

async function testCalcularPrenomina() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await prisma.asignacionFrente.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId,
        empleado_id: emp.id_empleado, frente_trabajo: 'Frente Test',
        fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA',
      },
    });

    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const rSinPermiso = await post('/api/v1/personal/prenominas/calcular', tokenSinPermiso, {
      periodo_inicio: '2026-07-13', periodo_fin: '2026-07-19',
    });
    assert.equal(rSinPermiso.status, 403, 'rol sin personal_rh/admin debe recibir 403 al calcular pre-nómina');

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rRh = await post('/api/v1/personal/prenominas/calcular', tokenRh, {
      periodo_inicio: '2026-07-13', periodo_fin: '2026-07-19',
    });
    assert.equal(rRh.status, 201, 'personal_rh debe poder calcular una pre-nómina');

    console.log('ok - POST /prenominas/calcular: 403 sin rol, 201 con personal_rh');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAltaEmpleado();
    await testBajaEmpleado();
    await testCrearCuadrilla();
    await testAsignarCuadrilla();
    await testCrearAsignacionFrente();
    await testCalcularPrenomina();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rbac-endpoints-personal-sin-rol integration tests');
  console.error(error);
  process.exitCode = 1;
});
