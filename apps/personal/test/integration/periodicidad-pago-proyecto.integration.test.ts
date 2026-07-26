/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: periodicidad de pago por proyecto + scoping real
 * Spec:  openspec/changes/expediente-asignacion-periodicidad-personal/specs/periodicidad-pago-proyecto/
 * Tarea: 3.1-3.8 del tasks.md
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
  await prisma.configNominaProyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string, salario = 300) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Periodicidad',
      rfc: `TPD${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: salario,
      estado: 'ACTIVO',
    },
  });
}

async function asignarAFrente(tenantId: string, proyectoId: string, empleadoId: string) {
  return prisma.asignacionFrente.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId,
      empleado_id: empleadoId, frente_trabajo: 'Frente Test',
      fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA',
    },
  });
}

async function put(pathUrl: string, token: string, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

// ── Test: RH configura periodicidad por proyecto ────────────────────────────

async function testConfigurarPeriodicidadProyecto() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const rDefault = await get('/api/v1/personal/config-nomina', tokenRh);
    assert.equal(rDefault.status, 200);
    const bodyDefault = (await rDefault.json()) as any;
    assert.equal(bodyDefault.data.periodicidad_pago, 'SEMANAL', 'sin config debe resolver a SEMANAL por default');

    const rPut = await put('/api/v1/personal/config-nomina', tokenRh, { periodicidad_pago: 'MENSUAL' });
    assert.equal(rPut.status, 200, 'personal_rh debe poder configurar periodicidad');
    const bodyPut = (await rPut.json()) as any;
    assert.equal(bodyPut.data.periodicidad_pago, 'MENSUAL');

    const rGet = await get('/api/v1/personal/config-nomina', tokenRh);
    const bodyGet = (await rGet.json()) as any;
    assert.equal(bodyGet.data.periodicidad_pago, 'MENSUAL', 'la config persiste tras guardarla');

    console.log('ok - RH configura periodicidad de pago por proyecto (selector general, no por empleado)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testValorInvalidoRechazado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await put('/api/v1/personal/config-nomina', tokenRh, { periodicidad_pago: 'ANUAL' });
    assert.equal(r.status, 400, 'periodicidad_pago inválida debe rechazarse con 400');
    console.log('ok - periodicidad_pago inválida (ANUAL) rechazada con 400');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testRolSinPermisoNoConfigura() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const tokenResidente = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await put('/api/v1/personal/config-nomina', tokenResidente, { periodicidad_pago: 'MENSUAL' });
    assert.equal(r.status, 403, 'rol sin personal_rh/admin debe recibir 403');
    console.log('ok - rol sin permiso (residente) recibe 403 al configurar periodicidad');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: calcular usa la periodicidad configurada del proyecto ────────────

async function testCalcularUsaPeriodicidadConfigurada() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    await put('/api/v1/personal/config-nomina', tokenRh, { periodicidad_pago: 'QUINCENAL' });

    const rCalcular = await post('/api/v1/personal/prenominas/calcular', tokenRh, {
      periodo_inicio: '2026-07-01',
      periodo_fin: '2026-07-15',
    });
    assert.equal(rCalcular.status, 201, 'calcular debe funcionar sin enviar periodo_tipo en el body');
    const body = (await rCalcular.json()) as any;
    assert.equal(body.data.periodo_tipo, 'QUINCENAL', 'la prenomina debe usar la periodicidad configurada del proyecto, no un default');

    console.log('ok - calcular lee la periodicidad de ConfigNominaProyecto en vez de periodo_tipo del body');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCalcularIgnoraPeriodoTipoDelBody() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    await put('/api/v1/personal/config-nomina', tokenRh, { periodicidad_pago: 'MENSUAL' });

    const rCalcular = await post('/api/v1/personal/prenominas/calcular', tokenRh, {
      periodo_inicio: '2026-07-01',
      periodo_fin: '2026-07-31',
      periodo_tipo: 'SEMANAL', // contrato anterior — debe ignorarse
    });
    assert.equal(rCalcular.status, 201);
    const body = (await rCalcular.json()) as any;
    assert.equal(body.data.periodo_tipo, 'MENSUAL', 'periodo_tipo del body debe ignorarse; manda la config del proyecto');

    console.log('ok - calcular ignora periodo_tipo del body (contrato anterior) sin error');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: scoping real por proyecto (fix del bug de doble pago) ────────────

async function testScopingPorProyectoExcluyeEmpleadoDeOtroProyecto() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  const userId = randomUUID();
  try {
    const empA = await crearEmpleado(tenantId, 300);
    const empB = await crearEmpleado(tenantId, 400);
    await asignarAFrente(tenantId, proyectoA, empA.id_empleado);
    await asignarAFrente(tenantId, proyectoB, empB.id_empleado);

    const tokenRhA = signTenantToken({ userId, tenantId, proyectoId: proyectoA, roles: ['personal_rh'] });
    const rCalcular = await post('/api/v1/personal/prenominas/calcular', tokenRhA, {
      periodo_inicio: '2026-07-01',
      periodo_fin: '2026-07-07',
    });
    assert.equal(rCalcular.status, 201);
    const body = (await rCalcular.json()) as any;
    assert.equal(body.data.total_empleados, 1, 'solo debe incluir al empleado asignado al proyecto A, no al de B');

    console.log('ok - calcular filtra empleados por AsignacionFrente real del proyecto (fix del bug de doble pago)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testScopingPorCuadrillaFallback() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const cuadrilla = await prisma.cuadrilla.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId,
        nombre: 'Cuadrilla Test', codigo: 'CUA-TEST', especialidad: 'General', estado: 'ACTIVA',
      },
    });
    const emp = await crearEmpleado(tenantId);
    await prisma.empleado.update({ where: { id_empleado: emp.id_empleado }, data: { cuadrilla_id: cuadrilla.id_cuadrilla } });
    // Sin AsignacionFrente explícita — solo pertenece a la cuadrilla del proyecto.

    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rCalcular = await post('/api/v1/personal/prenominas/calcular', tokenRh, {
      periodo_inicio: '2026-07-01',
      periodo_fin: '2026-07-07',
    });
    assert.equal(rCalcular.status, 201);
    const body = (await rCalcular.json()) as any;
    assert.equal(body.data.total_empleados, 1, 'debe incluir al empleado asignado solo por cuadrilla del proyecto (fallback)');

    console.log('ok - calcular incluye empleados asignados solo por Cuadrilla.proyecto_id (sin AsignacionFrente)');
  } finally {
    await cleanupTenant(tenantId);
    await prisma.cuadrilla.deleteMany({ where: { tenant_id: tenantId } });
  }
}

async function main() {
  await setup();
  try {
    await testConfigurarPeriodicidadProyecto();
    await testValorInvalidoRechazado();
    await testRolSinPermisoNoConfigura();
    await testCalcularUsaPeriodicidadConfigurada();
    await testCalcularIgnoraPeriodoTipoDelBody();
    await testScopingPorProyectoExcluyeEmpleadoDeOtroProyecto();
    await testScopingPorCuadrillaFallback();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - periodicidad-pago-proyecto integration tests');
  console.error(error);
  process.exitCode = 1;
});
