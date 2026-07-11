import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';
import { handleCentroCostosCreadoEvent } from '../../src/main';

const prisma = new PrismaClient();
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(assertion: () => Promise<void>, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await assertion();
      return;
    } catch {
      await delay(250);
    }
  }
  await assertion();
}

async function cleanupTenantData(tenantId: string) {
  await (prisma as any).proyectoFinanzas.deleteMany({ where: { tenant_id: tenantId } });
}

function buildEvent(tenantId: string, proyectoId: string, correlationId: string) {
  return {
    event_type: 'auth.centro_costos_creado',
    timestamp: new Date().toISOString(),
    context: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      user_id: randomUUID(),
      correlation_id: correlationId,
    },
    payload: {
      proyecto_id: proyectoId,
      codigo_centro_costos: 'HCO2026009001',
      empresa_grupo: 'HCO',
      anio_centro_costos: 2026,
      cliente_id: randomUUID(),
      es_especial: false,
      estatus: 'ABIERTO',
      nombre_oficial: 'Proyecto Prueba Evento Finanzas',
      fecha_creacion: new Date().toISOString(),
    },
  };
}

async function testProyectoNuevoCreaFilaEnCero() {
  const runId = randomUUID();
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const correlationId = `corr-${randomUUID()}`;
  const publisher = createEventBus('auth');
  const consumer = createEventBus(`finanzas-it-${runId}`);

  try {
    process.env.RABBITMQ_URL = rabbitUrl;
    await publisher.connect();
    await consumer.connect();
    await consumer.subscribe('auth.centro_costos_creado', handleCentroCostosCreadoEvent);
    await delay(500);

    const published = await publisher.publish(buildEvent(tenantId, proyectoId, correlationId));
    assert.equal(published, true, 'el evento auth.centro_costos_creado no se publicó');

    await waitFor(async () => {
      const fila = await (prisma as any).proyectoFinanzas.findUnique({
        where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: proyectoId } },
      });
      assert.ok(fila, 'debe crearse ProyectoFinanzas al recibir el evento');
      assert.equal(Number(fila.anticipo_total), 0);
      assert.equal(Number(fila.anticipo_usado), 0);
    });

    console.log('ok 3.3 - auth.centro_costos_creado crea ProyectoFinanzas con anticipo_total/usado en 0');
  } finally {
    await publisher.close();
    await consumer.close();
    await cleanupTenantData(tenantId);
  }
}

async function testNoSobreescribeAnticipoManualPrevio() {
  const runId = randomUUID();
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const correlationId = `corr-${randomUUID()}`;
  const publisher = createEventBus('auth');
  const consumer = createEventBus(`finanzas-it-${runId}`);

  try {
    process.env.RABBITMQ_URL = rabbitUrl;

    // Simula el flujo manual existente: alguien ya registró un anticipo
    // real ANTES de que llegue el evento (o el evento se perdió y se
    // disparó el flujo manual como fallback).
    await (prisma as any).proyectoFinanzas.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, anticipo_total: 500000, anticipo_usado: 125000 },
    });

    await publisher.connect();
    await consumer.connect();
    await consumer.subscribe('auth.centro_costos_creado', handleCentroCostosCreadoEvent);
    await delay(500);

    const published = await publisher.publish(buildEvent(tenantId, proyectoId, correlationId));
    assert.equal(published, true, 'el evento auth.centro_costos_creado no se publicó');

    // Dar tiempo al consumidor a procesar (no hay una señal directa de
    // "ya terminó" aquí porque el handler no loguea distinto en este
    // caso — se espera un tiempo fijo y luego se verifica el valor).
    await delay(1500);

    const fila = await (prisma as any).proyectoFinanzas.findUnique({
      where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: proyectoId } },
    });
    assert.ok(fila, 'la fila debe seguir existiendo');
    assert.equal(Number(fila.anticipo_total), 500000, 'el evento NO debe sobreescribir un anticipo_total ya registrado manualmente');
    assert.equal(Number(fila.anticipo_usado), 125000, 'el evento NO debe sobreescribir un anticipo_usado ya registrado manualmente');

    console.log('ok 3.4 - el evento no sobreescribe un anticipo ya registrado manualmente antes de que llegara');
  } finally {
    await publisher.close();
    await consumer.close();
    await cleanupTenantData(tenantId);
  }
}

async function main() {
  await testProyectoNuevoCreaFilaEnCero();
  await testNoSobreescribeAnticipoManualPrevio();
  console.log('ok - integración evento-centro-costos-creado (finanzas): creación proactiva + no sobreescritura verificadas');
}

void main()
  .catch((error) => {
    console.error('not ok - integración evento-centro-costos-creado (finanzas)');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
