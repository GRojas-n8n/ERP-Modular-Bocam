/**
 * Test de Integración: validación de longitud/rango de Insumo antes de
 * escribir a Postgres.
 * Spec: openspec/changes/fix-500-importar-insumos-explosion-apu/specs/validacion-lote-insumos-importar/spec.md
 * Tareas: 1.1-1.4 del tasks.md
 *
 * Hoy POST /insumos, PATCH /insumos/:id y POST /insumos/importar-lote no
 * validan longitud de `clave`/`unidad_medida` ni rango de `costo_base` antes
 * de invocar Prisma — un valor que excede la columna (`clave` VARCHAR(50),
 * `unidad_medida` VARCHAR(20), `costo_base` DECIMAL(12,4)) revienta con un
 * 500 crudo de Prisma/Postgres. Este test confirma primero el bug (rojo) y
 * luego valida el fix (verde).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

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
  await prisma.insumo.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[] = ['admin']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

function insumoBase(overrides: Record<string, unknown> = {}) {
  return {
    clave: 'CFM001',
    descripcion: 'Tubo conduit PVC 2"',
    unidad_medida: 'M',
    costo_base: 65,
    tipo_insumo: 'MATERIAL',
    ...overrides,
  };
}

async function postInsumo(headers: Record<string, string>, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function patchInsumo(headers: Record<string, string>, id: string, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function postImportarLote(headers: Record<string, string>, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/importar-lote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

// ── Test 1.1: clave de más de 50 caracteres en POST /insumos ──

async function testAltaConClaveDemasiadoLarga() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const claveLarga = 'X'.repeat(51);
    const r = await postInsumo({ Authorization: `Bearer ${t}` }, insumoBase({ clave: claveLarga }));

    assert.equal(r.status, 400, 'clave de más de 50 caracteres debe responder 400, no 500 crudo de Prisma');
    const body = await r.json() as any;
    assert.equal(body.success, false, 'la respuesta debe indicar success:false');
    assert.equal(body.error?.code, 'VALIDATION_ERROR', 'el código de error debe ser VALIDATION_ERROR');

    const creados = await prisma.insumo.count({ where: { tenant_id: tenantId } });
    assert.equal(creados, 0, 'no debe crearse ningún insumo con clave fuera de rango');

    console.log('ok - 1.1 POST /insumos con clave > 50 caracteres responde 400 y no crea nada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.2: unidad_medida de más de 20 caracteres en PATCH /insumos/:id ──

async function testEdicionConUnidadMedidaDemasiadoLarga() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const alta = await postInsumo({ Authorization: `Bearer ${t}` }, insumoBase());
    assert.equal(alta.status, 201, 'el alta inicial del insumo debe crearse correctamente');
    const { data: insumoCreado } = await alta.json() as any;

    const unidadLarga = 'U'.repeat(21);
    const r = await patchInsumo({ Authorization: `Bearer ${t}` }, insumoCreado.id, { unidad_medida: unidadLarga });

    assert.equal(r.status, 400, 'unidad_medida de más de 20 caracteres debe responder 400, no 500 crudo de Prisma');
    const body = await r.json() as any;
    assert.equal(body.error?.code, 'VALIDATION_ERROR', 'el código de error debe ser VALIDATION_ERROR');

    const insumoSinCambios = await prisma.insumo.findUnique({ where: { id: insumoCreado.id } });
    assert.equal(insumoSinCambios?.unidad_medida, 'M', 'el registro existente no debe modificarse');

    console.log('ok - 1.2 PATCH /insumos/:id con unidad_medida > 20 caracteres responde 400 y no modifica el registro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.3: costo_base fuera de rango de DECIMAL(12,4) en POST /insumos ──

async function testAltaConCostoBaseFueraDeRango() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const r = await postInsumo({ Authorization: `Bearer ${t}` }, insumoBase({ costo_base: 100_000_000 }));

    assert.equal(r.status, 400, 'costo_base > 99,999,999.9999 debe responder 400, no 500 crudo de Prisma');
    const body = await r.json() as any;
    assert.equal(body.error?.code, 'VALIDATION_ERROR', 'el código de error debe ser VALIDATION_ERROR');

    const creados = await prisma.insumo.count({ where: { tenant_id: tenantId } });
    assert.equal(creados, 0, 'no debe crearse ningún insumo con costo_base fuera de rango');

    console.log('ok - 1.3 POST /insumos con costo_base fuera de rango responde 400 y no crea nada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.4: lote con filas inválidas no aborta el resto ──

async function testImportarLoteConFilasInvalidasNoAbortaElResto() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const r = await postImportarLote({ Authorization: `Bearer ${t}` }, {
      insumos: [
        insumoBase({ clave: 'VALIDO01' }),
        insumoBase({ clave: 'X'.repeat(51), descripcion: 'Clave demasiado larga' }),
        insumoBase({ clave: 'VALIDO02', costo_base: 100_000_000 }),
      ],
    });

    assert.equal(r.status, 200, 'el lote con filas mixtas debe responder 200, no abortar con 500');
    const body = await r.json() as any;
    assert.equal(body.data.creados, 1, 'solo la fila válida debe crearse');
    assert.equal(body.data.omitidos, 2, 'las 2 filas fuera de rango deben omitirse, no abortar el lote');

    const creados = await prisma.insumo.count({ where: { tenant_id: tenantId } });
    assert.equal(creados, 1, 'solo debe existir 1 insumo creado en la base de datos');

    console.log('ok - 1.4 POST /insumos/importar-lote omite filas fuera de rango sin abortar el lote completo');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testAltaConClaveDemasiadoLarga();                    // 1.1
    await testEdicionConUnidadMedidaDemasiadoLarga();           // 1.2
    await testAltaConCostoBaseFueraDeRango();                  // 1.3
    await testImportarLoteConFilasInvalidasNoAbortaElResto();  // 1.4
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-longitud-insumo integration tests');
  console.error(error);
  process.exitCode = 1;
});
