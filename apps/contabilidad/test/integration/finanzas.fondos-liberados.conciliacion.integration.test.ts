import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';

const contabilidadDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';
const finanzasDbUrl = contabilidadDbUrl.includes('schema=contabilidad')
  ? contabilidadDbUrl.replace('schema=contabilidad', 'schema=finanzas')
  : 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
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

async function cleanupContabilidadTenantData(tenantId: string) {
  await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const contabilidadModule = await import('../../src/main');
  const finanzasMain = await import('../../../finanzas/src/main');
  const finanzasDb = await import('../../../finanzas/src/db');

  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const presupuestoId = randomUUID();
  const ocId = randomUUID();
  const publisher = createEventBus(`compras-publisher-${randomUUID()}`);
  const finanzasInbound = createEventBus(`finanzas-in-${randomUUID()}`);

  try {
    await contabilidadModule.initEventBus();
    await finanzasMain.initEventBus();
    await publisher.connect();
    await finanzasInbound.connect();
    await finanzasInbound.subscribe('compras.oc_cancelada', finanzasMain.handleOrdenCompraCanceladaEvent);

    await finanzasDb.createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma: any) => {
        await prisma.presupuestoAsignado.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            id_presupuesto: presupuestoId,
            codigo: `PRES-CONC-${Date.now()}`,
            descripcion: 'Presupuesto para conciliacion contable de liberacion',
            monto_autorizado: 100000,
            monto_disponible: 2000,
            monto_comprometido: 98000,
            monto_ejercido: 0,
            capitulo: 'MATERIALES',
            moneda: 'MXN',
            estatus: 'ACTIVO',
          },
        });

        await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id: presupuestoId,
            tipo: 'COMPROMISO',
            concepto: 'Compromiso previo para OC cancelada',
            monto: 98000,
            referencia_modulo: 'compras',
            referencia_entidad: 'OrdenCompra',
            referencia_id: ocId,
            referencia_codigo: 'OC-CONC-001',
            usuario_id: userId,
            notas: 'Compromiso inicial para escenario de conciliacion.',
          },
        });
      }
    );

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
        codigo: 'OC-CONC-001',
        total: 98000,
        proveedor_id: 'proveedor-conciliacion-demo',
        presupuesto_id: presupuestoId,
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
      assert.equal(asiento.referencia_funcional, `OC:${ocId}`);
    });

    await publisher.publish({
      event_type: 'compras.oc_cancelada',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        oc_id: ocId,
        codigo: 'OC-CONC-001',
        total: 98000,
        presupuesto_id: presupuestoId,
      },
    });

    await waitFor(async () => {
      const reversa = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: tenantId,
          external_event_key: `compras.oc_cancelada:${ocId}`,
        },
      });

      assert.equal(reversa.tipo_poliza, 'REVERSION_PASIVO_PROYECTADO');
      assert.equal(reversa.referencia_funcional, `OC:${ocId}`);
      assert.equal(reversa.evento_conciliacion_key?.startsWith('finanzas.fondos_liberados:'), true);
      assert.ok(reversa.conciliado_at);
      assert.match(reversa.notas || '', /Conciliado con finanzas\.fondos_liberados movimiento/);
    });

    const beforeRepublish = await contabilidadPrisma.asientoContable.findFirstOrThrow({
      where: {
        tenant_id: tenantId,
        external_event_key: `compras.oc_cancelada:${ocId}`,
      },
    });

    await publisher.publish({
      event_type: 'compras.oc_cancelada',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        oc_id: ocId,
        codigo: 'OC-CONC-001',
        total: 98000,
        presupuesto_id: presupuestoId,
      },
    });

    await delay(1000);

    const afterRepublish = await contabilidadPrisma.asientoContable.findFirstOrThrow({
      where: {
        tenant_id: tenantId,
        external_event_key: `compras.oc_cancelada:${ocId}`,
      },
    });

    assert.equal(afterRepublish.id_asiento, beforeRepublish.id_asiento);
    assert.equal(afterRepublish.evento_conciliacion_key, beforeRepublish.evento_conciliacion_key);
    console.log('ok - integracion real finanzas.fondos_liberados concilia reversa contable por referencia funcional');
  } finally {
    await publisher.close();
    await finanzasInbound.close();
    await contabilidadModule.shutdownEventBus();
    await finanzasMain.shutdownEventBus();
    await finanzasDb.createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma: any) => {
        await prisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
        await prisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
      }
    );
    await cleanupContabilidadTenantData(tenantId);
    await contabilidadPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion finanzas.fondos_liberados -> contabilidad');
  console.error(error);
  process.exitCode = 1;
});
