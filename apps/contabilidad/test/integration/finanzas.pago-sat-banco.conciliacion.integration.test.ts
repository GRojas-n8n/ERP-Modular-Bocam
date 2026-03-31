import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import type {
  CfdiSatValidadoPayload,
  ConciliacionBancariaPayload,
  ConciliarBancoRequest,
  ConciliarCfdiRequest,
  ValidarSatRequest,
} from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

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
  };
};

type BancoApiResponse = {
  success: boolean;
  data: {
    id_asiento: string;
    pago_id?: string;
    id_conciliacion_bancaria: string;
    referencia_bancaria?: string;
    estatus_bancario: string;
    bancario_status: string;
    estatus_asiento: string;
    idempotente: boolean;
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

async function conciliarCfdi(contabilidadBaseUrl: string, token: string, asientoId: string, monto: number) {
  const payload: ConciliarCfdiRequest = {
    uuid_fiscal: `CFDI-${randomUUID()}`,
    serie: 'A',
    folio: '2001',
    rfc_emisor: 'AAA010101AAA',
    rfc_receptor: 'BBB010101BBB',
    monto_total: monto,
    moneda: 'MXN',
    fecha_emision: new Date('2026-03-18T10:00:00.000Z').toISOString(),
    fecha_timbrado: new Date('2026-03-18T10:05:00.000Z').toISOString(),
    fuente: 'SAT_MOCK',
    notas: 'CFDI conciliado para prueba SAT/Banco.',
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

async function runVigenteScenario(
  finanzasBaseUrl: string,
  contabilidadBaseUrl: string,
  satEvents: BocamEvent<CfdiSatValidadoPayload>[],
  bancoEvents: BocamEvent<ConciliacionBancariaPayload>[]
) {
  const seeded = await seedScenario('SATVIGENTE', 12800);
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

    const conciliacionFiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        pago_id: seeded.pagoId,
      },
    });

    const conciliacionBancaria = await contabilidadPrisma.conciliacionBancaria.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        pago_id: seeded.pagoId,
      },
    });

    asientoId = asiento.id_asiento;
    conciliacionFiscalId = conciliacionFiscal.id_conciliacion;
    assert.equal(asiento.cfdi_status, 'PENDIENTE');
    assert.equal(asiento.bancario_status, 'PENDIENTE');
    assert.equal(conciliacionFiscal.estatus_sat, 'PENDIENTE_VALIDACION');
    assert.equal(conciliacionBancaria.estatus_bancario, 'PENDIENTE_MOVIMIENTO');
    assert.equal(conciliacionBancaria.referencia_bancaria, seeded.referenciaBancaria);
  });

  await conciliarCfdi(contabilidadBaseUrl, token, asientoId, seeded.monto);

  const satPayload: ValidarSatRequest = {
    estatus_sat: 'VIGENTE',
    fecha_validacion_sat: new Date('2026-03-18T12:00:00.000Z').toISOString(),
    fuente: 'SAT_MOCK',
    mensaje_sat: 'CFDI vigente en consulta SAT.',
    notas: 'SAT confirma vigencia.',
  };

  const satResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${conciliacionFiscalId}/validar-sat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(satPayload),
  });

  assert.equal(satResponse.status, 200);
  const satBody = await satResponse.json() as SatApiResponse;
  assert.equal(satBody.data.estatus_sat, 'VIGENTE');
  assert.equal(satBody.data.cfdi_status, 'SAT_VIGENTE');

  const bancoPayload: ConciliarBancoRequest = {
    referencia_bancaria: seeded.referenciaBancaria,
    banco: 'BBVA',
    metodo_pago: 'TRANSFERENCIA',
    monto_banco: seeded.monto,
    moneda: 'MXN',
    fecha_movimiento_bancario: new Date('2026-03-18T13:00:00.000Z').toISOString(),
    fuente: 'ESTADO_CUENTA',
    notas: 'Movimiento confirmado en estado de cuenta.',
  };

  const bancoResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/asientos/${asientoId}/conciliar-banco`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bancoPayload),
  });

  assert.equal(bancoResponse.status, 200);
  const bancoBody = await bancoResponse.json() as BancoApiResponse;
  assert.equal(bancoBody.data.estatus_bancario, 'CONCILIADO');
  assert.equal(bancoBody.data.bancario_status, 'CONCILIADO');
  assert.equal(bancoBody.data.estatus_asiento, 'CERRADO');

  await waitFor(async () => {
    const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        id_asiento: asientoId,
      },
    });

    const fiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        id_conciliacion: conciliacionFiscalId,
      },
    });

    const bancaria = await contabilidadPrisma.conciliacionBancaria.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        asiento_id: asientoId,
      },
    });

    assert.equal(asiento.cfdi_status, 'SAT_VIGENTE');
    assert.equal(asiento.bancario_status, 'CONCILIADO');
    assert.equal(asiento.estatus, 'CERRADO');
    assert.ok(asiento.conciliado_at);
    assert.equal(fiscal.estatus_sat, 'VIGENTE');
    assert.equal(bancaria.estatus_bancario, 'CONCILIADO');
    assert.equal(bancaria.referencia_bancaria, seeded.referenciaBancaria);
  });

  await waitFor(async () => {
    assert.ok(satEvents.some((event) => event.payload.id_asiento === asientoId && event.payload.estatus_sat === 'VIGENTE'));
    assert.ok(bancoEvents.some((event) => event.payload.id_asiento === asientoId && event.payload.estatus_bancario === 'CONCILIADO'));
  });

  const secondBancoResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/asientos/${asientoId}/conciliar-banco`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bancoPayload),
  });

  assert.equal(secondBancoResponse.status, 200);
  const secondBancoBody = await secondBancoResponse.json() as BancoApiResponse;
  assert.equal(secondBancoBody.data.idempotente, true);

  await cleanupTenantData(seeded.tenantId);
}

