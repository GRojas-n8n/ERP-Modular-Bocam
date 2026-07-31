/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: edición de datos generales de un empleado existente
 * Spec:  openspec/changes/editar-datos-empleado/specs/edicion-datos-empleado/
 * Tarea: 1.1-1.7 del tasks.md
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
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string, overrides: Partial<{ rfc: string; puesto: string }> = {}) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Edicion',
      rfc: overrides.rfc ?? `TED${sufijo}`,
      puesto: overrides.puesto ?? 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

async function patch(pathUrl: string, token: string, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── 1.1 — hoy el PATCH ignora campos generales en silencio ─────────────────

async function testCampoGeneralSePersiste() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, tokenRh, { puesto: 'Capataz' });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.puesto, 'Capataz', 'el PATCH debe persistir el campo general puesto');

    const actualizado = await prisma.empleado.findUnique({ where: { id_empleado: emp.id_empleado } });
    assert.equal(actualizado?.puesto, 'Capataz', 'el cambio debe quedar guardado en BD');

    console.log('ok - PATCH persiste campos generales (nombre, puesto, etc.)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.2 — campo obligatorio vacío ───────────────────────────────────────────

async function testCampoObligatorioVacioRechazado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, tokenRh, { rfc: '' });
    assert.equal(r.status, 400);
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'PER_MISSING_FIELDS');

    const sinCambios = await prisma.empleado.findUnique({ where: { id_empleado: emp.id_empleado } });
    assert.notEqual(sinCambios?.rfc, '', 'el rfc original no debe perderse');

    console.log('ok - PATCH con campo obligatorio vacío responde 400 PER_MISSING_FIELDS');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.3 — RFC duplicado ─────────────────────────────────────────────────────

async function testRfcDuplicadoRechazado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const rfcExistente = `DUP${Date.now().toString().slice(-6)}`;
    const empExistente = await crearEmpleado(tenantId, { rfc: rfcExistente });
    const empAEditar = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await patch(`/api/v1/personal/empleados/${empAEditar.id_empleado}`, tokenRh, { rfc: rfcExistente });
    assert.equal(r.status, 400);
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'PER_RFC_DUPLICADO');

    const sinCambios = await prisma.empleado.findUnique({ where: { id_empleado: empAEditar.id_empleado } });
    assert.notEqual(sinCambios?.rfc, rfcExistente, 'no debe adoptar el rfc duplicado');
    assert.equal(empExistente.rfc, rfcExistente, 'el empleado original conserva su rfc');

    console.log('ok - PATCH con rfc duplicado responde 400 PER_RFC_DUPLICADO y no modifica el registro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.4 — RFC nuevo sin colisión ────────────────────────────────────────────

async function testRfcNuevoSinColisionSeActualiza() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rfcNuevo = `NEW${Date.now().toString().slice(-6)}`;

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, tokenRh, { rfc: rfcNuevo });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.rfc, rfcNuevo);

    console.log('ok - PATCH con rfc nuevo sin colisión actualiza el empleado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.5 — rfc ausente no dispara el chequeo de unicidad ────────────────────

async function testSinRfcEnBodyNoDisparaChequeo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, tokenRh, { telefono: '5512345678' });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.telefono, '5512345678');
    assert.equal(body.data.rfc, emp.rfc, 'el rfc no debe cambiar cuando no viene en el body');

    console.log('ok - PATCH sin rfc en el body no dispara el chequeo de unicidad y actualiza otros campos');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.6 — rol no autorizado ─────────────────────────────────────────────────

async function testRolNoAutorizadoRechazado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenSinRol = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, tokenSinRol, { puesto: 'Otro' });
    assert.equal(r.status, 403);

    const sinCambios = await prisma.empleado.findUnique({ where: { id_empleado: emp.id_empleado } });
    assert.equal(sinCambios?.puesto, emp.puesto, 'no debe modificarse sin rol autorizado');

    console.log('ok - PATCH sin rol personal_rh/admin responde 403 y no modifica el empleado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.7 — campos generales + jornada en el mismo body ──────────────────────

async function testCamposGeneralesYJornadaJuntos() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, tokenRh, {
      puesto: 'Supervisor',
      modo_asistencia: 'JORNADA_COMPLETA',
      tipo_jornada: 'NOCTURNA',
    });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.puesto, 'Supervisor');
    assert.equal(body.data.tipo_jornada, 'NOCTURNA');

    console.log('ok - PATCH combinado (campos generales + jornada) actualiza ambos grupos');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCampoGeneralSePersiste();
    await testCampoObligatorioVacioRechazado();
    await testRfcDuplicadoRechazado();
    await testRfcNuevoSinColisionSeActualiza();
    await testSinRfcEnBodyNoDisparaChequeo();
    await testRolNoAutorizadoRechazado();
    await testCamposGeneralesYJornadaJuntos();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - edicion-datos-empleado integration tests');
  console.error(error);
  process.exitCode = 1;
});
