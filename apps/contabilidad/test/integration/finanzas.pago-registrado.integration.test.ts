import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import type { AsientoContableGeneradoPayload } from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const finanzasDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
const contabilidadDbUrl = finanzasDbUrl.includes('schema=finanzas')
  ? finanzasDbUrl.replace('schema=finanzas', 'schema=contabilidad')
  : 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';

const finanzasPrisma = new FinanzasPrismaClient({
  datasources: {
    db: {
      url: finanzasDbUrl,
    },
  },
});

const contabilidadPrisma = new ContabilidadPrismaClient({
  datasources: {
    db: {
      url: contabilidadDbUrl,
    },
  },
});

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

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
  await finanzasPrisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedScenario() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const presupuesto = await finanzasPrisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-CONT-${Date.now()}`,
      descripcion: 'Presupuesto para cierre contable',
      monto_autorizado: 20000,
      monto_disponible: 8400,
      monto_comprometido: 11600,
      monto_ejercido: 0,
      capitulo: 'SUBCONTRATOS',
      moneda: 'MXN',
      estatus: 'ACTIVO',
    },
  });

  const pago = await finanzasPrisma.programaPagos.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      presupuesto_id: presupuesto.id_presupuesto,
      concepto: 'Pago de estimacion validada',
      beneficiario: 'Proveedor Contable SA de CV',
      monto_programado: 11600,
      fecha_programada: new Date('2026-03-20'),
      estado: 'PENDIENTE',
      referencia_modulo: 'control-obra',
      referencia_entidad: 'Estimacion',
      referencia_id: randomUUID(),
    },
  });

  return {
    tenantId,
    proyectoId,
    userId,
    presupuestoId: presupuesto.id_presupuesto,
    pagoId: pago.id_pago,
  };
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const finanzasModule = await import('../../../finanzas/src/main');
  const contabilidadModule = await import('../../src/main');
  const seeded = await seedScenario();
  const probe = createEventBus(`contabilidad-probe-${randomUUID()}`);
  const duplicatePublisher = createEventBus(`contabilidad-dup-${randomUUID()}`);

  let finanzasServer: import('node:http').Server | undefined;
  let finanzasBaseUrl = '';
  const receivedGeneratedEvents: BocamEvent<AsientoContableGeneradoPayload>[] = [];

  try {
    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();
    await probe.connect();
    await duplicatePublisher.connect();
    await probe.subscribe('contabilidad.asiento_contable_generado', async (event: BocamEvent<AsientoContableGeneradoPayload>) => {
      receivedGeneratedEvents.push(event);
    });

    const started = await startHttpApp(finanzasModule.app);
    finanzasServer = started.server;
    finanzasBaseUrl = started.baseUrl;
    await delay(500);

    const token = signTenantToken({
      userId: seeded.userId,
      tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId,
      roles: ['finance'],
      projects: [seeded.proyectoId],
      limiteAprobacion: 999999999,
    });

    const response = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/pagos/${seeded.pagoId}/pagar`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referencia_bancaria: 'TRX-CONT-123456',
        metodo_pago: 'TRANSFERENCIA',
        banco: 'BBVA',
      }),
    });

    assert.equal(response.status, 200);
    const correlationId = response.headers.get('x-correlation-id');
    assert.ok(correlationId);

    await waitFor(async () => {
      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: seeded.tenantId,
          pago_id: seeded.pagoId,
        },
      });

      assert.equal(asiento.tipo_poliza, 'EGRESO');
      assert.equal(asiento.estatus, 'REGISTRADO');
      assert.ok(asiento.folio_poliza.startsWith('POL-EGR-'));
    });

    await waitFor(async () => {
      assert.equal(receivedGeneratedEvents.length, 1);
      assert.equal(receivedGeneratedEvents[0]?.context.correlation_id, correlationId);
      assert.equal(receivedGeneratedEvents[0]?.payload.pago_id, seeded.pagoId);
    });

    await duplicatePublisher.publish({
      event_type: 'finanzas.pago_registrado',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: seeded.tenantId,
        proyecto_id: seeded.proyectoId,
        user_id: seeded.userId,
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        id_pago: seeded.pagoId,
        presupuesto_id: randomUUID(),
        monto_pagado: 11600,
        fecha_pago_real: new Date().toISOString(),
        referencia_modulo: 'control-obra',
        referencia_entidad: 'Estimacion',
        referencia_id: randomUUID(),
        concepto: 'Pago de estimacion validada',
        beneficiario: 'Proveedor Contable SA de CV',
      },
    });

    await delay(800);

    const totalAsientos = await contabilidadPrisma.asientoContable.count({
      where: {
        tenant_id: seeded.tenantId,
        pago_id: seeded.pagoId,
      },
    });

    assert.equal(totalAsientos, 1);
    assert.equal(receivedGeneratedEvents.length, 1);

    const concurrentSeeded = await seedScenario();
    const concurrentEvent = {
      event_type: 'finanzas.pago_registrado',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: concurrentSeeded.tenantId,
        proyecto_id: concurrentSeeded.proyectoId,
        user_id: concurrentSeeded.userId,
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        id_pago: concurrentSeeded.pagoId,
        presupuesto_id: concurrentSeeded.presupuestoId,
        monto_pagado: 11600,
        fecha_pago_real: new Date().toISOString(),
        referencia_bancaria: 'TRX-CONT-CONCURRENT-001',
        metodo_pago: 'TRANSFERENCIA',
        banco: 'BBVA',
        referencia_modulo: 'control-obra',
        referencia_entidad: 'Estimacion',
        referencia_id: randomUUID(),
        concepto: 'Pago de estimacion validada concurrente',
        beneficiario: 'Proveedor Contable SA de CV',
      },
    } as const;

    await Promise.all(
      Array.from({ length: 6 }, () => duplicatePublisher.publish({
        ...concurrentEvent,
        context: {
          ...concurrentEvent.context,
          correlation_id: `corr-${randomUUID()}`,
        },
      }))
    );

    await waitFor(async () => {
      const totalConcurrentAsientos = await contabilidadPrisma.asientoContable.count({
        where: {
          tenant_id: concurrentSeeded.tenantId,
          pago_id: concurrentSeeded.pagoId,
        },
      });
      const totalConcurrentFiscal = await contabilidadPrisma.conciliacionFiscal.count({
        where: {
          tenant_id: concurrentSeeded.tenantId,
          pago_id: concurrentSeeded.pagoId,
        },
      });
      const totalConcurrentBanco = await contabilidadPrisma.conciliacionBancaria.count({
        where: {
          tenant_id: concurrentSeeded.tenantId,
          pago_id: concurrentSeeded.pagoId,
        },
      });
      const generatedForConcurrentPayment = receivedGeneratedEvents.filter(
        (entry) => entry.payload.pago_id === concurrentSeeded.pagoId
      );

      assert.equal(totalConcurrentAsientos, 1);
      assert.equal(totalConcurrentFiscal, 1);
      assert.equal(totalConcurrentBanco, 1);
      assert.equal(generatedForConcurrentPayment.length, 1);
    });

    console.log('ok - integracion real finanzas.pago_registrado -> contabilidad genera asiento y evento contable');
  } finally {
    await stopHttpApp(finanzasServer);
    await duplicatePublisher.close();
    await probe.close();
    await contabilidadModule.shutdownEventBus();
    await finanzasModule.shutdownEventBus();
    await cleanupTenantData(seeded.tenantId);
    await contabilidadPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion finanzas.pago_registrado -> contabilidad');
  console.error(error);
  process.exitCode = 1;
});
