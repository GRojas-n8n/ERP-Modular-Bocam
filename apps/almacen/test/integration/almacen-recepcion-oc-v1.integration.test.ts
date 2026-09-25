/**
 * Tests de Integración: Almacén — consumo de compras.recepcion_oc_registrada.v1
 * Change: fix-ingresos-almacen-por-recepcion-oc (sección 3)
 * Spec: almacen-eventos-oc (delta del change)
 *
 * Runner: npm run test:integration:recepcion-oc-v1 -w @bocam/almacen
 * Requiere: PostgreSQL (ALMACEN_DATABASE_URL o DATABASE_URL → schema almacen)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → el bus queda sin conectar, lo que prueba /ready)
 */

// CRÍTICO: env vars antes del import dinámico de main.ts
process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import type { BocamEvent } from '../../../../packages/event-bus/src';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl =
  process.env.ALMACEN_DATABASE_URL ||
  process.env.DATABASE_URL         ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=almacen';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let handleRecepcionOcRegistrada: (e: BocamEvent) => Promise<void>;
let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const mod = await import('../../src/main');
  handleRecepcionOcRegistrada = (mod as any).handleRecepcionOcRegistrada;
  const started = await startHttpApp(mod.app as any);
  server = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.movimientoAlmacen.deleteMany({ where: { tenant_id: tenantId } });
  await (prisma as any).eventoProcesado?.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.itemInventario.deleteMany({ where: { tenant_id: tenantId } });
}

interface ItemSpec {
  recepcionItemId?: string;
  insumoId: string | null;
  cantidad: number;
  clave?: string;
  descripcion?: string;
}

function buildEvent(o: {
  tenantId: string;
  proyectoId: string;
  ocId?: string;
  recepcionId?: string;
  eventId?: string;
  estado?: string;
  items: ItemSpec[];
  overridePayload?: Record<string, unknown>;
  eventVersion?: number;
  contextTenantId?: string;
}): BocamEvent {
  const eventId = o.eventId ?? randomUUID();
  const ocId = o.ocId ?? randomUUID();
  const recepcionId = o.recepcionId ?? randomUUID();
  const occurredAt = new Date().toISOString();
  return {
    event_type: 'compras.recepcion_oc_registrada.v1',
    event_id: eventId,
    event_version: o.eventVersion ?? 1,
    timestamp: occurredAt,
    context: { tenant_id: o.contextTenantId ?? o.tenantId, proyecto_id: o.proyectoId, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
    payload: {
      event_id: eventId,
      event_version: o.eventVersion ?? 1,
      occurred_at: occurredAt,
      tenant_id: o.tenantId,
      proyecto_id: o.proyectoId,
      orden_compra_id: ocId,
      orden_compra_codigo: 'OC-TEST-1',
      proveedor_id: randomUUID(),
      recepcion_id: recepcionId,
      fecha_recepcion: occurredAt,
      estado_oc_resultante: o.estado ?? 'PARCIALMENTE_RECIBIDA',
      items: o.items.map((i, idx) => ({
        recepcion_item_id: i.recepcionItemId ?? randomUUID(),
        orden_item_id: randomUUID(),
        insumo_id: i.insumoId,
        cantidad_recibida: i.cantidad,
        clave: i.clave ?? `INS-V1-${idx}`,
        descripcion: i.descripcion ?? `Insumo v1 ${idx}`,
        unidad: 'PZA',
        categoria: 'MATERIAL',
      })),
      ...(o.overridePayload ?? {}),
    },
  };
}

async function stockDe(tenantId: string, proyectoId: string, insumoId: string): Promise<number | null> {
  const item = await prisma.itemInventario.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: insumoId } });
  return item ? Number(item.stock_actual) : null;
}

async function ingresos(tenantId: string) {
  return prisma.movimientoAlmacen.findMany({ where: { tenant_id: tenantId, tipo: 'INGRESO' } });
}

// ─────────────────────────────────────────────────────────────────────────────
async function testContratoV1CreaIngresosYInventario() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumoA = randomUUID(); const insumoB = randomUUID();
  try {
    const event = buildEvent({ tenantId, proyectoId, items: [{ insumoId: insumoA, cantidad: 50 }, { insumoId: insumoB, cantidad: 7 }] });
    await handleRecepcionOcRegistrada(event);

    const movs = await ingresos(tenantId);
    assert.equal(movs.length, 2, 'un INGRESO por ítem con insumo_id');
    const payload = event.payload as any;
    for (const m of movs) {
      assert.equal(m.referencia, payload.orden_compra_id, 'referencia = orden_compra_id');
      assert.equal((m as any).recepcion_id, payload.recepcion_id, 'recepcion_id guardado en el movimiento');
      assert.ok((m as any).recepcion_item_id, 'recepcion_item_id guardado en el movimiento');
      assert.equal(m.origen, 'OC');
    }
    assert.equal(await stockDe(tenantId, proyectoId, insumoA), 50);
    assert.equal(await stockDe(tenantId, proyectoId, insumoB), 7);
    const item = await prisma.itemInventario.findFirst({ where: { tenant_id: tenantId, insumo_id: insumoA } });
    assert.equal(item!.clave, 'INS-V1-0', 'el ItemInventario se crea con el snapshot del evento');
    console.log('[OK] testContratoV1CreaIngresosYInventario');
  } finally { await cleanupTenant(tenantId); }
}

