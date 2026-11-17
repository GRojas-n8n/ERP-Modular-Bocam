/**
 * Test de Integración: retención de la cola `.v3` de recepciones de OC (RabbitMQ real).
 * Change: fix-ingresos-almacen-por-recepcion-oc
 *
 * Problema que corrige: la cola `.v2` heredaba el TTL de 24 h del EventBus sin dead-letter. Compras marca el
 * evento como PUBLICADO cuando el broker confirma, así que un mensaje que expirara mientras Almacén estaba
 * detenido se perdía sin rastro. La `.v3` no tiene TTL y envía a su DLQ todo lo que no pueda permanecer.
 *
 * Verifica: (1) argumentos de la cola; (2) un mensaje expirado nunca desaparece sin quedar en la DLQ;
 * (3) un mensaje permanece recuperable con Almacén detenido y se aplica al arrancar; (4) un fallo reintentable
 * pasa por retry y vuelve a `.v3`; (5) reintentos agotados y rechazo definitivo llegan a la DLQ;
 * (6) con bindings simultáneos no se procesa dos veces y el script de operación solo desvincula con
 * las precondiciones cumplidas; (7) el rollback a `.v2` está documentado.
 *
 * Runner: npm run test:integration:recepcion-oc-retencion -w @bocam/almacen
 * Requiere: PostgreSQL (ALMACEN_DATABASE_URL o DATABASE_URL → schema almacen) y RabbitMQ (RABBITMQ_URL).
 */

// CRÍTICO: env vars antes del import dinámico de main.ts
process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
process.env.PORT = String(43000 + Math.floor(Math.random() * 2000));
process.env.ALMACEN_RECEPCION_ESPERA_MS = '300';
process.env.ALMACEN_RECEPCION_MAX_INTENTOS = '3';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as amqplib from 'amqplib';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import { RECEPCION_OC_COLA, RECEPCION_OC_EVENT, argumentosColaRecepcionOc } from '../../src/recepcion-oc-cola';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const topologia = require('../../../../scripts/ops/almacen-recepcion-oc/topologia.js');

const dbUrl =
  process.env.ALMACEN_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=almacen';
process.env.ALMACEN_DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const QUEUE = RECEPCION_OC_COLA;
const DLQ = `${QUEUE}.dlq`;
const RETRY = `${QUEUE}.retry`;
const EXCHANGE = 'bocam.events';
const delay = (ms: number) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function waitFor(condition: () => Promise<boolean>, timeoutMs: number, what: string) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await condition()) return;
    await delay(100);
  }
  throw new Error(`Timeout (${timeoutMs}ms) esperando: ${what}`);
}

async function withConnection<T = any>(fn: (connection: amqplib.ChannelModel) => Promise<T>): Promise<T> {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL as string);
  try {
    return await fn(connection);
  } finally {
    await connection.close().catch(() => undefined);
  }
}

/** Mensajes en la cola, o -1 si no existe. Un error de canal cierra el canal, por eso se abre uno por consulta. */
async function messageCount(queue: string): Promise<number> {
  return withConnection(async (connection) => {
    const channel = await connection.createChannel();
    channel.on('error', () => undefined);
    try { return (await channel.checkQueue(queue)).messageCount; } catch { return -1; }
  });
}

async function drain(queue: string): Promise<amqplib.GetMessage[]> {
  return withConnection(async (connection) => {
    const channel = await connection.createChannel();
    channel.on('error', () => undefined);
    const out: amqplib.GetMessage[] = [];
    for (;;) {
      const msg = await channel.get(queue, { noAck: true });
      if (!msg) break;
      out.push(msg);
    }
    return out;
  });
}

