import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ComprasPrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';
import {
  handleFondosComprometidosEvent,
  handleFondosLiberadosEvent,
  handlePresupuestoInsuficienteEvent,
} from '../../src/main';

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
const comprasDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
const finanzasDbUrl = comprasDbUrl.includes('schema=compras')
  ? comprasDbUrl.replace('schema=compras', 'schema=finanzas')
  : 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
const comprasPrisma = new ComprasPrismaClient({
  datasources: {
    db: {
      url: comprasDbUrl,
    },
  },
});

let handleOrdenCompraCreadaEvent: (event: any) => Promise<void>;
let handleOrdenCompraCanceladaEvent: (event: any) => Promise<void>;
let initFinanzasEventBus: () => Promise<void>;
let shutdownFinanzasEventBus: () => Promise<void>;
let createFinanzasTenantContext: <T>(
  context: { tenantId: string; proyectoId: string; userId: string },
  callback: (prisma: any) => Promise<T>
) => Promise<T>;

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
  await comprasPrisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await comprasPrisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await comprasPrisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedScenario() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  const proveedor = await comprasPrisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC${Date.now()}`,
      razon_social: 'Proveedor Integracion Compras-Finanzas',
      estatus: 'ACTIVO',
    },
  });

  const presupuesto = await createFinanzasTenantContext(
    { tenantId, proyectoId, userId: randomUUID() },
    async (prisma) => prisma.presupuestoAsignado.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        codigo: `PRES-FBK-${Date.now()}`,
        descripcion: 'Presupuesto para feedback Finanzas -> Compras',
        monto_autorizado: 10000,
        monto_disponible: 10000,
        monto_comprometido: 0,
        monto_ejercido: 0,
        capitulo: 'MATERIALES',
        moneda: 'MXN',
        estatus: 'ACTIVO',
      },
    })
  );

  const ocEmitida = await comprasPrisma.ordenCompra.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      proveedor_id: proveedor.id_proveedor,
      codigo: `OC-FBK-A-${Date.now()}`,
      estado: 'PENDIENTE_CONFIRMACION_FINANZAS',
      subtotal: 3000,
      iva: 480,
      total: 3480,
      presupuesto_id: presupuesto.id_presupuesto,
    },
  });

  const ocInsuficiente = await comprasPrisma.ordenCompra.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      proveedor_id: proveedor.id_proveedor,
      codigo: `OC-FBK-B-${Date.now()}`,
      estado: 'PENDIENTE_CONFIRMACION_FINANZAS',
      subtotal: 12000,
      iva: 1920,
      total: 13920,
      presupuesto_id: presupuesto.id_presupuesto,
    },
  });

  return {
    tenantId,
    proyectoId,
    proveedorId: proveedor.id_proveedor,
    presupuestoId: presupuesto.id_presupuesto,
    ocEmitidaId: ocEmitida.id_orden,
    ocEmitidaCodigo: ocEmitida.codigo,
    ocInsuficienteId: ocInsuficiente.id_orden,
    ocInsuficienteCodigo: ocInsuficiente.codigo,
  };
}

async function main() {
  const runId = randomUUID();
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.COMPRAS_DATABASE_URL = comprasDbUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;

  const finanzasMain = await import('../../../finanzas/src/main');
  const finanzasDb = await import('../../../finanzas/src/db');

  handleOrdenCompraCreadaEvent = finanzasMain.handleOrdenCompraCreadaEvent;
  handleOrdenCompraCanceladaEvent = finanzasMain.handleOrdenCompraCanceladaEvent;
  initFinanzasEventBus = finanzasMain.initEventBus;
  shutdownFinanzasEventBus = finanzasMain.shutdownEventBus;
  createFinanzasTenantContext = finanzasDb.createTenantContext;

  const seeded = await seedScenario();
  const publisher = createEventBus(`compras-publisher-${runId}`);
  const financeInbound = createEventBus(`finanzas-in-${runId}`);
  const comprasInbound = createEventBus(`compras-in-${runId}`);

  try {
    await initFinanzasEventBus();
    await publisher.connect();
    await financeInbound.connect();
    await comprasInbound.connect();

    await financeInbound.subscribe('compras.oc_creada', handleOrdenCompraCreadaEvent);
    await financeInbound.subscribe('compras.oc_cancelada', handleOrdenCompraCanceladaEvent);
    await comprasInbound.subscribe('finanzas.fondos_comprometidos', handleFondosComprometidosEvent);
    await comprasInbound.subscribe('finanzas.fondos_liberados', handleFondosLiberadosEvent);
    await comprasInbound.subscribe('finanzas.presupuesto_insuficiente', handlePresupuestoInsuficienteEvent);
    await delay(500);

    const publishOcCreada = async (ocId: string, codigo: string, total: number) => {
      const published = await publisher.publish({
        event_type: 'compras.oc_creada',
        timestamp: new Date().toISOString(),
        context: {
          tenant_id: seeded.tenantId,
          proyecto_id: seeded.proyectoId,
          user_id: randomUUID(),
          correlation_id: `corr-${randomUUID()}`,
        },
        payload: {
          oc_id: ocId,
          codigo,
          total,
          proveedor_id: seeded.proveedorId,
          presupuesto_id: seeded.presupuestoId,
        },
      });

      assert.equal(published, true);
    };

    const publishOcCancelada = async (ocId: string, codigo: string, total: number) => {
      const published = await publisher.publish({
        event_type: 'compras.oc_cancelada',
        timestamp: new Date().toISOString(),
        context: {
          tenant_id: seeded.tenantId,
          proyecto_id: seeded.proyectoId,
          user_id: randomUUID(),
          correlation_id: `corr-${randomUUID()}`,
        },
        payload: {
          oc_id: ocId,
          codigo,
          total,
          presupuesto_id: seeded.presupuestoId,
        },
      });

      assert.equal(published, true);
    };

    await publishOcCreada(seeded.ocEmitidaId, seeded.ocEmitidaCodigo, 3480);

    await waitFor(async () => {
      const oc = await comprasPrisma.ordenCompra.findUniqueOrThrow({
        where: { id_orden: seeded.ocEmitidaId },
      });
      assert.equal(oc.estado, 'EMITIDA');
    });

    await waitFor(async () => {
      const movimiento = await createFinanzasTenantContext(
        { tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, userId: randomUUID() },
        async (prisma) => prisma.movimientoPresupuestal.findFirst({
          where: {
            referencia_id: seeded.ocEmitidaId,
            tipo: 'COMPROMISO',
          },
        })
      );
      assert.ok(movimiento);
    });

    await comprasPrisma.ordenCompra.update({
      where: { id_orden: seeded.ocEmitidaId },
      data: { estado: 'CANCELACION_PENDIENTE' },
    });

    await publishOcCancelada(seeded.ocEmitidaId, seeded.ocEmitidaCodigo, 3480);

    await waitFor(async () => {
      const oc = await comprasPrisma.ordenCompra.findUniqueOrThrow({
        where: { id_orden: seeded.ocEmitidaId },
      });
      assert.equal(oc.estado, 'CANCELADA');
    });

    await waitFor(async () => {
      const movimiento = await createFinanzasTenantContext(
        { tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, userId: randomUUID() },
        async (prisma) => prisma.movimientoPresupuestal.findFirst({
          where: {
            referencia_id: seeded.ocEmitidaId,
            tipo: 'LIBERACION',
          },
        })
      );
      assert.ok(movimiento);
    });

    await publishOcCreada(seeded.ocInsuficienteId, seeded.ocInsuficienteCodigo, 13920);

    await waitFor(async () => {
      const oc = await comprasPrisma.ordenCompra.findUniqueOrThrow({
        where: { id_orden: seeded.ocInsuficienteId },
      });
      assert.equal(oc.estado, 'ERROR_FINANZAS');
    });

    console.log('ok - ciclo completo compras -> finanzas -> compras actualiza estados por eventos de salida');
  } finally {
    await publisher.close();
    await financeInbound.close();
    await comprasInbound.close();
    await shutdownFinanzasEventBus();
    await createFinanzasTenantContext(
      { tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, userId: randomUUID() },
      async (prisma) => {
        await prisma.programaPagos.deleteMany({});
        await prisma.movimientoPresupuestal.deleteMany({});
        await prisma.presupuestoAsignado.deleteMany({});
      }
    );
    await cleanupTenantData(seeded.tenantId);
    await comprasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - ciclo completo compras -> finanzas -> compras');
  console.error(error);
  process.exitCode = 1;
});
