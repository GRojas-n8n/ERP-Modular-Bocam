import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';
import {
  handleOrdenCompraCanceladaEvent,
  handleOrdenCompraCreadaEvent,
  initEventBus,
  shutdownEventBus,
} from '../../src/main';

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
      codigo: `PRES-OC-EVT-${Date.now()}`,
      descripcion: 'Presupuesto de integracion Compras -> Finanzas',
      monto_autorizado: 50000,
      monto_disponible: 50000,
      monto_comprometido: 0,
      monto_ejercido: 0,
      capitulo: 'MATERIALES',
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
  const ocId = randomUUID();
  const publisher = createEventBus('compras');
  const consumer = createEventBus(`finanzas-it-${runId}`);

  try {
    process.env.RABBITMQ_URL = rabbitUrl;

    await initEventBus();
    await publisher.connect();
    await consumer.connect();
    await consumer.subscribe('compras.oc_creada', handleOrdenCompraCreadaEvent);
    await consumer.subscribe('compras.oc_cancelada', handleOrdenCompraCanceladaEvent);
    await delay(500);

    const publishCreated = async () => {
      const published = await publisher.publish({
        event_type: 'compras.oc_creada',
        timestamp: new Date().toISOString(),
        context: {
          tenant_id: seeded.tenantId,
          proyecto_id: seeded.proyectoId,
          user_id: randomUUID(),
          correlation_id: correlationId,
        },
        payload: {
          oc_id: ocId,
          codigo: `OC-EVT-${Date.now()}`,
          total: 7800,
          proveedor_id: randomUUID(),
          presupuesto_id: seeded.presupuestoId,
        },
      });

      assert.equal(published, true, 'El evento compras.oc_creada no se publico.');
    };

    const publishCancelled = async () => {
      const published = await publisher.publish({
        event_type: 'compras.oc_cancelada',
        timestamp: new Date().toISOString(),
        context: {
          tenant_id: seeded.tenantId,
          proyecto_id: seeded.proyectoId,
          user_id: randomUUID(),
          correlation_id: correlationId,
        },
        payload: {
          oc_id: ocId,
          codigo: `OC-EVT-${Date.now()}`,
          total: 7800,
          presupuesto_id: seeded.presupuestoId,
        },
      });

      assert.equal(published, true, 'El evento compras.oc_cancelada no se publico.');
    };

    await publishCreated();

    await waitFor(async () => {
      const movimientos = await prisma.movimientoPresupuestal.findMany({
        where: {
          tenant_id: seeded.tenantId,
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: ocId,
          tipo: 'COMPROMISO',
        },
      });

      assert.equal(movimientos.length, 1);
    });

    await waitFor(async () => {
      const presupuesto = await prisma.presupuestoAsignado.findUniqueOrThrow({
        where: { id_presupuesto: seeded.presupuestoId },
      });

      assert.equal(Number(presupuesto.monto_comprometido), 7800);
      assert.equal(Number(presupuesto.monto_disponible), 42200);
    });

    await waitFor(async () => {
      assert.ok(
        capturedLogs.some((line) =>
          line.includes('"action":"finanzas.event.orden_compra_creada.created"') &&
          line.includes(`"correlation_id":"${correlationId}"`)
        )
      );
    });

    await publishCreated();

    await waitFor(async () => {
      const movimientos = await prisma.movimientoPresupuestal.findMany({
        where: {
          tenant_id: seeded.tenantId,
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: ocId,
          tipo: 'COMPROMISO',
        },
      });

      assert.equal(movimientos.length, 1);
    });

    await waitFor(async () => {
      assert.ok(
        capturedLogs.some((line) =>
          line.includes('"action":"finanzas.event.orden_compra_creada.idempotent"') &&
          line.includes(`"correlation_id":"${correlationId}"`)
        )
      );
    });

    await publishCancelled();

    await waitFor(async () => {
      const movimientos = await prisma.movimientoPresupuestal.findMany({
        where: {
          tenant_id: seeded.tenantId,
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: ocId,
          tipo: 'LIBERACION',
        },
      });

      assert.equal(movimientos.length, 1);
    });

    await waitFor(async () => {
      const presupuesto = await prisma.presupuestoAsignado.findUniqueOrThrow({
        where: { id_presupuesto: seeded.presupuestoId },
      });

      assert.equal(Number(presupuesto.monto_comprometido), 0);
      assert.equal(Number(presupuesto.monto_disponible), 50000);
    });

    await waitFor(async () => {
      assert.ok(
        capturedLogs.some((line) =>
          line.includes('"action":"finanzas.event.orden_compra_cancelada.created"') &&
          line.includes(`"correlation_id":"${correlationId}"`)
        )
      );
    });

    await publishCancelled();

    await waitFor(async () => {
      const movimientos = await prisma.movimientoPresupuestal.findMany({
        where: {
          tenant_id: seeded.tenantId,
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: ocId,
          tipo: 'LIBERACION',
        },
      });

      assert.equal(movimientos.length, 1);
    });

    await waitFor(async () => {
      assert.ok(
        capturedLogs.some((line) =>
          line.includes('"action":"finanzas.event.orden_compra_cancelada.idempotent"') &&
          line.includes(`"correlation_id":"${correlationId}"`)
        )
      );
    });

    console.log('ok - integracion real compras -> finanzas via RabbitMQ compromete y libera fondos con idempotencia');
  } finally {
    await publisher.close();
    await consumer.close();
    await shutdownEventBus();

    await cleanupTenantData(seeded.tenantId);
    await prisma.$disconnect();
    console.log = originalLog;
  }
}

void main().catch((error) => {
  console.error('not ok - integracion compras -> finanzas rabbitmq');
  console.error(error);
  console.log = originalLog;
  process.exitCode = 1;
});