async function testDosRecepcionesParcialesDelMismoInsumoSuman() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumo = randomUUID(); const ocId = randomUUID();
  try {
    await handleRecepcionOcRegistrada(buildEvent({ tenantId, proyectoId, ocId, items: [{ insumoId: insumo, cantidad: 40 }] }));
    await handleRecepcionOcRegistrada(buildEvent({ tenantId, proyectoId, ocId, items: [{ insumoId: insumo, cantidad: 60 }], estado: 'RECIBIDA' }));
    assert.equal(await stockDe(tenantId, proyectoId, insumo), 100, 'las dos recepciones se suman (40 + 60)');
    assert.equal((await ingresos(tenantId)).length, 2);
    console.log('[OK] testDosRecepcionesParcialesDelMismoInsumoSuman');
  } finally { await cleanupTenant(tenantId); }
}

async function testRedeliveryMismoEventIdNoDuplica() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumo = randomUUID();
  try {
    const event = buildEvent({ tenantId, proyectoId, items: [{ insumoId: insumo, cantidad: 30 }] });
    await handleRecepcionOcRegistrada(event);
    await handleRecepcionOcRegistrada(event);
    assert.equal(await stockDe(tenantId, proyectoId, insumo), 30, 'no se duplica el stock');
    assert.equal((await ingresos(tenantId)).length, 1);
    const registros = await (prisma as any).eventoProcesado.count({ where: { tenant_id: tenantId } });
    assert.equal(registros, 1, 'el event_id se registra una sola vez');
    console.log('[OK] testRedeliveryMismoEventIdNoDuplica');
  } finally { await cleanupTenant(tenantId); }
}

async function testMismaRecepcionConOtroEventIdNoDuplica() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumo = randomUUID();
  const recepcionId = randomUUID(); const recepcionItemId = randomUUID();
  try {
    const items = [{ insumoId: insumo, cantidad: 25, recepcionItemId }];
    await handleRecepcionOcRegistrada(buildEvent({ tenantId, proyectoId, recepcionId, items }));
    await handleRecepcionOcRegistrada(buildEvent({ tenantId, proyectoId, recepcionId, items })); // otro event_id
    assert.equal(await stockDe(tenantId, proyectoId, insumo), 25, 'la misma recepción y renglón no se aplica dos veces');
    assert.equal((await ingresos(tenantId)).length, 1);
    console.log('[OK] testMismaRecepcionConOtroEventIdNoDuplica');
  } finally { await cleanupTenant(tenantId); }
}

async function testItemSinInsumoNoEsErrorNiMovimiento() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumo = randomUUID();
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => { logs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); };
  try {
    const recepcionItemLibre = randomUUID();
    const event = buildEvent({ tenantId, proyectoId, items: [
      { insumoId: null, cantidad: 3, recepcionItemId: recepcionItemLibre },
      { insumoId: insumo, cantidad: 9 },
    ] });
    await handleRecepcionOcRegistrada(event);
    console.log = originalLog;

    const movs = await ingresos(tenantId);
    assert.equal(movs.length, 1, 'solo el ítem con insumo genera movimiento');
    assert.equal(await stockDe(tenantId, proyectoId, insumo), 9);
    assert.equal(await prisma.itemInventario.count({ where: { tenant_id: tenantId } }), 1, 'no se crean registros artificiales');
    const info = logs.find(l => l.includes('item_no_inventariable'));
    assert.ok(info, 'debe registrarse un evento informativo');
    assert.ok(info!.includes(recepcionItemLibre) && info!.includes((event.payload as any).recepcion_id), 'el registro conserva la trazabilidad de la recepción');
    console.log('[OK] testItemSinInsumoNoEsErrorNiMovimiento');
  } finally { console.log = originalLog; await cleanupTenant(tenantId); }
}

async function testFalloEnUnItemRevierteElEventoCompleto() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumoOk = randomUUID(); const insumoMalo = randomUUID();
  try {
    const event = buildEvent({ tenantId, proyectoId, items: [
      { insumoId: insumoOk, cantidad: 10 },
      { insumoId: insumoMalo, cantidad: 5, clave: 'X'.repeat(80) }, // excede VarChar(50): falla al crear el ItemInventario
    ] });
    let error: any;
    await handleRecepcionOcRegistrada(event).catch((e) => { error = e; });
    assert.ok(error, 'el error se propaga para que el bus reintente');
    assert.notEqual(error.nonRetryable, true, 'un fallo de base de datos es reintentable');

    assert.equal((await ingresos(tenantId)).length, 0, 'no queda ningún INGRESO parcial');
    assert.equal(await stockDe(tenantId, proyectoId, insumoOk), null, 'el primer ítem tampoco se aplicó');
    assert.equal(await (prisma as any).eventoProcesado.count({ where: { tenant_id: tenantId } }), 0, 'el event_id no se registra si el evento falla');
    console.log('[OK] testFalloEnUnItemRevierteElEventoCompleto');
  } finally { await cleanupTenant(tenantId); }
}

