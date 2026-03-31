import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import type {
  ConciliarBancoLoteRequest,
  ConciliarCfdiRequest,
  ValidarSatRequest,
  ConciliacionBancariaPayload,
} from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const finanzasDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
const contabilidadDbUrl = finanzasDbUrl.includes('schema=finanzas')
  ? finanzasDbUrl.replace('schema=finanzas', 'schema=contabilidad')
  : 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';

const finanzasPrisma = new FinanzasPrismaClient({
  datasources: { db: { url: finanzasDbUrl } },
});

const contabilidadPrisma = new ContabilidadPrismaClient({
  datasources: { db: { url: contabilidadDbUrl } },
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
  await contabilidadPrisma.conciliacionBancaria.deleteMany({ where: { tenant_id: tenantId } });
  await contabilidadPrisma.conciliacionFiscal.deleteMany({ where: { tenant_id: tenantId } });
  await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedPago(
  tenantId: string,
  proyectoId: string,
  label: string,
  monto: number,
) {
  const presupuesto = await finanzasPrisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-${label}-${Date.now()}`,
      descripcion: `Presupuesto ${label}`,
      monto_autorizado: monto + 10000,
      monto_disponible: 10000,
      monto_comprometido: monto,
      monto_ejercido: 0,
      capitulo: 'SUBCONTRATOS',
      moneda: 'MXN',
      estatus: 'ACTIVO',
    },
  });

  return await finanzasPrisma.programaPagos.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      presupuesto_id: presupuesto.id_presupuesto,
      concepto: `Pago ${label}`,
      beneficiario: `Proveedor ${label}`,
      monto_programado: monto,
      fecha_programada: new Date('2026-03-22'),
      estado: 'PENDIENTE',
      referencia_modulo: 'control-obra',
      referencia_entidad: 'Estimacion',
      referencia_id: randomUUID(),
    },
  });
}

async function pagar(finanzasBaseUrl: string, token: string, pagoId: string, referenciaBancaria: string) {
  const response = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/pagos/${pagoId}/pagar`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      referencia_bancaria: referenciaBancaria,
      metodo_pago: 'TRANSFERENCIA',
      banco: 'BBVA',
    }),
  });
  assert.equal(response.status, 200);
}

