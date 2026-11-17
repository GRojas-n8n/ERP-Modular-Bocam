/**
 * Integración: los consumidores de Finanzas reintentan y mandan a DLQ en lugar de descartar.
 * Change: blindar-consumidores-finanzas (M5, hallazgo F21 de la auditoría del 5 nov 2026).
 *
 * Parte A (sin infraestructura): `registrarSuscripcionesFinanzas` registra las 10 suscripciones, cada una con
 *   cola versionada `finanzas.<patrón>.v2`, `retry` configurable y `deadLetter: true`.
 * Parte B (RabbitMQ real): con esas mismas opciones, un handler que falla 2 veces se procesa al tercer intento,
 *   y uno que siempre falla termina en `<cola>.dlq` sin perderse.
 *
 * Runner: npm run test:integration:consumidores-resilientes -w @bocam/finanzas
 * Requiere: RabbitMQ para la parte B (RABBITMQ_URL). No usa PostgreSQL.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
process.env.RABBITMQ_URL = rabbitUrl;
process.env.FINANZAS_EVENTOS_MAX_INTENTOS = '3';
process.env.FINANZAS_EVENTOS_ESPERA_MS = '300';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import * as amqplib from 'amqplib';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';

const PATRONES_ESPERADOS = [
  'compras.oc_creada',
  'compras.oc_cancelada',
  'control_obra.estimacion_aprobada',
  'control_obra.avance_fisico_validado',
  'control_obra.avance_fisico_registrado',
  'auth.centro_costos_creado',
  'gerencia_tecnica.saldo_partida_creado',
  'gerencia_tecnica.partida_comprometida',
  'personal.nomina_autorizada',
  'personal.nomina_pagada',
].sort();

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function esperar(cond: () => boolean | Promise<boolean>, ms: number, que: string) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await cond()) return; await delay(50); }
  throw new Error(`Timeout (${ms}ms) esperando: ${que}`);
}

async function mensajesEn(cola: string): Promise<number> {
  const c = await amqplib.connect(rabbitUrl);
  try {
    const ch = await c.createChannel();
    ch.on('error', () => undefined);
    return (await ch.checkQueue(cola)).messageCount;
  } catch { return -1; } finally { await c.close().catch(() => undefined); }
}

async function borrarColas(nombres: string[]) {
  const c = await amqplib.connect(rabbitUrl);
  try {
    const ch = await c.createChannel();
    ch.on('error', () => undefined);
    for (const n of nombres) await ch.deleteQueue(n).catch(() => undefined);
  } finally { await c.close().catch(() => undefined); }
}

const evento = (tipo: string): BocamEvent => ({
  event_type: tipo,
  timestamp: new Date().toISOString(),
  context: { tenant_id: randomUUID(), proyecto_id: randomUUID(), user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
  payload: { prueba: 'consumidores-resilientes' },
});

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function main() {
  const finanzas = await import('../../src/main');

  await test('A1. registra las 10 suscripciones de Finanzas', async () => {
    const registradas: Array<{ patron: string; opciones: any }> = [];
    await finanzas.registrarSuscripcionesFinanzas({
      subscribe: async (patron: string, _h: unknown, opciones?: unknown) => { registradas.push({ patron, opciones }); },
    } as any);
    assert.deepEqual(registradas.map((r) => r.patron).sort(), PATRONES_ESPERADOS);
    for (const r of registradas) {
      assert.equal(r.opciones?.queueName, `finanzas.${r.patron.replace(/[.*#]/g, '_')}.v2`, `cola versionada de ${r.patron}`);
      assert.equal(r.opciones?.deadLetter, true, `DLQ de ${r.patron}`);
      assert.equal(r.opciones?.retry?.maxAttempts, 3, `intentos configurables de ${r.patron}`);
      assert.equal(r.opciones?.retry?.delayMs, 300, `espera configurable de ${r.patron}`);
      assert.equal(r.opciones?.queueArguments?.['x-message-ttl'], undefined, `${r.patron} sin caducidad de 24 h`);
      assert.equal(r.opciones?.queueArguments?.['x-dead-letter-routing-key'], `${r.opciones.queueName}.dlq`, `dead-letter de ${r.patron}`);
    }
  });

  await test('A2. sin variables de entorno usa 5 intentos y 30 s de espera', async () => {
    const prevI = process.env.FINANZAS_EVENTOS_MAX_INTENTOS, prevE = process.env.FINANZAS_EVENTOS_ESPERA_MS;
    delete process.env.FINANZAS_EVENTOS_MAX_INTENTOS; delete process.env.FINANZAS_EVENTOS_ESPERA_MS;
    try {
      const o = finanzas.colaFinanzas('personal.nomina_pagada');
      assert.equal(o.queueName, 'finanzas.personal_nomina_pagada.v2');
      assert.deepEqual(o.retry, { maxAttempts: 5, delayMs: 30_000 });
    } finally {
      process.env.FINANZAS_EVENTOS_MAX_INTENTOS = prevI; process.env.FINANZAS_EVENTOS_ESPERA_MS = prevE;
    }
  });

  const sufijo = randomUUID().slice(0, 8);
  const patronOk = `finanzas_prueba.reintento_${sufijo}`;
  const patronDlq = `finanzas_prueba.dlq_${sufijo}`;
  const opcOk = finanzas.colaFinanzas(patronOk);
  const opcDlq = finanzas.colaFinanzas(patronDlq);
  const colas = [opcOk.queueName, `${opcOk.queueName}.retry`, `${opcOk.queueName}.dlq`,
                 opcDlq.queueName, `${opcDlq.queueName}.retry`, `${opcDlq.queueName}.dlq`];

  const consumidor = createEventBus('finanzas');
  const emisor = createEventBus('prueba');
  try {
    await consumidor.connect();
    await emisor.connect();

    await test('B1. un handler que falla 2 veces se procesa al tercer intento', async () => {
      let intentos = 0; let procesado = false;
      await consumidor.subscribe(patronOk, async () => {
        intentos += 1;
        if (intentos < 3) throw new Error(`falla transitoria ${intentos}`);
        procesado = true;
      }, opcOk);
      await emisor.publish(evento(patronOk));
      await esperar(() => procesado, 15_000, 'procesado al tercer intento');
      assert.equal(intentos, 3);
      assert.equal(await mensajesEn(`${opcOk.queueName}.dlq`), 0, 'nada en DLQ');
    });

    await test('B2. un handler que siempre falla termina en DLQ, no se descarta', async () => {
      let intentos = 0;
      await consumidor.subscribe(patronDlq, async () => { intentos += 1; throw new Error('falla permanente'); }, opcDlq);
      await emisor.publish(evento(patronDlq));
      await esperar(async () => (await mensajesEn(`${opcDlq.queueName}.dlq`)) === 1, 15_000, 'mensaje en DLQ');
      assert.equal(intentos, 3, 'agota exactamente los intentos configurados');
    });

    await test('B3. la cola principal no caduca mensajes (sin x-message-ttl)', async () => {
      const c = await amqplib.connect(rabbitUrl);
      try {
        const ch = await c.createChannel();
        ch.on('error', () => undefined);
        // Redeclarar con los argumentos esperados solo funciona si coinciden exactamente con los vigentes (406 si no).
        await ch.assertQueue(opcOk.queueName, {
          durable: true,
          arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': `${opcOk.queueName}.dlq` },
        });
      } finally { await c.close().catch(() => undefined); }
    });
  } finally {
    await consumidor.close().catch(() => undefined);
    await emisor.close().catch(() => undefined);
    await borrarColas(colas);
  }

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  process.exit(fallidas ? 1 : 0);
}

main().catch((e) => { console.error('not ok - consumidores-resilientes', e); process.exit(1); });
