/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Flujo Cotización — Requisición IMPREVISTO + Aprobar
 * Spec:  openspec/changes/flujo-cotizacion-req-imprevisto/
 * Tareas: 9.1–9.6 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (EventBus falla silenciosamente)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

// ── Configuración ────────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({
  datasources: { db: { url: comprasDbUrl } },
});

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';

// ── Setup / Teardown ─────────────────────────────────────────────────────────

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) =>
    res.json({ success: true, data: { tiene_suficiencia: true } })
  );
  finanzasStub.post('/api/v1/finanzas/comprometer-fondos', (_req, res) =>
    res.json({ success: true, data: { compromiso_id: `COMP-${Date.now()}` } })
  );
  finanzasStub.post('/api/v1/finanzas/liberar-fondos', (_req, res) =>
    res.json({ success: true, data: {} })
  );

  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;

  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

// ── Runner ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ── Test 9.1 — POST IMPREVISTO sin insumo_id → 201, estado PENDIENTE ─────────

async function test91() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  await cleanupTenant(tenantId);

  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['resident'] });
  const res = await fetch(`${comprasBaseUrl}/api/v1/compras/requisiciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      concepto_id: randomUUID(),
      tipo: 'IMPREVISTO',
      prioridad: 'ALTA',
      observaciones: 'Material no previsto en presupuesto',
      items: [
        { descripcion_libre: 'Varilla 3/8"', unidad_libre: 'TON', cantidad: 2, es_imprevisto: true, justificacion: 'Material adicional por cambio de diseño' },
        { descripcion_libre: 'Arena gruesa',  unidad_libre: 'M3',  cantidad: 5, es_imprevisto: true, justificacion: 'Material adicional por cambio de diseño' },
      ],
    }),
  });

  assert.equal(res.status, 201, `Esperado 201, recibido ${res.status}`);
  const body = await res.json() as any;
  assert.equal(body.success, true);
  assert.equal(body.data.estado, 'PENDIENTE', 'Estado inicial debe ser PENDIENTE');
  assert.equal(body.data.tipo, 'IMPREVISTO', 'Tipo debe ser IMPREVISTO');
  assert.equal(body.data.items.length, 2, 'Debe persistir los 2 ítems');
  assert.equal(body.data.items[0].insumo_id, null, 'insumo_id debe ser null en ítem sin catálogo');

  await cleanupTenant(tenantId);
}

// ── Test 9.2 — POST IMPREVISTO con insumo_id → insumo_id se guarda ───────────

async function test92() {
  const tenantId  = randomUUID();
  const proyectoId = randomUUID();
  await cleanupTenant(tenantId);

  const insumoId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['resident'] });
  const res = await fetch(`${comprasBaseUrl}/api/v1/compras/requisiciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      concepto_id: randomUUID(),
      tipo: 'IMPREVISTO',
      items: [{
        insumo_id: insumoId,
        descripcion_libre: 'Concreto extra f\'c=250',
        unidad_libre: 'M3',
        cantidad: 10,
        es_imprevisto: true,
        justificacion: 'Concreto adicional por cambio de especificación',
      }],
    }),
  });

  assert.equal(res.status, 201);
  const body = await res.json() as any;
  assert.equal(body.data.items[0].insumo_id, insumoId,
    'Cuando se provee insumo_id en ítem IMPREVISTO debe conservarse');
  assert.equal(body.data.items[0].es_imprevisto, true);

  await cleanupTenant(tenantId);
}

// ── Test 9.3 — PATCH /aprobar con rol procurement → 200, estado APROBADA ─────

async function test93() {
  const tenantId  = randomUUID();
  const proyectoId = randomUUID();
  const userId    = randomUUID();
  await cleanupTenant(tenantId);

  const req = await prisma.requisicion.create({
    data: {
      tenant_id:     tenantId,
      proyecto_id:   proyectoId,
      codigo:        `REQ-TEST-93-${Date.now()}`,
      solicitante_id: userId,
      prioridad:     'NORMAL',
      estado:        'PENDIENTE',
      tipo:          'NORMAL',
      items: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId,
        insumo_id: randomUUID(), cantidad: 1, es_imprevisto: false }] },
    },
  });

  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });
  const res = await fetch(
    `${comprasBaseUrl}/api/v1/compras/requisiciones/${req.id_requisicion}/aprobar`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
  );

  assert.equal(res.status, 200, `Esperado 200, recibido ${res.status}`);
  const body = await res.json() as any;
  assert.equal(body.success, true);
  assert.equal(body.data.estado, 'APROBADA', 'Estado debe cambiar a APROBADA');

  await cleanupTenant(tenantId);
}

