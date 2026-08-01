/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: GET /empleados incluye frente de trabajo y residente
 * vigente por empleado (necesario para los filtros de descarga de QR/RH).
 * Spec:  openspec/changes/descarga-qr-empleados-filtrada/specs/credencial-empleado/
 * Tarea: 1.0 del tasks.md
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
  await prisma.asignacionResidente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asignacionFrente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'ListadoFiltros',
      rfc: `TLF${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

async function get(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function testIncluyeFrenteTrabajoActivo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await prisma.asignacionFrente.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, empleado_id: emp.id_empleado,
        frente_trabajo: 'Frente 1 — Cimentación', fecha_inicio: new Date('2026-01-01'),
        horas_diarias: 8, estado: 'ACTIVA',
      },
    });
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await get('/api/v1/personal/empleados', tokenRh);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    const encontrado = body.data.find((e: any) => e.id_empleado === emp.id_empleado);
    assert.ok(encontrado, 'el empleado debe aparecer en el listado');
    assert.ok(Array.isArray(encontrado.asignaciones), 'debe incluir el arreglo de asignaciones de frente');
    assert.equal(encontrado.asignaciones.length, 1);
    assert.equal(encontrado.asignaciones[0].frente_trabajo, 'Frente 1 — Cimentación');

    console.log('ok - GET /empleados incluye frente de trabajo activo por empleado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testIncluyeSoloResidenteVigente() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const residenteVigente = randomUUID();
  const residenteHistorico = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await prisma.asignacionResidente.create({
      data: { tenant_id: tenantId, empleado_id: emp.id_empleado, residente_id: residenteVigente, fecha_inicio: new Date('2026-01-01'), fecha_fin: null, asignado_por: userId },
    });
    await prisma.asignacionResidente.create({
      data: { tenant_id: tenantId, empleado_id: emp.id_empleado, residente_id: residenteHistorico, fecha_inicio: new Date('2025-01-01'), fecha_fin: new Date('2025-06-01'), asignado_por: userId },
    });
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await get('/api/v1/personal/empleados', tokenRh);
    const body = (await r.json()) as any;
    const encontrado = body.data.find((e: any) => e.id_empleado === emp.id_empleado);
    assert.ok(Array.isArray(encontrado.asignacionesResidente), 'debe incluir el arreglo de asignaciones de residente');
    assert.equal(encontrado.asignacionesResidente.length, 1, 'solo debe incluir la asignación vigente, no la histórica');
    assert.equal(encontrado.asignacionesResidente[0].residente_id, residenteVigente);

    console.log('ok - GET /empleados incluye solo el residente vigente por empleado (no el histórico)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testIncluyeFrenteTrabajoActivo();
    await testIncluyeSoloResidenteVigente();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - listado-empleados-incluye-frente-residente integration tests');
  console.error(error);
  process.exitCode = 1;
});
