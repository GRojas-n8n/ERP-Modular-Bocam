/**
 * Confiabilidad del bus de eventos (change fix-ingresos-almacen-por-recepcion-oc, sección 2):
 *  - publicación confirmada (publishConfirmed) y event_id asignado;
 *  - reintentos con espera y cola de mensajes fallidos por suscripción (opt-in);
 *  - una suscripción sin opciones se comporta exactamente como antes.
 *
 * Requiere RabbitMQ (RABBITMQ_URL, por defecto amqp://user:password@127.0.0.1:5672).
 * Runner: npm run test:integration:confiabilidad -w @bocam/event-bus
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import * as amqplib from 'amqplib';
import { createEventBus, type BocamEvent } from '../../src/index';

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
process.env.RABBITMQ_URL = rabbitUrl;
const EXCHANGE = 'bocam.events';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(condition: () => boolean | Promise<boolean>, timeoutMs: number, what: string) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await condition()) return;
    await delay(50);
  }
  throw new Error(`Timeout (${timeoutMs}ms) esperando: ${what}`);
}

function buildEvent(eventType: string, overrides: Partial<BocamEvent> = {}): BocamEvent {
  return {
    event_type: eventType,
    timestamp: new Date().toISOString(),
    context: { tenant_id: randomUUID(), proyecto_id: randomUUID(), user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
    payload: { marca: 'confiabilidad' },
    ...overrides,
  };
}

type Raw = { connection: amqplib.ChannelModel; channel: amqplib.Channel };
async function rawChannel(): Promise<Raw> {
  const connection = await amqplib.connect(rabbitUrl);
  const channel = await connection.createChannel();
  channel.on('error', () => undefined);
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  return { connection, channel };
}

/** Cuenta los mensajes de una cola con un canal propio; -1 si la cola no existe (un 404 cierra el canal). */
async function messageCount(queue: string): Promise<number> {
  const connection = await amqplib.connect(rabbitUrl);
  try {
    const probe = await connection.createChannel();
    probe.on('error', () => undefined);
    return (await probe.checkQueue(queue)).messageCount;
  } catch {
    return -1;
  } finally {
    await connection.close().catch(() => undefined);
  }
}

async function queueExists(_raw: Raw, name: string): Promise<boolean> {
  return (await messageCount(name)) >= 0;
}

async function cleanupQueues(raw: Raw, names: string[]) {
  for (const name of names) {
    await raw.channel.deleteQueue(name).catch(() => undefined);
  }
}

/** Vacía una cola y devuelve sus mensajes, con un canal propio. */
async function drain(_raw: Raw, queue: string): Promise<amqplib.GetMessage[]> {
  const connection = await amqplib.connect(rabbitUrl);
  const out: amqplib.GetMessage[] = [];
  try {
    const channel = await connection.createChannel();
    channel.on('error', () => undefined);
    for (;;) {
      const msg = await channel.get(queue, { noAck: true });
      if (!msg) break;
      out.push(msg);
    }
  } catch {
    /* cola inexistente: se devuelve lo obtenido */
  } finally {
    await connection.close().catch(() => undefined);
  }
  return out;
}

async function testPublishConfirmedResuelveConCola() {
  const runId = randomUUID();
  const eventType = `confiabilidad.confirmado.${runId}`;
  const queue = `conf-q-${runId}`;
  const bus = createEventBus(`pub-${runId}`);
  const consumer = createEventBus(`sub-${runId}`);
  const raw = await rawChannel();
  try {
    await bus.connect();
    await consumer.connect();
    let recibido: BocamEvent | undefined;
    await consumer.subscribe(eventType, async (e) => { recibido = e; }, { queueName: queue });
    await delay(250);
    await bus.publishConfirmed(buildEvent(eventType));
    await waitFor(() => recibido !== undefined, 5000, 'entrega del evento confirmado');
    console.log('ok - publishConfirmed se resuelve cuando el broker confirma y hay cola enlazada');
  } finally {
    await bus.close(); await consumer.close();
    await cleanupQueues(raw, [queue]);
    await raw.connection.close();
  }
}

async function testPublishConfirmedRechazaSinCola() {
  const runId = randomUUID();
  const bus = createEventBus(`pub-${runId}`);
  try {
    await bus.connect();
    await assert.rejects(
      () => bus.publishConfirmed(buildEvent(`confiabilidad.sin_cola.${runId}`)),
      /sin cola|no.*rutable|unroutable|NO_ROUTE/i,
      'debe rechazarse cuando ninguna cola está enlazada a la routing key',
    );
    console.log('ok - publishConfirmed se rechaza si el mensaje no tiene cola enlazada');
  } finally {
    await bus.close();
  }
}