async function testFormatoAntiguoVersionYContextoNoSoportadosSonNoReintentables() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumo = randomUUID();
  try {
    const casos: Array<[string, BocamEvent]> = [
      ['formato antiguo', {
        event_type: 'compras.recepcion_oc_registrada.v1', timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
        payload: { orden_compra_id: randomUUID(), items: [{ insumo_id: insumo, clave: 'A', descripcion: 'B', unidad: 'PZA', categoria: 'MATERIAL', cantidad_recibida: 5 }] },
      }],
      ['versión no soportada', buildEvent({ tenantId, proyectoId, eventVersion: 2, items: [{ insumoId: insumo, cantidad: 5 }] })],
      ['contexto inconsistente', buildEvent({ tenantId, proyectoId, contextTenantId: randomUUID(), items: [{ insumoId: insumo, cantidad: 5 }] })],
      ['sin ítems', buildEvent({ tenantId, proyectoId, items: [] })],
      ['cantidad inválida', buildEvent({ tenantId, proyectoId, items: [{ insumoId: insumo, cantidad: 0 }] })],
    ];
    for (const [nombre, evento] of casos) {
      let error: any;
      await handleRecepcionOcRegistrada(evento).catch((e) => { error = e; });
      assert.ok(error, `${nombre}: debe rechazarse`);
      assert.equal(error.nonRetryable, true, `${nombre}: el error debe ser no reintentable`);
    }
    assert.equal((await ingresos(tenantId)).length, 0, 'ningún rechazo produce efectos');
    console.log('[OK] testFormatoAntiguoVersionYContextoNoSoportadosSonNoReintentables');
  } finally { await cleanupTenant(tenantId); }
}

async function testEventosConcurrentesDelMismoInsumoNoDuplicanElItem() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const insumo = randomUUID();
  try {
    await Promise.all([1, 2, 3, 4].map(() =>
      handleRecepcionOcRegistrada(buildEvent({ tenantId, proyectoId, items: [{ insumoId: insumo, cantidad: 10 }] }))));
    assert.equal(await prisma.itemInventario.count({ where: { tenant_id: tenantId, insumo_id: insumo } }), 1, 'un solo ItemInventario');
    assert.equal(await stockDe(tenantId, proyectoId, insumo), 40, 'las cuatro recepciones concurrentes se suman');
    console.log('[OK] testEventosConcurrentesDelMismoInsumoNoDuplicanElItem');
  } finally { await cleanupTenant(tenantId); }
}

async function testHealthEsPruebaDeVidaYReadyInformaDependencias() {
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200, '/health responde 200 aunque el bus no esté conectado');
  const healthBody = await health.json() as any;
  assert.equal(healthBody.status, 'ok');
  assert.equal(healthBody.service, 'almacen');

  const ready = await fetch(`${baseUrl}/ready`);
  assert.equal(ready.status, 503, '/ready responde 503 si el bus no está listo');
  const body = await ready.json() as any;
  assert.equal(body.status, 'not_ready');
  assert.equal(body.checks.database, 'ok', 'la base sí responde');
  assert.equal(body.checks.event_bus, 'error', 'el detalle indica qué dependencia falla');
  console.log('[OK] testHealthEsPruebaDeVidaYReadyInformaDependencias');
}

async function main() {
  await setup();
  const pruebas: Array<[string, () => Promise<void>]> = [
    ['contrato v1 crea ingresos e inventario', testContratoV1CreaIngresosYInventario],
    ['dos recepciones parciales suman', testDosRecepcionesParcialesDelMismoInsumoSuman],
    ['redelivery con el mismo event_id', testRedeliveryMismoEventIdNoDuplica],
    ['misma recepcion con otro event_id', testMismaRecepcionConOtroEventIdNoDuplica],
    ['item sin insumo no es error ni movimiento', testItemSinInsumoNoEsErrorNiMovimiento],
    ['fallo en un item revierte el evento', testFalloEnUnItemRevierteElEventoCompleto],
    ['formato/version/contexto no soportados son no reintentables', testFormatoAntiguoVersionYContextoNoSoportadosSonNoReintentables],
    ['eventos concurrentes no duplican el item', testEventosConcurrentesDelMismoInsumoNoDuplicanElItem],
    ['/health vida y /ready dependencias', testHealthEsPruebaDeVidaYReadyInformaDependencias],
  ];
  try {
    for (const [nombre, prueba] of pruebas) {
      try { await prueba(); } catch (error: any) {
        console.error(`[FAIL] ${nombre}: ${error?.message ?? error}`);
        process.exitCode = 1;
      }
    }
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - almacen recepcion-oc v1 integration tests');
  console.error(error);
  process.exitCode = 1;
});
