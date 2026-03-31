import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import type { AsientoContableGeneradoPayload, CfdiConciliadoPayload } from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

type CfdiApiResponse = {
  success: boolean;
  data: {
    id_asiento: string;
    pago_id?: string;
    id_conciliacion: string;
    uuid_fiscal: string;
    estatus_fiscal: string;
    cfdi_status: string;
    idempotente: boolean;
  };
};

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
  await contabilidadPrisma.conciliacionFiscal.deleteMany({ where: { tenant_id: tenantId } });
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
      codigo: `PRES-CFDI-${Date.now()}`,
      descripcion: 'Presupuesto para conciliacion fiscal',
      monto_autorizado: 15000,
      monto_disponible: 4200,
      monto_comprometido: 10800,
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
      concepto: 'Pago fiscal conciliable',
      beneficiario: 'Proveedor Fiscal SA de CV',
      monto_programado: 10800,
      fecha_programada: new Date('2026-03-21'),
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

  let finanzasServer: import('node:http').Server | undefined;
  let contabilidadServer: import('node:http').Server | undefined;
  let finanzasBaseUrl = '';
  let contabilidadBaseUrl = '';
  const generatedEvents: BocamEvent<AsientoContableGeneradoPayload>[] = [];
  const fiscalEvents: BocamEvent<CfdiConciliadoPayload>[] = [];

  try {
    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();
    await probe.connect();
    await probe.subscribe('contabilidad.asiento_contable_generado', async (event: BocamEvent<AsientoContableGeneradoPayload>) => {
      generatedEvents.push(event);
    });
    await probe.subscribe('contabilidad.cfdi_conciliado', async (event: BocamEvent<CfdiConciliadoPayload>) => {
      fiscalEvents.push(event);
    });

    const finanzasStarted = await startHttpApp(finanzasModule.app);
    finanzasServer = finanzasStarted.server;
    finanzasBaseUrl = finanzasStarted.baseUrl;

    const contabilidadStarted = await startHttpApp(contabilidadModule.app);
    contabilidadServer = contabilidadStarted.server;
    contabilidadBaseUrl = contabilidadStarted.baseUrl;
    await delay(500);

    const token = signTenantToken({
      userId: seeded.userId,
      tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId,
      roles: ['finance'],
      projects: [seeded.proyectoId],
      limiteAprobacion: 999999999,
    });

    const pagarResponse = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/pagos/${seeded.pagoId}/pagar`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referencia_bancaria: 'TRX-CFDI-123456',
        metodo_pago: 'TRANSFERENCIA',
        banco: 'BBVA',
      }),
    });

    assert.equal(pagarResponse.status, 200);

    let asientoId = '';
    await waitFor(async () => {
      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: seeded.tenantId,
          pago_id: seeded.pagoId,
        },
      });

      asientoId = asiento.id_asiento;
      assert.equal(asiento.tipo_poliza, 'EGRESO');
      assert.equal(asiento.cfdi_status, 'PENDIENTE');
    });

    await waitFor(async () => {
      const conciliacion = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
        where: {
          tenant_id: seeded.tenantId,
          pago_id: seeded.pagoId,
        },
      });

      assert.equal(conciliacion.estatus_fiscal, 'PENDIENTE_CFDI');
      assert.equal(Number(conciliacion.monto_pagado), 10800);
    });

    await waitFor(async () => {
      const tenantEvents = generatedEvents.filter((event) => event.context.tenant_id === seeded.tenantId);
      assert.equal(tenantEvents.length, 1);
    });

    const conciliarResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/asientos/${asientoId}/conciliar-cfdi`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid_fiscal: `CFDI-${randomUUID()}`,
        serie: 'A',
        folio: '1001',
        rfc_emisor: 'AAA010101AAA',
        rfc_receptor: 'BBB010101BBB',
        monto_total: 10800,
        moneda: 'MXN',
        fecha_emision: new Date('2026-03-18T10:00:00.000Z').toISOString(),
        fecha_timbrado: new Date('2026-03-18T10:05:00.000Z').toISOString(),
        fuente: 'SAT_MOCK',
        notas: 'CFDI conciliado en integracion.',
      }),
    });

    assert.equal(conciliarResponse.status, 200);
    const conciliarPayload = await conciliarResponse.json() as CfdiApiResponse;
    assert.equal(conciliarPayload.success, true);
    assert.equal(conciliarPayload.data.cfdi_status, 'CONCILIADO');
    assert.equal(conciliarPayload.data.estatus_fiscal, 'CONCILIADO');

    await waitFor(async () => {
      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: seeded.tenantId,
          id_asiento: asientoId,
        },
      });

      const conciliacion = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
        where: {
          tenant_id: seeded.tenantId,
          asiento_id: asientoId,
        },
      });

      assert.equal(asiento.cfdi_status, 'CONCILIADO');
      assert.match(asiento.notas || '', /CFDI conciliado/);
      assert.equal(conciliacion.estatus_fiscal, 'CONCILIADO');
      assert.ok(conciliacion.uuid_fiscal);
      assert.ok(conciliacion.fecha_conciliacion);
    });

    await waitFor(async () => {
      const tenantEvents = fiscalEvents.filter((event) => event.context.tenant_id === seeded.tenantId);
      assert.equal(tenantEvents.length, 1);
      assert.equal(tenantEvents[0]?.payload.id_asiento, asientoId);
      assert.equal(tenantEvents[0]?.payload.pago_id, seeded.pagoId);
      assert.equal(tenantEvents[0]?.payload.cfdi_status, 'CONCILIADO');
    });

    const secondResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/asientos/${asientoId}/conciliar-cfdi`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid_fiscal: conciliarPayload.data.uuid_fiscal,
        serie: 'A',
        folio: '1001',
        rfc_emisor: 'AAA010101AAA',
        rfc_receptor: 'BBB010101BBB',
        monto_total: 10800,
        moneda: 'MXN',
        fecha_emision: new Date('2026-03-18T10:00:00.000Z').toISOString(),
      }),
    });

    assert.equal(secondResponse.status, 200);
    const secondPayload = await secondResponse.json() as CfdiApiResponse;
    assert.equal(secondPayload.data.idempotente, true);
    assert.equal(fiscalEvents.filter((event) => event.context.tenant_id === seeded.tenantId).length, 1);
    console.log('ok - integracion real finanzas.pago_registrado -> contabilidad concilia CFDI y cierra estatus fiscal');
  } finally {
    await stopHttpApp(contabilidadServer);
    await stopHttpApp(finanzasServer);
    await probe.close();
    await contabilidadModule.shutdownEventBus();
    await finanzasModule.shutdownEventBus();
    await cleanupTenantData(seeded.tenantId);
    await contabilidadPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion finanzas.pago_registrado -> contabilidad CFDI');
  console.error(error);
  process.exitCode = 1;
});
