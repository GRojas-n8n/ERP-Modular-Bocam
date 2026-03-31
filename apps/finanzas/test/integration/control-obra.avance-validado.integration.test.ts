import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';
import { handleAvanceFisicoValidadoEvent } from '../../src/main';

const prisma = new PrismaClient();
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

const originalLog = console.log;
const capturedLogs: string[] = [];

console.log = (...args: unknown[]) => {
  const line = args.map((value) => typeof value === 'string' ? value : JSON.stringify(value)).join(' ');
  capturedLogs.push(line);
  originalLog(...args);
};

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
  await prisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedBudget() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  const presupuesto = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-AV-${Date.now()}`,
      descripcion: 'Presupuesto de integracion avance validado -> Finanzas',
      monto_autorizado: 32000,
      monto_disponible: 32000,
      monto_comprometido: 0,
      monto_ejercido: 0,
      capitulo: 'MANO_OBRA',
      moneda: 'MXN',
      estatus: 'ACTIVO',
    },
  });

  return {
    tenantId,
    proyectoId,
    presupuestoId: presupuesto.id_presupuesto,
  };
}

async function main() {
  const runId = randomUUID();
  const seeded = await seedBudget();
  const correlationId = `corr-${randomUUID()}`;
  const avanceId = randomUUID();
  const publisher = createEventBus('control-obra');
  const consumer = createEventBus(`finanzas-it-${runId}`);

  try {
    process.env.RABBITMQ_URL = rabbitUrl;

    await publisher.connect();
    await consumer.connect();
    await consumer.subscribe('control_obra.avance_fisico_validado', handleAvanceFisicoValidadoEvent);
    await delay(500);

    const publishEvent = async () => {
      const published = await publisher.publish({
        event_type: 'control_obra.avance_fisico_validado',
        timestamp: new Date().toISOString(),
        context: {
          tenant_id: seeded.tenantId,
          proyecto_id: seeded.proyectoId,
          user_id: randomUUID(),
          correlation_id: correlationId,
        },
        payload: {
          avance_id: avanceId,
          concepto: 'CIM-001',
          porcentaje: 47.5,
          importe: 3650,
          presupuesto_id: seeded.presupuestoId,
        },
      });

      assert.equal(published, true, 'El evento control_obra.avance_fisico_validado no se publico.');
    };

    await publishEvent();

    await waitFor(async () => {
      const pagos = await prisma.programaPagos.findMany({
        where: {
          tenant_id: seeded.tenantId,
          referencia_modulo: 'control-obra',
          referencia_entidad: 'AvanceFisicoValidado',
          referencia_id: avanceId,
        },
      });

      assert.equal(pagos.length, 1);
      assert.equal(Number(pagos[0].monto_programado), 3650);
      assert.equal(pagos[0].estado, 'PENDIENTE');
    });

    await waitFor(async () => {
      assert.ok(
        capturedLogs.some((line) =>
          line.includes('"action":"finanzas.event.avance_fisico_validado.created"') &&
          line.includes(`"correlation_id":"${correlationId}"`)
        )
      );
    });

    await publishEvent();

    await waitFor(async () => {
      const pagos = await prisma.programaPagos.findMany({
        where: {
          tenant_id: seeded.tenantId,
          referencia_modulo: 'control-obra',
          referencia_entidad: 'AvanceFisicoValidado',
          referencia_id: avanceId,
        },
      });

      assert.equal(pagos.length, 1);
    });

    await waitFor(async () => {
      assert.ok(
        capturedLogs.some((line) =>
          line.includes('"action":"finanzas.event.avance_fisico_validado.idempotent"') &&
          line.includes(`"correlation_id":"${correlationId}"`)
        )
      );
    });

    console.log('ok - integracion real control-obra avance validado -> finanzas crea proyeccion preliminar con idempotencia');
  } finally {
    await publisher.close();
    await consumer.close();
    await cleanupTenantData(seeded.tenantId);
    await prisma.$disconnect();
    console.log = originalLog;
  }
}

void main().catch((error) => {
  console.error('not ok - integracion control-obra avance validado -> finanzas rabbitmq');
  console.error(error);
  console.log = originalLog;
  process.exitCode = 1;
});
