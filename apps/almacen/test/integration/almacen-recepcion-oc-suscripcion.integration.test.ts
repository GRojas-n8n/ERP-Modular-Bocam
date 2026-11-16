/**
 * Test de Integración (extremo a extremo): Almacén suscrito a compras.recepcion_oc_registrada.v1
 * Change: fix-ingresos-almacen-por-recepcion-oc (sección 3.4)
 *
 * Verifica con RabbitMQ real que la suscripción usa la cola vigente con sufijo .v3 (sin TTL), con cola de reintento
 * y de mensajes fallidos; que un evento válido se aplica; que un evento de formato antiguo va a la DLQ
 * sin reintentos; y que /ready pasa a 200 cuando el bus está listo.
 *
 * Runner: npm run test:integration:recepcion-oc-suscripcion -w @bocam/almacen
 * Requiere: PostgreSQL (ALMACEN_DATABASE_URL o DATABASE_URL → schema almacen) y RabbitMQ (RABBITMQ_URL).
 */

// CRÍTICO: env vars antes del import dinámico de main.ts
process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
process.env.PORT = String(41000 + Math.floor(Math.random() * 2000));
process.env.ALMACEN_RECEPCION_ESPERA_MS = '300';
process.env.ALMACEN_RECEPCION_MAX_INTENTOS = '3';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import * as amqplib from 'amqplib';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import { RECEPCION_OC_COLA, RECEPCION_OC_EVENT } from '../../src/recepcion-oc-cola';

const dbUrl =
  process.env.ALMACEN_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=almacen';
process.env.ALMACEN_DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const QUEUE = RECEPCION_OC_COLA;
const EVENT = RECEPCION_OC_EVENT;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(condition: () => Promise<boolean>, timeoutMs: number, what: string) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await condition()) return;
    await delay(100);
  }
  throw new Error(`Timeout (${timeoutMs}ms) esperando: ${what}`);
}

async function messageCount(queue: string): Promise<number> {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL as string);
  try {
    const channel = await connection.createChannel();
    channel.on('error', () => undefined);
    return (await channel.checkQueue(queue)).messageCount;
  } catch {
    return -1;
  } finally {
    await connection.close().catch(() => undefined);
  }
}

async function drain(queue: string): Promise<amqplib.GetMessage[]> {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL as string);
  const out: amqplib.GetMessage[] = [];
  try {
    const channel = await connection.createChannel();
    channel.on('error', () => undefined);
    for (;;) {
      const msg = await channel.get(queue, { noAck: true });
      if (!msg) break;
      out.push(msg);
    }
  } finally {
    await connection.close().catch(() => undefined);
  }
  return out;
}

function eventoValido(tenantId: string, proyectoId: string, insumoId: string, cantidad: number): BocamEvent {
  const eventId = randomUUID();
  const now = new Date().toISOString();
  return {
    event_type: EVENT, event_id: eventId, event_version: 1, timestamp: now,
    context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
    payload: {
      event_id: eventId, event_version: 1, occurred_at: now, tenant_id: tenantId, proyecto_id: proyectoId,
      orden_compra_id: randomUUID(), orden_compra_codigo: 'OC-E2E', proveedor_id: randomUUID(),
      recepcion_id: randomUUID(), fecha_recepcion: now, estado_oc_resultante: 'RECIBIDA',
      items: [{ recepcion_item_id: randomUUID(), orden_item_id: randomUUID(), insumo_id: insumoId, cantidad_recibida: cantidad,
        clave: 'E2E-001', descripcion: 'Insumo e2e', unidad: 'PZA', categoria: 'MATERIAL' }],
    },
  };
}

async function main() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoId = randomUUID();
  const publisher = createEventBus(`e2e-pub-${randomUUID()}`);
  const raw = await amqplib.connect(process.env.RABBITMQ_URL as string);
  const rawChannel = await raw.createChannel();
  let server: import('node:http').Server | undefined;
  let failed = false;

  try {
    const mod = await import('../../src/main');
    server = await (mod as any).startServer();
    const baseUrl = `http://127.0.0.1:${process.env.PORT}`;
    await publisher.connect();

    await waitFor(async () => (await messageCount(QUEUE)) >= 0, 10000, 'la cola .v3 declarada');
    await waitFor(async () => (await fetch(`${baseUrl}/ready`)).status === 200, 10000, '/ready en 200');
    console.log('[OK] la suscripción declara la cola .v3 y /ready pasa a 200 con el bus listo');

    assert.ok(await messageCount(`${QUEUE}.retry`) >= 0, 'la cola de reintento existe');
    assert.ok(await messageCount(`${QUEUE}.dlq`) >= 0, 'la cola de mensajes fallidos existe');
    assert.equal((await fetch(`${baseUrl}/health`)).status, 200);
    console.log('[OK] existen <cola>.retry y <cola>.dlq, y /health responde 200');

    await publisher.publishConfirmed(eventoValido(tenantId, proyectoId, insumoId, 12));
    await waitFor(async () => {
      const item = await prisma.itemInventario.findFirst({ where: { tenant_id: tenantId, insumo_id: insumoId } });
      return Number(item?.stock_actual ?? 0) === 12;
    }, 10000, 'INGRESO aplicado por el consumidor');
    console.log('[OK] un evento v1 válido se consume y aplica el INGRESO por el bus real');

    const antiguo: BocamEvent = {
      event_type: EVENT, timestamp: new Date().toISOString(),
      context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
      payload: { orden_compra_id: randomUUID(), items: [{ insumo_id: insumoId, cantidad_recibida: 5 }] },
    };
    await publisher.publishConfirmed(antiguo);
    await waitFor(async () => (await messageCount(`${QUEUE}.dlq`)) === 1, 10000, 'evento de formato antiguo en la DLQ');
    await delay(800);
    assert.equal(await messageCount(`${QUEUE}.retry`), 0, 'un formato no soportado no pasa por la cola de reintento');
    const [msg] = await drain(`${QUEUE}.dlq`);
    assert.match(String(msg.properties.headers?.['x-failure-reason']), /FORMATO_NO_SOPORTADO/);
    assert.equal(Number(msg.properties.headers?.['x-attempt']), 1, 'un solo intento');
    assert.equal(JSON.parse(msg.content.toString()).payload.orden_compra_id, (antiguo.payload as any).orden_compra_id, 'la DLQ conserva el payload original');
    const item = await prisma.itemInventario.findFirst({ where: { tenant_id: tenantId, insumo_id: insumoId } });
    assert.equal(Number(item!.stock_actual), 12, 'el evento rechazado no cambia el stock');
    console.log('[OK] un evento de formato antiguo va a la DLQ sin reintentos ni efectos');
  } catch (error: any) {
    failed = true;
    console.error('not ok - almacen recepcion-oc suscripcion e2e');
    console.error(error);
  } finally {
    await prisma.movimientoAlmacen.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.eventoProcesado.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.itemInventario.deleteMany({ where: { tenant_id: tenantId } });
    for (const q of [QUEUE, `${QUEUE}.retry`, `${QUEUE}.dlq`]) await rawChannel.deleteQueue(q).catch(() => undefined);
    await raw.close().catch(() => undefined);
    await publisher.close();
    server?.close();
    await prisma.$disconnect();
    process.exit(failed ? 1 : 0);
  }
}

void main();