// ── Test 9.4 — PATCH /aprobar idempotente (ya APROBADA) → 200 ────────────────

async function test94() {
  const tenantId  = randomUUID();
  const proyectoId = randomUUID();
  const userId    = randomUUID();
  await cleanupTenant(tenantId);

  const req = await prisma.requisicion.create({
    data: {
      tenant_id:     tenantId,
      proyecto_id:   proyectoId,
      codigo:        `REQ-TEST-94-${Date.now()}`,
      solicitante_id: userId,
      prioridad:     'NORMAL',
      estado:        'APROBADA',
      tipo:          'NORMAL',
      items: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId,
        insumo_id: randomUUID(), cantidad: 1, es_imprevisto: false }] },
    },
  });

  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });
  const url = `${comprasBaseUrl}/api/v1/compras/requisiciones/${req.id_requisicion}/aprobar`;

  const res1 = await fetch(url, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res1.status, 200, 'Primera llamada idempotente debe ser 200');

  const res2 = await fetch(url, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res2.status, 200, 'Segunda llamada idempotente debe ser 200 sin error');
  const body = await res2.json() as any;
  assert.equal(body.data.estado, 'APROBADA', 'Estado no debe cambiar');

  await cleanupTenant(tenantId);
}

// ── Test 9.5 — PATCH /aprobar con rol resident → 403 ─────────────────────────

async function test95() {
  const tenantId  = randomUUID();
  const proyectoId = randomUUID();
  await cleanupTenant(tenantId);

  const req = await prisma.requisicion.create({
    data: {
      tenant_id:     tenantId,
      proyecto_id:   proyectoId,
      codigo:        `REQ-TEST-95-${Date.now()}`,
      solicitante_id: randomUUID(),
      prioridad:     'NORMAL',
      estado:        'PENDIENTE',
      tipo:          'NORMAL',
      items: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId,
        insumo_id: randomUUID(), cantidad: 1, es_imprevisto: false }] },
    },
  });

  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['resident'] });
  const res = await fetch(
    `${comprasBaseUrl}/api/v1/compras/requisiciones/${req.id_requisicion}/aprobar`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
  );

  assert.equal(res.status, 403, `Rol resident debe recibir 403, recibió ${res.status}`);

  await cleanupTenant(tenantId);
}

// ── Test 9.6 — PATCH /aprobar con estado COMPRADA → 400 ──────────────────────

async function test96() {
  const tenantId  = randomUUID();
  const proyectoId = randomUUID();
  await cleanupTenant(tenantId);

  const req = await prisma.requisicion.create({
    data: {
      tenant_id:     tenantId,
      proyecto_id:   proyectoId,
      codigo:        `REQ-TEST-96-${Date.now()}`,
      solicitante_id: randomUUID(),
      prioridad:     'NORMAL',
      estado:        'COMPRADA',
      tipo:          'NORMAL',
      items: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId,
        insumo_id: randomUUID(), cantidad: 1, es_imprevisto: false }] },
    },
  });

  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });
  const res = await fetch(
    `${comprasBaseUrl}/api/v1/compras/requisiciones/${req.id_requisicion}/aprobar`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
  );

  assert.equal(res.status, 400, `Estado COMPRADA debe retornar 400, recibió ${res.status}`);
  const body = await res.json() as any;
  assert.equal(body.success, false, 'Body debe indicar error');

  await cleanupTenant(tenantId);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n── req-imprevisto-aprobar integration tests ──\n');

  await setup();

  await test('9.1 POST IMPREVISTO sin insumo_id → 201, estado PENDIENTE',      test91);
  await test('9.2 POST IMPREVISTO con insumo_id → insumo_id conservado',       test92);
  await test('9.3 PATCH /aprobar rol procurement → 200, estado APROBADA',      test93);
  await test('9.4 PATCH /aprobar idempotente (ya APROBADA) → 200 sin error',   test94);
  await test('9.5 PATCH /aprobar rol resident → 403',                          test95);
  await test('9.6 PATCH /aprobar estado COMPRADA → 400',                       test96);

  await teardown();

  console.log(`\nResultado: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
