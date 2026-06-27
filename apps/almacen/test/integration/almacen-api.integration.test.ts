/**
 * Tests de Integración: Almacén — API HTTP (Inventario, Movimientos, Dashboard)
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/almacen-api.integration.test.ts
 * Requiere: PostgreSQL corriendo (DATABASE_URL → schema almacen)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus falla silenciosamente)
 */

// CRÍTICO: env vars antes del import dinámico de main.ts
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

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function waitFor(fn: () => Promise<void>, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { await fn(); return; } catch { await delay(200); }
  }
  await fn();
}

async function setup() {
  // Dynamic import after env vars are set
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

async function apiRequest(method: string, path: string, token: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

// ─────────────────────────────────────────────────────────────────────────────
async function testInventarioCrearYListar() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['admin'] });

  try {
    // POST /inventario → crea item
    const post = await apiRequest('POST', '/api/v1/almacen/inventario', token, {
      clave:       'INS-TEST-001',
      descripcion: 'Insumo de prueba',
      unidad:      'PZA',
      categoria:   'MATERIAL',
      stock_minimo: 5,
    });
    assert.equal(post.status, 201, `POST inventario debió retornar 201, got ${post.status}`);
    assert.ok(post.body?.data?.id, 'POST inventario debe retornar id');

    const itemId = post.body.data.id;

    // GET /inventario → lista contiene el item creado
    const get = await apiRequest('GET', '/api/v1/almacen/inventario', token);
    assert.equal(get.status, 200, `GET inventario debió retornar 200, got ${get.status}`);
    const found = get.body.data.find((i: any) => i.id === itemId);
    assert.ok(found, 'GET inventario debe contener el item recién creado');
    assert.equal(found.clave, 'INS-TEST-001');

    // GET /inventario?q=prueba → filtro funciona
    const filtered = await apiRequest('GET', '/api/v1/almacen/inventario?q=prueba', token);
    assert.equal(filtered.status, 200);
    assert.ok(filtered.body.data.length > 0, 'Filtro ?q= debe retornar resultados');

    console.log('[OK] testInventarioCrearYListar');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testInventarioPatch() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['admin'] });

  try {
    const post = await apiRequest('POST', '/api/v1/almacen/inventario', token, {
      clave: 'INS-PATCH-001', descripcion: 'Patch test', unidad: 'KG', categoria: 'MATERIAL',
    });
    const itemId = post.body.data.id;

    // PATCH stock_minimo
    const patch = await apiRequest('PATCH', `/api/v1/almacen/inventario/${itemId}`, token, {
      stock_minimo: 10,
      ubicacion: 'Bodega A',
    });
    assert.equal(patch.status, 200, `PATCH debió retornar 200, got ${patch.status}`);
    assert.equal(Number(patch.body.data.stock_minimo), 10);
    assert.equal(patch.body.data.ubicacion, 'Bodega A');

    // PATCH con stock_actual debe ser ignorado (campo protegido)
    const patchStock = await apiRequest('PATCH', `/api/v1/almacen/inventario/${itemId}`, token, {
      stock_actual: 9999,
    });
    // El endpoint acepta la llamada pero ignora stock_actual
    // El stock_actual debe seguir siendo 0 (sin movimientos)
    const get = await apiRequest('GET', '/api/v1/almacen/inventario', token);
    const item = get.body.data.find((i: any) => i.id === itemId);
    assert.equal(Number(item.stock_actual), 0, 'stock_actual NO debe modificarse vía PATCH');

    console.log('[OK] testInventarioPatch');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testMovimientosIngresoEgreso() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['warehouse'] });

  try {
    // Crear item base
    const post = await apiRequest('POST', '/api/v1/almacen/inventario', token, {
      clave: 'INS-MOV-001', descripcion: 'Item movimientos', unidad: 'PZA', categoria: 'MATERIAL',
    });
    const itemId = post.body.data.id;

    // INGRESO
    const ingreso = await apiRequest('POST', '/api/v1/almacen/movimientos', token, {
      item_id:  itemId,
      tipo:     'INGRESO',
      cantidad: 100,
      unidad:   'PZA',
      origen:   'MANUAL',
    });
    assert.equal(ingreso.status, 201, `INGRESO debió retornar 201, got ${ingreso.status}`);

    // Verificar stock actualizado
    const getItems = await apiRequest('GET', '/api/v1/almacen/inventario', token);
    const item = getItems.body.data.find((i: any) => i.id === itemId);
    assert.equal(Number(item.stock_actual), 100, 'INGRESO debe incrementar stock_actual');

    // EGRESO
    const egreso = await apiRequest('POST', '/api/v1/almacen/movimientos', token, {
      item_id:  itemId,
      tipo:     'EGRESO',
      cantidad: 30,
      unidad:   'PZA',
      origen:   'MANUAL',
    });
    assert.equal(egreso.status, 201, `EGRESO debió retornar 201, got ${egreso.status}`);

    // Stock debe ser 70
    const getItems2 = await apiRequest('GET', '/api/v1/almacen/inventario', token);
    const item2 = getItems2.body.data.find((i: any) => i.id === itemId);
    assert.equal(Number(item2.stock_actual), 70, 'EGRESO debe decrementar stock_actual');

    // GET /movimientos → lista los movimientos
    const movs = await apiRequest('GET', `/api/v1/almacen/movimientos?item_id=${itemId}`, token);
    assert.equal(movs.status, 200);
    assert.equal(movs.body.data.length, 2, 'Debe haber 2 movimientos (INGRESO + EGRESO)');

    console.log('[OK] testMovimientosIngresoEgreso');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testMovimientoEgresoSinStock() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['warehouse'] });

  try {
    const post = await apiRequest('POST', '/api/v1/almacen/inventario', token, {
      clave: 'INS-NOSALE-001', descripcion: 'Sin stock', unidad: 'PZA', categoria: 'MATERIAL',
    });
    const itemId = post.body.data.id;

    // EGRESO sin stock disponible → debe rechazar
    const egreso = await apiRequest('POST', '/api/v1/almacen/movimientos', token, {
      item_id: itemId, tipo: 'EGRESO', cantidad: 50, unidad: 'PZA', origen: 'MANUAL',
    });
    assert.ok(egreso.status >= 400, `EGRESO sin stock debe fallar, got ${egreso.status}`);

    console.log('[OK] testMovimientoEgresoSinStock');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testDashboard() {
  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['admin'] });

  try {
    // Dashboard vacío (tenant nuevo)
    const dash = await apiRequest('GET', '/api/v1/almacen/dashboard', token);
    assert.equal(dash.status, 200, `GET dashboard debió retornar 200, got ${dash.status}`);
    assert.ok(dash.body?.data, 'Dashboard debe retornar data');

    const d = dash.body.data;
    assert.ok('total_items'       in d, 'dashboard debe incluir total_items');
    assert.ok('items_bajo_minimo' in d, 'dashboard debe incluir items_bajo_minimo');
    assert.ok('items_agotados'    in d, 'dashboard debe incluir items_agotados');
    assert.ok('movimientos_hoy'   in d, 'dashboard debe incluir movimientos_hoy');
    assert.ok(Array.isArray(d.alertas), 'dashboard debe incluir alertas array');

    assert.equal(d.total_items, 0, 'tenant nuevo debe tener 0 items');

    // Crear item con stock bajo mínimo → aparece en alertas
    await apiRequest('POST', '/api/v1/almacen/inventario', token, {
      clave: 'INS-DASH-001', descripcion: 'Item bajo mínimo', unidad: 'PZA', categoria: 'MATERIAL',
      stock_minimo: 10,
    });

    const dash2 = await apiRequest('GET', '/api/v1/almacen/dashboard', token);
    assert.equal(dash2.body.data.total_items,       1, 'total_items debe ser 1');
    assert.equal(dash2.body.data.items_bajo_minimo, 1, 'items_bajo_minimo debe ser 1 (stock 0 < mínimo 10)');
    assert.equal(dash2.body.data.items_agotados,    1, 'items_agotados debe ser 1 (stock 0)');
    assert.ok(dash2.body.data.alertas.length > 0, 'alertas debe tener al menos 1 entrada');

    console.log('[OK] testDashboard');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await setup();

  const tests = [
    testInventarioCrearYListar,
    testInventarioPatch,
    testMovimientosIngresoEgreso,
    testMovimientoEgresoSinStock,
    testDashboard,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (err: any) {
      failed++;
      console.error(`[FAIL] ${test.name}: ${err.message}`);
      if (process.env.VERBOSE) console.error(err);
    }
  }

  await teardown();

  console.log(`\nResultados: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
