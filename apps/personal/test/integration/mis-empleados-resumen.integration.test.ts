/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: GET /mis-empleados/resumen (vista "Mi equipo")
 * Spec:  specs/features/02-asignacion-empleados-residente-prestamos.md (sección 5)
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

async function crearEmpleado(tenantId: string, categoria: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 10000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Equipo',
      rfc: `TEQ${sufijo}`.slice(0, 13),
      puesto: 'Obrero',
      categoria,
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

async function get(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}
async function post(pathUrl: string, token: string, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Test: agrupa por categoría y marca compartido cuando aplica ────────────

async function testResumenAgrupaPorCategoriaYMarcaCompartido() {
  const tenantId = randomUUID();
  const proyectoResidente = randomUUID();
  const otroProyecto = randomUUID();
  const userId = randomUUID();
  const residenteId = randomUUID();
  try {
    const empObrero = await crearEmpleado(tenantId, 'OBRERO');
    const empTecnico = await crearEmpleado(tenantId, 'TECNICO');
    const empPrestado = await crearEmpleado(tenantId, 'OBRERO');

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId: proyectoResidente, roles: ['personal_rh'] });
    for (const emp of [empObrero, empTecnico, empPrestado]) {
      const r = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residenteId });
      assert.equal(r.status, 201);
    }

    // empObrero y empTecnico trabajan en el proyecto del residente; empPrestado está en otro.
    await prisma.asignacionFrente.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoResidente, empleado_id: empObrero.id_empleado, frente_trabajo: 'F1', fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA' },
    });
    await prisma.asignacionFrente.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoResidente, empleado_id: empTecnico.id_empleado, frente_trabajo: 'F2', fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA' },
    });
    await prisma.asignacionFrente.create({
      data: { tenant_id: tenantId, proyecto_id: otroProyecto, empleado_id: empPrestado.id_empleado, frente_trabajo: 'F3', fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA' },
    });

    const tokenResidente = signTenantToken({ userId: residenteId, tenantId, proyectoId: proyectoResidente, roles: ['residencia'] });
    const r = await get('/api/v1/personal/mis-empleados/resumen', tokenResidente);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    const porCategoria = body.data.por_categoria as any[];

    const obreros = porCategoria.find(c => c.categoria === 'OBRERO');
    const tecnicos = porCategoria.find(c => c.categoria === 'TECNICO');
    assert.equal(obreros.total, 2, 'debe haber 2 obreros a cargo del residente');
    assert.equal(tecnicos.total, 1, 'debe haber 1 técnico a cargo del residente');

    const prestadoEnResumen = obreros.empleados.find((e: any) => e.id_empleado === empPrestado.id_empleado);
    assert.equal(prestadoEnResumen.compartido, true, 'el empleado con AsignacionFrente en otro proyecto debe marcarse compartido');
    assert.equal(prestadoEnResumen.proyecto_actual_id, otroProyecto);

    const obreroLocal = obreros.empleados.find((e: any) => e.id_empleado === empObrero.id_empleado);
    assert.equal(obreroLocal.compartido, false, 'el empleado que trabaja en el proyecto del residente no debe marcarse compartido');

    console.log('ok - /mis-empleados/resumen agrupa por categoría y marca compartido correctamente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testResumenVacioSinAsignaciones() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const residenteSinEquipo = randomUUID();
  try {
    const r = await get('/api/v1/personal/mis-empleados/resumen', signTenantToken({ userId: residenteSinEquipo, tenantId, proyectoId, roles: ['residencia'] }));
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.deepEqual(body.data.por_categoria, [], 'residente sin equipo debe recibir por_categoria vacío, sin crashear');
    console.log('ok - /mis-empleados/resumen responde vacío sin crashear cuando no hay equipo asignado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testResumenRechazaRolSinPermiso() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const r = await get('/api/v1/personal/mis-empleados/resumen', signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] }));
    assert.equal(r.status, 403, 'solo el rol residencia puede consultar su propio resumen de equipo');
    console.log('ok - /mis-empleados/resumen rechaza roles distintos de residencia');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testResumenAgrupaPorCategoriaYMarcaCompartido();
    await testResumenVacioSinAsignaciones();
    await testResumenRechazaRolSinPermiso();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - mis-empleados-resumen integration tests');
  console.error(error);
  process.exitCode = 1;
});