async function testPublishConfirmedRechazaSinCanal() {
  const bus = createEventBus(`pub-${randomUUID()}`); // nunca se conecta
  await assert.rejects(
    () => bus.publishConfirmed(buildEvent('confiabilidad.sin_canal')),
    /canal|conex|disponible/i,
    'sin canal debe rechazarse en vez de devolver false en silencio',
  );
  console.log('ok - publishConfirmed se rechaza cuando no hay canal');
}

async function testEventIdAsignadoYConservado() {
  const runId = randomUUID();
  const eventType = `confiabilidad.event_id.${runId}`;
  const queue = `conf-q-${runId}`;
  const bus = createEventBus(`pub-${runId}`);
  const consumer = createEventBus(`sub-${runId}`);
  const raw = await rawChannel();
  try {
    await bus.connect();
    await consumer.connect();
    const recibidos: BocamEvent[] = [];
    await consumer.subscribe(eventType, async (e) => { recibidos.push(e); }, { queueName: queue });
    await delay(250);

    await bus.publish(buildEvent(eventType));
    const propio = randomUUID();
    await bus.publishConfirmed(buildEvent(eventType, { event_id: propio, event_version: 1 }));
    await waitFor(() => recibidos.length === 2, 5000, 'dos eventos');

    const [sinId, conId] = recibidos;
    assert.match(String(sinId.event_id), /^[0-9a-f-]{36}$/, 'publish debe asignar un event_id si falta');
    assert.equal(conId.event_id, propio, 'un event_id explícito se conserva');
    assert.equal(conId.event_version, 1);
    console.log('ok - el bus asigna event_id si falta y conserva el explícito');
  } finally {
    await bus.close(); await consumer.close();
    await cleanupQueues(raw, [queue]);
    await raw.connection.close();
  }
}

async function testReintentoConExito() {
  const runId = randomUUID();
  const eventType = `confiabilidad.reintento.${runId}`;
  const queue = `conf-q-${runId}`;
  const bus = createEventBus(`pub-${runId}`);
  const consumer = createEventBus(`sub-${runId}`);
  const raw = await rawChannel();
  try {
    await bus.connect();
    await consumer.connect();
    let llamadas = 0;
    await consumer.subscribe(eventType, async () => {
      llamadas++;
      if (llamadas === 1) throw new Error('fallo transitorio');
    }, { queueName: queue, retry: { maxAttempts: 3, delayMs: 300 }, deadLetter: true });
    await delay(300);
    await bus.publishConfirmed(buildEvent(eventType));
    await waitFor(() => llamadas === 2, 8000, 'segundo intento');
    await delay(500);
    assert.equal(llamadas, 2, 'debe procesarse exactamente dos veces (fallo y éxito)');
    assert.equal((await drain(raw, `${queue}.dlq`)).length, 0, 'no debe llegar a la DLQ');
    console.log('ok - un fallo transitorio se reintenta y el mensaje no llega a la DLQ');
  } finally {
    await bus.close(); await consumer.close();
    await cleanupQueues(raw, [queue, `${queue}.retry`, `${queue}.dlq`]);
    await raw.connection.close();
  }
}

async function testIntentosAgotadosVanALaDlq() {
  const runId = randomUUID();
  const eventType = `confiabilidad.dlq.${runId}`;
  const queue = `conf-q-${runId}`;
  const bus = createEventBus(`pub-${runId}`);
  const consumer = createEventBus(`sub-${runId}`);
  const raw = await rawChannel();
  const errores: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => { errores.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); };
  try {
    await bus.connect();
    await consumer.connect();
    let llamadas = 0;
    await consumer.subscribe(eventType, async () => { llamadas++; throw new Error('siempre falla'); },
      { queueName: queue, retry: { maxAttempts: 3, delayMs: 200 }, deadLetter: true });
    await delay(300);
    const evento = buildEvent(eventType, { event_id: randomUUID(), payload: { orden: 'OC-1', cantidad: 5 } });
    await bus.publishConfirmed(evento);
    await waitFor(async () => (await messageCount(`${queue}.dlq`)) === 1, 10000, 'mensaje en la DLQ');
    assert.equal(llamadas, 3, 'el handler debe invocarse maxAttempts veces');

    const [msg] = await drain(raw, `${queue}.dlq`);
    const original = JSON.parse(msg.content.toString());
    assert.deepEqual(original.payload, { orden: 'OC-1', cantidad: 5 }, 'la DLQ conserva el payload original');
    assert.equal(original.event_id, evento.event_id);
    assert.equal(Number(msg.properties.headers?.['x-attempt']), 3, 'contador de intentos');
    assert.match(String(msg.properties.headers?.['x-failure-reason']), /siempre falla/, 'motivo del último error');

    const log = errores.find(l => l.includes('dlq') || l.includes('DLQ'));
    assert.ok(log, 'debe registrarse un log de error al enviar a la DLQ');
    for (const campo of [eventType, String(evento.event_id), evento.context.tenant_id, String(evento.context.correlation_id)]) {
      assert.ok(log.includes(campo), `el log de la DLQ debe incluir ${campo}`);
    }
    console.log('ok - agotados los intentos, el mensaje va a la DLQ con payload, intentos, motivo y log');
  } finally {
    console.error = originalError;
    await bus.close(); await consumer.close();
    await cleanupQueues(raw, [queue, `${queue}.retry`, `${queue}.dlq`]);
    await raw.connection.close();
  }
}

