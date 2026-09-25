/**
 * Test de Integración (RabbitMQ real): despachador del outbox de Compras
 * Change: fix-ingresos-almacen-por-recepcion-oc (sección 4)
 *
 * Verifica con el broker real que la fila se marca PUBLICADO solo tras la confirmación, que un mensaje sin
 * cola enlazada (devuelto por el broker) NO se marca publicado y se reintenta, y que la republicación conserva
 * el mismo event_id.
 *
 * Runner: npm run test:integration:outbox-recepcion-oc-rabbitmq -w @bocam/compras
 * Requiere: PostgreSQL (DATABASE_URL → schema compras) y RabbitMQ (RABBITMQ_URL).
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import * as amqplib from 'amqplib';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
process.env.DATABASE_URL = comprasDbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

const EXCHANGE = 'bocam.events';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sembrar(tenantId: string, proyectoId: string, eventType: string) {
  const eventId = randomUUID();
  const recepcionId = randomUUID();
  await (prisma as any).outboxEvento.create({
    data: {
      id_evento: eventId, tenant_id: tenantId, proyecto_id: proyectoId, orden_id: randomUUID(), recepcion_id: recepcionId,
      event_type: eventType, event_version: 1,
      payload: { event_id: eventId, event_version: 1, occurred_at: new Date().toISOString(), tenant_id: tenantId, proyecto_id: proyectoId, recepcion_id: recepcionId, items: [] },
    },
  });
  return { eventId, recepcionId };
}

const estadoDe = async (eventId: string) => (prisma as any).outboxEvento.findUnique({ where: { id_evento: eventId } });

async function main() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const bus = createEventBus(`compras-outbox-e2e-${randomUUID()}`);
  const raw = await amqplib.connect(process.env.RABBITMQ_URL as string);
  const channel = await raw.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  const queue = `outbox-e2e-${randomUUID()}`;
  let failed = false;

  try {
    const { despacharOutbox } = await import('../../src/outbox');
    await bus.connect();

    // 1) Con una cola enlazada, el broker confirma: la fila queda PUBLICADO y el mensaje llega con su event_id.
    const tipoRutable = `compras.recepcion_oc_registrada.v1.e2e-${randomUUID()}`;
    await channel.assertQueue(queue, { durable: false, autoDelete: true });
    await channel.bindQueue(queue, EXCHANGE, tipoRutable);
    const a = await sembrar(tenantId, proyectoId, tipoRutable);
    const r1 = await despacharOutbox({ publisher: bus, maxAttempts: 5 });
    assert.equal(r1.publicados, 1);
    const filaA = await estadoDe(a.eventId);
    assert.equal(filaA.estado, 'PUBLICADO');
    assert.ok(filaA.publicado_en);
    await delay(300);
    const msg = await channel.get(queue, { noAck: true });
    assert.ok(msg, 'el mensaje llegó a la cola enlazada');
    const cuerpo = JSON.parse(msg!.content.toString());
    assert.equal(cuerpo.event_id, a.eventId);
    assert.equal(cuerpo.payload.recepcion_id, a.recepcionId);
    assert.equal(msg!.properties.messageId, a.eventId);
    console.log('[OK] con cola enlazada el broker confirma, la fila queda PUBLICADO y el mensaje conserva el event_id');

    // 2) Sin cola enlazada el broker devuelve el mensaje (mandatory): NO se marca PUBLICADO y se reprograma.
    const tipoSinCola = `compras.recepcion_oc_registrada.v1.sin-cola-${randomUUID()}`;
    const b = await sembrar(tenantId, proyectoId, tipoSinCola);
    const originalError = console.error;
    console.error = () => undefined;
    const r2 = await despacharOutbox({ publisher: bus, maxAttempts: 5 });
    console.error = originalError;
    assert.equal(r2.fallidos, 1);
    const filaB = await estadoDe(b.eventId);
    assert.equal(filaB.estado, 'PENDIENTE', 'un mensaje devuelto por falta de cola no se marca publicado');
    assert.equal(filaB.intentos, 1);
    assert.match(String(filaB.ultimo_error), /SIN_COLA/);
    console.log('[OK] un mensaje sin cola enlazada no se marca PUBLICADO y queda reprogramado');

    // 3) Al aparecer la cola, la republicación sale con el MISMO event_id y se marca PUBLICADO.
    await channel.bindQueue(queue, EXCHANGE, tipoSinCola);
    await (prisma as any).outboxEvento.update({ where: { id_evento: b.eventId }, data: { proximo_intento_en: new Date(Date.now() - 1000) } });
    const r3 = await despacharOutbox({ publisher: bus, maxAttempts: 5 });
    assert.equal(r3.publicados, 1);
    await delay(300);
    const msg2 = await channel.get(queue, { noAck: true });
    assert.ok(msg2);
    assert.equal(JSON.parse(msg2!.content.toString()).event_id, b.eventId, 'misma identidad del evento tras el reintento');
    assert.equal((await estadoDe(b.eventId)).estado, 'PUBLICADO');
    assert.equal((await estadoDe(b.eventId)).intentos, 2);
    console.log('[OK] la republicación conserva el event_id y termina PUBLICADO');
  } catch (error: any) {
    failed = true;
    console.error('not ok - compras outbox rabbitmq e2e');
    console.error(error);
  } finally {
    await (prisma as any).outboxEvento.deleteMany({ where: { tenant_id: tenantId } });
    await channel.deleteQueue(queue).catch(() => undefined);
    await raw.close().catch(() => undefined);
    await bus.close();
    await prisma.$disconnect();
    process.exit(failed ? 1 : 0);
  }
}

void main();
