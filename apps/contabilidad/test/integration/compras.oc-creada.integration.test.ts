import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import type { AsientoContableGeneradoPayload } from '../../src/types';

const contabilidadDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

const contabilidadPrisma = new ContabilidadPrismaClient({
  datasources: {
    db: {
      url: contabilidadDbUrl,
    },
  },
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(assertion: () => Promise<void>, timeoutMs = 12000) {
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
  await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const contabilidadModule = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const ocId = randomUUID();
  const probe = createEventBus(`contabilidad-probe-${randomUUID()}`);
  const publisher = createEventBus(`compras-publisher-${randomUUID()}`);
  const receivedGeneratedEvents: BocamEvent<AsientoContableGeneradoPayload>[] = [];

  try {
    await contabilidadModule.initEventBus();
    await probe.connect();
    await publisher.connect();

    await probe.subscribe('contabilidad.asiento_contable_generado', async (event: BocamEvent<AsientoContableGeneradoPayload>) => {
      receivedGeneratedEvents.push(event);
    });

    await publisher.publish({
      event_type: 'compras.oc_creada',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        oc_id: ocId,
        codigo: 'OC-CONT-001',
        total: 245000,
        proveedor_id: 'proveedor-uuid-demo',
        presupuesto_id: randomUUID(),
      },
    });

    await waitFor(async () => {
      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: tenantId,
          external_event_key: `compras.oc_creada:${ocId}`,
        },
      });

      assert.equal(asiento.tipo_poliza, 'PASIVO_PROYECTADO');
      assert.equal(asiento.estatus, 'PROYECTADO');
      assert.ok(asiento.folio_poliza.startsWith('POL-PAS-'));
    });

    assert.equal(receivedGeneratedEvents.length, 1);
    assert.equal(receivedGeneratedEvents[0]?.payload.referencia_id, ocId);

    await publisher.publish({
      event_type: 'compras.oc_creada',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        oc_id: ocId,
        codigo: 'OC-CONT-001',
        total: 245000,
        proveedor_id: 'proveedor-uuid-demo',
        presupuesto_id: randomUUID(),
      },
    });

    await delay(800);

    const totalAsientos = await contabilidadPrisma.asientoContable.count({
      where: {
        tenant_id: tenantId,
        external_event_key: `compras.oc_creada:${ocId}`,
      },
    });

    assert.equal(totalAsientos, 1);
    assert.equal(receivedGeneratedEvents.length, 1);
    console.log('ok - integracion real compras.oc_creada -> contabilidad genera pasivo proyectado');
  } finally {
    await publisher.close();
    await probe.close();
    await contabilidadModule.shutdownEventBus();
    await cleanupTenantData(tenantId);
    await contabilidadPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion compras.oc_creada -> contabilidad');
  console.error(error);
  process.exitCode = 1;
});
