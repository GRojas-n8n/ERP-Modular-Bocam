import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import * as amqplib from 'amqplib';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import type { ConciliarCfdiRequest } from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

type MonitorResponse = {
  success: boolean;
  data: {
    total: number;
    dlq_count: number;
    retrying_count: number;
    items: Array<{
      id_conciliacion: string;
      estatus_sat: string;
      sat_retry_count: number;
      sat_last_error?: string | null;
      sat_dlq_at?: string | null;
      sat_next_retry_at?: string | null;
    }>;
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

async function waitFor(assertion: () => Promise<void>, timeoutMs = 20000) {
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

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function createSatProvider() {
  const attemptCounters = new Map<string, number>();
  let mode: 'retry_then_success' | 'always_fail' = 'retry_then_success';

  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST' || req.url !== '/validate-cfdi') {
      res.statusCode = 404;
      res.end();
      return;
    }

    const body = await readJsonBody(req);
    const uuid = String(body.uuid_fiscal || '');
    const currentAttempt = (attemptCounters.get(uuid) || 0) + 1;
    attemptCounters.set(uuid, currentAttempt);

    if (mode === 'always_fail' || currentAttempt < 3) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: {
          code: 'SAT_PROVIDER_TEMPORARY_UNAVAILABLE',
          message: 'Proveedor SAT no disponible temporalmente.',
        },
      }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      data: {
        estatus_sat: 'VIGENTE',
        fecha_validacion_sat: new Date('2026-03-19T12:00:00.000Z').toISOString(),
        mensaje_sat: 'CFDI vigente desde worker SAT.',
        provider_reference: `SAT-${uuid.slice(0, 8)}`,
        fuente: 'SAT_PROVIDER_MOCK',
      },
    }));
  });

  return {
    server,
    setMode(nextMode: 'retry_then_success' | 'always_fail') {
      mode = nextMode;
    },
    attemptsFor(uuid: string) {
      return attemptCounters.get(uuid) || 0;
    },
  };
}

