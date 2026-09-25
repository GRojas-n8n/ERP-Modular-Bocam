/**
 * Tests de Integración: Compras — outbox transaccional de recepciones de OC
 * Change: fix-ingresos-almacen-por-recepcion-oc (sección 4)
 * Specs: evento-recepcion-oc-registrada, outbox-eventos-compras (deltas del change)
 *
 * Garantías que se prueban:
 *  - la recepción y el registro del outbox se escriben en la misma transacción;
 *  - la publicación es reintentable, se marca PUBLICADO solo tras la confirmación del broker
 *    y se recupera tras reinicios o caídas entre la confirmación y el marcado;
 *  - varias instancias del despachador no duplican la publicación;
 *  - aislamiento por RLS y reemisión restringida.
 *
 * Runner: npm run test:integration:outbox-recepcion-oc -w @bocam/compras
 * Requiere: PostgreSQL (DATABASE_URL → schema compras). No requiere RabbitMQ (publicador simulado).
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import type { BocamEvent } from '../../../../packages/event-bus/src';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
process.env.DATABASE_URL = comprasDbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

const INSUMO_CATALOGO = randomUUID();
let comprasServer: Server | undefined;
let gtServer: Server | undefined;
let baseUrl = '';
let despacharOutbox: (deps: any) => Promise<{ publicados: number; fallidos: number; errores: number }>;
let gtDisponible = true;
let gtLlamadas = 0;

async function setup() {
  const gt = express();
  gt.get('/api/v1/gerencia-tecnica/insumos', (_req, res) => {
    gtLlamadas++;
    if (!gtDisponible) return void res.status(503).json({ success: false });
    res.json({ success: true, data: [{ id: INSUMO_CATALOGO, clave: 'MAT-001', descripcion: 'Varilla 3/8', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL' }] });
  });
  const gtStarted = await startHttpApp(gt);
  gtServer = gtStarted.server;
  process.env.GT_URL = `${gtStarted.baseUrl}/api/v1/gerencia-tecnica`;

  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  comprasServer = started.server;
  baseUrl = started.baseUrl;
  despacharOutbox = ((await import('../../src/outbox')) as any).despacharOutbox;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(gtServer);
  await prisma.$disconnect();
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function cleanupTenant(tenantId: string) {
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_test_outbox_falla ON outbox_eventos`).catch(() => undefined);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_test_outbox_update_falla ON outbox_eventos`).catch(() => undefined);
  await (prisma as any).outboxEvento?.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.recepcionOCItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.recepcionOC.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

const SNAPSHOT_CATALOGO = { clave: 'MAT-001', descripcion: 'Varilla 3/8', unidad: 'PZA', categoria: 'MATERIAL' };

async function seedOc(tenantId: string, proyectoId: string, items: Array<{ insumo?: string | null; libre?: { descripcion: string; unidad: string }; cantidad: number; snapshot?: boolean }>) {
  const proveedor = await prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90)}`, razon_social: 'Proveedor outbox', estatus: 'ACTIVO' },
  });
  return prisma.ordenCompra.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedor.id_proveedor,
      codigo: `OC-OUTBOX-${randomUUID().slice(0, 8)}`, estado: 'EMITIDA', subtotal: 100, iva: 16, total: 116,
      items: {
        create: items.map((i) => ({
          tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: i.insumo ?? null,
          descripcion_libre: i.libre?.descripcion ?? null, unidad_libre: i.libre?.unidad ?? null,
          cantidad: i.cantidad, precio_unitario: 10, importe: i.cantidad * 10,
          ...(i.snapshot ? {
            clave_snapshot: SNAPSHOT_CATALOGO.clave, descripcion_snapshot: SNAPSHOT_CATALOGO.descripcion,
            unidad_snapshot: SNAPSHOT_CATALOGO.unidad, categoria_snapshot: SNAPSHOT_CATALOGO.categoria,
          } : {}),
        })),
      },
    } as any,
    include: { items: true },
  });
}

function token(tenantId: string, proyectoId: string, roles = ['procurement']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles, projects: [proyectoId] });
}

async function recibir(tenantId: string, proyectoId: string, ocId: string, items: Array<{ orden_item_id: string; cantidad_recibida: number }>, roles?: string[]) {
  return fetch(`${baseUrl}/api/v1/compras/ordenes-compra/${ocId}/recepciones`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token(tenantId, proyectoId, roles)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}

const outboxDe = (tenantId: string) => (prisma as any).outboxEvento.findMany({ where: { tenant_id: tenantId }, orderBy: { created_at: 'asc' } });

function publisherQue(comportamiento: (event: BocamEvent, llamada: number) => Promise<void>) {
  const eventos: BocamEvent[] = [];
  return {
    eventos,
    publishConfirmed: async (event: BocamEvent) => { eventos.push(event); await comportamiento(event, eventos.length); },
  };
}

// ── Contrato y atomicidad ────────────────────────────────────────────────────

async function testRecepcionCreaEventoV1EnElOutboxConSnapshot() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  gtDisponible = false; // el snapshot sale de la OC persistida: GT no interviene
  gtLlamadas = 0;
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10, snapshot: true }, { insumo: null, libre: { descripcion: 'Andamio imprevisto', unidad: 'PZA' }, cantidad: 4 }]);
    const [itCat, itLibre] = [oc.items.find((i: any) => i.insumo_id), oc.items.find((i: any) => !i.insumo_id)] as any[];

    const r = await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: itCat.id_item, cantidad_recibida: 6 }, { orden_item_id: itLibre.id_item, cantidad_recibida: 1 }]);
    assert.equal(r.status, 201, 'con Gerencia Técnica caída la recepción se registra: el snapshot ya está en la OC');
    assert.equal(gtLlamadas, 0, 'no se consultó a Gerencia Técnica');
    const filas = await outboxDe(tenantId);
    assert.equal(filas.length, 1, 'una recepción produce exactamente un evento');
    const fila = filas[0];
    assert.equal(fila.estado, 'PENDIENTE');
    assert.equal(fila.event_type, 'compras.recepcion_oc_registrada.v1');
    const p = fila.payload as any;
    assert.equal(p.event_id, fila.id_evento, 'event_id = identificador de la fila');
    assert.equal(p.event_version, 1);
    assert.ok(p.occurred_at);
    assert.equal(p.tenant_id, tenantId); assert.equal(p.proyecto_id, proyectoId);
    assert.equal(p.orden_compra_id, oc.id_orden);
    assert.equal(p.estado_oc_resultante, 'PARCIALMENTE_RECIBIDA');
    const recepcion = await prisma.recepcionOC.findFirst({ where: { tenant_id: tenantId }, include: { items: true } });
    assert.equal(p.recepcion_id, recepcion!.id_recepcion);
    const pCat = p.items.find((i: any) => i.orden_item_id === itCat.id_item);
    const idRecepcionItemCat = recepcion!.items.find((i) => i.orden_item_id === itCat.id_item)!.id_recepcion_item;
    assert.equal(pCat.recepcion_item_id, idRecepcionItemCat, 'identificador estable por renglón = id del renglón de recepción');
    assert.equal(pCat.insumo_id, INSUMO_CATALOGO);
    assert.equal(pCat.cantidad_recibida, 6);
    assert.deepEqual([pCat.clave, pCat.descripcion, pCat.unidad, pCat.categoria], ['MAT-001', 'Varilla 3/8', 'PZA', 'MATERIAL'], 'snapshot autosuficiente tomado de la OC persistida');
    const pLibre = p.items.find((i: any) => i.orden_item_id === itLibre.id_item);
    assert.equal(pLibre.insumo_id, null);
    assert.equal(pLibre.descripcion, 'Andamio imprevisto');
    assert.equal(pLibre.unidad, 'PZA');
    console.log('[OK] testRecepcionCreaEventoV1EnElOutboxConSnapshot');
  } finally { gtDisponible = true; await cleanupTenant(tenantId); }
}

async function testSegundaRecepcionSoloLlevaSusItems() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10, snapshot: true }]);
    const it = oc.items[0] as any;
    assert.equal((await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: it.id_item, cantidad_recibida: 4 }])).status, 201);
    assert.equal((await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: it.id_item, cantidad_recibida: 6 }])).status, 201);
    const filas = await outboxDe(tenantId);
    assert.equal(filas.length, 2);
    assert.notEqual(filas[0].id_evento, filas[1].id_evento, 'event_id distinto por recepción');
    assert.notEqual(filas[0].payload.recepcion_id, filas[1].payload.recepcion_id);
    assert.equal(filas[0].payload.items[0].cantidad_recibida, 4, 'la primera solo lleva lo recibido en ella');
    assert.equal(filas[1].payload.items[0].cantidad_recibida, 6, 'la segunda no acumula');
    assert.equal(filas[0].payload.estado_oc_resultante, 'PARCIALMENTE_RECIBIDA');
    assert.equal(filas[1].payload.estado_oc_resultante, 'RECIBIDA');
    console.log('[OK] testSegundaRecepcionSoloLlevaSusItems');
  } finally { await cleanupTenant(tenantId); }
}

async function testGtCaidaSinSnapshotRechazaLaRecepcionAntesDelCommit() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  gtDisponible = false;
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 5 }]); // sin snapshot persistido
    const r = await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 5 }]);
    assert.equal(r.status, 503, 'sin snapshot y sin Gerencia Técnica la recepción se rechaza');
    const body = await r.json() as any;
    assert.equal(body.error, 'SNAPSHOT_INSUMO_NO_DISPONIBLE', 'causa explícita y reintentable');
    assert.ok(String(body.message).includes(INSUMO_CATALOGO), 'indica qué insumo falta');
    assert.equal(await prisma.recepcionOC.count({ where: { tenant_id: tenantId } }), 0, 'no queda recepción');
    assert.equal(await (prisma as any).outboxEvento.count({ where: { tenant_id: tenantId } }), 0, 'no queda ningún evento (ni incompleto)');
    assert.equal((await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } }))!.estado, 'EMITIDA', 'la OC no cambia');

    gtDisponible = true; // reintentable: al volver Gerencia Técnica, la misma solicitud funciona
    const r2 = await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 5 }]);
    assert.equal(r2.status, 201);
    console.log('[OK] testGtCaidaSinSnapshotRechazaLaRecepcionAntesDelCommit');
  } finally { gtDisponible = true; await cleanupTenant(tenantId); }
}

async function testSnapshotFaltanteSeResuelveYSePersisteEnLaOc() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10 }]); // OC anterior al snapshot
    const it = oc.items[0] as any;
    assert.equal(it.clave_snapshot, null);
    assert.equal((await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: it.id_item, cantidad_recibida: 4 }])).status, 201);
    const persistido: any = await prisma.ordenCompraItem.findUnique({ where: { id_item: it.id_item } });
    assert.deepEqual([persistido.clave_snapshot, persistido.descripcion_snapshot, persistido.unidad_snapshot, persistido.categoria_snapshot],
      ['MAT-001', 'Varilla 3/8', 'PZA', 'MATERIAL'], 'el snapshot resuelto queda persistido en la OC');
    const [fila] = await outboxDe(tenantId);
    assert.equal(fila.payload.items[0].clave, 'MAT-001');

    gtDisponible = false; // la siguiente recepción ya no necesita a Gerencia Técnica
    gtLlamadas = 0;
    assert.equal((await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: it.id_item, cantidad_recibida: 6 }])).status, 201);
    assert.equal(gtLlamadas, 0);
    console.log('[OK] testSnapshotFaltanteSeResuelveYSePersisteEnLaOc');
  } finally { gtDisponible = true; await cleanupTenant(tenantId); }
}

async function testFallaAlEscribirElOutboxRevierteLaRecepcion() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10 }]);
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_outbox_falla() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'outbox_falla_simulada'; END; $$ LANGUAGE plpgsql`);
    await prisma.$executeRawUnsafe(`CREATE TRIGGER trg_test_outbox_falla BEFORE INSERT ON outbox_eventos FOR EACH ROW EXECUTE FUNCTION test_outbox_falla()`);
    const r = await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 10 }]);
    assert.ok(r.status >= 500, 'el usuario recibe un error');
    assert.equal(await prisma.recepcionOC.count({ where: { tenant_id: tenantId } }), 0, 'la recepción no queda registrada');
    assert.equal(await prisma.recepcionOCItem.count({ where: { tenant_id: tenantId } }), 0);
    const ocDespues = await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } });
    assert.equal(ocDespues!.estado, 'EMITIDA', 'el estado de la OC no cambia');
    console.log('[OK] testFallaAlEscribirElOutboxRevierteLaRecepcion');
  } finally { await cleanupTenant(tenantId); }
}

async function testBusCaidoLaRecepcionSeRegistraYElEventoQuedaPendiente() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10 }]);
    const r = await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 10 }]);
    assert.equal(r.status, 201, 'con el bus caído la recepción se registra igual');
    const [fila] = await outboxDe(tenantId);
    assert.equal(fila.estado, 'PENDIENTE');
    const publisherCaido = publisherQue(async () => { throw new Error('EVENT_BUS_SIN_CANAL: bus caído'); });
    const res = await despacharOutbox({ publisher: publisherCaido, batchSize: 10, maxAttempts: 5 });
    assert.equal(res.fallidos, 1);
    const [despues] = await outboxDe(tenantId);
    assert.equal(despues.estado, 'PENDIENTE', 'sigue pendiente');
    assert.equal(despues.intentos, 1);
    assert.match(String(despues.ultimo_error), /bus caído/);
    assert.ok(despues.proximo_intento_en.getTime() > Date.now(), 'reprogramado con espera');
    console.log('[OK] testBusCaidoLaRecepcionSeRegistraYElEventoQuedaPendiente');
  } finally { await cleanupTenant(tenantId); }
}

// ── Despachador ──────────────────────────────────────────────────────────────

async function sembrarEventoPendiente(tenantId: string, proyectoId: string) {
  const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10 }]);
  await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 10 }]);
  const [fila] = await outboxDe(tenantId);
  return fila;
}

async function adelantarProximoIntento(idEvento: string) {
  await (prisma as any).outboxEvento.update({ where: { id_evento: idEvento }, data: { proximo_intento_en: new Date(Date.now() - 1000) } });
}

async function testPublicacionTrasFallaTransitoria() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    const fila = await sembrarEventoPendiente(tenantId, proyectoId);
    const pub = publisherQue(async (_e, n) => { if (n === 1) throw new Error('fallo transitorio'); });
    await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    assert.equal((await outboxDe(tenantId))[0].estado, 'PENDIENTE');
    await adelantarProximoIntento(fila.id_evento);
    await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    const [final] = await outboxDe(tenantId);
    assert.equal(final.estado, 'PUBLICADO');
    assert.equal(final.intentos, 2);
    assert.ok(final.publicado_en);
    assert.equal(pub.eventos.length, 2);
    assert.equal(pub.eventos[0].event_id, fila.id_evento, 'se publica con el event_id de la fila');
    assert.equal(pub.eventos[1].event_id, fila.id_evento, 'el reintento conserva el mismo event_id');
    assert.equal(pub.eventos[1].event_type, 'compras.recepcion_oc_registrada.v1');
    assert.equal(pub.eventos[1].context.tenant_id, tenantId);
    assert.equal(pub.eventos[1].context.proyecto_id, proyectoId);
    console.log('[OK] testPublicacionTrasFallaTransitoria');
  } finally { await cleanupTenant(tenantId); }
}

async function testMaximoDeIntentosPasaAErrorYRegistraLog() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  const logs: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => { logs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); };
  try {
    const fila = await sembrarEventoPendiente(tenantId, proyectoId);
    const pub = publisherQue(async () => { throw new Error('siempre falla'); });
    for (let i = 0; i < 3; i++) {
      await despacharOutbox({ publisher: pub, maxAttempts: 3 });
      await adelantarProximoIntento(fila.id_evento);
    }
    console.error = originalError;
    const [final] = await outboxDe(tenantId);
    assert.equal(final.estado, 'ERROR');
    assert.equal(final.intentos, 3);
    assert.match(String(final.ultimo_error), /siempre falla/);
    assert.ok(logs.some((l) => l.includes(fila.id_evento) && l.includes('outbox')), 'log de error con el evento afectado');
    await despacharOutbox({ publisher: pub, maxAttempts: 3 });
    assert.equal(pub.eventos.length, 3, 'una fila en ERROR no se vuelve a publicar sola');
    console.log('[OK] testMaximoDeIntentosPasaAErrorYRegistraLog');
  } finally { console.error = originalError; await cleanupTenant(tenantId); }
}

async function testSoloSeMarcaPublicadoTrasLaConfirmacionDelBroker() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    const fila = await sembrarEventoPendiente(tenantId, proyectoId);
    let liberar!: () => void;
    const confirmacion = new Promise<void>((resolve) => { liberar = resolve; });
    const pub = publisherQue(async () => { await confirmacion; });
    const corrida = despacharOutbox({ publisher: pub, maxAttempts: 5 });
    await delay(400);
    assert.equal(pub.eventos.length, 1, 'ya se envió al broker');
    assert.equal((await outboxDe(tenantId))[0].estado, 'PENDIENTE', 'sin confirmación del broker sigue PENDIENTE');
    liberar();
    await corrida;
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO');
    console.log('[OK] testSoloSeMarcaPublicadoTrasLaConfirmacionDelBroker');
  } finally { await cleanupTenant(tenantId); }
}

async function testMensajeDevueltoPorFaltaDeColaNoSeMarcaPublicado() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    await sembrarEventoPendiente(tenantId, proyectoId);
    const pub = publisherQue(async () => { throw new Error('EVENT_BUS_SIN_COLA: mensaje sin cola enlazada (no rutable).'); });
    await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    const [fila] = await outboxDe(tenantId);
    assert.equal(fila.estado, 'PENDIENTE');
    assert.match(String(fila.ultimo_error), /SIN_COLA/);
    console.log('[OK] testMensajeDevueltoPorFaltaDeColaNoSeMarcaPublicado');
  } finally { await cleanupTenant(tenantId); }
}

async function testDosInstanciasNoPublicanLaMismaFila() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    await sembrarEventoPendiente(tenantId, proyectoId);
    const pub = publisherQue(async () => { await delay(400); });
    await Promise.all([
      despacharOutbox({ publisher: pub, maxAttempts: 5 }),
      despacharOutbox({ publisher: pub, maxAttempts: 5 }),
    ]);
    assert.equal(pub.eventos.length, 1, 'cada fila la toma una sola instancia');
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO');
    console.log('[OK] testDosInstanciasNoPublicanLaMismaFila');
  } finally { await cleanupTenant(tenantId); }
}

async function testRecuperacionTrasReinicioRetomaLoPendiente() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    await sembrarEventoPendiente(tenantId, proyectoId);
    // "Reinicio": ningún estado en memoria; un despachador nuevo retoma lo que quedó en la base.
    const pub = publisherQue(async () => undefined);
    const res = await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    assert.equal(res.publicados, 1);
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO');
    console.log('[OK] testRecuperacionTrasReinicioRetomaLoPendiente');
  } finally { await cleanupTenant(tenantId); }
}

async function testCaidaEntreConfirmacionYMarcadoRepublicaConElMismoEventId() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const fila = await sembrarEventoPendiente(tenantId, proyectoId);
    const pub = publisherQue(async () => undefined);
    // Simula la caída: el broker confirma pero el marcado PUBLICADO falla y la transacción se revierte.
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_outbox_update_falla() RETURNS trigger AS $$
      BEGIN IF NEW.estado = 'PUBLICADO' THEN RAISE EXCEPTION 'caida_simulada'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql`);
    await prisma.$executeRawUnsafe(`CREATE TRIGGER trg_test_outbox_update_falla BEFORE UPDATE ON outbox_eventos FOR EACH ROW EXECUTE FUNCTION test_outbox_update_falla()`);
    await despacharOutbox({ publisher: pub, maxAttempts: 5 }).catch(() => undefined);
    assert.equal((await outboxDe(tenantId))[0].estado, 'PENDIENTE', 'sin marcado la fila sigue pendiente');
    assert.equal(pub.eventos.length, 1);

    await prisma.$executeRawUnsafe(`DROP TRIGGER trg_test_outbox_update_falla ON outbox_eventos`);
    await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    assert.equal(pub.eventos.length, 2, 'se republica');
    assert.equal(pub.eventos[1].event_id, fila.id_evento, 'con el mismo event_id (el consumidor lo trata como reentrega)');
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO');
    console.log('[OK] testCaidaEntreConfirmacionYMarcadoRepublicaConElMismoEventId');
  } finally { console.error = originalError; await cleanupTenant(tenantId); }
}

async function testEventoCompletoTrasReinicioSinConsultarGerenciaTecnica() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10 }]); // snapshot vía resolución en la petición
    await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 10 }]);
    // "Reinicio" con Gerencia Técnica caída: un despachador nuevo, sin memoria, publica un evento completo.
    gtDisponible = false; gtLlamadas = 0;
    const pub = publisherQue(async () => undefined);
    await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    assert.equal(gtLlamadas, 0, 'el despacho no consulta a Gerencia Técnica');
    assert.equal(pub.eventos.length, 1);
    const item = (pub.eventos[0].payload as any).items[0];
    for (const campo of ['clave', 'descripcion', 'unidad', 'categoria']) assert.ok(item[campo], `el evento publicado trae ${campo}`);
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO');
    console.log('[OK] testEventoCompletoTrasReinicioSinConsultarGerenciaTecnica');
  } finally { gtDisponible = true; await cleanupTenant(tenantId); }
}

async function testEventoIncompletoNuncaSePublicaNiSeMarcaPublicadoYSeRepara() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  const logs: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => { logs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); };
  try {
    // Recepción real cuyo evento se corrompe a mano (defecto simulado): sin snapshot del insumo.
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10, snapshot: true }]);
    await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 10 }]);
    const [fila] = await outboxDe(tenantId);
    const corrupto = JSON.parse(JSON.stringify(fila.payload));
    for (const campo of ['clave', 'descripcion', 'unidad', 'categoria']) delete corrupto.items[0][campo];
    await (prisma as any).outboxEvento.update({ where: { id_evento: fila.id_evento }, data: { payload: corrupto } });

    const pub = publisherQue(async () => undefined);
    const res = await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    console.error = originalError;
    assert.equal(pub.eventos.length, 0, 'un evento incompleto nunca se envía al broker');
    assert.equal(res.errores, 1);
    const [bloqueado] = await outboxDe(tenantId);
    assert.equal(bloqueado.estado, 'ERROR', 'queda retenido, no marcado como publicado');
    assert.match(String(bloqueado.ultimo_error), /PAYLOAD_INCOMPLETO/, 'causa explícita');
    assert.equal(bloqueado.publicado_en, null);
    assert.ok(logs.some((l) => l.includes(fila.id_evento) && l.includes('PAYLOAD_INCOMPLETO')), 'log de error con el evento');
    await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    assert.equal(pub.eventos.length, 0, 'sigue sin publicarse por sí solo');

    // Reparable: el snapshot persistido en la OC está completo, la reemisión reconstruye el payload (mismo event_id).
    const url = `${baseUrl}/api/v1/compras/ordenes-compra/${fila.orden_id}/recepciones/${fila.payload.recepcion_id}/reemitir-evento`;
    const ok = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token(tenantId, proyectoId)}` } });
    assert.equal(ok.status, 200);
    const [reparado] = await outboxDe(tenantId);
    assert.equal(reparado.id_evento, fila.id_evento, 'se conserva el event_id');
    assert.equal(reparado.estado, 'PENDIENTE');
    assert.equal(reparado.payload.items[0].clave, 'MAT-001', 'payload reconstruido desde datos persistidos');
    await despacharOutbox({ publisher: pub, maxAttempts: 5 });
    assert.equal(pub.eventos.length, 1);
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO');
    console.log('[OK] testEventoIncompletoNuncaSePublicaNiSeMarcaPublicadoYSeRepara');
  } finally { console.error = originalError; await cleanupTenant(tenantId); }
}

async function testReemisionNoRepublicaUnPayloadQueSigueIncompleto() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const oc = await seedOc(tenantId, proyectoId, [{ insumo: INSUMO_CATALOGO, cantidad: 10, snapshot: true }]);
    await recibir(tenantId, proyectoId, oc.id_orden, [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 10 }]);
    const [fila] = await outboxDe(tenantId);
    // Se pierde el snapshot persistido y el payload queda incompleto: no hay de dónde reconstruirlo.
    const corrupto = JSON.parse(JSON.stringify(fila.payload));
    delete corrupto.items[0].clave;
    await (prisma as any).outboxEvento.update({ where: { id_evento: fila.id_evento }, data: { payload: corrupto } });
    await prisma.ordenCompraItem.updateMany({ where: { orden_id: oc.id_orden }, data: { clave_snapshot: null, descripcion_snapshot: null, unidad_snapshot: null, categoria_snapshot: null } });
    await despacharOutbox({ publisher: publisherQue(async () => undefined), maxAttempts: 5 });
    const url = `${baseUrl}/api/v1/compras/ordenes-compra/${fila.orden_id}/recepciones/${fila.payload.recepcion_id}/reemitir-evento`;
    gtDisponible = false;
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token(tenantId, proyectoId)}` } });
    assert.equal(r.status, 409, 'no se reemite un payload que seguirá siendo inválido');
    assert.equal(((await r.json()) as any).error, 'SNAPSHOT_INCOMPLETO');
    assert.equal((await outboxDe(tenantId))[0].estado, 'ERROR', 'permanece retenido con su causa');
    console.log('[OK] testReemisionNoRepublicaUnPayloadQueSigueIncompleto');
  } finally { console.error = originalError; gtDisponible = true; await cleanupTenant(tenantId); }
}

// ── Aislamiento y reemisión ──────────────────────────────────────────────────

async function testRlsAislaPorTenantYProyectoYElDespachadorVeTodo() {
  const tenantA = randomUUID(); const proyectoA = randomUUID();
  const tenantB = randomUUID(); const proyectoB = randomUUID();
  const rol = `outbox_rls_test_${Date.now()}`;
  try {
    await sembrarEventoPendiente(tenantA, proyectoA);
    await sembrarEventoPendiente(tenantB, proyectoB);
    const schemaRows = await prisma.$queryRawUnsafe<Array<{ s: string }>>(`SELECT current_schema() AS s`);
    const schema = schemaRows[0].s;
    await prisma.$executeRawUnsafe(`CREATE ROLE ${rol} NOLOGIN`);
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA ${schema} TO ${rol}`);
    await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE ON outbox_eventos TO ${rol}`);
    // La política se toma del script versionado, para probar la definición real.
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const sql = readFileSync(join(__dirname, '../../prisma/rls-policies.sql'), 'utf8');
    const bloque = sql.split('-- >>> OUTBOX_EVENTOS')[1]?.split('-- <<< OUTBOX_EVENTOS')[0];
    assert.ok(bloque, 'rls-policies.sql debe delimitar el bloque OUTBOX_EVENTOS');
    // La política versionada no depende de funciones auxiliares (CI solo aplica el esquema de Prisma).
    const sentencias = bloque!.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n')
      .split(';').map((x) => x.trim()).filter(Boolean);
    for (const sentencia of sentencias) await prisma.$executeRawUnsafe(sentencia);

    const contar = async (settings: Record<string, string>) => prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${rol}`);
      for (const [k, v] of Object.entries(settings)) await tx.$executeRawUnsafe(`SELECT set_config('${k}', '${v}', true)`);
      const filas = await tx.$queryRawUnsafe<Array<{ tenant_id: string }>>(`SELECT tenant_id FROM outbox_eventos WHERE tenant_id IN ('${tenantA}','${tenantB}')`);
      return filas.map((f) => f.tenant_id);
    });

    assert.deepEqual(await contar({ 'app.current_tenant_id': tenantA, 'app.current_proyecto_id': proyectoA }), [tenantA], 'una sesión solo ve su tenant y proyecto');
    assert.deepEqual(await contar({ 'app.current_tenant_id': tenantA, 'app.current_proyecto_id': proyectoB }), [], 'ni otro proyecto con el mismo tenant');
    assert.deepEqual(await contar({}), [], 'sin contexto no ve nada');
    assert.equal((await contar({ 'app.internal_worker': 'outbox' })).length, 2, 'el despachador ve las filas de todos los tenants');

    // Camino exacto del despachador bajo un rol sin privilegios: reclamar con SKIP LOCKED y actualizar.
    const comoRol = async (settings: Record<string, string>, sql: string) => prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${rol}`);
      for (const [k, v] of Object.entries(settings)) await tx.$executeRawUnsafe(`SELECT set_config('${k}', '${v}', true)`);
      return tx.$executeRawUnsafe(sql);
    });
    const reclamar = `SELECT id_evento FROM outbox_eventos WHERE tenant_id IN ('${tenantA}','${tenantB}') AND estado = 'PENDIENTE' ORDER BY created_at LIMIT 10 FOR UPDATE SKIP LOCKED`;
    const actualizar = `UPDATE outbox_eventos SET intentos = intentos WHERE tenant_id IN ('${tenantA}','${tenantB}')`;
    assert.equal(await comoRol({ 'app.internal_worker': 'outbox' }, actualizar), 2, 'el despachador puede actualizar las filas de todos los tenants');
    assert.equal(await comoRol({ 'app.current_tenant_id': tenantA, 'app.current_proyecto_id': proyectoA }, actualizar), 1, 'una sesión ordinaria solo actualiza la suya');
    assert.equal(await comoRol({ 'app.current_tenant_id': randomUUID(), 'app.current_proyecto_id': randomUUID() }, actualizar), 0, 'ni las de otro tenant');
    await comoRol({ 'app.internal_worker': 'outbox' }, reclamar); // no debe fallar bajo RLS
    console.log('[OK] testRlsAislaPorTenantYProyectoYElDespachadorVeTodo');
  } finally {
    await prisma.$executeRawUnsafe(`REVOKE ALL ON outbox_eventos FROM ${rol}`).catch(() => undefined);
    await prisma.$executeRawUnsafe(`REVOKE ALL ON SCHEMA ${'compras'} FROM ${rol}`).catch(() => undefined);
    await prisma.$executeRawUnsafe(`DROP ROLE IF EXISTS ${rol}`).catch(() => undefined);
    await cleanupTenant(tenantA); await cleanupTenant(tenantB);
  }
}

async function testReemisionRestringidaYAislada() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const otroTenant = randomUUID();
  try {
    const fila = await sembrarEventoPendiente(tenantId, proyectoId);
    await despacharOutbox({ publisher: publisherQue(async () => undefined), maxAttempts: 5 });
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO');
    const recepcionId = fila.payload.recepcion_id;
    const url = `${baseUrl}/api/v1/compras/ordenes-compra/${fila.orden_id}/recepciones/${recepcionId}/reemitir-evento`;

    const sinPermiso = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token(tenantId, proyectoId, ['resident'])}` } });
    assert.equal(sinPermiso.status, 403, 'un rol sin permiso no puede reemitir');
    const ajeno = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token(otroTenant, randomUUID())}` } });
    assert.equal(ajeno.status, 404, 'un usuario de otro tenant recibe 404');
    assert.equal((await outboxDe(tenantId))[0].estado, 'PUBLICADO', 'los intentos rechazados no alteran la fila');

    const ok = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token(tenantId, proyectoId)}` } });
    assert.equal(ok.status, 200);
    const [despues] = await outboxDe(tenantId);
    assert.equal(despues.estado, 'PENDIENTE');
    assert.equal(despues.intentos, 0);
    assert.equal(despues.id_evento, fila.id_evento, 'se conserva el mismo event_id');
    console.log('[OK] testReemisionRestringidaYAislada');
  } finally { await cleanupTenant(tenantId); }
}

async function main() {
  const pruebas: Array<[string, () => Promise<void>]> = [
    ['recepcion crea evento v1 con snapshot', testRecepcionCreaEventoV1EnElOutboxConSnapshot],
    ['segunda recepcion solo lleva sus items', testSegundaRecepcionSoloLlevaSusItems],
    ['GT caida sin snapshot rechaza la recepcion antes del commit', testGtCaidaSinSnapshotRechazaLaRecepcionAntesDelCommit],
    ['snapshot faltante se resuelve y se persiste en la OC', testSnapshotFaltanteSeResuelveYSePersisteEnLaOc],
    ['falla del outbox revierte la recepcion', testFallaAlEscribirElOutboxRevierteLaRecepcion],
    ['bus caido: recepcion registrada y evento pendiente', testBusCaidoLaRecepcionSeRegistraYElEventoQuedaPendiente],
    ['publicacion tras falla transitoria', testPublicacionTrasFallaTransitoria],
    ['maximo de intentos pasa a ERROR', testMaximoDeIntentosPasaAErrorYRegistraLog],
    ['solo se marca publicado tras la confirmacion', testSoloSeMarcaPublicadoTrasLaConfirmacionDelBroker],
    ['mensaje devuelto por falta de cola no se marca', testMensajeDevueltoPorFaltaDeColaNoSeMarcaPublicado],
    ['dos instancias no duplican', testDosInstanciasNoPublicanLaMismaFila],
    ['recuperacion tras reinicio', testRecuperacionTrasReinicioRetomaLoPendiente],
    ['caida entre confirmacion y marcado republica con el mismo event_id', testCaidaEntreConfirmacionYMarcadoRepublicaConElMismoEventId],
    ['evento completo tras reinicio sin consultar GT', testEventoCompletoTrasReinicioSinConsultarGerenciaTecnica],
    ['evento incompleto nunca se publica y se repara', testEventoIncompletoNuncaSePublicaNiSeMarcaPublicadoYSeRepara],
    ['reemision no republica un payload que sigue incompleto', testReemisionNoRepublicaUnPayloadQueSigueIncompleto],
    ['RLS aisla por tenant y proyecto', testRlsAislaPorTenantYProyectoYElDespachadorVeTodo],
    ['reemision restringida y aislada', testReemisionRestringidaYAislada],
  ];
  try {
    await setup();
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
  console.error('not ok - compras outbox recepcion-oc integration tests');
  console.error(error);
  process.exitCode = 1;
});
