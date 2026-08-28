/**
 * Test de Integración: POST /insumos/importar-lote valida longitud antes de insertar.
 * Spec: openspec/changes/fix-500-importar-apu-explosion-filas-boilerplate
 *
 * Reproduce contra Postgres real el bug de producción: un lote con un ítem
 * cuya unidad_medida excede VarChar(20) (fila de boilerplate mal-parseada de
 * un archivo APU/Explosión real) tumbaba el endpoint con 500 porque
 * `db.insumo.createMany(...)` no tenía protección de longitud y Postgres
 * rechazaba el INSERT completo.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env).
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

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
  await prisma.insumo.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[] = ['admin']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function post(pathUrl: string, t: string, body: unknown) {
  return fetch(`${baseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: JSON.stringify(body),
  });
}

const UNIDAD_BOILERPLATE = 'L.A.E. IVONNE OBREGON GUTIERREZ'; // 31 caracteres — excede VarChar(20)

// ── Test: ítem con unidad_medida fuera de rango se omite, no tumba el lote ──

async function testItemFueraDeRangoSeOmiteSinTumbarElLote() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId, ['admin']);
    const r = await post('/api/v1/gerencia-tecnica/insumos/importar-lote', t, {
      insumos: [
        { clave: 'OK-1', descripcion: 'Insumo válido', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 10 },
        { clave: UNIDAD_BOILERPLATE, descripcion: UNIDAD_BOILERPLATE, unidad_medida: UNIDAD_BOILERPLATE, tipo_insumo: 'MATERIAL', costo_base: 0 },
      ],
    });

    assert.equal(r.status, 200, 'un lote con un ítem inválido junto a uno válido debe responder 200, no 500');
    const body = await r.json() as any;
    assert.equal(body.data.creados, 1, 'debe crearse solo el insumo válido');
    assert.equal(body.data.omitidos, 1, 'el ítem con unidad_medida fuera de rango debe contarse como omitido');

    const creados = await prisma.insumo.findMany({ where: { tenant_id: tenantId } });
    assert.equal(creados.length, 1, 'no debe haber quedado ningún insumo con unidad_medida fuera de rango en la base');
    assert.equal(creados[0].clave, 'OK-1');

    console.log('ok - un ítem con unidad_medida > 20 caracteres se omite sin tumbar el resto del lote (antes: 500)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: lote compuesto solo por ítems inválidos responde 400 ──

async function testLoteSoloConItemsInvalidosResponde400() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId, ['admin']);
    const r = await post('/api/v1/gerencia-tecnica/insumos/importar-lote', t, {
      insumos: [
        { clave: UNIDAD_BOILERPLATE, descripcion: UNIDAD_BOILERPLATE, unidad_medida: UNIDAD_BOILERPLATE, tipo_insumo: 'MATERIAL', costo_base: 0 },
      ],
    });

    assert.equal(r.status, 400, 'un lote donde ningún ítem es válido debe responder 400');

    const creados = await prisma.insumo.findMany({ where: { tenant_id: tenantId } });
    assert.equal(creados.length, 0, 'no debe haberse creado ningún insumo');

    console.log('ok - un lote compuesto solo por ítems fuera de rango responde 400 sin crear nada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testItemFueraDeRangoSeOmiteSinTumbarElLote();
    await testLoteSoloConItemsInvalidosResponde400();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('FALLÓ:', error);
  process.exitCode = 1;
});
