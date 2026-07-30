/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: préstamo de empleado a otro proyecto (por rango de fechas)
 * Spec:  specs/features/02-asignacion-empleados-residente-prestamos.md (sección 3)
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
  await prisma.asignacionFrente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadrilla.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Prestamo',
      rfc: `TPR${sufijo}`.slice(0, 13),
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

// ── Test: préstamo trunca la asignación estructural de origen ──────────────

async function testPrestamoTruncaAsignacionDeOrigen() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await prisma.asignacionFrente.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoOrigen,
        empleado_id: emp.id_empleado, frente_trabajo: 'Frente Origen',
        fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA',
      },
    });

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId: proyectoOrigen, roles: ['personal_rh'] });
    const r = await post(`/api/v1/personal/empleados/${emp.id_empleado}/prestamo`, tokenRh, {
      proyecto_destino_id: proyectoDestino,
      frente_trabajo: 'Frente Destino',
      fecha_inicio: '2026-07-13',
      fecha_fin: '2026-07-19',
    });
    assert.equal(r.status, 201, 'debe crear el préstamo');
    const body = (await r.json()) as any;
    assert.equal(body.data.asignacion.proyecto_id, proyectoDestino);
    assert.equal(body.data.asignacion.es_prestamo, true);

    const origenTruncada = await prisma.asignacionFrente.findFirst({
      where: { tenant_id: tenantId, proyecto_id: proyectoOrigen, empleado_id: emp.id_empleado },
    });
    assert.ok(origenTruncada?.fecha_fin, 'la asignación de origen debe quedar truncada con fecha_fin');
    assert.ok(new Date(origenTruncada!.fecha_fin!) < new Date('2026-07-13'), 'fecha_fin de origen debe ser antes de que empiece el préstamo');

    console.log('ok - préstamo trunca la AsignacionFrente estructural de origen');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: rechaza si el empleado está en una Cuadrilla activa del origen ───

async function testPrestamoRechazaSiCuadrillaActivaEnOrigen() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const userId = randomUUID();
  try {
    const cuadrilla = await prisma.cuadrilla.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoOrigen,
        nombre: 'Cuadrilla Test', codigo: `CUA-${Date.now()}`, especialidad: 'General', estado: 'ACTIVA',
      },
    });
    const emp = await prisma.empleado.create({
      data: {
        tenant_id: tenantId,
        numero_empleado: `EMP-${Date.now()}`,
        nombre: 'Test', apellido_paterno: 'Cuadrilla',
        rfc: `TCU${Date.now()}`.slice(0, 13),
        puesto: 'Obrero',
        fecha_ingreso: new Date('2026-01-01'),
        salario_diario: 300,
        estado: 'ACTIVO',
        cuadrilla_id: cuadrilla.id_cuadrilla,
      },
    });

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId: proyectoOrigen, roles: ['personal_rh'] });
    const r = await post(`/api/v1/personal/empleados/${emp.id_empleado}/prestamo`, tokenRh, {
      proyecto_destino_id: proyectoDestino,
      frente_trabajo: 'Frente Destino',
      fecha_inicio: '2026-07-13',
      fecha_fin: '2026-07-19',
    });
    assert.equal(r.status, 409, 'debe rechazar el préstamo si el empleado pertenece a una Cuadrilla activa del proyecto de origen');

    console.log('ok - préstamo rechaza empleados en Cuadrilla activa del proyecto de origen');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: rechaza dos préstamos solapados al mismo empleado ────────────────

async function testPrestamoRechazaSolapeConOtroPrestamo() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestinoA = randomUUID();
  const proyectoDestinoB = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId: proyectoOrigen, roles: ['personal_rh'] });

    const r1 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/prestamo`, tokenRh, {
      proyecto_destino_id: proyectoDestinoA,
      frente_trabajo: 'Frente A',
      fecha_inicio: '2026-07-13',
      fecha_fin: '2026-07-19',
    });
    assert.equal(r1.status, 201);

    const r2 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/prestamo`, tokenRh, {
      proyecto_destino_id: proyectoDestinoB,
      frente_trabajo: 'Frente B',
      fecha_inicio: '2026-07-15', // se solapa con el préstamo anterior (13-19)
      fecha_fin: '2026-07-21',
    });
    assert.equal(r2.status, 409, 'debe rechazar un segundo préstamo que se solape con uno ya vigente');

    console.log('ok - préstamo rechaza solape con otro préstamo vigente del mismo empleado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: reparto indefinido (fecha_fin null, spec sección 4) ───────────────

async function testPrestamoIndefinidoSinFechaFin() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId: proyectoOrigen, roles: ['personal_rh'] });

    const r = await post(`/api/v1/personal/empleados/${emp.id_empleado}/prestamo`, tokenRh, {
      proyecto_destino_id: proyectoDestino,
      frente_trabajo: 'Frente Reparto',
      fecha_inicio: '2026-07-13',
    });
    assert.equal(r.status, 201, 'debe permitir préstamo sin fecha_fin (reparto por pausa indefinida)');
    const body = (await r.json()) as any;
    assert.equal(body.data.asignacion.fecha_fin, null);

    console.log('ok - préstamo indefinido (sin fecha_fin) se crea correctamente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: rol sin permiso recibe 403 ────────────────────────────────────────

async function testPrestamoRechazaRolSinPermiso() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenResidencia = signTenantToken({ userId, tenantId, proyectoId: proyectoOrigen, roles: ['residencia'] });

    const r = await post(`/api/v1/personal/empleados/${emp.id_empleado}/prestamo`, tokenResidencia, {
      proyecto_destino_id: proyectoDestino,
      frente_trabajo: 'Frente Destino',
      fecha_inicio: '2026-07-13',
    });
    assert.equal(r.status, 403, 'residencia no puede crear préstamos (D3 del spec, solo personal_rh/admin)');

    console.log('ok - rol residencia recibe 403 al intentar crear un préstamo');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testPrestamoTruncaAsignacionDeOrigen();
    await testPrestamoRechazaSiCuadrillaActivaEnOrigen();
    await testPrestamoRechazaSolapeConOtroPrestamo();
    await testPrestamoIndefinidoSinFechaFin();
    await testPrestamoRechazaRolSinPermiso();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - prestamo-empleado-otro-proyecto integration tests');
  console.error(error);
  process.exitCode = 1;
});
