/**
 * Integración (PostgreSQL y RabbitMQ reales): outbox transaccional de eventos de Finanzas (lote P1).
 * Change: hacer-confiables-publicadores-eventbus-criticos.
 *
 * Verifica, sin simular el motor ni el broker: modos direct/outbox, atomicidad con la transacción de negocio,
 * event_id estable, orden por agregado, publicación con confirmación y `mandatory`, reintento, reinicio del
 * despachador, dos despachadores concurrentes, reversa a `direct` y limpieza de PUBLICADO.
 *
 * Runner: npm run test:integration:outbox-eventos -w @bocam/finanzas
 * Requiere: PostgreSQL (schema finanzas en DATABASE_URL, con la migración 20260930180000 aplicada) y RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
delete process.env.FINANZAS_EVENT_MODE;

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import * as amqplib from 'amqplib';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus, createEventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { MIGRATION_DIR_OUTBOX, runSqlFile } from '../support/sql';

// Esta suite crea y borra filas: exige una base EXPLÍCITA (sin valor por defecto que pueda apuntar a un entorno de desarrollo).
if (!process.env.FINANZAS_DATABASE_URL && !process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL (o FINANZAS_DATABASE_URL) de una base desechable.');
const dbUrl = (process.env.FINANZAS_DATABASE_URL || process.env.DATABASE_URL) as string;
process.env.DATABASE_URL = dbUrl;
if (!process.env.RABBITMQ_URL) throw new Error('Defina RABBITMQ_URL de un broker desechable.');
const rabbitUrl = process.env.RABBITMQ_URL as string;
process.env.RABBITMQ_URL = rabbitUrl;

const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// Publicaciones DIRECTAS (eventBus.publish): en modo outbox no debe haber ninguna.
const directas: Array<{ type: string; payload: any; tenantId: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  directas.push({ type: event.event_type, payload: event.payload, tenantId: event.context?.tenant_id });
  return true;
} as any;
const directasDe = (tenantId: string, type?: string) => directas.filter((d) => d.tenantId === tenantId && (!type || d.type === type));

const TIPOS = ['finanzas.fondos_comprometidos', 'finanzas.fondos_liberados', 'finanzas.presupuesto_insuficiente'];

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n').slice(0, 14).join(" | ")}`); }
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const settle = (ps: Array<Promise<unknown>>) => Promise.allSettled(ps);

const tenantsUsados = new Set<string>();
const nuevoTenant = () => {
  const t = { tenant: randomUUID(), proyecto: randomUUID() };
  tenantsUsados.add(t.tenant);
  return t;
};
const setMode = (m: string | undefined) => { if (m === undefined) delete process.env.FINANZAS_EVENT_MODE; else process.env.FINANZAS_EVENT_MODE = m; };

async function seedPresupuesto(t: { tenant: string; proyecto: string }, disponible: number) {
  return (await admin.presupuestoAsignado.create({
    data: {
      tenant_id: t.tenant, proyecto_id: t.proyecto, codigo: `PRES-OB-${randomUUID().slice(0, 8)}`, descripcion: 'Presupuesto outbox',
      monto_autorizado: disponible, monto_disponible: disponible, monto_comprometido: 0, monto_ejercido: 0, capitulo: 'MATERIALES', moneda: 'MXN', estatus: 'ACTIVO',
    } as any,
  })).id_presupuesto;
}

type FilaOutbox = {
  id_evento: string; event_id: string; event_type: string; aggregate_id: string; aggregate_seq: number; estado: string; intentos: number;
  ultimo_error: string | null; payload: any; tenant_id: string; proyecto_id: string; publicado_en: Date | null; created_at: Date; correlation_id: string | null;
};
const filas = (tenant: string, ocId?: string) =>
  admin.$queryRawUnsafe<FilaOutbox[]>(
    `SELECT * FROM "outbox_eventos" WHERE "tenant_id" = $1::uuid ${ocId ? `AND "aggregate_id" = '${ocId}'::uuid` : ''} ORDER BY "orden_global"`, tenant);
const cuantasFilas = async (tenant: string) => (await filas(tenant)).length;
const cuantosMov = (tenant: string, ocId: string, tipo: string) =>
  admin.movimientoPresupuestal.count({ where: { tenant_id: tenant, referencia_modulo: 'compras', referencia_entidad: 'OrdenCompra', referencia_id: ocId, tipo } });

let baseUrl = '';
const token = (t: { tenant: string; proyecto: string }) => signTenantToken({ userId: randomUUID(), tenantId: t.tenant, proyectoId: t.proyecto, roles: ['finanzas'], projects: [t.proyecto] });
const http = (t: { tenant: string; proyecto: string }, path: string, body: any) =>
  fetch(`${baseUrl}/api/v1/finanzas/${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token(t)}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
const comprometer = (t: { tenant: string; proyecto: string }, ocId: string, presupuestoId: string, monto: number) =>
  http(t, 'comprometer-fondos', { presupuesto_id: presupuestoId, monto, oc_id: ocId, oc_codigo: `OC-${ocId.slice(0, 6)}` });
const liberar = (t: { tenant: string; proyecto: string }, ocId: string, presupuestoId: string, monto: number) =>
  http(t, 'liberar-fondos', { presupuesto_id: presupuestoId, monto, oc_id: ocId, oc_codigo: `OC-${ocId.slice(0, 6)}` });

const ctxEv = (t: { tenant: string; proyecto: string }) => ({ tenant_id: t.tenant, proyecto_id: t.proyecto, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` });
const evCreada = (t: { tenant: string; proyecto: string }, ocId: string, presupuestoId: string, total: number) => ({
  event_type: 'compras.oc_creada', timestamp: new Date().toISOString(), context: ctxEv(t),
  payload: { oc_id: ocId, codigo: `OC-${ocId.slice(0, 6)}`, total, proveedor_id: randomUUID(), presupuesto_id: presupuestoId },
});
const evCancelada = (t: { tenant: string; proyecto: string }, ocId: string, presupuestoId: string, total: number) => ({
  event_type: 'compras.oc_cancelada', timestamp: new Date().toISOString(), context: ctxEv(t),
  payload: { oc_id: ocId, codigo: `OC-${ocId.slice(0, 6)}`, total, presupuesto_id: presupuestoId, requisicion_id: null },
});

// ── RabbitMQ real: sonda que recibe lo que el despachador publica ──────────────────────────────────────────────
async function crearSonda(routingKeys: string[] = TIPOS) {
  const conn = await amqplib.connect(rabbitUrl);
  const ch = await conn.createChannel();
  await ch.assertExchange('bocam.events', 'topic', { durable: true });
  const q = await ch.assertQueue('', { exclusive: true, autoDelete: true });
  for (const k of routingKeys) await ch.bindQueue(q.queue, 'bocam.events', k);
  const recibidos: any[] = [];
  await ch.consume(q.queue, (m) => { if (m) { recibidos.push(JSON.parse(m.content.toString())); ch.ack(m); } });
  return {
    recibidos,
    de: (tenant: string) => recibidos.filter((e) => e.context?.tenant_id === tenant),
    cerrar: async () => { await conn.close().catch(() => undefined); },
  };
}
async function conectarBus(nombre = `finanzas-outbox-${randomUUID()}`) {
  const bus = createEventBus(nombre);
  await bus.connect();
  return bus;
}

let dispatcher: typeof import('../../src/outbox-dispatcher');
let eventos: typeof import('../../src/outbox-eventos');
let compromiso: typeof import('../../src/compromiso-oc');
let finanzas: typeof import('../../src/main');
let server: Server | undefined;

/** Drena por rondas hasta que no se publique nada más. */
async function drenar(publisher: any, opciones: { maxAttempts?: number; baseBackoffMs?: number } = {}, rondas = 12) {
  let total = 0;
  for (let i = 0; i < rondas; i++) {
    const r = await dispatcher.despacharOutbox({ publisher, batchSize: 50, ...opciones });
    total += r.publicados;
    if (r.publicados === 0) break;
  }
  return total;
}
/** El despachador es global (procesa todos los tenants): las pruebas que drenan parten de una tabla vacía. */
const aislar = () => admin.$executeRawUnsafe(`DELETE FROM "outbox_eventos"`);
const aJson = (v: unknown) => JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? x.toString() : x));
async function esperar(cond: () => boolean | Promise<boolean>, ms = 6000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await cond()) return; await delay(50); }
  assert.ok(await cond(), 'la condición no se cumplió a tiempo');
}

