/**
 * Integración (PostgreSQL y RabbitMQ reales): RLS de la outbox, /ready y verificación de consumidores (lote P1).
 * Change: hacer-confiables-publicadores-eventbus-criticos.
 *
 * RLS: se usa un rol SIN BYPASSRLS ni superusuario y la tabla con FORCE ROW LEVEL SECURITY. Se comprueba que una
 * sesión de aplicación solo lee/inserta filas de su tenant y proyecto, que NO puede actualizar ni borrar, que solo el
 * despachador (app.internal_worker = 'outbox') lee todo, actualiza y borra, y que el flujo completo (HTTP →
 * outbox → despachador → /ready) funciona con ese rol.
 *
 * Runner: npm run test:integration:outbox-eventos-rls-ready -w @bocam/finanzas
 * Requiere: PostgreSQL (superusuario en DATABASE_URL, schema finanzas) y RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
delete process.env.FINANZAS_EVENT_MODE;

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Server } from 'node:http';
import * as amqplib from 'amqplib';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { MIGRATION_DIR_OUTBOX, RLS_POLICIES_PATH, runSqlFile } from '../support/sql';

// Esta suite crea roles y borra filas: exige una base EXPLÍCITA y desechable.
if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL (superusuario, base desechable).');
if (!process.env.RABBITMQ_URL) throw new Error('Defina RABBITMQ_URL de un broker desechable.');
const adminUrl = process.env.DATABASE_URL as string;
const rabbitUrl = process.env.RABBITMQ_URL as string;
const ROLE = 'bocam_rls_test';
const rolePass = 'rls_test_pwd';
const restrictedUrl = (() => { const u = new URL(adminUrl); u.username = ROLE; u.password = rolePass; return u.toString(); })();

const admin = new PrismaClient({ datasources: { db: { url: adminUrl } } });
const restricted = new PrismaClient({ datasources: { db: { url: restrictedUrl } } });

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n').slice(0, 8).join(' | ')}`); }
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Sesion = { tenant: string; proyecto: string };
const nuevo = (): Sesion => ({ tenant: randomUUID(), proyecto: randomUUID() });
const tenantsUsados = new Set<string>();

async function conContexto<T>(s: Sesion | null, worker: boolean, fn: (tx: any) => Promise<T>): Promise<T> {
  return restricted.$transaction(async (tx) => {
    if (s) {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${s.tenant}, true)`;
      await tx.$executeRaw`SELECT set_config('app.current_proyecto_id', ${s.proyecto}, true)`;
    }
    if (worker) await tx.$executeRaw`SELECT set_config('app.internal_worker', 'outbox', true)`;
    return fn(tx);
  });
}
const insertar = (tx: any, tenant: string, proyecto: string, seq = 1, oc = randomUUID()) => tx.$executeRawUnsafe(
  `INSERT INTO "outbox_eventos" ("event_id","event_type","tenant_id","proyecto_id","aggregate_type","aggregate_id","aggregate_seq","payload")
   VALUES ('${randomUUID()}','finanzas.fondos_comprometidos','${tenant}','${proyecto}','OrdenCompra','${oc}',${seq},'{}'::jsonb)`);
const contar = (tx: any, tenant: string) => tx.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "outbox_eventos" WHERE "tenant_id" = '${tenant}'::uuid`).then((r: any[]) => r[0].n as number);

async function bootstrap() {
  const mig = runSqlFile(`${MIGRATION_DIR_OUTBOX}/migration.sql`, adminUrl);
  if (!mig.ok) throw new Error(`No se pudo aplicar la migración del outbox:\n${mig.output}`);
  const [{ s }] = await admin.$queryRawUnsafe<Array<{ s: string }>>(`SELECT current_schema() AS s`);
  await admin.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${ROLE}') THEN CREATE ROLE ${ROLE} LOGIN PASSWORD '${rolePass}' NOSUPERUSER NOBYPASSRLS; END IF; END $$`);
  await admin.$executeRawUnsafe(`GRANT USAGE ON SCHEMA "${s}" TO ${ROLE}`);
  await admin.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA "${s}" TO ${ROLE}`);
  await admin.$executeRawUnsafe(`GRANT ALL ON ALL SEQUENCES IN SCHEMA "${s}" TO ${ROLE}`);
  const [{ bypass, super: sup }] = await admin.$queryRawUnsafe<any[]>(`SELECT rolbypassrls AS bypass, rolsuper AS super FROM pg_roles WHERE rolname = '${ROLE}'`);
  assert.equal(bypass || sup, false, 'el rol de prueba no debe saltarse RLS');
  await admin.$executeRawUnsafe(`DELETE FROM "outbox_eventos"`);
}

async function main() {
  await bootstrap();
  // db.ts toma FINANZAS_DATABASE_URL: la aplicación y el despachador corren con el rol restringido.
  process.env.FINANZAS_DATABASE_URL = restrictedUrl;
  const finanzas = await import('../../src/main');
  const dispatcher = await import('../../src/outbox-dispatcher');
  const consumidores = await import('../../src/outbox-consumidores');
  const { server, baseUrl } = await startHttpApp(finanzas.app) as { server: Server; baseUrl: string };

  try {
    // ── RLS ──────────────────────────────────────────────────────────────────────────────────────────────────
    await test('RLS: la tabla tiene RLS habilitado y FORZADO y el rol de la prueba no lo salta', async () => {
      const r = await admin.$queryRawUnsafe<any[]>(`SELECT relrowsecurity AS rls, relforcerowsecurity AS forzado FROM pg_class WHERE oid = to_regclass('outbox_eventos')`);
      assert.deepEqual([r[0].rls, r[0].forzado], [true, true]);
    });

    await test('RLS: una sesión de aplicación inserta y lee solo filas de su tenant y proyecto', async () => {
      const A = nuevo(); const B = nuevo(); tenantsUsados.add(A.tenant); tenantsUsados.add(B.tenant);
      await conContexto(A, false, (tx) => insertar(tx, A.tenant, A.proyecto));
      await conContexto(B, false, (tx) => insertar(tx, B.tenant, B.proyecto));
      assert.equal(await conContexto(A, false, (tx) => contar(tx, A.tenant)), 1);
      assert.equal(await conContexto(A, false, (tx) => contar(tx, B.tenant)), 0, 'A no ve las filas del tenant B');
      assert.equal(await conContexto(B, false, (tx) => contar(tx, A.tenant)), 0, 'B no ve las filas del tenant A');
    });

    await test('RLS: otro proyecto del mismo tenant tampoco ve las filas', async () => {
      const A = nuevo(); tenantsUsados.add(A.tenant);
      await conContexto(A, false, (tx) => insertar(tx, A.tenant, A.proyecto));
      const otroProyecto = { tenant: A.tenant, proyecto: randomUUID() };
      assert.equal(await conContexto(otroProyecto, false, (tx) => contar(tx, A.tenant)), 0);
    });

    await test('RLS: no se puede insertar una fila de otro tenant ni de otro proyecto (WITH CHECK)', async () => {
      const A = nuevo(); const B = nuevo(); tenantsUsados.add(A.tenant);
      await assert.rejects(() => conContexto(A, false, (tx) => insertar(tx, B.tenant, B.proyecto)), /row-level security|policy/i);
      await assert.rejects(() => conContexto(A, false, (tx) => insertar(tx, A.tenant, randomUUID())), /row-level security|policy/i);
    });

    await test('RLS: sin contexto ni despachador no se ve ni se inserta nada (y no falla por GUC vacío)', async () => {
      const A = nuevo(); tenantsUsados.add(A.tenant);
      await conContexto(A, false, (tx) => insertar(tx, A.tenant, A.proyecto));
      // Misma conexión del pool tras una transacción con set_config(..., true): el GUC queda en ''.
      assert.equal(await conContexto(null, false, (tx) => contar(tx, A.tenant)), 0);
      await assert.rejects(() => conContexto(null, false, (tx) => insertar(tx, A.tenant, A.proyecto)), /row-level security|policy/i);
    });

    await test('RLS: una sesión de aplicación NO puede actualizar ni borrar filas (inmutable), ni siquiera las propias', async () => {
      const A = nuevo(); tenantsUsados.add(A.tenant);
      await conContexto(A, false, (tx) => insertar(tx, A.tenant, A.proyecto));
      const upd = await conContexto(A, false, (tx) => tx.$executeRawUnsafe(`UPDATE "outbox_eventos" SET "estado" = 'PUBLICADO' WHERE "tenant_id" = '${A.tenant}'::uuid`));
      const del = await conContexto(A, false, (tx) => tx.$executeRawUnsafe(`DELETE FROM "outbox_eventos" WHERE "tenant_id" = '${A.tenant}'::uuid`));
      assert.equal(upd, 0, 'UPDATE no afecta filas');
      assert.equal(del, 0, 'DELETE no afecta filas');
      const f = await admin.$queryRawUnsafe<any[]>(`SELECT estado FROM "outbox_eventos" WHERE tenant_id = '${A.tenant}'::uuid`);
      assert.deepEqual(f.map((x) => x.estado), ['PENDIENTE']);
    });

    await test('RLS: solo el despachador (app.internal_worker) lee todos los tenants, actualiza y borra; no inserta', async () => {
      const A = nuevo(); const B = nuevo(); tenantsUsados.add(A.tenant); tenantsUsados.add(B.tenant);
      await conContexto(A, false, (tx) => insertar(tx, A.tenant, A.proyecto));
      await conContexto(B, false, (tx) => insertar(tx, B.tenant, B.proyecto));
      const visibles = await conContexto(null, true, (tx) => tx.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "outbox_eventos" WHERE "tenant_id" IN ('${A.tenant}'::uuid, '${B.tenant}'::uuid)`).then((r: any[]) => r[0].n));
      assert.equal(visibles, 2, 'el despachador ve ambos tenants');
      const upd = await conContexto(null, true, (tx) => tx.$executeRawUnsafe(`UPDATE "outbox_eventos" SET "estado" = 'PUBLICADO', "publicado_en" = now() WHERE "tenant_id" = '${A.tenant}'::uuid`));
      assert.equal(upd, 1);
      const del = await conContexto(null, true, (tx) => tx.$executeRawUnsafe(`DELETE FROM "outbox_eventos" WHERE "tenant_id" = '${A.tenant}'::uuid`));
      assert.equal(del, 1);
      await assert.rejects(() => conContexto(null, true, (tx) => insertar(tx, A.tenant, A.proyecto)), /row-level security|policy/i);
    });

    await test('RLS: un valor distinto de "outbox" en app.internal_worker no concede nada', async () => {
      const A = nuevo(); tenantsUsados.add(A.tenant);
      await conContexto(A, false, (tx) => insertar(tx, A.tenant, A.proyecto));
      const n = await restricted.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.internal_worker', 'admin', true)`;
        return tx.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "outbox_eventos" WHERE "tenant_id" = '${A.tenant}'::uuid`).then((r: any[]) => r[0].n);
      });
      assert.equal(n, 0);
    });

    await test('RLS: el bloque de la migración y el de rls-policies.sql son idénticos (paridad)', () => {
      const bloque = (sql: string) => {
        const m = sql.replace(/\r\n/g, '\n').match(/-- >>> OUTBOX_EVENTOS_FINANZAS\n([\s\S]*?)-- <<< OUTBOX_EVENTOS_FINANZAS/);
        assert.ok(m, 'falta el bloque OUTBOX_EVENTOS_FINANZAS');
        return m![1].trim();
      };
      assert.equal(bloque(readFileSync(join(MIGRATION_DIR_OUTBOX, 'migration.sql'), 'utf8')), bloque(readFileSync(RLS_POLICIES_PATH, 'utf8')));
    });

    await test('flujo completo con el rol restringido: HTTP en modo outbox → fila → despachador → RabbitMQ real', async () => {
      process.env.FINANZAS_EVENT_MODE = 'outbox';
      const A = nuevo(); tenantsUsados.add(A.tenant);
      const pres = (await admin.presupuestoAsignado.create({
        data: { tenant_id: A.tenant, proyecto_id: A.proyecto, codigo: `PRES-RLSO-${randomUUID().slice(0, 8)}`, descripcion: 'rls outbox', monto_autorizado: 5000,
          monto_disponible: 5000, monto_comprometido: 0, monto_ejercido: 0, capitulo: 'MATERIALES', moneda: 'MXN', estatus: 'ACTIVO' } as any,
      })).id_presupuesto;
      const token = signTenantToken({ userId: randomUUID(), tenantId: A.tenant, proyectoId: A.proyecto, roles: ['finanzas'], projects: [A.proyecto] });
      const oc = randomUUID();
      const r = await fetch(`${baseUrl}/api/v1/finanzas/comprometer-fondos`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: pres, monto: 1000, oc_id: oc, oc_codigo: 'OC-RLSO' }),
      });
      assert.equal(r.status, 201);
      const conn = await amqplib.connect(rabbitUrl);
      const ch = await conn.createChannel();
      await ch.assertExchange('bocam.events', 'topic', { durable: true });
      const q = await ch.assertQueue('', { exclusive: true, autoDelete: true });
      await ch.bindQueue(q.queue, 'bocam.events', 'finanzas.fondos_comprometidos');
      const recibidos: any[] = [];
      await ch.consume(q.queue, (m) => { if (m) { recibidos.push(JSON.parse(m.content.toString())); ch.ack(m); } });
      const bus = createEventBus(`finanzas-rls-${randomUUID()}`);
      await bus.connect();
      try {
        for (let i = 0; i < 5; i++) { const x = await dispatcher.despacharOutbox({ publisher: bus }); if (x.publicados) break; }
        const t0 = Date.now();
        while (!recibidos.some((e) => e.context?.tenant_id === A.tenant) && Date.now() - t0 < 6000) await delay(50);
        assert.ok(recibidos.some((e) => e.context?.tenant_id === A.tenant), 'el evento llegó a RabbitMQ');
        const fila = await admin.$queryRawUnsafe<any[]>(`SELECT estado FROM "outbox_eventos" WHERE tenant_id = '${A.tenant}'::uuid`);
        assert.deepEqual(fila.map((f) => f.estado), ['PUBLICADO']);
      } finally {
        await bus.close().catch(() => undefined);
        await conn.close().catch(() => undefined);
        delete process.env.FINANZAS_EVENT_MODE;
      }
    });

    // ── Verificación de consumidores esperados ───────────────────────────────────────────────────────────────
    await test('catálogo: nombres de cola = módulo.routing_key_con_guion_bajo, y los consumidores declaran esas suscripciones', () => {
      const cat = consumidores.CONSUMIDORES_ESPERADOS;
      assert.deepEqual(Object.keys(cat).sort(), ['finanzas.fondos_comprometidos', 'finanzas.fondos_liberados', 'finanzas.presupuesto_insuficiente']);
      assert.deepEqual(cat['finanzas.fondos_comprometidos'].map((c) => c.cola).sort(), ['compras.finanzas_fondos_comprometidos', 'contabilidad.finanzas_fondos_comprometidos']);
      assert.deepEqual(cat['finanzas.fondos_liberados'].map((c) => c.cola).sort(), ['compras.finanzas_fondos_liberados', 'contabilidad.finanzas_fondos_liberados']);
      assert.deepEqual(cat['finanzas.presupuesto_insuficiente'].map((c) => c.cola), ['compras.finanzas_presupuesto_insuficiente']);
      const raiz = join(__dirname, '..', '..', '..');
      const compras = readFileSync(join(raiz, 'compras', 'src', 'main.ts'), 'utf8');
      const contabilidad = readFileSync(join(raiz, 'contabilidad', 'src', 'main.ts'), 'utf8');
      const tiposCont = readFileSync(join(raiz, 'contabilidad', 'src', 'types.ts'), 'utf8');
      for (const t of ['finanzas.fondos_comprometidos', 'finanzas.fondos_liberados', 'finanzas.presupuesto_insuficiente']) {
        assert.ok(compras.includes(`eventBus.subscribe('${t}'`), `Compras debe suscribirse a ${t}`);
      }
      assert.ok(tiposCont.includes("FONDOS_COMPROMETIDOS = 'finanzas.fondos_comprometidos'") && contabilidad.includes('ContabilidadConsumedEvents.FONDOS_COMPROMETIDOS, async'), 'Contabilidad consume fondos_comprometidos');
      assert.ok(tiposCont.includes("FONDOS_LIBERADOS = 'finanzas.fondos_liberados'") && contabilidad.includes('ContabilidadConsumedEvents.FONDOS_LIBERADOS, async'), 'Contabilidad consume fondos_liberados');
    });

    const colaUnica = () => `finanzas-test-${randomUUID().replace(/-/g, '')}`;
    await test('consumidores: cola inexistente → degradado; cola sin consumidores → degradado; cola con consumidor → ok', async () => {
      const existente = colaUnica(); const sinConsumidor = colaUnica(); const inexistente = colaUnica();
      const conn = await amqplib.connect(rabbitUrl);
      const ch = await conn.createChannel();
      await ch.assertQueue(existente, { autoDelete: true });
      await ch.assertQueue(sinConsumidor, { autoDelete: false });
      const tag = await ch.consume(existente, () => undefined);
      try {
        const catalogo = {
          'finanzas.evento_a': [{ servicio: 'x', cola: existente }],
          'finanzas.evento_b': [{ servicio: 'y', cola: sinConsumidor }, { servicio: 'z', cola: inexistente }],
        };
        const r = await consumidores.verificarConsumidoresEsperados({ url: rabbitUrl, catalogo });
        assert.equal(r.estado, 'degradado');
        assert.equal(r.eventos['finanzas.evento_a'][0].ok, true);
        assert.equal(r.eventos['finanzas.evento_a'][0].consumidores, 1);
        assert.equal(r.eventos['finanzas.evento_b'][0].existe, true);
        assert.equal(r.eventos['finanzas.evento_b'][0].ok, false);
        assert.match(r.eventos['finanzas.evento_b'][0].error ?? '', /sin consumidores|no tiene consumidores/);
        assert.equal(r.eventos['finanzas.evento_b'][1].existe, false);
        assert.match(r.eventos['finanzas.evento_b'][1].error ?? '', /no existe/);
        assert.deepEqual(r.faltantes.length, 2);
        const soloOk = await consumidores.verificarConsumidoresEsperados({ url: rabbitUrl, catalogo: { 'finanzas.evento_a': catalogo['finanzas.evento_a'] } });
        assert.equal(soloOk.estado, 'ok');
        assert.deepEqual(soloOk.faltantes, []);
      } finally {
        await ch.cancel(tag.consumerTag).catch(() => undefined);
        await ch.deleteQueue(sinConsumidor).catch(() => undefined);
        await conn.close().catch(() => undefined);
      }
    });

    await test('consumidores: sin RABBITMQ_URL → sin_broker; broker inalcanzable → error observable', async () => {
      const prev = process.env.RABBITMQ_URL;
      delete process.env.RABBITMQ_URL;
      try {
        assert.equal((await consumidores.verificarConsumidoresEsperados({ url: '' })).estado, 'sin_broker');
      } finally { process.env.RABBITMQ_URL = prev; }
      const r = await consumidores.verificarConsumidoresEsperados({ url: 'amqp://u:p@127.0.0.1:1', timeoutMs: 1500 });
      assert.equal(r.estado, 'error');
      assert.ok(r.error);
    });

    // ── /ready ───────────────────────────────────────────────────────────────────────────────────────────────
    await finanzas.initEventBus();
    const ready = async () => { const r = await fetch(`${baseUrl}/ready`); return { status: r.status, body: await r.json() as any }; };
    const okConsumidores = async () => {
      const q = colaUnica();
      const conn = await amqplib.connect(rabbitUrl);
      const ch = await conn.createChannel();
      await ch.assertQueue(q, { autoDelete: true });
      await ch.consume(q, () => undefined);
      await consumidores.verificarConsumidoresEsperados({ url: rabbitUrl, catalogo: { 'finanzas.evento_a': [{ servicio: 'x', cola: q }] } });
      return conn;
    };
    const faltaConsumidor = () => consumidores.verificarConsumidoresEsperados({ url: rabbitUrl, catalogo: { 'finanzas.evento_a': [{ servicio: 'x', cola: colaUnica() }] } });
    const limpiarOutbox = () => admin.$executeRawUnsafe(`DELETE FROM "outbox_eventos"`);
    const sembrar = (estado: string, edadMin = 0) => {
      const A = nuevo(); tenantsUsados.add(A.tenant);
      return admin.$executeRawUnsafe(
        `INSERT INTO "outbox_eventos" ("event_id","event_type","tenant_id","proyecto_id","aggregate_type","aggregate_id","aggregate_seq","payload","estado","created_at")
         VALUES ('${randomUUID()}','finanzas.fondos_comprometidos','${A.tenant}','${A.proyecto}','OrdenCompra','${randomUUID()}',1,'{}'::jsonb,'${estado}', now() - interval '${edadMin} minutes')`);
    };

    await test('/ready en modo direct: 200 y distingue base, RabbitMQ, despachador, consumidores y backlog (informativos)', async () => {
      await limpiarOutbox();
      delete process.env.FINANZAS_EVENT_MODE;
      await faltaConsumidor();
      await sembrar('ERROR', 30);
      const { status, body } = await ready();
      assert.equal(status, 200, 'en direct el outbox es informativo');
      assert.equal(body.event_mode, 'direct');
      assert.deepEqual(Object.keys(body.checks).sort(), ['backlog', 'bindings', 'database', 'dispatcher', 'rabbitmq']);
      assert.equal(body.checks.database, 'ok');
      assert.equal(body.checks.rabbitmq, 'ok');
      assert.equal(body.checks.bindings, 'degraded', 'se informa aunque no afecte en direct');
      assert.equal(body.checks.backlog, 'degraded');
      assert.equal(body.outbox.errores, 1);
      assert.ok('metricas' in body.outbox);
    });

    await test('/ready en modo outbox: 503 si el despachador está apagado', async () => {
      await limpiarOutbox();
      process.env.FINANZAS_EVENT_MODE = 'outbox';
      dispatcher.configurarDespachadorOutbox({ async publishConfirmed() { /* no se usa */ } }, { valor: 'off' });
      const conn = await okConsumidores();
      try {
        const { status, body } = await ready();
        assert.equal(status, 503);
        assert.equal(body.checks.dispatcher, 'disabled');
      } finally { await conn.close(); }
    });

    await test('/ready en modo outbox: 200 con despachador encendido, sin errores, sin atascos y con consumidores', async () => {
      await limpiarOutbox();
      process.env.FINANZAS_EVENT_MODE = 'outbox';
      const activo = dispatcher.configurarDespachadorOutbox({ async publishConfirmed() { /* nada que publicar */ } }, { valor: 'on', intervaloMs: 60_000 });
      await activo!.ejecutarAhora();
      const conn = await okConsumidores();
      try {
        const { status, body } = await ready();
        assert.equal(status, 200, JSON.stringify(body.checks));
        assert.deepEqual(body.checks, { database: 'ok', rabbitmq: 'ok', dispatcher: 'ok', bindings: 'ok', backlog: 'ok' });
        // Filas en ERROR → no listo.
        await sembrar('ERROR', 0);
        const conError = await ready();
        assert.equal(conError.status, 503);
        assert.equal(conError.body.checks.backlog, 'degraded');
        await limpiarOutbox();
        // Pendiente más antiguo que el umbral → no listo.
        process.env.FINANZAS_OUTBOX_MAX_PENDIENTE_SEG = '60';
        await sembrar('PENDIENTE', 10);
        const atascado = await ready();
        assert.equal(atascado.status, 503);
        assert.equal(atascado.body.checks.backlog, 'degraded');
        assert.ok(atascado.body.outbox.mas_antiguo_pendiente_segundos >= 600);
        delete process.env.FINANZAS_OUTBOX_MAX_PENDIENTE_SEG;
        await limpiarOutbox();
        // Falta la cola de un consumidor → no listo.
        await faltaConsumidor();
        const sinCola = await ready();
        assert.equal(sinCola.status, 503);
        assert.equal(sinCola.body.checks.bindings, 'degraded');
      } finally { activo!.detener(); await conn.close(); }
    });

    await test('/ready: sin conexión a RabbitMQ el servicio no está listo en ningún modo', async () => {
      delete process.env.FINANZAS_EVENT_MODE;
      await finanzas.shutdownEventBus();
      const { status, body } = await ready();
      assert.equal(status, 503);
      assert.equal(body.checks.rabbitmq, 'error');
      assert.equal(body.checks.database, 'ok');
    });
  } finally {
    delete process.env.FINANZAS_EVENT_MODE;
    await stopHttpApp(server);
    for (const t of tenantsUsados) await admin.$executeRawUnsafe(`DELETE FROM "outbox_eventos" WHERE "tenant_id" = '${t}'::uuid`);
    await restricted.$disconnect();
    await admin.$disconnect();
  }

  const fallidas = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fallidas.length}/${results.length} pruebas RLS/ready en verde`);
  process.exit(fallidas.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
