import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import type {
  CfdiSatValidadoPayload,
  ConciliarCfdiRequest,
  SolicitudValidacionSatPayload,
} from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

type SolicitudSatApiResponse = {
  success: boolean;
  data: {
    id_asiento: string;
    pago_id?: string;
    id_conciliacion: string;
    uuid_fiscal: string;
    estatus_sat: string;
    callback_path: string;
    callback_method: string;
    queued: boolean;
  };
};

type SatApiResponse = {
  success: boolean;
  data: {
    id_asiento: string;
    pago_id?: string;
    id_conciliacion: string;
    uuid_fiscal: string;
    estatus_sat: string;
    cfdi_status: string;
    estatus_asiento: string;
    idempotente: boolean;
    fuente?: string;
  };
};

type SeededScenario = {
  tenantId: string;
  proyectoId: string;
  userId: string;
  pagoId: string;
  monto: number;
  referenciaBancaria: string;
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
  await contabilidadPrisma.conciliacionBancaria.deleteMany({ where: { tenant_id: tenantId } });
  await contabilidadPrisma.conciliacionFiscal.deleteMany({ where: { tenant_id: tenantId } });
  await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedScenario(prefix: string, monto = 9600): Promise<SeededScenario> {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const referenciaBancaria = `TRX-${prefix}-${Date.now()}`;

  const presupuesto = await finanzasPrisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-${prefix}-${Date.now()}`,
      descripcion: `Presupuesto ${prefix}`,
      monto_autorizado: monto + 5000,
      monto_disponible: 5000,
      monto_comprometido: monto,
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
      concepto: `Pago ${prefix}`,
      beneficiario: `Proveedor ${prefix}`,
      monto_programado: monto,
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
    monto,
    referenciaBancaria,
  };
}

async function pagarEnFinanzas(finanzasBaseUrl: string, token: string, pagoId: string, referenciaBancaria: string) {
  const pagarResponse = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/pagos/${pagoId}/pagar`, {
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

  assert.equal(pagarResponse.status, 200);
}

async function conciliarCfdi(contabilidadBaseUrl: string, token: string, asientoId: string, monto: number, uuidFiscal: string) {
  const payload: ConciliarCfdiRequest = {
    uuid_fiscal: uuidFiscal,
    serie: 'A',
    folio: '3001',
    rfc_emisor: 'AAA010101AAA',
    rfc_receptor: 'BBB010101BBB',
    monto_total: monto,
    moneda: 'MXN',
    fecha_emision: new Date('2026-03-18T10:00:00.000Z').toISOString(),
    fecha_timbrado: new Date('2026-03-18T10:05:00.000Z').toISOString(),
    fuente: 'SAT_CAPTURE',
    notas: 'CFDI listo para validacion asincrona.',
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

async function runScenario(
  finanzasBaseUrl: string,
  contabilidadBaseUrl: string,
  satRequestEvents: BocamEvent<SolicitudValidacionSatPayload>[],
  satValidatedEvents: BocamEvent<CfdiSatValidadoPayload>[],
  status: 'VIGENTE' | 'CANCELADO'
) {
  const seeded = await seedScenario(`SATASYNC-${status}`, status === 'VIGENTE' ? 13200 : 8400);
  const token = signTenantToken({
    userId: seeded.userId,
    tenantId: seeded.tenantId,
    proyectoId: seeded.proyectoId,
    roles: ['finance'],
    projects: [seeded.proyectoId],
    limiteAprobacion: 999999999,
  });

  await pagarEnFinanzas(finanzasBaseUrl, token, seeded.pagoId, seeded.referenciaBancaria);

  let asientoId = '';
  let conciliacionFiscalId = '';

  await waitFor(async () => {
    const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        pago_id: seeded.pagoId,
      },
    });

    const fiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        pago_id: seeded.pagoId,
      },
    });

    asientoId = asiento.id_asiento;
    conciliacionFiscalId = fiscal.id_conciliacion;
  });

  const uuidFiscal = `CFDI-${status}-${randomUUID()}`;
  await conciliarCfdi(contabilidadBaseUrl, token, asientoId, seeded.monto, uuidFiscal);

  const requestResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${conciliacionFiscalId}/validar-sat-externo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Correlation-Id': `corr-sat-${seeded.pagoId}`,
    },
    body: JSON.stringify({}),
  });

  assert.equal(requestResponse.status, 202);
  const requestBody = await requestResponse.json() as SolicitudSatApiResponse;
  assert.equal(requestBody.success, true);
  assert.equal(requestBody.data.id_conciliacion, conciliacionFiscalId);
  assert.equal(requestBody.data.estatus_sat, 'VALIDACION_EN_PROCESO');
  assert.equal(requestBody.data.queued, true);

  await waitFor(async () => {
    const fiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        id_conciliacion: conciliacionFiscalId,
      },
    });

    assert.equal(fiscal.estatus_sat, 'VALIDACION_EN_PROCESO');
    assert.equal(fiscal.fuente, 'SAT_ASYNC_REQUEST');
  });

  await waitFor(async () => {
    const satRequestEvent = satRequestEvents.find((event) => event.payload.id_conciliacion === conciliacionFiscalId);
    assert.ok(satRequestEvent);

    const callbackResponse = await fetch(`${contabilidadBaseUrl}${satRequestEvent!.payload.callback_path}`, {
      method: satRequestEvent!.payload.callback_method,
      headers: {
        'Content-Type': 'application/json',
        'X-Bocam-Secret': process.env.SAT_CALLBACK_SHARED_SECRET!,
        'X-Correlation-Id': `corr-worker-${seeded.pagoId}`,
      },
      body: JSON.stringify({
        tenant_id: satRequestEvent!.context.tenant_id,
        proyecto_id: satRequestEvent!.context.proyecto_id,
        user_id: satRequestEvent!.context.user_id,
        id_conciliacion: satRequestEvent!.payload.id_conciliacion,
        estatus_sat: status,
        fecha_validacion_sat: new Date('2026-03-19T10:00:00.000Z').toISOString(),
        fecha_cancelacion_sat: status === 'CANCELADO'
          ? new Date('2026-03-19T10:05:00.000Z').toISOString()
          : undefined,
        fuente: 'N8N_SAT_WORKER',
        mensaje_sat: status === 'CANCELADO'
          ? 'Worker SAT reporta CFDI cancelado.'
          : 'Worker SAT reporta CFDI vigente.',
        provider_reference: `SATREF-${satRequestEvent!.payload.uuid_fiscal.slice(0, 8)}`,
      }),
    });

    assert.equal(callbackResponse.status, 200);
    const callbackBody = await callbackResponse.json() as SatApiResponse;
    assert.equal(callbackBody.success, true);
    assert.equal(callbackBody.data.estatus_sat, status);
    assert.equal(callbackBody.data.uuid_fiscal, uuidFiscal);
    assert.equal(callbackBody.data.fuente, 'N8N_SAT_WORKER');
  });

  await waitFor(async () => {
    const fiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        id_conciliacion: conciliacionFiscalId,
      },
    });

    const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        id_asiento: asientoId,
      },
    });

    assert.equal(fiscal.estatus_sat, status);
    assert.equal(fiscal.fuente, 'N8N_SAT_WORKER');
    assert.ok(fiscal.mensaje_sat);

    if (status === 'VIGENTE') {
      assert.equal(asiento.cfdi_status, 'SAT_VIGENTE');
    } else {
      assert.equal(asiento.cfdi_status, 'SAT_CANCELADO');
      assert.equal(asiento.estatus, 'OBSERVADO');
    }
  });

  await waitFor(async () => {
    assert.ok(satValidatedEvents.some((event) =>
      event.payload.id_conciliacion === conciliacionFiscalId &&
      event.payload.estatus_sat === status
    ));
  });

  await cleanupTenantData(seeded.tenantId);
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
  process.env.SAT_CALLBACK_SHARED_SECRET = 'sat-callback-secret';
  process.env.SAT_ADAPTER_API_KEY = 'sat-callback-secret';

  const finanzasModule = await import('../../../finanzas/src/main');
  const contabilidadModule = await import('../../src/main');
  const probe = createEventBus(`contabilidad-probe-${randomUUID()}`);

  let finanzasServer: import('node:http').Server | undefined;
  let contabilidadServer: import('node:http').Server | undefined;
  const satRequestEvents: BocamEvent<SolicitudValidacionSatPayload>[] = [];
  const satValidatedEvents: BocamEvent<CfdiSatValidadoPayload>[] = [];

  try {
    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();
    await probe.connect();
    await probe.subscribe('contabilidad.cfdi_sat_validacion_solicitada', async (event: BocamEvent<SolicitudValidacionSatPayload>) => {
      satRequestEvents.push(event);
    });
    await probe.subscribe('contabilidad.cfdi_sat_validado', async (event: BocamEvent<CfdiSatValidadoPayload>) => {
      satValidatedEvents.push(event);
    });

    const finanzasStarted = await startHttpApp(finanzasModule.app);
    finanzasServer = finanzasStarted.server;

    const contabilidadStarted = await startHttpApp(contabilidadModule.app);
    contabilidadServer = contabilidadStarted.server;
    await delay(500);

    await runScenario(finanzasStarted.baseUrl, contabilidadStarted.baseUrl, satRequestEvents, satValidatedEvents, 'VIGENTE');
    await runScenario(finanzasStarted.baseUrl, contabilidadStarted.baseUrl, satRequestEvents, satValidatedEvents, 'CANCELADO');

    console.log('ok - integracion real contabilidad solicita SAT por evento y aplica callback externo');
  } finally {
    await stopHttpApp(contabilidadServer);
    await stopHttpApp(finanzasServer);
    await probe.close();
    await contabilidadModule.shutdownEventBus();
    await finanzasModule.shutdownEventBus();
    await contabilidadPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion contabilidad SAT async por evento/callback');
  console.error(error);
  process.exitCode = 1;
});
