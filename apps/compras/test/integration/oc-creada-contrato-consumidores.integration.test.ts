/**
 * Integración: el payload de compras.oc_creada construido por el publicador real lo aceptan Contabilidad y Finanzas.
 * Change: fix-oc-creada-presupuesto-id (lote B2 de auditar-consumidores-eventbus-sin-perdida-silenciosa)
 *
 * El payload NO se escribe a mano: se arma con buildOcCreadaPayload / buildOcCanceladaPayload, las mismas funciones
 * que usa la ruta convertir-oc, a partir de una OC persistida en Compras.
 *
 * Runner: npm run test:integration:oc-creada-contrato-consumidores -w @bocam/compras
 * Requiere: PostgreSQL (schemas compras, finanzas y contabilidad; se derivan de DATABASE_URL). No requiere RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ComprasPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as ContabilidadPrismaClient } from '../../../contabilidad/src/generated/prisma';
import { buildOcCanceladaPayload, buildOcCreadaPayload } from '../../src/oc-eventos';

const comprasDbUrl = process.env.COMPRAS_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
const swap = (schema: string) => comprasDbUrl.includes('schema=compras')
  ? comprasDbUrl.replace('schema=compras', `schema=${schema}`)
  : `postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=${schema}`;
const finanzasDbUrl = process.env.FINANZAS_DATABASE_URL || swap('finanzas');
const contabilidadDbUrl = process.env.CONTABILIDAD_DATABASE_URL || swap('contabilidad');
process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;

const comprasPrisma = new ComprasPrismaClient({ datasources: { db: { url: comprasDbUrl } } });
const contabilidadPrisma = new ContabilidadPrismaClient({ datasources: { db: { url: contabilidadDbUrl } } });

async function main() {
  const finanzasMain = await import('../../../finanzas/src/main');
  const finanzasDb = await import('../../../finanzas/src/db');
  const contabilidadMain = await import('../../../contabilidad/src/main');

  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const context = () => ({ tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId, correlation_id: `corr-${randomUUID()}` });

  const presupuesto = await finanzasDb.createTenantContext({ tenantId, proyectoId, userId }, async (prisma: any) =>
    prisma.presupuestoAsignado.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, codigo: `PRES-B2-${Date.now()}`, descripcion: 'Presupuesto contrato oc_creada',
        monto_autorizado: 10000, monto_disponible: 10000, monto_comprometido: 0, monto_ejercido: 0,
        capitulo: 'MATERIALES', moneda: 'MXN', estatus: 'ACTIVO',
      },
    }));

  const proveedor = await comprasPrisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFCB2${Date.now()}`, razon_social: 'Proveedor contrato oc_creada', estatus: 'ACTIVO' },
  });
  const oc = await comprasPrisma.ordenCompra.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedor.id_proveedor, codigo: `OC-B2-${Date.now()}`,
      estado: 'EMITIDA', subtotal: 3000, iva: 480, total: 3480, presupuesto_id: presupuesto.id_presupuesto,
    },
  });

  try {
    const creada = buildOcCreadaPayload({
      oc,
      proyectoId,
      presupuestoId: oc.presupuesto_id as string,
      requisicionId: oc.requisicion_id,
      conceptoId: null,
      items: [],
    });
    assert.equal(creada.presupuesto_id, presupuesto.id_presupuesto, 'el publicador incluye presupuesto_id');

    const evento = () => ({ event_type: 'compras.oc_creada', timestamp: new Date().toISOString(), context: context(), payload: creada });

    // Contabilidad acepta el payload real y el reenvío es idempotente.
    await contabilidadMain.handleOrdenCompraCreadaEvent(evento() as any);
    await contabilidadMain.handleOrdenCompraCreadaEvent(evento() as any);
    const asientos = await contabilidadPrisma.asientoContable.findMany({
      where: { tenant_id: tenantId, external_event_key: `compras.oc_creada:${oc.id_orden}` },
    });
    assert.equal(asientos.length, 1, 'Contabilidad crea un solo asiento');
    assert.equal(asientos[0].tipo_poliza, 'PASIVO_PROYECTADO');

    // Finanzas acepta el payload real y el reenvío es idempotente.
    await finanzasMain.handleOrdenCompraCreadaEvent(evento() as any);
    await finanzasMain.handleOrdenCompraCreadaEvent(evento() as any);
    const { movimientos, presupuestoFinal } = await finanzasDb.createTenantContext({ tenantId, proyectoId, userId }, async (prisma: any) => ({
      movimientos: await prisma.movimientoPresupuestal.count({
        where: { tenant_id: tenantId, referencia_id: oc.id_orden, tipo: 'COMPROMISO' },
      }),
      presupuestoFinal: await prisma.presupuestoAsignado.findUnique({ where: { id_presupuesto: presupuesto.id_presupuesto } }),
    }));
    assert.equal(movimientos, 1, 'Finanzas registra un solo compromiso');
    assert.equal(Number(presupuestoFinal.monto_comprometido), 3480, 'el compromiso no se duplica');

    // Simetría: la cancelación de la misma OC, con su constructor real, también la acepta Contabilidad.
    const cancelada = buildOcCanceladaPayload(oc);
    assert.equal(cancelada.presupuesto_id, creada.presupuesto_id);
    await contabilidadMain.handleOrdenCompraCanceladaEvent({
      event_type: 'compras.oc_cancelada', timestamp: new Date().toISOString(), context: context(), payload: cancelada,
    } as any);
    const reversion = await contabilidadPrisma.asientoContable.count({
      where: { tenant_id: tenantId, external_event_key: `compras.oc_cancelada:${oc.id_orden}` },
    });
    assert.equal(reversion, 1, 'Contabilidad registra la reversión');

    console.log('[OK] oc_creada: payload del publicador real aceptado por Contabilidad y Finanzas, idempotente y simétrico con oc_cancelada');
  } finally {
    await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } }).catch(() => undefined);
    await finanzasDb.createTenantContext({ tenantId, proyectoId, userId }, async (prisma: any) => {
      await prisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
    }).catch(() => undefined);
    await comprasPrisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } }).catch(() => undefined);
    await comprasPrisma.proveedor.deleteMany({ where: { tenant_id: tenantId } }).catch(() => undefined);
    await comprasPrisma.$disconnect();
    await contabilidadPrisma.$disconnect();
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error('not ok - oc_creada contrato consumidores', error);
  process.exit(1);
});
