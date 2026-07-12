/**
 * Tests de Integración: CRUD de Activos fijos
 * Spec:  openspec/changes/control-almacen-activos/specs/activos-fijos-crud/
 * Tareas: 2.1-2.5 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/activos-crud.integration.test.ts
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

// ── 2.1: alta con clasificación válida asigna numero_activo correlativo ────

async function testAltaValidaAsignaNumeroCorrelativo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    const r1 = await post('/api/v1/almacen/activos', t, {
      clave: 'VEH-01', descripcion: 'Camioneta Pickup', clasificacion: 'VEHICULO', proyecto_id: proyectoId,
    });
    assert.equal(r1.status, 201, 'alta con clasificación válida debe crear (201)');
    const b1 = (await r1.json()) as any;
    assert.equal(b1.data.estado, 'DISPONIBLE');
    assert.match(b1.data.numero_activo, /^ACT-\d{3}$/);

    const r2 = await post('/api/v1/almacen/activos', t, {
      clave: 'VEH-02', descripcion: 'Camión de volteo', clasificacion: 'VEHICULO', proyecto_id: proyectoId,
    });
    const b2 = (await r2.json()) as any;
    const n1 = parseInt(b1.data.numero_activo.replace('ACT-', ''));
    const n2 = parseInt(b2.data.numero_activo.replace('ACT-', ''));
    assert.equal(n2 - n1, 1, 'el segundo activo debe tener el número correlativo siguiente');

    console.log('ok - 2.1 alta con clasificación válida asigna numero_activo correlativo');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testClasificacionInvalidaEsRechazada() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    const r = await post('/api/v1/almacen/activos', t, {
      clave: 'X-01', descripcion: 'Algo', clasificacion: 'NO_EXISTE', proyecto_id: proyectoId,
    });
    assert.equal(r.status, 400, 'clasificación inválida debe rechazarse con 400');

    console.log('ok - 2.1b clasificación inválida es rechazada (400)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 2.2: filtros de listado ─────────────────────────────────────────────

async function testFiltrosDeListado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    await post('/api/v1/almacen/activos', t, { clave: 'HER-01', descripcion: 'Taladro industrial', clasificacion: 'HERRAMIENTA', proyecto_id: proyectoId });
    await post('/api/v1/almacen/activos', t, { clave: 'VEH-03', descripcion: 'Camioneta Ram', clasificacion: 'VEHICULO', proyecto_id: proyectoId });

    const r = await get(`/api/v1/almacen/activos?clasificacion=VEHICULO`, t);
    const body = (await r.json()) as any;
    assert.ok(body.data.length >= 1 && body.data.every((a: any) => a.clasificacion === 'VEHICULO'), 'el filtro por clasificación debe devolver solo VEHICULO');

    const rq = await get(`/api/v1/almacen/activos?q=Taladro`, t);
    const bodyq = (await rq.json()) as any;
    assert.ok(bodyq.data.some((a: any) => a.clave === 'HER-01'), 'la búsqueda por descripción debe encontrar el activo');

    console.log('ok - 2.2 filtros de listado (clasificacion, q) funcionan');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 2.3: editar datos descriptivos no cambia proyecto/asignación ───────────

async function testEditarNoCambiaProyectoNiAsignacion() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    const rCrear = await post('/api/v1/almacen/activos', t, { clave: 'MAQ-01', descripcion: 'Retroexcavadora', clasificacion: 'MAQUINARIA', proyecto_id: proyectoId });
    const activo = ((await rCrear.json()) as any).data;

    const rEditar = await patch(`/api/v1/almacen/activos/${activo.id_activo}`, t, {
      descripcion: 'Retroexcavadora CAT 420F', ubicacion: 'Patio norte', valor_adquisicion: 1500000,
      proyecto_id: randomUUID(), // debe ignorarse
    });
    assert.equal(rEditar.status, 200);
    const editado = ((await rEditar.json()) as any).data;
    assert.equal(editado.descripcion, 'Retroexcavadora CAT 420F');
    assert.equal(editado.ubicacion, 'Patio norte');
    assert.equal(editado.proyecto_id, proyectoId, 'proyecto_id no debe cambiar desde este endpoint');

    console.log('ok - 2.3 editar datos descriptivos no cambia proyecto ni asignación');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 2.4: baja con motivo / sin motivo ──────────────────────────────────

async function testBajaConYSinMotivo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    const rCrear = await post('/api/v1/almacen/activos', t, { clave: 'EQ-01', descripcion: 'Compresor', clasificacion: 'EQUIPO', proyecto_id: proyectoId });
    const activo = ((await rCrear.json()) as any).data;

    const rSinMotivo = await post(`/api/v1/almacen/activos/${activo.id_activo}/baja`, t, {});
    assert.equal(rSinMotivo.status, 400, 'baja sin motivo debe rechazarse');

    const rConMotivo = await post(`/api/v1/almacen/activos/${activo.id_activo}/baja`, t, { motivo: 'Dañado por accidente en obra' });
    assert.equal(rConMotivo.status, 200);
    const dado = ((await rConMotivo.json()) as any).data;
    assert.equal(dado.estado, 'BAJA');
    assert.ok(dado.fecha_baja);
    assert.equal(dado.motivo_baja, 'Dañado por accidente en obra');

    console.log('ok - 2.4 baja con motivo funciona, sin motivo se rechaza');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 2.5: un activo BAJA no admite un nuevo traspaso (409) ──────────────

async function testActivoBajaNoAdmiteTraspaso() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const proyectoDestino = randomUUID();
  const t = token(tenantId, proyectoId, ['warehouse']);

  try {
    const rCrear = await post('/api/v1/almacen/activos', t, { clave: 'VEH-04', descripcion: 'Grúa móvil', clasificacion: 'VEHICULO', proyecto_id: proyectoId });
    const activo = ((await rCrear.json()) as any).data;
    await post(`/api/v1/almacen/activos/${activo.id_activo}/baja`, t, { motivo: 'Venta' });

    const rTraspaso = await post(`/api/v1/almacen/activos/${activo.id_activo}/traspasos`, t, {
      tipo: 'PROYECTO', proyecto_destino_id: proyectoDestino,
    });
    assert.equal(rTraspaso.status, 409, 'un activo BAJA no debe admitir un nuevo traspaso');

    console.log('ok - 2.5 un activo BAJA no admite un nuevo traspaso (409)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAltaValidaAsignaNumeroCorrelativo();
    await testClasificacionInvalidaEsRechazada();
    await testFiltrosDeListado();
    await testEditarNoCambiaProyectoNiAsignacion();
    await testBajaConYSinMotivo();
    await testActivoBajaNoAdmiteTraspaso();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - activos-crud integration tests');
  console.error(error);
  process.exitCode = 1;
});