async function conciliarCfdi(contabilidadBaseUrl: string, token: string, asientoId: string, monto: number) {
  const payload: ConciliarCfdiRequest = {
    uuid_fiscal: `CFDI-${randomUUID()}`,
    serie: 'B',
    folio: '3001',
    rfc_emisor: 'AAA010101AAA',
    rfc_receptor: 'BBB010101BBB',
    monto_total: monto,
    moneda: 'MXN',
    fecha_emision: new Date('2026-03-18T10:00:00.000Z').toISOString(),
    fecha_timbrado: new Date('2026-03-18T10:05:00.000Z').toISOString(),
    fuente: 'SAT_MOCK',
  };

  const response = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/asientos/${asientoId}/conciliar-cfdi`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 200);
}

async function validarSat(contabilidadBaseUrl: string, token: string, conciliacionId: string) {
  const payload: ValidarSatRequest = {
    estatus_sat: 'VIGENTE',
    fecha_validacion_sat: new Date('2026-03-18T12:00:00.000Z').toISOString(),
    fuente: 'SAT_MOCK',
    mensaje_sat: 'CFDI vigente para lote bancario.',
  };

  const response = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${conciliacionId}/validar-sat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 200);
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const pago1Ref = `TRX-LOTE-A-${Date.now()}`;
  const pago2Ref = `TRX-LOTE-B-${Date.now()}`;
  const pago1Monto = 5400;
  const pago2Monto = 8900;

  const finanzasModule = await import('../../../finanzas/src/main');
  const contabilidadModule = await import('../../src/main');
  const probe = createEventBus(`contabilidad-probe-${randomUUID()}`);

  let finanzasServer: import('node:http').Server | undefined;
  let contabilidadServer: import('node:http').Server | undefined;
  const bankEvents: BocamEvent<ConciliacionBancariaPayload>[] = [];

  try {
    const pago1 = await seedPago(tenantId, proyectoId, 'LOTE-A', pago1Monto);
    const pago2 = await seedPago(tenantId, proyectoId, 'LOTE-B', pago2Monto);

    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();
    await probe.connect();
    await probe.subscribe('contabilidad.conciliacion_bancaria_actualizada', async (event: BocamEvent<ConciliacionBancariaPayload>) => {
      bankEvents.push(event);
    });

    const finanzasStarted = await startHttpApp(finanzasModule.app);
    finanzasServer = finanzasStarted.server;
    const contabilidadStarted = await startHttpApp(contabilidadModule.app);
    contabilidadServer = contabilidadStarted.server;
    await delay(500);

    const token = signTenantToken({
      userId,
      tenantId,
      proyectoId,
      roles: ['finance'],
      projects: [proyectoId],
      limiteAprobacion: 999999999,
    });

    await pagar(finanzasStarted.baseUrl, token, pago1.id_pago, pago1Ref);
    await pagar(finanzasStarted.baseUrl, token, pago2.id_pago, pago2Ref);

    let asiento1Id = '';
    let asiento2Id = '';
    let conciliacionFiscal1Id = '';
    let conciliacionFiscal2Id = '';

    await waitFor(async () => {
      const asiento1 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago1.id_pago } });
      const asiento2 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago2.id_pago } });
      const fiscal1 = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago1.id_pago } });
      const fiscal2 = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago2.id_pago } });

      asiento1Id = asiento1.id_asiento;
      asiento2Id = asiento2.id_asiento;
      conciliacionFiscal1Id = fiscal1.id_conciliacion;
      conciliacionFiscal2Id = fiscal2.id_conciliacion;
    });

    await conciliarCfdi(contabilidadStarted.baseUrl, token, asiento1Id, pago1Monto);
    await conciliarCfdi(contabilidadStarted.baseUrl, token, asiento2Id, pago2Monto);
    await validarSat(contabilidadStarted.baseUrl, token, conciliacionFiscal1Id);
    await validarSat(contabilidadStarted.baseUrl, token, conciliacionFiscal2Id);

    const lotePayload: ConciliarBancoLoteRequest = {
      lote_id: `LOTE-ESTADO-${Date.now()}`,
      items: [
        {
          referencia_lote: 'estado-1',
          referencia_bancaria: pago1Ref,
          monto_banco: pago1Monto,
          moneda: 'MXN',
          fecha_movimiento_bancario: new Date('2026-03-18T13:00:00.000Z').toISOString(),
          banco: 'BBVA',
          metodo_pago: 'TRANSFERENCIA',
          fuente: 'ESTADO_CUENTA_LOTE',
        },
        {
          referencia_lote: 'estado-2',
          id_asiento: asiento2Id,
          referencia_bancaria: pago2Ref,
          monto_banco: pago2Monto,
          moneda: 'MXN',
          fecha_movimiento_bancario: new Date('2026-03-18T13:05:00.000Z').toISOString(),
          banco: 'BBVA',
          metodo_pago: 'TRANSFERENCIA',
          fuente: 'ESTADO_CUENTA_LOTE',
        },
        {
          referencia_lote: 'estado-error',
          referencia_bancaria: 'TRX-NO-EXISTE',
          monto_banco: 1000,
          moneda: 'MXN',
          fecha_movimiento_bancario: new Date('2026-03-18T13:10:00.000Z').toISOString(),
        },
      ],
    };

    const loteResponse = await fetch(`${contabilidadStarted.baseUrl}/api/v1/contabilidad/conciliaciones-bancarias/lote`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lotePayload),
    });

    assert.equal(loteResponse.status, 200);
    const loteBody = await loteResponse.json() as {
      success: boolean;
      data: {
        lote_id: string;
        total_items: number;
        success_count: number;
        failure_count: number;
        results: Array<Record<string, unknown>>;
      };
    };

    assert.equal(loteBody.success, true);
    assert.equal(loteBody.data.total_items, 3);
    assert.equal(loteBody.data.success_count, 2);
    assert.equal(loteBody.data.failure_count, 1);

    await waitFor(async () => {
      const asiento1 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, id_asiento: asiento1Id } });
      const asiento2 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, id_asiento: asiento2Id } });
      const banco1 = await contabilidadPrisma.conciliacionBancaria.findFirstOrThrow({ where: { tenant_id: tenantId, asiento_id: asiento1Id } });
      const banco2 = await contabilidadPrisma.conciliacionBancaria.findFirstOrThrow({ where: { tenant_id: tenantId, asiento_id: asiento2Id } });

      assert.equal(asiento1.estatus, 'CERRADO');
      assert.equal(asiento2.estatus, 'CERRADO');
      assert.equal(asiento1.bancario_status, 'CONCILIADO');
      assert.equal(asiento2.bancario_status, 'CONCILIADO');
      assert.equal(banco1.estatus_bancario, 'CONCILIADO');
      assert.equal(banco2.estatus_bancario, 'CONCILIADO');
    });

    await waitFor(async () => {
      const tenantEvents = bankEvents.filter((event) => event.context.tenant_id === tenantId);
      assert.equal(tenantEvents.length, 2);
    });

    const failedItem = loteBody.data.results.find((item) => item.success === false);
    assert.ok(failedItem);
    assert.equal(failedItem?.code, 'ASIENTO_NOT_FOUND');

    console.log('ok - integracion real contabilidad concilia banco por lote con exito parcial');
  } finally {
    await stopHttpApp(contabilidadServer);
    await stopHttpApp(finanzasServer);
    await probe.close();
    await contabilidadModule.shutdownEventBus();
    await finanzasModule.shutdownEventBus();
    await cleanupTenantData(tenantId);
    await contabilidadPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion contabilidad conciliacion bancaria por lote');
  console.error(error);
  process.exitCode = 1;
});