async function main() {
  // La migración es idempotente: si el CI ya la aplicó, esto no cambia nada.
  const mig = runSqlFile(`${MIGRATION_DIR_OUTBOX}/migration.sql`, dbUrl);
  if (!mig.ok) throw new Error(`No se pudo aplicar la migración del outbox:\n${mig.output}`);
  await admin.$executeRawUnsafe(`DELETE FROM "outbox_eventos"`);

  finanzas = await import('../../src/main');
  dispatcher = await import('../../src/outbox-dispatcher');
  eventos = await import('../../src/outbox-eventos');
  compromiso = await import('../../src/compromiso-oc');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  const sonda = await crearSonda();
  const busDespachador = await conectarBus();

  try {
    // ── Modos ────────────────────────────────────────────────────────────────────────────────────────────────
    await test('modo direct (predeterminado): no escribe outbox y publica directamente una vez', async () => {
      setMode(undefined);
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      const r = await comprometer(t, oc, pres, 1000);
      assert.equal(r.status, 201);
      assert.equal(await cuantasFilas(t.tenant), 0, 'direct no escribe filas');
      assert.equal(directasDe(t.tenant, 'finanzas.fondos_comprometidos').length, 1, 'publica directamente');
    });

    await test('valores no reconocidos de FINANZAS_EVENT_MODE (OUTBOX, true, vacío, on) se tratan como direct', async () => {
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 100000);
      for (const valor of ['OUTBOX', 'true', '', 'on', 'Outbox ']) {
        setMode(valor);
        assert.equal(eventos.modoEventos(), 'direct', `valor ${JSON.stringify(valor)}`);
        assert.equal((await comprometer(t, randomUUID(), pres, 10)).status, 201);
      }
      assert.equal(await cuantasFilas(t.tenant), 0);
      setMode(undefined);
    });

    await test('modo outbox: el commit deja exactamente una fila, con event_id estable, y NO publica directamente', async () => {
      setMode('outbox');
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      const r = await comprometer(t, oc, pres, 1000);
      assert.equal(r.status, 201);
      const [fila, ...resto] = await filas(t.tenant, oc);
      assert.equal(resto.length, 0, 'exactamente una fila');
      const mov = await admin.movimientoPresupuestal.findFirstOrThrow({ where: { tenant_id: t.tenant, referencia_id: oc, tipo: 'COMPROMISO' } });
      assert.equal(fila.event_type, 'finanzas.fondos_comprometidos');
      assert.equal(fila.estado, 'PENDIENTE');
      assert.equal(fila.aggregate_seq, 1);
      assert.equal(fila.payload.movimiento_id, mov.id_movimiento);
      assert.equal(fila.payload.monto_comprometido, 1000);
      assert.equal(fila.payload.monto_disponible_restante, 9000);
      assert.equal(fila.payload.referencia_oc_id, oc);
      assert.equal(fila.event_id, eventos.uuidDeterminista(`finanzas.fondos_comprometidos:${mov.id_movimiento}`), 'event_id derivado del movimiento');
      assert.ok(fila.correlation_id, 'lleva correlation_id');
      assert.equal(directasDe(t.tenant).length, 0, 'en modo outbox nada se publica directamente');
      setMode(undefined);
    });

    await test('presupuesto_insuficiente en modo outbox: una fila por rechazo, sin movimiento y sin publicación directa', async () => {
      setMode('outbox');
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 500); const oc = randomUUID();
      const r = await comprometer(t, oc, pres, 1000);
      assert.equal(r.status, 422);
      const fs = await filas(t.tenant, oc);
      assert.equal(fs.length, 1);
      assert.equal(fs[0].event_type, 'finanzas.presupuesto_insuficiente');
      assert.equal(fs[0].payload.deficit, 500);
      assert.equal(await cuantosMov(t.tenant, oc, 'COMPROMISO'), 0, 'el rechazo no persiste movimiento');
      assert.equal(directasDe(t.tenant).length, 0);
      setMode(undefined);
    });

    await test('el evento oc_creada en modo outbox también se encola (y no se publica directo)', async () => {
      setMode('outbox');
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, oc, pres, 700) as any);
      const fs = await filas(t.tenant, oc);
      assert.deepEqual(fs.map((f) => f.event_type), ['finanzas.fondos_comprometidos']);
      assert.equal(directasDe(t.tenant).length, 0);
      setMode(undefined);
    });

    // ── Atomicidad ───────────────────────────────────────────────────────────────────────────────────────────
    await test('rollback: si la transacción de negocio se revierte no queda fila de outbox', async () => {
      const t = nuevoTenant(); const oc = randomUUID();
      const db = await import('../../src/db');
      await assert.rejects(() => db.createTenantContext({ tenantId: t.tenant, proyectoId: t.proyecto, userId: randomUUID() }, async (tx: any) => {
        await eventos.encolarEventoTx(tx, { tenantId: t.tenant, proyectoId: t.proyecto, userId: randomUUID(), eventType: TIPOS[0], ocId: oc, payload: { x: 1 } });
        throw new Error('falla de negocio posterior al encolado');
      }), /falla de negocio/);
      assert.equal(await cuantasFilas(t.tenant), 0);
    });

    await test('atomicidad real: si el commit no se concreta no queda ni movimiento ni fila de outbox (mismo commit)', async () => {
      setMode('outbox');
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      const [{ s }] = await admin.$queryRawUnsafe<Array<{ s: string }>>(`SELECT current_schema() AS s`);
      await admin.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION "${s}".t_outbox_falla_commit() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'falla_simulada_commit'; END $$ LANGUAGE plpgsql`);
      await admin.$executeRawUnsafe(`CREATE CONSTRAINT TRIGGER t_outbox_falla AFTER INSERT ON "${s}"."outbox_eventos" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION "${s}".t_outbox_falla_commit()`);
      try {
        const r = await comprometer(t, oc, pres, 1000);
        // Hallazgo (ver design.md del change): el $transaction interactivo de Prisma NO propaga un fallo de COMMIT diferido; la
        // transaccion se revierte completa pero la llamada vuelve sin error. Por eso aqui solo se afirma la atomicidad (nada persiste).
        void r;
      } finally {
        await admin.$executeRawUnsafe(`DROP TRIGGER IF EXISTS t_outbox_falla ON "${s}"."outbox_eventos"`);
        await admin.$executeRawUnsafe(`DROP FUNCTION IF EXISTS "${s}".t_outbox_falla_commit()`);
      }
      assert.equal(await cuantosMov(t.tenant, oc, 'COMPROMISO'), 0, 'sin movimiento');
      assert.equal(await cuantasFilas(t.tenant), 0, 'sin fila de outbox');
      const p = await admin.presupuestoAsignado.findUniqueOrThrow({ where: { id_presupuesto: pres } });
      assert.equal(Number(p.monto_disponible), 10000, 'saldo intacto');
      setMode(undefined);
    });

    // ── Duplicados ───────────────────────────────────────────────────────────────────────────────────────────
    await test('duplicado: HTTP repetido y oc_creada concurrentes producen un solo fondos_comprometidos', async () => {
      setMode('outbox');
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      await settle([
        ...Array.from({ length: 4 }, () => comprometer(t, oc, pres, 1000)),
        ...Array.from({ length: 4 }, () => finanzas.handleOrdenCompraCreadaEvent(evCreada(t, oc, pres, 1000) as any)),
      ]);
      assert.equal(await cuantosMov(t.tenant, oc, 'COMPROMISO'), 1);
      const fs = (await filas(t.tenant, oc)).filter((f) => f.event_type === 'finanzas.fondos_comprometidos');
      assert.equal(fs.length, 1, 'un solo evento');
      setMode(undefined);
    });

    await test('duplicado: liberación repetida (HTTP + evento concurrentes) produce un solo fondos_liberados', async () => {
      setMode('outbox');
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      await comprometer(t, oc, pres, 1000);
      await settle([
        ...Array.from({ length: 3 }, () => liberar(t, oc, pres, 1000)),
        ...Array.from({ length: 3 }, () => finanzas.handleOrdenCompraCanceladaEvent(evCancelada(t, oc, pres, 1000) as any)),
      ]);
      assert.equal(await cuantosMov(t.tenant, oc, 'LIBERACION'), 1);
      const fs = (await filas(t.tenant, oc)).filter((f) => f.event_type === 'finanzas.fondos_liberados');
      assert.equal(fs.length, 1, 'un solo evento de liberación');
      assert.equal(directasDe(t.tenant).length, 0);
      setMode(undefined);
    });

    await test('secuencia por agregado: N escrituras concurrentes sobre la misma OC obtienen 1..N sin huecos ni choques', async () => {
      const t = nuevoTenant(); const oc = randomUUID();
      const db = await import('../../src/db');
      const N = 10;
      const r = await settle(Array.from({ length: N }, () => db.createTenantContext({ tenantId: t.tenant, proyectoId: t.proyecto, userId: randomUUID() }, (tx: any) =>
        eventos.encolarEventoTx(tx, { tenantId: t.tenant, proyectoId: t.proyecto, userId: randomUUID(), eventType: TIPOS[2], ocId: oc, payload: { n: 1 } }))));
      assert.ok(r.every((x) => x.status === 'fulfilled'), `todas deben tener éxito: ${JSON.stringify(r.filter((x) => x.status === 'rejected').slice(0, 1))}`);
      const seqs = (await filas(t.tenant, oc)).map((f) => f.aggregate_seq).sort((a, b) => a - b);
      assert.deepEqual(seqs, Array.from({ length: N }, (_, i) => i + 1));
    });

    await test('el índice único de secuencia rechaza un aggregate_seq repetido aun sin pasar por el lock', async () => {
      const t = nuevoTenant(); const oc = randomUUID();
      const ins = () => admin.$executeRawUnsafe(
        `INSERT INTO "outbox_eventos" ("event_id","event_type","tenant_id","proyecto_id","aggregate_type","aggregate_id","aggregate_seq","payload")
         VALUES ('${randomUUID()}','${TIPOS[0]}','${t.tenant}','${t.proyecto}','OrdenCompra','${oc}',1,'{}'::jsonb)`);
      await ins();
      await assert.rejects(ins, /23505|uq_outbox_finanzas_agregado_seq|already exists/i);
    });

    // ── Despachador ──────────────────────────────────────────────────────────────────────────────────────────
    await test('orden: compromiso → liberación queda con aggregate_seq 1 y 2 y se publica en ese orden (RabbitMQ real)', async () => {
      setMode('outbox');
      await aislar();
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      await comprometer(t, oc, pres, 1000);
      await liberar(t, oc, pres, 1000);
      const fs = await filas(t.tenant, oc);
      assert.deepEqual(fs.map((f) => [f.event_type, f.aggregate_seq]), [['finanzas.fondos_comprometidos', 1], ['finanzas.fondos_liberados', 2]]);
      await drenar(busDespachador);
      await esperar(() => sonda.de(t.tenant).length === 2);
      assert.deepEqual(sonda.de(t.tenant).map((e) => e.event_type), ['finanzas.fondos_comprometidos', 'finanzas.fondos_liberados']);
      assert.ok((await filas(t.tenant, oc)).every((f) => f.estado === 'PUBLICADO' && f.publicado_en !== null));
      // El mensaje lleva el event_id y el contexto de la fila.
      assert.equal(sonda.de(t.tenant)[0].event_id, fs[0].event_id);
      assert.equal(sonda.de(t.tenant)[0].context.proyecto_id, t.proyecto);
      setMode(undefined);
    });

    await test('orden estricto por OC: si falla el compromiso de la OC A, su liberación espera; la OC B sigue', async () => {
      setMode('outbox');
      await aislar();
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 100000);
      const A = randomUUID(); const B = randomUUID();
      for (const oc of [A, B]) { await comprometer(t, oc, pres, 100); await liberar(t, oc, pres, 100); }
      const vistos: string[] = [];
      let fallarA = true;
      const publisher = {
        async publishConfirmed(e: any) {
          const ocId = e.payload.referencia_oc_id;
          if (ocId === A && fallarA) throw new Error('fallo simulado del broker');
          vistos.push(`${ocId === A ? 'A' : 'B'}:${e.event_type.split('.')[1]}`);
        },
      };
      await drenar(publisher, { baseBackoffMs: 1 });
      assert.deepEqual(vistos, ['B:fondos_comprometidos', 'B:fondos_liberados'], 'A no avanza; B sí, en orden');
      const filasA = await filas(t.tenant, A);
      assert.deepEqual(filasA.map((f) => f.estado), ['PENDIENTE', 'PENDIENTE']);
      assert.equal(filasA[0].intentos >= 1, true);
      assert.equal(filasA[1].intentos, 0, 'la liberación de A ni siquiera se intentó');
      fallarA = false;
      await delay(20);
      await drenar(publisher, { baseBackoffMs: 1 });
      assert.deepEqual(vistos.filter((v) => v.startsWith('A')), ['A:fondos_comprometidos', 'A:fondos_liberados']);
      setMode(undefined);
    });

    await test('mandatory: un evento sin cola enlazada produce un error observable (no se marca PUBLICADO) y pasa a ERROR al agotar intentos', async () => {
      const t = nuevoTenant(); const oc = randomUUID();
      const tipoSinBinding = `finanzas.sin_binding_${randomUUID().replace(/-/g, '')}`;
      await admin.$executeRawUnsafe(
        `INSERT INTO "outbox_eventos" ("event_id","event_type","tenant_id","proyecto_id","aggregate_type","aggregate_id","aggregate_seq","payload")
         VALUES ('${randomUUID()}','${tipoSinBinding}','${t.tenant}','${t.proyecto}','OrdenCompra','${oc}',1,'{"referencia_oc_id":"${oc}"}'::jsonb),
                ('${randomUUID()}','${TIPOS[0]}','${t.tenant}','${t.proyecto}','OrdenCompra','${oc}',2,'{"referencia_oc_id":"${oc}"}'::jsonb)`);
      const antes = dispatcher.metricasOutbox.sin_routing;
      const r1 = await dispatcher.despacharOutbox({ publisher: busDespachador, maxAttempts: 2, baseBackoffMs: 1 });
      assert.equal(r1.publicados, 0);
      assert.equal(r1.sinRouting, 1);
      let fs = await filas(t.tenant, oc);
      assert.equal(fs[0].estado, 'PENDIENTE');
      assert.match(fs[0].ultimo_error ?? '', /EVENT_BUS_SIN_COLA/);
      assert.equal(dispatcher.metricasOutbox.sin_routing, antes + 1);
      await delay(10);
      const r2 = await dispatcher.despacharOutbox({ publisher: busDespachador, maxAttempts: 2, baseBackoffMs: 1 });
      assert.equal(r2.errores, 1);
      fs = await filas(t.tenant, oc);
      assert.equal(fs[0].estado, 'ERROR');
      assert.equal(fs[1].estado, 'PENDIENTE', 'la fila posterior del mismo agregado queda retenida por la fila en ERROR');
      assert.equal(fs[1].intentos, 0);
      assert.equal(sonda.de(t.tenant).length, 0);
    });

    await test('caída de RabbitMQ conserva el pendiente y al volver se publica (mismo event_id)', async () => {
      setMode('outbox');
      await aislar();
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      await comprometer(t, oc, pres, 1000);
      const fila = (await filas(t.tenant, oc))[0];
      const caido = await conectarBus();
      await caido.close(); // sin canal: como una caída del broker
      const r = await dispatcher.despacharOutbox({ publisher: caido, baseBackoffMs: 1 });
      assert.equal(r.publicados, 0);
      assert.equal(r.fallidos, 1);
      const tras = (await filas(t.tenant, oc))[0];
      assert.equal(tras.estado, 'PENDIENTE');
      assert.match(tras.ultimo_error ?? '', /EVENT_BUS_SIN_CANAL/);
      assert.equal(sonda.de(t.tenant).length, 0);
      await delay(10);
      await drenar(busDespachador, { baseBackoffMs: 1 });
      await esperar(() => sonda.de(t.tenant).length === 1);
      assert.equal(sonda.de(t.tenant)[0].event_id, fila.event_id, 'el reintento conserva el event_id');
      setMode(undefined);
    });

    await test('reintento conserva event_id y datos: el primer intento falla y el segundo entrega lo mismo', async () => {
      setMode('outbox');
      await aislar();
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      await comprometer(t, oc, pres, 1000);
      const intentos: any[] = [];
      const publisher = { async publishConfirmed(e: any) { intentos.push(JSON.parse(JSON.stringify(e))); if (intentos.length === 1) throw new Error('primer intento falla'); } };
      await drenar(publisher, { baseBackoffMs: 1 });
      await delay(10);
      await drenar(publisher, { baseBackoffMs: 1 });
      assert.equal(intentos.length, 2);
      assert.equal(intentos[0].event_id, intentos[1].event_id);
      assert.deepEqual(intentos[0].payload, intentos[1].payload);
      const fila = (await filas(t.tenant, oc))[0];
      assert.equal(fila.event_id, intentos[0].event_id);
      assert.equal(fila.estado, 'PUBLICADO');
      assert.equal(fila.intentos, 2);
      setMode(undefined);
    });

    await test('reinicio del despachador: lo pendiente se reanuda al arrancar uno nuevo', async () => {
      setMode('outbox');
      await aislar();
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 100000);
      const ocs = Array.from({ length: 3 }, () => randomUUID());
      for (const oc of ocs) await comprometer(t, oc, pres, 100);
      const roto = dispatcher.iniciarDespachadorOutbox({ async publishConfirmed() { throw new Error('caído'); } }, { intervaloMs: 60_000, baseBackoffMs: 1 });
      await roto.ejecutarAhora();
      roto.detener();
      assert.ok((await filas(t.tenant)).every((f) => f.estado === 'PENDIENTE'));
      await delay(20);
      const nuevo = dispatcher.iniciarDespachadorOutbox(busDespachador, { intervaloMs: 60_000, baseBackoffMs: 1 });
      await esperar(async () => (await filas(t.tenant)).every((f) => f.estado === 'PUBLICADO'), 8000);
      nuevo.detener();
      await esperar(() => sonda.de(t.tenant).length === 3);
      setMode(undefined);
    });

    await test('dos despachadores concurrentes no duplican ninguna publicación (SKIP LOCKED)', async () => {
      setMode('outbox');
      await aislar();
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 1000000);
      const N = 12;
      for (let i = 0; i < N; i++) await comprometer(t, randomUUID(), pres, 10);
      const llamadas = new Map<string, number>();
      const publisher = {
        async publishConfirmed(e: any) {
          llamadas.set(e.event_id, (llamadas.get(e.event_id) ?? 0) + 1);
          await delay(15);
          await busDespachador.publishConfirmed(e);
        },
      };
      await Promise.all(Array.from({ length: 4 }, () => drenar(publisher)));
      assert.equal(llamadas.size, N, 'todos se publicaron');
      assert.ok([...llamadas.values()].every((n) => n === 1), `cada evento exactamente una vez: ${JSON.stringify([...llamadas.values()])}`);
      await esperar(() => sonda.de(t.tenant).length === N);
      assert.equal(new Set(sonda.de(t.tenant).map((e) => e.event_id)).size, N);
      setMode(undefined);
    });

    await test('modo outbox con el despachador apagado acumula sin publicar (solo "on" lo enciende)', async () => {
      setMode('outbox');
      await aislar();
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000); const oc = randomUUID();
      await comprometer(t, oc, pres, 1000);
      for (const valor of [undefined, '', 'off', 'ON', 'true', '1', ' on']) {
        assert.equal(dispatcher.configurarDespachadorOutbox(busDespachador, { valor }), null, `valor ${JSON.stringify(valor)} no debe encender`);
        assert.equal(dispatcher.estadoDespachadorOutbox().estado, 'disabled');
      }
      await delay(400);
      assert.equal((await filas(t.tenant, oc))[0].estado, 'PENDIENTE');
      assert.equal(sonda.de(t.tenant).length, 0, 'nada se publicó');
      const activo = dispatcher.configurarDespachadorOutbox(busDespachador, { valor: 'on', intervaloMs: 60_000 });
      assert.ok(activo, 'el valor exacto "on" sí lo enciende');
      await esperar(async () => (await filas(t.tenant, oc))[0].estado === 'PUBLICADO', 8000);
      activo!.detener();
      setMode(undefined);
    });

    await test('volver a direct no elimina ni modifica las filas pendientes', async () => {
      setMode('outbox');
      const t = nuevoTenant(); const pres = await seedPresupuesto(t, 10000);
      const oc1 = randomUUID();
      await comprometer(t, oc1, pres, 1000);
      const antes = aJson(await filas(t.tenant));
      setMode('direct');
      const oc2 = randomUUID();
      assert.equal((await comprometer(t, oc2, pres, 500)).status, 201);
      assert.equal(aJson(await filas(t.tenant)), antes, 'las filas previas quedan idénticas y direct no agrega ninguna');
      assert.equal(directasDe(t.tenant, 'finanzas.fondos_comprometidos').length, 1, 'el nuevo evento sale por la vía directa');
      setMode(undefined);
    });

    // ── Limpieza ─────────────────────────────────────────────────────────────────────────────────────────────
    await test('limpieza: solo borra PUBLICADO con más de 90 días; nunca PENDIENTE ni ERROR', async () => {
      const t = nuevoTenant();
      const fila = (estado: string, publicadoHace: number | null, seq: number) => admin.$executeRawUnsafe(
        `INSERT INTO "outbox_eventos" ("event_id","event_type","tenant_id","proyecto_id","aggregate_type","aggregate_id","aggregate_seq","payload","estado","publicado_en","created_at")
         VALUES ('${randomUUID()}','${TIPOS[0]}','${t.tenant}','${t.proyecto}','OrdenCompra','${randomUUID()}',${seq},'{}'::jsonb,'${estado}',
                 ${publicadoHace === null ? 'NULL' : `now() - interval '${publicadoHace} days'`}, now() - interval '400 days')`);
      await fila('PUBLICADO', 200, 1);
      await fila('PUBLICADO', 10, 1);
      await fila('PENDIENTE', null, 1);
      await fila('ERROR', null, 1);
      const borradas = await dispatcher.limpiarPublicados({ retencionDias: 90, lote: 100 });
      assert.equal(borradas >= 1, true);
      const resto = await filas(t.tenant);
      assert.deepEqual(resto.map((f) => f.estado).sort(), ['ERROR', 'PENDIENTE', 'PUBLICADO']);
      const pub = resto.find((f) => f.estado === 'PUBLICADO')!;
      assert.ok(pub.publicado_en && Date.now() - new Date(pub.publicado_en).getTime() < 30 * 86400_000, 'quedó el PUBLICADO reciente');
    });

    await test('limpieza por lotes pequeños y desactivada por defecto', async () => {
      const t = nuevoTenant();
      for (let i = 0; i < 5; i++) {
        await admin.$executeRawUnsafe(
          `INSERT INTO "outbox_eventos" ("event_id","event_type","tenant_id","proyecto_id","aggregate_type","aggregate_id","aggregate_seq","payload","estado","publicado_en")
           VALUES ('${randomUUID()}','${TIPOS[0]}','${t.tenant}','${t.proyecto}','OrdenCompra','${randomUUID()}',1,'{}'::jsonb,'PUBLICADO', now() - interval '300 days')`);
      }
      assert.equal(await dispatcher.limpiarPublicados({ retencionDias: 90, lote: 2 }), 2, 'un lote borra como máximo `lote` filas');
      assert.equal((await filas(t.tenant)).length, 3);
      for (const valor of [undefined, 'off', 'ON', 'true']) assert.equal(dispatcher.configurarLimpiezaOutbox({ valor }), null, `valor ${JSON.stringify(valor)}`);
      assert.equal((await filas(t.tenant)).length, 3, 'desactivada: no borra');
      const activa = dispatcher.configurarLimpiezaOutbox({ valor: 'on', intervaloMs: 3_600_000, retencionDias: 90, lote: 10 });
      assert.ok(activa);
      assert.equal(await activa!.ejecutarAhora(), 3);
      activa!.detener();
      assert.equal((await filas(t.tenant)).length, 0);
    });

    await test('reintentarFilasEnError devuelve ERROR a PENDIENTE sin borrar nada', async () => {
      const t = nuevoTenant(); const oc = randomUUID();
      await admin.$executeRawUnsafe(
        `INSERT INTO "outbox_eventos" ("event_id","event_type","tenant_id","proyecto_id","aggregate_type","aggregate_id","aggregate_seq","payload","estado","intentos","ultimo_error")
         VALUES ('${randomUUID()}','${TIPOS[0]}','${t.tenant}','${t.proyecto}','OrdenCompra','${oc}',1,'{}'::jsonb,'ERROR',10,'x')`);
      assert.ok((await dispatcher.reintentarFilasEnError()) >= 1);
      const f = (await filas(t.tenant, oc))[0];
      assert.equal(f.estado, 'PENDIENTE');
      assert.equal(f.intentos, 0);
    });

    await test('sanitizarError: una línea, sin caracteres de control y acotado a 300 caracteres', () => {
      const s = eventos.sanitizarError(new Error(`línea1\nlínea2\t${'x'.repeat(1000)}\u0000`));
      assert.ok(!/[\n\t\u0000]/.test(s));
      assert.ok(s.length <= 300);
      assert.match(s, /^Error: línea1 línea2/);
    });

    await test('encolarEventoTx rechaza eventos fuera del lote P1', async () => {
      const t = nuevoTenant();
      const db = await import('../../src/db');
      await assert.rejects(() => db.createTenantContext({ tenantId: t.tenant, proyectoId: t.proyecto, userId: randomUUID() }, (tx: any) =>
        eventos.encolarEventoTx(tx, { tenantId: t.tenant, proyectoId: t.proyecto, userId: randomUUID(), eventType: 'finanzas.pago_registrado', ocId: randomUUID(), payload: {} })), /OUTBOX_EVENTO_NO_SOPORTADO/);
    });
  } finally {
    setMode(undefined);
    await sonda.cerrar();
    await busDespachador.close().catch(() => undefined);
    await stopHttpApp(server);
    for (const tenant of tenantsUsados) await admin.$executeRawUnsafe(`DELETE FROM "outbox_eventos" WHERE "tenant_id" = '${tenant}'::uuid`);
    await admin.$disconnect();
  }

  const fallidas = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fallidas.length}/${results.length} pruebas en verde`);
  process.exit(fallidas.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