function eventoValido(tenantId: string, proyectoId: string, insumoId: string, cantidad: number): BocamEvent {
  const eventId = randomUUID();
  const now = new Date().toISOString();
  return {
    event_type: RECEPCION_OC_EVENT, event_id: eventId, event_version: 1, timestamp: now,
    context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
    payload: {
      event_id: eventId, event_version: 1, occurred_at: now, tenant_id: tenantId, proyecto_id: proyectoId,
      orden_compra_id: randomUUID(), orden_compra_codigo: 'OC-RET', proveedor_id: randomUUID(),
      recepcion_id: randomUUID(), fecha_recepcion: now, estado_oc_resultante: 'RECIBIDA',
      items: [{ recepcion_item_id: randomUUID(), orden_item_id: randomUUID(), insumo_id: insumoId, cantidad_recibida: cantidad,
        clave: 'RET-001', descripcion: 'Insumo retención', unidad: 'PZA', categoria: 'MATERIAL' }],
    },
  };
}

async function stockDe(tenantId: string, insumoId: string): Promise<number | null> {
  const item = await prisma.itemInventario.findFirst({ where: { tenant_id: tenantId, insumo_id: insumoId } });
  return item ? Number(item.stock_actual) : null;
}

async function main() {
  const tenants: string[] = [];
  const nuevoTenant = () => { const t = randomUUID(); tenants.push(t); return t; };
  const proyectoId = randomUUID();
  const scratch: string[] = [];
  const publisher = createEventBus(`e2e-pub-${randomUUID()}`);
  const raw = await amqplib.connect(process.env.RABBITMQ_URL as string);
  const rawChannel = await raw.createChannel();
  let server: import('node:http').Server | undefined;
  let failed = false;

  try {
    // Estado limpio: un broker de desarrollo puede conservar colas de corridas anteriores.
    for (const q of [QUEUE, RETRY, DLQ]) await rawChannel.deleteQueue(q).catch(() => undefined);

    await publisher.connect();
    const dbMod = require('../../src/db');
    const mod = await import('../../src/main');

    // ── 1. Argumentos de la cola ────────────────────────────────────────────────────────────────────────
    // Se declara exactamente como lo hace Almacén, pero SIN consumidor: Almacén "detenido".
    await publisher.ensureQueue(RECEPCION_OC_EVENT, QUEUE, { queueArguments: argumentosColaRecepcionOc() });
    await rawChannel.assertQueue(DLQ, { durable: true }); // igual que ensureResilienceQueues

    assert.equal(await withConnection((c) => topologia.tieneArgumentos(c, QUEUE, topologia.argumentosEsperadosV3(QUEUE))), true,
      'la cola .v3 existe con los argumentos esperados: sin x-message-ttl y con dead-letter a su DLQ');
    assert.equal(await withConnection((c) => topologia.tieneArgumentos(c, QUEUE, { ...topologia.argumentosEsperadosV3(QUEUE), 'x-message-ttl': 86400000 })), false,
      'la cola .v3 NO tiene el TTL de 24 h que tenía la .v2');

    // Sanidad del verificador: una cola con el TTL por defecto del EventBus (como la .v2) sí se detecta.
    const control = `almacen.test.control_ttl_defecto.${randomUUID()}`;
    scratch.push(control);
    await publisher.ensureQueue('almacen.test.control', control);
    assert.equal(await withConnection((c) => topologia.tieneArgumentos(c, control, {})), false, 'el verificador distingue una cola con TTL heredado');
    assert.equal(await withConnection((c) => topologia.tieneArgumentos(c, control, { 'x-message-ttl': 86400000 })), true);
    console.log('[OK] la cola .v3 se declara sin TTL y con dead-letter a su DLQ; el verificador detecta el TTL heredado');

    // ── 2. Un mensaje expirado nunca desaparece sin quedar en la DLQ ───────────────────────────────────
    // Control: el mecanismo anterior (TTL sin dead-letter), a escala de milisegundos, sí perdía el mensaje.
    const controlPerdida = `almacen.test.control_ttl_sin_dlx.${randomUUID()}`;
    scratch.push(controlPerdida);
    await rawChannel.assertQueue(controlPerdida, { durable: true, arguments: { 'x-message-ttl': 300 } });
    rawChannel.sendToQueue(controlPerdida, Buffer.from('{}'), { persistent: true });
    await delay(1000);
    assert.equal(await messageCount(controlPerdida), 0, 'control: con TTL y sin dead-letter el mensaje desaparece (la falla que se corrige)');

    // .v3: fuerza la expiración de un mensaje individual (una política futura, por ejemplo) y comprueba la DLQ.
    const expirado = eventoValido(nuevoTenant(), proyectoId, randomUUID(), 1);
    rawChannel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(expirado)), { persistent: true, expiration: '300', contentType: 'application/json' });
    await waitFor(async () => (await messageCount(DLQ)) === 1, 8000, 'el mensaje expirado en la DLQ');
    assert.equal(await messageCount(QUEUE), 0, 'el mensaje ya no está en la cola principal');
    const [enDlq] = await drain(DLQ);
    assert.equal(JSON.parse(enDlq.content.toString()).event_id, expirado.event_id, 'la DLQ conserva el mensaje original íntegro');
    const muertes = (enDlq.properties.headers?.['x-death'] ?? []) as Array<{ reason: string; queue: string }>;
    assert.ok(muertes.some((m) => m.reason === 'expired' && m.queue === QUEUE), 'queda registrado que expiró en la cola principal');
    console.log('[OK] un mensaje expirado en la cola principal termina en la DLQ; el mecanismo anterior lo perdía');

    // ── 3. Un mensaje permanece recuperable con Almacén detenido ───────────────────────────────────────
    const tenantRet = nuevoTenant(); const insumoRet = randomUUID();
    await publisher.publishConfirmed(eventoValido(tenantRet, proyectoId, insumoRet, 7));
    await delay(1500); // 5 veces la retención del control de arriba (300 ms): con el mecanismo anterior ya se habría perdido
    assert.equal(await messageCount(QUEUE), 1, 'con Almacén detenido el mensaje sigue en la cola .v3');
    assert.equal(await stockDe(tenantRet, insumoRet), null, 'y aún no se aplicó (nadie lo consume)');

    // Almacén arranca: retoma el mensaje pendiente.
    server = await (mod as any).startServer();
    const baseUrl = `http://127.0.0.1:${process.env.PORT}`;
    await waitFor(async () => (await fetch(`${baseUrl}/ready`)).status === 200, 10000, '/ready en 200');
    await waitFor(async () => (await stockDe(tenantRet, insumoRet)) === 7, 10000, 'INGRESO aplicado tras el arranque');
    assert.equal(await messageCount(QUEUE), 0);
    const estado = await withConnection((c) => topologia.estadoCola(c, QUEUE));
    assert.equal(estado.consumidores, 1, 'un único consumidor en la .v3');
    console.log('[OK] un mensaje permanece en la cola con Almacén detenido y se aplica una sola vez al arrancar');

    // ── 4. Fallo reintentable: pasa por retry y vuelve a .v3 ───────────────────────────────────────────
    const original = dbMod.createTenantContext;
    const llamadas = new Map<string, number>();
    const tenantReintento = nuevoTenant(); const insumoReintento = randomUUID();
    const tenantAgotado = nuevoTenant(); const insumoAgotado = randomUUID();
    dbMod.createTenantContext = async (ctx: any, fn: any) => {
      const n = (llamadas.get(ctx.tenantId) ?? 0) + 1;
      llamadas.set(ctx.tenantId, n);
      if (ctx.tenantId === tenantAgotado || (ctx.tenantId === tenantReintento && n === 1)) {
        throw new Error('conexión a la base perdida (simulada)');
      }
      return original(ctx, fn);
    };
    try {
      await publisher.publishConfirmed(eventoValido(tenantReintento, proyectoId, insumoReintento, 5));
      await waitFor(async () => (await stockDe(tenantReintento, insumoReintento)) === 5, 10000, 'el reintento vuelve a .v3 y se aplica');
      assert.ok((llamadas.get(tenantReintento) ?? 0) >= 2, 'el primer intento falló y se reintentó');
      assert.equal(await messageCount(DLQ), 0, 'un fallo reintentable que se recupera no llega a la DLQ');
      assert.equal(await messageCount(RETRY), 0);
      assert.equal(await prisma.movimientoAlmacen.count({ where: { tenant_id: tenantReintento } }), 1, 'un solo INGRESO');
      console.log('[OK] un fallo reintentable pasa por la cola retry, vuelve a .v3 y se aplica una sola vez');

      // ── 5a. Reintentos agotados → DLQ ─────────────────────────────────────────────────────────────
      await publisher.publishConfirmed(eventoValido(tenantAgotado, proyectoId, insumoAgotado, 9));
      await waitFor(async () => (await messageCount(DLQ)) === 1, 15000, 'el mensaje sin recuperación en la DLQ');
      assert.ok((llamadas.get(tenantAgotado) ?? 0) >= 3, 'se intentó tres veces');
      const [agotado] = await drain(DLQ);
      assert.equal(Number(agotado.properties.headers?.['x-attempt']), 3);
      assert.match(String(agotado.properties.headers?.['x-failure-reason']), /simulada/);
      assert.equal(await stockDe(tenantAgotado, insumoAgotado), null, 'sin efectos parciales');
      console.log('[OK] agotados los reintentos, el mensaje llega a la DLQ conservando causa e intentos');
    } finally {
      dbMod.createTenantContext = original;
    }

    // ── 5b. Rechazo definitivo → DLQ sin pasar por retry ───────────────────────────────────────────────
    const antiguo: BocamEvent = {
      event_type: RECEPCION_OC_EVENT, timestamp: new Date().toISOString(),
      context: { tenant_id: nuevoTenant(), proyecto_id: proyectoId, user_id: randomUUID() },
      payload: { orden_compra_id: randomUUID(), items: [{ insumo_id: randomUUID(), cantidad_recibida: 5 }] },
    };
    await publisher.publishConfirmed(antiguo);
    await waitFor(async () => (await messageCount(DLQ)) === 1, 10000, 'rechazo definitivo en la DLQ');
    await delay(800);
    assert.equal(await messageCount(RETRY), 0, 'un rechazo definitivo no pasa por retry');
    const [definitivo] = await drain(DLQ);
    assert.match(String(definitivo.properties.headers?.['x-failure-reason']), /FORMATO_NO_SOPORTADO/);
    assert.equal(Number(definitivo.properties.headers?.['x-attempt']), 1);
    console.log('[OK] un rechazo definitivo llega a la DLQ en el primer intento');

    // ── 6. Bindings simultáneos ────────────────────────────────────────────────────────────────────────
    // `viejaV2` simula la .v2 que sigue enlazada al exchange sin consumidor.
    const viejaV2 = `almacen.test.v2_simulada.${randomUUID()}`;
    scratch.push(viejaV2);
    await publisher.ensureQueue(RECEPCION_OC_EVENT, viejaV2);
    const tenantBind = nuevoTenant(); const insumoBind = randomUUID();

    await publisher.publishConfirmed(eventoValido(tenantBind, proyectoId, insumoBind, 4));
    await waitFor(async () => (await stockDe(tenantBind, insumoBind)) === 4, 10000, 'primer evento aplicado por .v3');
    assert.equal(await messageCount(viejaV2), 1, 'mientras siga enlazada, la cola vieja recibe una copia que nadie consume (por eso se desvincula antes de publicar)');

    // Simulación: no modifica nada.
    const simulacion = await withConnection((c) => topologia.desvincularV2(c, { colaV2: viejaV2, ejecutar: false }));
    assert.equal(simulacion.motivo, 'PRECONDICION_NO_CUMPLIDA', 'con mensajes en la cola vieja no se desvincula');
    assert.match(simulacion.problemas.join(' '), /mensaje\(s\)/);
    await publisher.publishConfirmed(eventoValido(tenantBind, proyectoId, insumoBind, 6));
    await waitFor(async () => (await stockDe(tenantBind, insumoBind)) === 10, 10000, 'segundo evento aplicado');
    assert.equal(await messageCount(viejaV2), 2, 'la negativa no modificó el binding');

    // Cola vieja vacía → con --ejecutar sí se desvincula; sin --ejecutar es simulación.
    assert.equal((await drain(viejaV2)).length, 2);
    const sim2 = await withConnection((c) => topologia.desvincularV2(c, { colaV2: viejaV2, ejecutar: false }));
    assert.equal(sim2.motivo, 'SIMULACION');
    await publisher.publishConfirmed(eventoValido(tenantBind, proyectoId, insumoBind, 1));
    await waitFor(async () => (await stockDe(tenantBind, insumoBind)) === 11, 10000, 'tercer evento aplicado');
    assert.equal(await messageCount(viejaV2), 1, 'la simulación no desvincula');
    assert.equal((await drain(viejaV2)).length, 1);
    const real = await withConnection((c) => topologia.desvincularV2(c, { colaV2: viejaV2, ejecutar: true }));
    assert.equal(real.motivo, 'DESVINCULADA');
    await publisher.publishConfirmed(eventoValido(tenantBind, proyectoId, insumoBind, 2));
    await waitFor(async () => (await stockDe(tenantBind, insumoBind)) === 13, 10000, 'cuarto evento aplicado tras desvincular');
    assert.equal(await messageCount(viejaV2), 0, 'desvinculada, la cola vieja ya no recibe eventos');
    assert.notEqual(await messageCount(viejaV2), -1, 'y la cola vieja sigue existiendo (solo se quitó el binding; nada se borra)');
    assert.equal(await prisma.movimientoAlmacen.count({ where: { tenant_id: tenantBind } }), 4, 'cada evento se procesó exactamente una vez');

    // El script se niega si .v3 no está operativa.
    const sinV3 = await withConnection((c) => topologia.desvincularV2(c, { colaV3: `almacen.test.no_existe.${randomUUID()}`, colaV2: viejaV2, ejecutar: true }));
    assert.equal(sinV3.motivo, 'PRECONDICION_NO_CUMPLIDA');
    assert.match(sinV3.problemas.join(' '), /no existe/);
    const ver = await withConnection((c) => topologia.verificar(c));
    assert.equal(ver.operativa, true, `la .v3 real está operativa: ${ver.problemas.join('; ')}`);
    console.log('[OK] con bindings simultáneos nada se procesa dos veces y el script solo desvincula con .v3 operativa y .v2 vacía');

    // ── 7. Rollback documentado ────────────────────────────────────────────────────────────────────────
    const doc = resolve(__dirname, '../../../../docs/operacion/almacen-cola-recepcion-oc-v3.md');
    assert.ok(existsSync(doc), 'existe la guía de operación de la cola .v3');
    const texto = readFileSync(doc, 'utf-8');
    assert.match(texto, /Rollback/i);
    assert.match(texto, /\.v2/);
    console.log('[OK] el rollback a .v2 está documentado');
  } catch (error: any) {
    failed = true;
    console.error('not ok - almacen recepcion-oc retencion e2e');
    console.error(error);
  } finally {
    for (const t of tenants) {
      await prisma.movimientoAlmacen.deleteMany({ where: { tenant_id: t } }).catch(() => undefined);
      await prisma.eventoProcesado.deleteMany({ where: { tenant_id: t } }).catch(() => undefined);
      await prisma.itemInventario.deleteMany({ where: { tenant_id: t } }).catch(() => undefined);
    }
    const limpio = await raw.createChannel();
    limpio.on('error', () => undefined);
    for (const q of [QUEUE, RETRY, DLQ, ...scratch]) await limpio.deleteQueue(q).catch(() => undefined);
    await raw.close().catch(() => undefined);
    await publisher.close();
    server?.close();
    await prisma.$disconnect();
    process.exit(failed ? 1 : 0);
  }
}

void main();
