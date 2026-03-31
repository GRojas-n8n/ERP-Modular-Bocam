import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ControlObraPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';
import { handlePagoRegistradoEvent } from '../../src/main';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const controlObraDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=control_obra';
const finanzasDbUrl = controlObraDbUrl.includes('schema=control_obra')
  ? controlObraDbUrl.replace('schema=control_obra', 'schema=finanzas')
  : 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';

const controlPrisma = new ControlObraPrismaClient({
  datasources: {
    db: {
      url: controlObraDbUrl,
    },
  },
});

const finanzasPrisma = new FinanzasPrismaClient({
  datasources: {
    db: {
      url: finanzasDbUrl,
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
  await controlPrisma.avanceFisico.deleteMany({ where: { tenant_id: tenantId } });
  await controlPrisma.estimacion.deleteMany({ where: { tenant_id: tenantId } });

  await finanzasPrisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedScenario() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const estimacion = await controlPrisma.estimacion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      numero_estimacion: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000),
      codigo: `EST-PAGO-${Date.now()}`,
      periodo_inicio: new Date('2026-03-01'),
      periodo_fin: new Date('2026-03-15'),
      subtotal: '10000.00',
      retencion_fondo_garantia: '0.00',
      amortizacion_anticipo: '0.00',
      iva: '1600.00',
      total_neto: '11600.00',
      estado: 'APROBADA_FINANCIERA',
      elaborado_por_id: userId,
      elaborado_por_nombre: 'Residente Integracion',
      notas: 'Pendiente de pago.',
    },
  });

  const presupuesto = await finanzasPrisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-PAGO-${Date.now()}`,
      descripcion: 'Presupuesto para pago de estimacion',
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
      concepto: `Estimacion ${estimacion.codigo}`,
      beneficiario: 'Constructora (Self)',
      monto_programado: 11600,
      fecha_programada: new Date('2026-03-20'),
      estado: 'PENDIENTE',
      referencia_modulo: 'control-obra',
      referencia_entidad: 'Estimacion',
      referencia_id: estimacion.id_estimacion,
    },
  });

  return {
    tenantId,
    proyectoId,
    userId,
    estimacionId: estimacion.id_estimacion,
    pagoId: pago.id_pago,
  };
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.CONTROL_OBRA_DATABASE_URL = controlObraDbUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const finanzasModule = await import('../../../finanzas/src/main');
  const seeded = await seedScenario();
  const consumer = createEventBus(`control-obra-it-${randomUUID()}`);
  const publisher = createEventBus(`finanzas-publisher-it-${randomUUID()}`);

  let finanzasServer: import('node:http').Server | undefined;
  let finanzasBaseUrl = '';

  try {
    await finanzasModule.initEventBus();
    await consumer.connect();
    await publisher.connect();
    await consumer.subscribe('finanzas.pago_registrado', handlePagoRegistradoEvent);

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
        referencia_bancaria: 'TRX-123456',
        metodo_pago: 'TRANSFERENCIA',
        banco: 'BBVA',
      }),
    });

    assert.equal(response.status, 200);

    await waitFor(async () => {
      const estimacion = await controlPrisma.estimacion.findUniqueOrThrow({
        where: { id_estimacion: seeded.estimacionId },
      });

      assert.equal(estimacion.estado, 'FACTURADA');
      assert.ok(estimacion.notas?.includes(seeded.pagoId));
    });

    const afterFirst = await controlPrisma.estimacion.findUniqueOrThrow({
      where: { id_estimacion: seeded.estimacionId },
    });

    await publisher.publish({
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
        referencia_id: seeded.estimacionId,
        concepto: afterFirst.codigo,
        beneficiario: 'Constructora (Self)',
      },
    });

    await waitFor(async () => {
      const estimacion = await controlPrisma.estimacion.findUniqueOrThrow({
        where: { id_estimacion: seeded.estimacionId },
      });

      assert.equal(estimacion.estado, 'FACTURADA');
      assert.equal(estimacion.notas, afterFirst.notas);
    });
    await delay(500);

    console.log('ok - ciclo completo finanzas.pago_registrado -> control-obra cierra estimacion pagada');
  } finally {
    await stopHttpApp(finanzasServer);
    await publisher.close();
    await consumer.close();
    await finanzasModule.shutdownEventBus();
    await cleanupTenantData(seeded.tenantId);
    await controlPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion finanzas.pago_registrado -> control-obra');
  console.error(error);
  process.exitCode = 1;
});