async function testMensajeIninterpretableVaDirectoALaDlq() {
  const runId = randomUUID();
  const eventType = `confiabilidad.veneno.${runId}`;
  const queue = `conf-q-${runId}`;
  const consumer = createEventBus(`sub-${runId}`);
  const raw = await rawChannel();
  const originalError = console.error;
  console.error = () => undefined;
  try {
    await consumer.connect();
    let llamadas = 0;
    await consumer.subscribe(eventType, async () => { llamadas++; },
      { queueName: queue, retry: { maxAttempts: 3, delayMs: 200 }, deadLetter: true });
    await delay(300);
    raw.channel.publish(EXCHANGE, eventType, Buffer.from('esto no es json'), { persistent: true });
    raw.channel.publish(EXCHANGE, eventType, Buffer.from(JSON.stringify({ event_type: eventType, payload: {} })), { persistent: true }); // sin contexto de tenant
    await waitFor(async () => (await messageCount(`${queue}.dlq`)) === 2, 8000, 'dos mensajes en la DLQ');
    await delay(600);
    assert.equal(llamadas, 0, 'un mensaje ininterpretable no debe llegar al handler');
    assert.equal(await messageCount(`${queue}.retry`), 0, 'sin reintentos para mensajes ininterpretables');
    console.log('ok - mensajes ininterpretables van directo a la DLQ, sin reintentos');
  } finally {
    console.error = originalError;
    await consumer.close();
    await cleanupQueues(raw, [queue, `${queue}.retry`, `${queue}.dlq`]);
    await raw.connection.close();
  }
}

async function testSuscripcionSinOpcionesSeComportaComoAntes() {
  const runId = randomUUID();
  const eventType = `confiabilidad.legado.${runId}`;
  const queue = `conf-q-${runId}`;
  const bus = createEventBus(`pub-${runId}`);
  const consumer = createEventBus(`sub-${runId}`);
  const raw = await rawChannel();
  const originalError = console.error;
  console.error = () => undefined;
  try {
    await bus.connect();
    await consumer.connect();
    let llamadas = 0;
    await consumer.subscribe(eventType, async () => { llamadas++; throw new Error('falla'); }, { queueName: queue });
    await delay(300);
    await bus.publish(buildEvent(eventType));
    await waitFor(() => llamadas >= 1, 5000, 'primer intento');
    await delay(800);
    assert.equal(llamadas, 1, 'sin opciones no hay reintentos: el mensaje se descarta como antes');
    assert.equal(await queueExists(raw, `${queue}.dlq`), false, 'sin opciones no se declara una DLQ');
    assert.equal(await queueExists(raw, `${queue}.retry`), false, 'sin opciones no se declara una cola de reintento');
    assert.equal(await messageCount(queue), 0, 'el mensaje no se reencola');
    console.log('ok - una suscripción sin opciones conserva el comportamiento anterior');
  } finally {
    console.error = originalError;
    await bus.close(); await consumer.close();
    await cleanupQueues(raw, [queue]);
    await raw.connection.close();
  }
}

async function main() {
  const pruebas: Array<[string, () => Promise<void>]> = [
    ['publishConfirmed resuelve con cola enlazada', testPublishConfirmedResuelveConCola],
    ['publishConfirmed rechaza sin cola', testPublishConfirmedRechazaSinCola],
    ['publishConfirmed rechaza sin canal', testPublishConfirmedRechazaSinCanal],
    ['event_id asignado y conservado', testEventIdAsignadoYConservado],
    ['reintento con exito', testReintentoConExito],
    ['intentos agotados van a la DLQ', testIntentosAgotadosVanALaDlq],
    ['mensaje ininterpretable va directo a la DLQ', testMensajeIninterpretableVaDirectoALaDlq],
    ['suscripcion sin opciones como antes', testSuscripcionSinOpcionesSeComportaComoAntes],
  ];
  for (const [nombre, prueba] of pruebas) {
    try {
      await prueba();
    } catch (error: any) {
      console.error(`not ok - ${nombre}: ${error?.message ?? error}`);
      process.exitCode = 1;
    }
  }
}

void main();
