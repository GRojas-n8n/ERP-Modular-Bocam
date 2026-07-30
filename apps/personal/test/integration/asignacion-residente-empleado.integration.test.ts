/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: asignación de empleado a Residente(s)
 * Spec:  openspec/changes/expediente-asignacion-periodicidad-personal/specs/asignacion-residente-empleado/
 * Tarea: 6.1-6.5 del tasks.md
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
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Residente',
      rfc: `TRE${sufijo}`,
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
async function del(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

// ── Test: asignar uno o más residentes sin remover al anterior ─────────────

async function testAsignarMultiplesResidentes() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const residente1 = randomUUID();
  const residente2 = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r1 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residente1 });
    assert.equal(r1.status, 201);

    const r2 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residente2 });
    assert.equal(r2.status, 201);

    const rList = await get(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh);
    assert.equal(rList.status, 200);
    const body = (await rList.json()) as any;
    assert.equal(body.data.asignaciones.length, 2, 'ambos residentes deben quedar vigentes simultáneamente');

    console.log('ok - se pueden asignar múltiples residentes vigentes al mismo empleado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testDesasignarConservaHistorial() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const residenteId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const rAsignar = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residenteId });
    const asignacion = (await rAsignar.json()) as any;

    const rDel = await del(`/api/v1/personal/empleados/${emp.id_empleado}/residentes/${asignacion.data.id_asignacion}`, tokenRh);
    assert.equal(rDel.status, 200);
    const desasignada = (await rDel.json()) as any;
    assert.ok(desasignada.data.fecha_fin, 'debe setear fecha_fin en vez de borrar el registro');

    const rVigentes = await get(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh);
    const vigentes = (await rVigentes.json()) as any;
    assert.equal(vigentes.data.asignaciones.length, 0, 'no debe aparecer entre las vigentes tras desasignar');

    const rHistorico = await get(`/api/v1/personal/empleados/${emp.id_empleado}/residentes?incluirHistorico=true`, tokenRh);
    const historico = (await rHistorico.json()) as any;
    assert.equal(historico.data.asignaciones.length, 1, 'debe seguir apareciendo en el histórico');

    console.log('ok - desasignar residente conserva historial (fecha_fin, no borrado)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: /mis-empleados aísla por residente ────────────────────────────────

async function testMisEmpleadosAislamiento() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const residenteA = randomUUID();
  const residenteB = randomUUID();
  try {
    const empA = await crearEmpleado(tenantId);
    const empB = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    await post(`/api/v1/personal/empleados/${empA.id_empleado}/residentes`, tokenRh, { residente_id: residenteA });
    await post(`/api/v1/personal/empleados/${empB.id_empleado}/residentes`, tokenRh, { residente_id: residenteB });

    const tokenResidenteA = signTenantToken({ userId: residenteA, tenantId, proyectoId, roles: ['residencia'] });
    const rMisEmpleados = await get('/api/v1/personal/mis-empleados', tokenResidenteA);
    assert.equal(rMisEmpleados.status, 200);
    const body = (await rMisEmpleados.json()) as any;
    assert.equal(body.data.length, 1, 'residente A solo debe ver a su propio empleado asignado');
    assert.equal(body.data[0].id_empleado, empA.id_empleado);

    console.log('ok - /mis-empleados aísla correctamente por residente asignado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testResidenteSinAsignacionesNoVeNada() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const residenteSinAsignar = randomUUID();
  try {
    const r = await get('/api/v1/personal/mis-empleados', signTenantToken({ userId: residenteSinAsignar, tenantId, proyectoId, roles: ['residencia'] }));
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.length, 0, 'residente sin asignaciones no debe ver ningún empleado');
    console.log('ok - residente sin asignaciones no ve ningún empleado en /mis-empleados');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: es_principal (spec 02, 2.1) — no cierra, solo desmarca ───────────

async function testEsPrincipalDesmarcaAnteriorSinCerrar() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const residente1 = randomUUID();
  const residente2 = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r1 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residente1 });
    assert.equal(r1.status, 201);
    const a1 = (await r1.json()) as any;
    assert.equal(a1.data.es_principal, true, 'la primera asignación es principal por default');

    const r2 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residente2 });
    assert.equal(r2.status, 201);
    const a2 = (await r2.json()) as any;
    assert.equal(a2.data.es_principal, true, 'la nueva asignación es principal por default');

    const rList = await get(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh);
    const body = (await rList.json()) as any;
    assert.equal(body.data.asignaciones.length, 2, 'ambas asignaciones deben seguir vigentes (no se cierran)');

    const anterior = body.data.asignaciones.find((a: any) => a.id_asignacion === a1.data.id_asignacion);
    const nueva = body.data.asignaciones.find((a: any) => a.id_asignacion === a2.data.id_asignacion);
    assert.equal(anterior.fecha_fin, null, 'la asignación anterior NO debe cerrarse');
    assert.equal(anterior.es_principal, false, 'la asignación anterior debe quedar desmarcada como principal');
    assert.equal(nueva.es_principal, true, 'la asignación nueva debe ser la principal');

    console.log('ok - es_principal desmarca la asignación anterior sin cerrarla (personal compartido intacto)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEsPrincipalFalseNoDesmarcaAnterior() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const residente1 = randomUUID();
  const residente2 = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r1 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residente1 });
    const a1 = (await r1.json()) as any;

    const r2 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh, { residente_id: residente2, es_principal: false });
    assert.equal(r2.status, 201);
    const a2 = (await r2.json()) as any;
    assert.equal(a2.data.es_principal, false);

    const rList = await get(`/api/v1/personal/empleados/${emp.id_empleado}/residentes`, tokenRh);
    const body = (await rList.json()) as any;
    const anterior = body.data.asignaciones.find((a: any) => a.id_asignacion === a1.data.id_asignacion);
    assert.equal(anterior.es_principal, true, 'con es_principal:false explícito, la asignación anterior conserva su estado de principal');

    console.log('ok - es_principal:false no desmarca ninguna asignación existente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAsignarMultiplesResidentes();
    await testDesasignarConservaHistorial();
    await testMisEmpleadosAislamiento();
    await testResidenteSinAsignacionesNoVeNada();
    await testEsPrincipalDesmarcaAnteriorSinCerrar();
    await testEsPrincipalFalseNoDesmarcaAnterior();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - asignacion-residente-empleado integration tests');
  console.error(error);
  process.exitCode = 1;
});
