/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: revisión de nómina (fiscal y complementaria) por
 * Residencia — prerequisito de autorización de RH.
 * Spec: specs/features/01-revision-nomina-residencia.md (2.3, D1, D2)
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
  await prisma.nominaComplementariaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.nominaComplementaria.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.preNominaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.preNomina.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asignacionFrente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function get(path: string, token: string) {
  return fetch(`${personalBaseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function patch(path: string, token: string) {
  return fetch(`${personalBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
}

async function crearEmpleadoYCalcularPrenomina(tenantId: string, proyectoId: string, userId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  const empleado = await prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test',
      apellido_paterno: 'RevisionResidencia',
      rfc: `TRR${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
  await prisma.asignacionFrente.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId,
      empleado_id: empleado.id_empleado, frente_trabajo: 'Frente Test',
      fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA',
    },
  });

  const tokenAdmin = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });
  const r = await fetch(`${personalBaseUrl}/api/v1/personal/prenominas/calcular`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ periodo_inicio: '2026-07-13', periodo_fin: '2026-07-19', periodo_tipo: 'SEMANAL' }),
  });
  assert.equal(r.status, 201, 'debe poder calcular la pre-nómina de setup');
  const body = (await r.json()) as any;
  return body.data.id_prenomina as string;
}

// ── D1: GET /prenominas y /prenominas/:id ────────────────────────────────

async function testGateRolLecturaPrenominas() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const idPrenomina = await crearEmpleadoYCalcularPrenomina(tenantId, proyectoId, userId);

    const tokenResidencia = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const rLista = await get('/api/v1/personal/prenominas', tokenResidencia);
    assert.equal(rLista.status, 200, 'residencia debe poder leer la lista de prenóminas (no 403)');
    const rDetalle = await get(`/api/v1/personal/prenominas/${idPrenomina}`, tokenResidencia);
    assert.equal(rDetalle.status, 200, 'residencia debe poder leer el detalle de una prenómina (no 403)');

    const tokenSinAcceso = signTenantToken({ userId, tenantId, proyectoId, roles: ['control_obra'] });
    const rListaSinAcceso = await get('/api/v1/personal/prenominas', tokenSinAcceso);
    assert.equal(rListaSinAcceso.status, 403, 'un rol sin personal_rh/admin/residencia debe recibir 403 en la lista');

    console.log('ok - GET /prenominas y /prenominas/:id: residencia lee, control_obra recibe 403');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── D2: /marcar-revisado ──────────────────────────────────────────────────

async function testMarcarRevisadoPrenomina() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const idPrenomina = await crearEmpleadoYCalcularPrenomina(tenantId, proyectoId, userId);

    const tokenSinPermiso = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rForbidden = await patch(`/api/v1/personal/prenominas/${idPrenomina}/marcar-revisado`, tokenSinPermiso);
    assert.equal(rForbidden.status, 403, 'personal_rh no debe poder marcar revisado (solo residencia/admin)');

    const tokenResidencia = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await patch(`/api/v1/personal/prenominas/${idPrenomina}/marcar-revisado`, tokenResidencia);
    assert.equal(r.status, 200, 'residencia debe poder marcar revisado (no 403)');
    const body = (await r.json()) as any;
    assert.equal(body.data.revisado_por_residencia, true, 'revisado_por_residencia debe quedar en true');
    assert.ok(body.data.revisado_at, 'revisado_at debe quedar registrado');

    // Idempotencia: segunda llamada no debe fallar.
    const r2 = await patch(`/api/v1/personal/prenominas/${idPrenomina}/marcar-revisado`, tokenResidencia);
    assert.equal(r2.status, 200, 'segunda llamada a marcar-revisado debe ser no-op, no error');

    console.log('ok - PATCH /prenominas/:id/marcar-revisado: rol correcto, gate de rol, idempotente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── D2: /autorizar exige revisión previa (con bypass admin) ────────────────

async function testAutorizarExigeRevisionPrevia() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const idPrenomina = await crearEmpleadoYCalcularPrenomina(tenantId, proyectoId, userId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const rSinRevision = await patch(`/api/v1/personal/prenominas/${idPrenomina}/autorizar`, tokenRh);
    assert.equal(rSinRevision.status, 409, 'personal_rh no debe poder autorizar sin revisión previa de Residencia');

    console.log('ok - PATCH /prenominas/:id/autorizar responde 409 si no está revisado por Residencia');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testAutorizarBypassAdmin() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const idPrenomina = await crearEmpleadoYCalcularPrenomina(tenantId, proyectoId, userId);
    const tokenAdmin = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

    const r = await patch(`/api/v1/personal/prenominas/${idPrenomina}/autorizar`, tokenAdmin);
    assert.equal(r.status, 200, 'admin debe poder autorizar sin revisión previa (bypass)');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'AUTORIZADA', 'la pre-nómina debe transicionar a AUTORIZADA vía bypass');

    console.log('ok - PATCH /prenominas/:id/autorizar: admin tiene bypass de la revisión de Residencia');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testGateRolLecturaPrenominas();
    await testMarcarRevisadoPrenomina();
    await testAutorizarExigeRevisionPrevia();
    await testAutorizarBypassAdmin();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - revision-nomina-residencia integration tests');
  console.error(error);
  process.exitCode = 1;
});
