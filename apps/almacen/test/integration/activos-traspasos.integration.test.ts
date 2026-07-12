/**
 * Tests de Integración: Traspasos de Activos con aprobación
 * Spec:  openspec/changes/control-almacen-activos/specs/activos-fijos-traspasos/
 * Tareas: 3.1-3.8 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/activos-traspasos.integration.test.ts
 * Requiere: PostgreSQL corriendo (DATABASE_URL → schema almacen)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus falla silenciosamente)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl =
  process.env.ALMACEN_DATABASE_URL ||
  process.env.DATABASE_URL         ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=almacen';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.traspasoActivo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.activo.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function post(path: string, t: string, body: object) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
async function patch(path: string, t: string, body: object) {
  return fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
async function get(path: string, t: string) {
  return fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${t}` } });
}

async function crearActivo(t: string, proyectoId: string, clave = 'VEH-01') {
  const r = await post('/api/v1/almacen/activos', t, {
    clave, descripcion: 'Camioneta de prueba', clasificacion: 'VEHICULO', proyecto_id: proyectoId,
  });
  return ((await r.json()) as any).data;
}

// ── 3.1: solicitar traspaso de proyecto deja EN_TRASPASO sin cambiar proyecto_id ──

async function testSolicitarTraspasoProyectoDejaEnTraspaso() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const t = token(tenantId, proyectoOrigen, ['warehouse']);

  try {
    const activo = await crearActivo(t, proyectoOrigen);

    const r = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, t, {
      tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino,
    });
    assert.equal(r.status, 201, 'solicitar traspaso debe crear la solicitud (201)');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'PENDIENTE');
    assert.equal(body.data.proyecto_destino_id, proyectoDestino);

    const rActivo = await get(`/api/v1/almacen/activos?q=${activo.clave}`, t);
    const activos = ((await rActivo.json()) as any).data;
    const actualizado = activos.find((a: any) => a.id_activo === activo.id_activo);
    assert.equal(actualizado.estado, 'EN_TRASPASO');
    assert.equal(actualizado.proyecto_id, proyectoOrigen, 'proyecto_id NO debe cambiar todavía');

    console.log('ok - 3.1 solicitar traspaso de proyecto deja EN_TRASPASO sin cambiar proyecto_id');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.2: solicitar asignación a empleado guarda empleado_destino ───────────

async function testSolicitarAsignacionGuardaEmpleadoDestino() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const empleadoId = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    const activo = await crearActivo(t, proyectoId, 'HER-01');

    const r = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, t, {
      tipo: 'ASIGNACION', empleado_destino_id: empleadoId, empleado_destino_nombre: 'Juan Pérez',
    });
    assert.equal(r.status, 201);
    const body = (await r.json()) as any;
    assert.equal(body.data.empleado_destino_id, empleadoId);
    assert.equal(body.data.empleado_destino_nombre, 'Juan Pérez');

    console.log('ok - 3.2 solicitar asignación a empleado guarda empleado_destino_id/nombre');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.3: activo EN_TRASPASO no admite segunda solicitud (409) ─────────────

async function testActivoEnTraspasoNoAdmiteSegundaSolicitud() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const otroProyecto = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    const activo = await crearActivo(t, proyectoId, 'MAQ-01');
    await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, t, { tipo: 'PROYECTO', proyecto_destino_id: otroProyecto });

    const r2 = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, t, { tipo: 'PROYECTO', proyecto_destino_id: randomUUID() });
    assert.equal(r2.status, 409, 'una segunda solicitud sobre un activo EN_TRASPASO debe rechazarse');

    console.log('ok - 3.3 un activo EN_TRASPASO no admite una segunda solicitud (409)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.4: confirmar desde el proyecto destino aplica el cambio ─────────────

async function testConfirmarDesdeProyectoDestinoAplicaCambio() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const tOrigen = token(tenantId, proyectoOrigen, ['warehouse']);
  const tDestino = token(tenantId, proyectoDestino, ['warehouse']);

  try {
    const activo = await crearActivo(tOrigen, proyectoOrigen, 'VEH-02');
    const rSolicitud = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, tOrigen, { tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino });
    const solicitud = ((await rSolicitud.json()) as any).data;

    const rConfirmar = await patch(`/api/v1/almacen/activos/traspasos/${solicitud.id_traspaso}/confirmar`, tDestino, {});
    assert.equal(rConfirmar.status, 200, 'confirmar desde el proyecto destino debe aplicarse');
    const confirmado = ((await rConfirmar.json()) as any).data;
    assert.equal(confirmado.estado, 'CONFIRMADO');

    const rActivo = await get(`/api/v1/almacen/activos?q=${activo.clave}`, tDestino);
    const activos = ((await rActivo.json()) as any).data;
    const actualizado = activos.find((a: any) => a.id_activo === activo.id_activo);
    assert.equal(actualizado.proyecto_id, proyectoDestino, 'proyecto_id debe actualizarse tras confirmar');
    assert.equal(actualizado.estado, 'DISPONIBLE');

    console.log('ok - 3.4 confirmar desde el proyecto destino aplica el cambio');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.5: confirmar desde proyecto equivocado → 403 ─────────────────────────

async function testConfirmarDesdeProyectoEquivocadoEsRechazado() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const proyectoEquivocado = randomUUID();
  const tOrigen = token(tenantId, proyectoOrigen, ['warehouse']);
  const tEquivocado = token(tenantId, proyectoEquivocado, ['warehouse']);

  try {
    const activo = await crearActivo(tOrigen, proyectoOrigen, 'VEH-03');
    const rSolicitud = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, tOrigen, { tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino });
    const solicitud = ((await rSolicitud.json()) as any).data;

    const rConfirmar = await patch(`/api/v1/almacen/activos/traspasos/${solicitud.id_traspaso}/confirmar`, tEquivocado, {});
    assert.equal(rConfirmar.status, 403, 'confirmar desde un proyecto distinto al destino debe rechazarse');

    console.log('ok - 3.5 confirmar desde un proyecto distinto al destino es rechazado (403)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.6: rechazar revierte el estado sin cambiar proyecto/asignación ──────

async function testRechazarRevierteEstado() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const t = token(tenantId, proyectoOrigen, ['warehouse']);

  try {
    const activo = await crearActivo(t, proyectoOrigen, 'VEH-04');
    const rSolicitud = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, t, { tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino });
    const solicitud = ((await rSolicitud.json()) as any).data;

    const rRechazar = await patch(`/api/v1/almacen/activos/traspasos/${solicitud.id_traspaso}/rechazar`, t, { notas: 'No aplica' });
    assert.equal(rRechazar.status, 200);
    const rechazado = ((await rRechazar.json()) as any).data;
    assert.equal(rechazado.estado, 'RECHAZADO');

    const rActivo = await get(`/api/v1/almacen/activos?q=${activo.clave}`, t);
    const activos = ((await rActivo.json()) as any).data;
    const actualizado = activos.find((a: any) => a.id_activo === activo.id_activo);
    assert.equal(actualizado.proyecto_id, proyectoOrigen, 'proyecto_id no debe cambiar al rechazar');
    assert.equal(actualizado.estado, 'DISPONIBLE', 'el activo debe volver a DISPONIBLE al rechazar');

    console.log('ok - 3.6 rechazar revierte el estado sin cambiar proyecto/asignación');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.7: listar pendientes filtrados por proyecto_destino_id ──────────────

async function testListarPendientesPorProyectoDestino() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const tOrigen = token(tenantId, proyectoOrigen, ['warehouse']);
  const tDestino = token(tenantId, proyectoDestino, ['warehouse']);

  try {
    const activo = await crearActivo(tOrigen, proyectoOrigen, 'VEH-05');
    await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, tOrigen, { tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino });

    const r = await get(`/api/v1/almacen/activos/traspasos?estado=PENDIENTE&proyecto_destino_id=${proyectoDestino}`, tDestino);
    const body = (await r.json()) as any;
    assert.ok(body.data.some((s: any) => s.activo_id === activo.id_activo), 'la bandeja de pendientes del destino debe incluir la solicitud');

    console.log('ok - 3.7 listar pendientes filtrados por proyecto_destino_id');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.8: historial de un activo en orden cronológico descendente ──────────

async function testHistorialCronologicoDescendente() {
  const tenantId = randomUUID();
  const proyectoOrigen = randomUUID();
  const proyectoDestino = randomUUID();
  const tOrigen = token(tenantId, proyectoOrigen, ['warehouse']);
  const tDestino = token(tenantId, proyectoDestino, ['warehouse']);

  try {
    const activo = await crearActivo(tOrigen, proyectoOrigen, 'VEH-06');

    const r1 = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, tOrigen, { tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino });
    const s1 = ((await r1.json()) as any).data;
    await patch(`/api/v1/almacen/activos/traspasos/${s1.id_traspaso}/rechazar`, tOrigen, {});

    const r2 = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, tOrigen, { tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino });
    const s2 = ((await r2.json()) as any).data;
    await patch(`/api/v1/almacen/activos/traspasos/${s2.id_traspaso}/confirmar`, tDestino, {});

    const rHist = await get(`/api/v1/almacen/activos/${activo.id_activo}/historial`, tDestino);
    const hist = ((await rHist.json()) as any).data;
    assert.equal(hist.length, 2, 'debe haber 2 solicitudes en el historial');
    assert.equal(hist[0].id_traspaso, s2.id_traspaso, 'la más reciente (confirmada) debe ir primero');
    assert.equal(hist[0].estado, 'CONFIRMADO');
    assert.equal(hist[1].estado, 'RECHAZADO');

    console.log('ok - 3.8 historial de un activo en orden cronológico descendente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testSolicitarTraspasoProyectoDejaEnTraspaso();
    await testSolicitarAsignacionGuardaEmpleadoDestino();
    await testActivoEnTraspasoNoAdmiteSegundaSolicitud();
    await testConfirmarDesdeProyectoDestinoAplicaCambio();
    await testConfirmarDesdeProyectoEquivocadoEsRechazado();
    await testRechazarRevierteEstado();
    await testListarPendientesPorProyectoDestino();
    await testHistorialCronologicoDescendente();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - activos-traspasos integration tests');
  console.error(error);
  process.exitCode = 1;
});
