/**
 * Tests de Integración: Almacén — GET /api/v1/almacen/stock (consulta batch B2B)
 * Spec: openspec/changes/validar-stock-antes-cotizar-externo/
 * Tarea: 1.3 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/stock-por-insumo.integration.test.ts
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
  await prisma.itemInventario.deleteMany({ where: { tenant_id: tenantId } });
}

async function apiRequest(method: string, path: string, token: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function testInsumosConYSinStock() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['admin'] });

  const insumoConStock = randomUUID();
  const insumoSinFila = randomUUID();

  try {
    const create = await apiRequest('POST', '/api/v1/almacen/inventario', token, {
      insumo_id: insumoConStock,
      clave: 'INS-STOCK-001',
      descripcion: 'Insumo con stock para prueba B2B',
      unidad: 'PZA',
      categoria: 'MATERIAL',
      stock_actual: 27,
    });
    assert.equal(create.status, 201, 'debe crearse el item de inventario de prueba');

    const r = await apiRequest(
      'GET',
      `/api/v1/almacen/stock?insumo_ids=${insumoConStock},${insumoSinFila}`,
      token
    );
    assert.equal(r.status, 200);
    assert.equal(r.body.data.length, 1, 'solo el insumo con fila en ItemInventario debe aparecer');
    assert.equal(r.body.data[0].insumo_id, insumoConStock);
    assert.equal(r.body.data[0].stock_actual, 27);

    console.log('ok 1.3a - insumo con stock devuelve stock_actual; insumo sin fila no aparece');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testListaVacia() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['admin'] });

  const sinParametro = await apiRequest('GET', '/api/v1/almacen/stock', token);
  assert.equal(sinParametro.status, 200);
  assert.deepEqual(sinParametro.body.data, []);

  const listaVacia = await apiRequest('GET', '/api/v1/almacen/stock?insumo_ids=', token);
  assert.equal(listaVacia.status, 200);
  assert.deepEqual(listaVacia.body.data, []);

  console.log('ok 1.3b - sin parámetro o lista vacía responde { success: true, data: [] } sin error');
}

async function main() {
  await setup();
  try {
    await testInsumosConYSinStock();
    await testListaVacia();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - stock-por-insumo integration tests');
  console.error(error);
  process.exitCode = 1;
});