async function runCanceladoScenario(
  finanzasBaseUrl: string,
  contabilidadBaseUrl: string,
  satEvents: BocamEvent<CfdiSatValidadoPayload>[]
) {
  const seeded = await seedScenario('SATCANCELADO', 7800);
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

    const conciliacionFiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        pago_id: seeded.pagoId,
      },
    });

    asientoId = asiento.id_asiento;
    conciliacionFiscalId = conciliacionFiscal.id_conciliacion;
  });

  await conciliarCfdi(contabilidadBaseUrl, token, asientoId, seeded.monto);

  const satPayload: ValidarSatRequest = {
    estatus_sat: 'CANCELADO',
    fecha_validacion_sat: new Date('2026-03-18T14:00:00.000Z').toISOString(),
    fecha_cancelacion_sat: new Date('2026-03-18T14:05:00.000Z').toISOString(),
    fuente: 'SAT_MOCK',
    mensaje_sat: 'CFDI aparece cancelado en SAT.',
    notas: 'SAT reporta cancelacion.',
  };

  const satResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${conciliacionFiscalId}/validar-sat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(satPayload),
  });

  assert.equal(satResponse.status, 200);
  const satBody = await satResponse.json() as SatApiResponse;
  assert.equal(satBody.data.estatus_sat, 'CANCELADO');
  assert.equal(satBody.data.cfdi_status, 'SAT_CANCELADO');
  assert.equal(satBody.data.estatus_asiento, 'OBSERVADO');

  await waitFor(async () => {
    const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        id_asiento: asientoId,
      },
    });

    const fiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        id_conciliacion: conciliacionFiscalId,
      },
    });

    const bancaria = await contabilidadPrisma.conciliacionBancaria.findFirstOrThrow({
      where: {
        tenant_id: seeded.tenantId,
        asiento_id: asientoId,
      },
    });

    assert.equal(asiento.cfdi_status, 'SAT_CANCELADO');
    assert.equal(asiento.estatus, 'OBSERVADO');
    assert.equal(asiento.bancario_status, 'PENDIENTE');
    assert.equal(fiscal.estatus_sat, 'CANCELADO');
    assert.ok(fiscal.fecha_cancelacion_sat);
    assert.equal(bancaria.estatus_bancario, 'PENDIENTE_MOVIMIENTO');
  });

  await waitFor(async () => {
    assert.ok(satEvents.some((event) => event.payload.id_asiento === asientoId && event.payload.estatus_sat === 'CANCELADO'));
  });

  await cleanupTenantData(seeded.tenantId);
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const finanzasModule = await import('../../../finanzas/src/main');
  const contabilidadModule = await import('../../src/main');
  const probe = createEventBus(`contabilidad-probe-${randomUUID()}`);

  let finanzasServer: import('node:http').Server | undefined;
  let contabilidadServer: import('node:http').Server | undefined;
  const satEvents: BocamEvent<CfdiSatValidadoPayload>[] = [];
  const bancoEvents: BocamEvent<ConciliacionBancariaPayload>[] = [];

  try {
    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();
    await probe.connect();
    await probe.subscribe('contabilidad.cfdi_sat_validado', async (event: BocamEvent<CfdiSatValidadoPayload>) => {
      satEvents.push(event);
    });
    await probe.subscribe('contabilidad.conciliacion_bancaria_actualizada', async (event: BocamEvent<ConciliacionBancariaPayload>) => {
      bancoEvents.push(event);
    });

    const finanzasStarted = await startHttpApp(finanzasModule.app);
    finanzasServer = finanzasStarted.server;

    const contabilidadStarted = await startHttpApp(contabilidadModule.app);
    contabilidadServer = contabilidadStarted.server;
    await delay(500);

    await runVigenteScenario(finanzasStarted.baseUrl, contabilidadStarted.baseUrl, satEvents, bancoEvents);
    await runCanceladoScenario(finanzasStarted.baseUrl, contabilidadStarted.baseUrl, satEvents);

    console.log('ok - integracion real contabilidad valida SAT y enlaza conciliacion bancaria');
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
  console.error('not ok - integracion contabilidad SAT y conciliacion bancaria');
  console.error(error);
  process.exitCode = 1;
});
