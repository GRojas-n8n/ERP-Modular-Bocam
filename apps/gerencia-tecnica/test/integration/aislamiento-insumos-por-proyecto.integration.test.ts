/**
 * Test de Integración: aislamiento de Insumo por proyecto activo.
 * Spec: openspec/changes/aislamiento-insumos-por-proyecto-gt
 * Tareas: 8.1-8.6 del tasks.md
 *
 * Confirma contra Postgres real (RLS `rls_insumos_context` aplicada) que:
 *  - Un rol de nivel-proyecto solo ve/edita los insumos de su proyecto activo.
 *  - Un rol de nivel-tenant sin proyecto activo ve el catálogo consolidado.
 *  - La unicidad de `clave` pasa a ser por proyecto, no por tenant.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env) con
 *           apps/gerencia-tecnica/prisma/rls-policies.sql ya aplicado.
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

// La app bajo prueba DEBE conectar con un rol NOSUPERUSER/NOBYPASSRLS para que
// la RLS aplique de verdad — `postgres` (default de .env) es superusuario y
// bypasea RLS silenciosamente, dejando este test en verde sin haber probado
// nada. Mismo mecanismo que aislamiento-proyecto-por-modulo (ver su tasks.md,
// tarea 6.4 / nota de entorno). Solo se sobreescribe la URL de la app —
// el cliente de sembrado/limpieza de este archivo (`prisma`, más abajo) sigue
// usando el superusuario de siempre.
process.env.GERENCIA_TECNICA_DATABASE_URL =
  process.env.GERENCIA_TECNICA_DATABASE_URL_RLS_TEST ||
  'postgresql://local_app:local_app_test_pw@localhost:5432/bocam_erp?schema=gerencia_tecnica';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

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
  await prisma.conceptoInsumo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.concepto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.insumo.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[] = ['admin']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function get(pathUrl: string, t: string) {
  return fetch(`${baseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${t}` } });
}

async function post(pathUrl: string, t: string, body: unknown) {
  return fetch(`${baseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: JSON.stringify(body),
  });
}

async function patch(pathUrl: string, t: string, body: unknown) {
  return fetch(`${baseUrl}${pathUrl}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: JSON.stringify(body),
  });
}

async function del(pathUrl: string, t: string) {
  return fetch(`${baseUrl}${pathUrl}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } });
}

// ── Test 8.1: GET /insumos con rol gerencia_tecnica y proyecto activo A ──

async function testGetInsumosAcotaAProyectoActivo() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  try {
    const insumoA = await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoA, clave: 'INS-A', descripcion: 'Insumo A', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 10 },
    });
    await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoB, clave: 'INS-B', descripcion: 'Insumo B', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 20 },
    });

    const t = token(tenantId, proyectoA, ['gerencia_tecnica']);
    const r = await get('/api/v1/gerencia-tecnica/insumos', t);
    assert.equal(r.status, 200, 'GET /insumos debe responder 200');
    const body = await r.json() as any;

    assert.equal(body.data.length, 1, 'solo debe retornar 1 insumo (el del proyecto activo)');
    assert.equal(body.data[0].id, insumoA.id, 'el insumo retornado debe ser el del proyecto A');
    assert.equal(body.data[0].proyecto_id, proyectoA, 'el proyecto_id expuesto debe ser el del proyecto activo');

    console.log('ok - 8.1 GET /insumos con proyecto activo A solo retorna insumos de A, aunque exista un insumo activo de B');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 8.2: GET /insumos/explosion con rol technical, mismo aislamiento + cálculo correcto ──

async function testGetExplosionAcotaAProyectoYCalculaCantidad() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  try {
    const insumoA = await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoA, clave: 'INS-EXPL-A', descripcion: 'Insumo Explosión A', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 10 },
    });
    await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoB, clave: 'INS-EXPL-B', descripcion: 'Insumo Explosión B', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 20 },
    });

    const presupuesto = await prisma.presupuestoBase.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoA },
    });
    const concepto = await prisma.concepto.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoA, presupuesto_id: presupuesto.id,
        clave: 'CONC-A', descripcion: 'Concepto A', unidad_medida: 'M3',
        cantidad: 2, precio_unitario: 100, importe: 200,
      },
    });
    await prisma.conceptoInsumo.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoA, concepto_id: concepto.id, insumo_id: insumoA.id,
        tipo_insumo: 'MATERIAL', cantidad: 3,
      },
    });

    const t = token(tenantId, proyectoA, ['technical']);
    const r = await get('/api/v1/gerencia-tecnica/insumos/explosion', t);
    assert.equal(r.status, 200, 'GET /insumos/explosion debe responder 200');
    const body = await r.json() as any;

    assert.equal(body.data.length, 1, 'solo debe retornar el insumo del proyecto activo');
    assert.equal(body.data[0].id, insumoA.id);
    assert.equal(body.data[0].cantidad_presupuestada, 6, 'cantidad_presupuestada = concepto.cantidad(2) x composicion.cantidad(3) = 6');

    console.log('ok - 8.2 GET /insumos/explosion aisla por proyecto y sigue calculando cantidad_presupuestada correctamente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 8.3: GET /insumos con rol admin sin proyecto activo consolida el tenant ──

async function testGetInsumosSinProyectoActivoConsolidaTenant() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  try {
    await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoA, clave: 'INS-CONS-A', descripcion: 'Insumo A', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 10 },
    });
    await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoB, clave: 'INS-CONS-B', descripcion: 'Insumo B', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 20 },
    });

    const t = token(tenantId, '', ['admin']);
    const r = await get('/api/v1/gerencia-tecnica/insumos', t);
    assert.equal(r.status, 200, 'GET /insumos sin proyecto activo debe responder 200 para un rol de nivel-tenant');
    const body = await r.json() as any;

    assert.equal(body.data.length, 2, 'debe retornar los insumos de ambos proyectos consolidados');
    const proyectosVistos = body.data.map((i: any) => i.proyecto_id).sort();
    assert.deepEqual(proyectosVistos, [proyectoA, proyectoB].sort(), 'cada insumo debe traer su propio proyecto_id');

    console.log('ok - 8.3 GET /insumos con rol admin sin proyecto activo consolida ambos proyectos, cada uno trazable');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 8.4: POST /insumos con clave ya existente en otro proyecto no colisiona ──

async function testPostInsumoClaveDuplicadaEnOtroProyectoNoColisiona() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  try {
    await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoB, clave: 'DUP-CLAVE', descripcion: 'Insumo B original', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 20 },
    });

    const t = token(tenantId, proyectoA, ['gerencia_tecnica']);
    const r = await post('/api/v1/gerencia-tecnica/insumos', t, {
      clave: 'DUP-CLAVE', descripcion: 'Insumo A nuevo', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 15,
    });

    assert.equal(r.status, 201, 'debe crear el insumo en A sin conflicto de clave duplicada de otro proyecto');
    const body = await r.json() as any;
    assert.equal(body.data.proyecto_id, proyectoA);

    const totalConClave = await prisma.insumo.count({ where: { tenant_id: tenantId, clave: 'DUP-CLAVE' } });
    assert.equal(totalConClave, 2, 'deben coexistir 2 filas con la misma clave, una por proyecto');

    console.log('ok - 8.4 POST /insumos con clave ya existente en otro proyecto crea el insumo en el proyecto activo sin colisión');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 8.5: POST /insumos/importar-lote estampa proyecto_id del proyecto activo ──

async function testImportarLoteEstampaProyectoActivo() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  try {
    const t = token(tenantId, proyectoA, ['admin']);
    const r = await post('/api/v1/gerencia-tecnica/insumos/importar-lote', t, {
      insumos: [
        { clave: 'LOTE-1', descripcion: 'Lote 1', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 5 },
        { clave: 'LOTE-2', descripcion: 'Lote 2', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 8 },
      ],
    });

    assert.equal(r.status, 200, 'POST /insumos/importar-lote debe responder 200');
    const body = await r.json() as any;
    assert.equal(body.data.creados, 2, 'deben crearse los 2 insumos del lote');

    const creados = await prisma.insumo.findMany({ where: { tenant_id: tenantId, clave: { in: ['LOTE-1', 'LOTE-2'] } } });
    assert.equal(creados.length, 2);
    for (const i of creados) {
      assert.equal(i.proyecto_id, proyectoA, `el insumo ${i.clave} debe quedar con proyecto_id del proyecto activo de la sesión`);
    }

    console.log('ok - 8.5 POST /insumos/importar-lote estampa proyecto_id del proyecto activo en cada insumo creado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 8.6: PATCH/DELETE sobre un insumo de otro proyecto → 404 ──

async function testPatchDeleteInsumoDeOtroProyectoFalla404() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  try {
    const insumoB = await prisma.insumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoB, clave: 'INS-CROSS-B', descripcion: 'Insumo B', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 20 },
    });

    const tTechnical = token(tenantId, proyectoA, ['technical']);
    const rPatch = await patch(`/api/v1/gerencia-tecnica/insumos/${insumoB.id}`, tTechnical, { costo_base: 999 });
    assert.equal(rPatch.status, 404, 'PATCH sobre un insumo de otro proyecto debe responder 404, aunque se conozca su id exacto');

    const tAdmin = token(tenantId, proyectoA, ['admin']);
    const rDelete = await del(`/api/v1/gerencia-tecnica/insumos/${insumoB.id}`, tAdmin);
    assert.equal(rDelete.status, 404, 'DELETE sobre un insumo de otro proyecto debe responder 404, aunque se conozca su id exacto');

    const sigueActivo = await prisma.insumo.findUnique({ where: { id: insumoB.id } });
    assert.equal(sigueActivo?.activo, true, 'el insumo de B no debe haberse visto afectado por los intentos cross-proyecto');
    assert.equal(Number(sigueActivo?.costo_base), 20, 'el costo_base de B no debe haber cambiado');

    console.log('ok - 8.6 PATCH y DELETE sobre un insumo de otro proyecto del mismo tenant responden 404 por URL manipulada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testGetInsumosAcotaAProyectoActivo();                 // 8.1
    await testGetExplosionAcotaAProyectoYCalculaCantidad();      // 8.2
    await testGetInsumosSinProyectoActivoConsolidaTenant();      // 8.3
    await testPostInsumoClaveDuplicadaEnOtroProyectoNoColisiona(); // 8.4
    await testImportarLoteEstampaProyectoActivo();               // 8.5
    await testPatchDeleteInsumoDeOtroProyectoFalla404();         // 8.6
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - aislamiento-insumos-por-proyecto integration tests');
  console.error(error);
  process.exitCode = 1;
});