async function cleanupTenantData(tenantId: string) {
  await contabilidadPrisma.conciliacionBancaria.deleteMany({ where: { tenant_id: tenantId } });
  await contabilidadPrisma.conciliacionFiscal.deleteMany({ where: { tenant_id: tenantId } });
  await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedScenario(prefix: string, monto = 9100) {
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
      fecha_programada: new Date('2026-03-22'),
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

async function prepararConciliacion(finanzasBaseUrl: string, contabilidadBaseUrl: string, token: string, pagoId: string, referenciaBancaria: string, monto: number, tenantId: string) {
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

  let asientoId = '';
  let conciliacionId = '';

  await waitFor(async () => {
    const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
      where: {
        tenant_id: tenantId,
        pago_id: pagoId,
      },
    });
    const conciliacion = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
      where: {
        tenant_id: tenantId,
        pago_id: pagoId,
      },
    });

    asientoId = asiento.id_asiento;
    conciliacionId = conciliacion.id_conciliacion;
  });

  const uuidFiscal = `CFDI-WORKER-${randomUUID()}`;
  const payload: ConciliarCfdiRequest = {
    uuid_fiscal: uuidFiscal,
    serie: 'W',
    folio: '4401',
    rfc_emisor: 'AAA010101AAA',
    rfc_receptor: 'BBB010101BBB',
    monto_total: monto,
    moneda: 'MXN',
    fecha_emision: new Date('2026-03-19T09:00:00.000Z').toISOString(),
    fecha_timbrado: new Date('2026-03-19T09:05:00.000Z').toISOString(),
    fuente: 'SAT_CAPTURE',
    notas: 'CFDI listo para worker SAT.',
  };

  const cfdiResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/asientos/${asientoId}/conciliar-cfdi`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  assert.equal(cfdiResponse.status, 200);

  return {
    asientoId,
    conciliacionId,
    uuidFiscal,
  };
}

async function getMonitor(contabilidadBaseUrl: string, token: string, olderThanMinutes = 0) {
  const response = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/conciliaciones-fiscales/monitoreo/sat-pendientes?older_than_minutes=${olderThanMinutes}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 200);
  return await response.json() as MonitorResponse;
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
  process.env.SAT_CALLBACK_SHARED_SECRET = 'sat-worker-secret';
  process.env.SAT_ADAPTER_API_KEY = 'sat-worker-secret';
  process.env.SAT_WORKER_MAX_ATTEMPTS = '3';
  process.env.SAT_WORKER_RETRY_DELAY_MS = '300';
  process.env.CONTABILIDAD_SAT_WORKER_NAME = `contabilidad-sat-worker-${randomUUID()}`;
  process.env.CONTABILIDAD_SAT_WORKER_QUEUE = `${process.env.CONTABILIDAD_SAT_WORKER_NAME}.main`;
  process.env.CONTABILIDAD_SAT_WORKER_RETRY_QUEUE = `${process.env.CONTABILIDAD_SAT_WORKER_NAME}.retry`;
  process.env.CONTABILIDAD_SAT_WORKER_DLQ_QUEUE = `${process.env.CONTABILIDAD_SAT_WORKER_NAME}.dlq`;

  const satProvider = createSatProvider();
  let satProviderServer: http.Server | undefined;
  let finanzasServer: import('node:http').Server | undefined;
  let contabilidadServer: import('node:http').Server | undefined;
  let rabbitConnection: amqplib.ChannelModel | undefined;
  let rabbitChannel: amqplib.Channel | undefined;

  try {
    satProviderServer = await new Promise<http.Server>((resolve) => {
      const server = satProvider.server.listen(0, () => resolve(server));
    });

    const satProviderAddress = satProviderServer.address();
    if (!satProviderAddress || typeof satProviderAddress === 'string') {
      throw new Error('SAT_PROVIDER_ADDRESS_NOT_AVAILABLE');
    }

    process.env.SAT_ADAPTER_BASE_URL = `http://127.0.0.1:${satProviderAddress.port}`;

    const finanzasModule = await import('../../../finanzas/src/main');
    const contabilidadModule = await import('../../src/main');

    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();

    const finanzasStarted = await startHttpApp(finanzasModule.app);
    finanzasServer = finanzasStarted.server;

    const contabilidadStarted = await startHttpApp(contabilidadModule.app);
    contabilidadServer = contabilidadStarted.server;
    process.env.CONTABILIDAD_BASE_URL = contabilidadStarted.baseUrl;

    const satWorkerModule = await import('../../src/sat-worker');
    await satWorkerModule.initSatWorker();

    rabbitConnection = await amqplib.connect(rabbitUrl);
    rabbitChannel = await rabbitConnection.createChannel();

    const retryScenario = await seedScenario('SAT-WORKER-RETRY', 15400);
    const retryToken = signTenantToken({
      userId: retryScenario.userId,
      tenantId: retryScenario.tenantId,
      proyectoId: retryScenario.proyectoId,
      roles: ['finance'],
      projects: [retryScenario.proyectoId],
      limiteAprobacion: 999999999,
    });

    const retryPrepared = await prepararConciliacion(
      finanzasStarted.baseUrl,
      contabilidadStarted.baseUrl,
      retryToken,
      retryScenario.pagoId,
      retryScenario.referenciaBancaria,
      retryScenario.monto,
      retryScenario.tenantId
    );

    satProvider.setMode('retry_then_success');

    const retryRequestResponse = await fetch(`${contabilidadStarted.baseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${retryPrepared.conciliacionId}/validar-sat-externo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${retryToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    assert.equal(retryRequestResponse.status, 202);

    await waitFor(async () => {
      const fiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
        where: {
          tenant_id: retryScenario.tenantId,
          id_conciliacion: retryPrepared.conciliacionId,
        },
      });

      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: retryScenario.tenantId,
          id_asiento: retryPrepared.asientoId,
        },
      });

      assert.equal(fiscal.estatus_sat, 'VIGENTE');
      assert.equal(fiscal.sat_retry_count, 2);
      assert.equal(fiscal.sat_last_error, null);
      assert.equal(asiento.cfdi_status, 'SAT_VIGENTE');
      assert.equal(satProvider.attemptsFor(retryPrepared.uuidFiscal), 3);
    });

    const retryMonitor = await getMonitor(contabilidadStarted.baseUrl, retryToken, 0);
    assert.equal(retryMonitor.data.items.some((item) => item.id_conciliacion === retryPrepared.conciliacionId), false);

    await cleanupTenantData(retryScenario.tenantId);

    const dlqScenario = await seedScenario('SAT-WORKER-DLQ', 11100);
    const dlqToken = signTenantToken({
      userId: dlqScenario.userId,
      tenantId: dlqScenario.tenantId,
      proyectoId: dlqScenario.proyectoId,
      roles: ['finance'],
      projects: [dlqScenario.proyectoId],
      limiteAprobacion: 999999999,
    });

    const dlqPrepared = await prepararConciliacion(
      finanzasStarted.baseUrl,
      contabilidadStarted.baseUrl,
      dlqToken,
      dlqScenario.pagoId,
      dlqScenario.referenciaBancaria,
      dlqScenario.monto,
      dlqScenario.tenantId
    );

    satProvider.setMode('always_fail');

    const dlqRequestResponse = await fetch(`${contabilidadStarted.baseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${dlqPrepared.conciliacionId}/validar-sat-externo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dlqToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    assert.equal(dlqRequestResponse.status, 202);

    await waitFor(async () => {
      const monitor = await getMonitor(contabilidadStarted.baseUrl, dlqToken, 0);
      const item = monitor.data.items.find((entry) => entry.id_conciliacion === dlqPrepared.conciliacionId);
      assert.ok(item);
      assert.equal(item!.sat_retry_count, 3);
      assert.ok(item!.sat_last_error);
      assert.ok(item!.sat_dlq_at);
      assert.equal(monitor.data.dlq_count >= 1, true);
      assert.equal(satProvider.attemptsFor(dlqPrepared.uuidFiscal), 3);
    }, 30000);

    const dlqCheck = await rabbitChannel!.checkQueue(process.env.CONTABILIDAD_SAT_WORKER_DLQ_QUEUE!);
    assert.ok(dlqCheck.messageCount >= 1);

    satProvider.setMode('retry_then_success');

    const retryManualResponse = await fetch(`${contabilidadStarted.baseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${dlqPrepared.conciliacionId}/reintentar-sat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dlqToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    assert.equal(retryManualResponse.status, 202);

    await waitFor(async () => {
      const fiscal = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({
        where: {
          tenant_id: dlqScenario.tenantId,
          id_conciliacion: dlqPrepared.conciliacionId,
        },
      });

      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: dlqScenario.tenantId,
          id_asiento: dlqPrepared.asientoId,
        },
      });

      assert.equal(fiscal.estatus_sat, 'VIGENTE');
      assert.equal(fiscal.sat_last_error, null);
      assert.equal(asiento.cfdi_status, 'SAT_VIGENTE');
    }, 30000);

    await cleanupTenantData(dlqScenario.tenantId);

    await satWorkerModule.shutdownSatWorker();
    await contabilidadModule.shutdownEventBus();
    await finanzasModule.shutdownEventBus();

    console.log('ok - integracion real worker SAT aplica retry, DLQ y monitoreo de VALIDACION_EN_PROCESO');
  } finally {
    if (rabbitChannel) {
      await rabbitChannel.close();
    }
    if (rabbitConnection) {
      await rabbitConnection.close();
    }
    await stopHttpApp(contabilidadServer);
    await stopHttpApp(finanzasServer);
    if (satProviderServer) {
      await new Promise<void>((resolve, reject) => {
        satProviderServer!.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
    await contabilidadPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion worker SAT retry/DLQ/monitor');
  console.error(error);
  process.exitCode = 1;
});
