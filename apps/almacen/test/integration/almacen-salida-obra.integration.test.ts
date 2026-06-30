/**
 * Tests de Integración: Almacén — EGRESO_OBRA y endpoint salidas-obra
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/almacen-salida-obra.integration.test.ts
 * Requiere: PostgreSQL corriendo con columnas concepto_id / concepto_clave / frente_trabajo / oc_item_id
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
  await prisma.movimientoAlmacen.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.itemInventario.deleteMany({ where: { tenant_id: tenantId } });
}

async function api(method: string, path: string, token: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function crearItemConStock(token: string, insumo_id: string, stock: number) {
  const r1 = await api('POST', '/api/v1/almacen/movimientos', token, {
    insumo_id,
    tipo: 'INGRESO',
    cantidad: stock,
    clave: 'VARILLA-TEST',
    descripcion: 'Varilla de prueba',
    unidad: 'KG',
    categoria: 'ACERO',
  });
  assert.equal(r1.status, 201, `INGRESO falló: ${JSON.stringify(r1.body)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
async function testEgresoObraSinConceptoId() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const insumo_id  = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['warehouse'] });

  try {
    await crearItemConStock(token, insumo_id, 100);

    const r = await api('POST', '/api/v1/almacen/movimientos', token, {
      insumo_id,
      tipo: 'EGRESO_OBRA',
      cantidad: 10,
    });
    assert.equal(r.status, 422, `EGRESO_OBRA sin concepto_id debe ser 422, got ${r.status}`);
    assert.ok(r.body?.message?.includes('concepto_id'), 'mensaje debe mencionar concepto_id');

    console.log('[OK] testEgresoObraSinConceptoId');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEgresoObraStockInsuficiente() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const insumo_id  = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['warehouse'] });

  try {
    await crearItemConStock(token, insumo_id, 5);

    const r = await api('POST', '/api/v1/almacen/movimientos', token, {
      insumo_id,
      tipo: 'EGRESO_OBRA',
      cantidad: 100,
      concepto_id: randomUUID(),
      concepto_clave: 'CIM-001',
    });
    assert.equal(r.status, 422, `Stock insuficiente debe ser 422, got ${r.status}`);
    assert.ok(r.body?.message?.toLowerCase().includes('stock'), 'mensaje debe mencionar stock');

    console.log('[OK] testEgresoObraStockInsuficiente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEgresoObraExitoso() {
  const tenantId    = randomUUID();
  const proyectoId  = randomUUID();
  const insumo_id   = randomUUID();
  const concepto_id = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['warehouse'] });

  try {
    await crearItemConStock(token, insumo_id, 50);

    const r = await api('POST', '/api/v1/almacen/movimientos', token, {
      insumo_id,
      tipo: 'EGRESO_OBRA',
      cantidad: 20,
      concepto_id,
      concepto_clave: 'CIM-001',
      frente_trabajo: 'Frente 1 — Cimentación',
    });
    assert.equal(r.status, 201, `EGRESO_OBRA exitoso debe ser 201, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.equal(r.body?.data?.tipo, 'EGRESO_OBRA');
    assert.equal(r.body?.data?.cantidad, 20);

    // Verificar stock decrementado
    const inv = await api('GET', '/api/v1/almacen/inventario', token);
    const item = inv.body?.data?.find((i: any) => i.insumo_id === insumo_id);
    assert.ok(item, 'Item debe estar en inventario');
    assert.equal(item.stock_actual, 30, `Stock debe ser 30, got ${item.stock_actual}`);

    console.log('[OK] testEgresoObraExitoso');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testSalidasObraFiltroConcepto() {
  const tenantId    = randomUUID();
  const proyectoId  = randomUUID();
  const insumo_id   = randomUUID();
  const concepto_id = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['warehouse'] });

  try {
    await crearItemConStock(token, insumo_id, 100);

    // Dos EGRESO_OBRA para el mismo concepto
    await api('POST', '/api/v1/almacen/movimientos', token, {
      insumo_id, tipo: 'EGRESO_OBRA', cantidad: 10, concepto_id, concepto_clave: 'EST-002',
    });
    await api('POST', '/api/v1/almacen/movimientos', token, {
      insumo_id, tipo: 'EGRESO_OBRA', cantidad: 5, concepto_id, concepto_clave: 'EST-002',
    });

    // GET sin filtro
    const todos = await api('GET', '/api/v1/almacen/salidas-obra', token);
    assert.equal(todos.status, 200);
    assert.ok(todos.body?.data?.length >= 2, 'Sin filtro debe retornar al menos 2 salidas');

    // GET con filtro concepto_id
    const filtrado = await api('GET', `/api/v1/almacen/salidas-obra?concepto_id=${concepto_id}`, token);
    assert.equal(filtrado.status, 200);
    assert.equal(filtrado.body?.data?.length, 2, `Con filtro debe retornar 2, got ${filtrado.body?.data?.length}`);
    assert.ok(filtrado.body.data.every((m: any) => m.concepto_id === concepto_id), 'Todos deben ser del concepto filtrado');

    console.log('[OK] testSalidasObraFiltroConcepto');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await setup();
  const results: { name: string; ok: boolean; error?: string }[] = [];

  const tests = [
    testEgresoObraSinConceptoId,
    testEgresoObraStockInsuficiente,
    testEgresoObraExitoso,
    testSalidasObraFiltroConcepto,
  ];

  for (const t of tests) {
    try {
      await t();
      results.push({ name: t.name, ok: true });
    } catch (err: any) {
      results.push({ name: t.name, ok: false, error: err.message });
    }
  }

  await teardown();

  console.log('\n══════════ RESULTADOS ══════════');
  let passed = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`✅  ${r.name}`);
      passed++;
    } else {
      console.log(`❌  ${r.name}: ${r.error}`);
    }
  }
  console.log(`\n${passed}/${results.length} tests pasaron`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
