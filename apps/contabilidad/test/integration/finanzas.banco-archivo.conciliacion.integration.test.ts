import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import * as XLSX from 'xlsx';
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

async function delay(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
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

async function seedPago(tenantId: string, proyectoId: string, label: string, monto: number) {
  const presupuesto = await finanzasPrisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-${label}-${Date.now()}`,
      descripcion: `Presupuesto ${label}`,
      monto_autorizado: monto + 5000,
      monto_disponible: 5000,
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

async function conciliarCfdiYsat(contabilidadBaseUrl: string, token: string, asientoId: string, conciliacionId: string, monto: number) {
  const cfdiResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/asientos/${asientoId}/conciliar-cfdi`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid_fiscal: `CFDI-${randomUUID()}`,
      serie: 'C',
      folio: '4001',
      rfc_emisor: 'AAA010101AAA',
      rfc_receptor: 'BBB010101BBB',
      monto_total: monto,
      moneda: 'MXN',
      fecha_emision: new Date('2026-03-18T10:00:00.000Z').toISOString(),
      fecha_timbrado: new Date('2026-03-18T10:05:00.000Z').toISOString(),
      fuente: 'SAT_MOCK',
    }),
  });
  assert.equal(cfdiResponse.status, 200);

  const satResponse = await fetch(`${contabilidadBaseUrl}/api/v1/contabilidad/conciliaciones-fiscales/${conciliacionId}/validar-sat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      estatus_sat: 'VIGENTE',
      fecha_validacion_sat: new Date('2026-03-18T12:00:00.000Z').toISOString(),
      fuente: 'SAT_MOCK',
      mensaje_sat: 'CFDI vigente para archivo.',
    }),
  });
  assert.equal(satResponse.status, 200);
}

function toBase64Csv(rows: string[][]) {
  const csv = rows.map((row) => row.join(',')).join('\n');
  return Buffer.from(csv, 'utf8').toString('base64');
}

function toBase64Xlsx(rows: Array<Record<string, unknown>>) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'EstadoCuenta');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buffer).toString('base64');
}

async function main() {
  process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const pago1Ref = `TRX-ARCH-A-${Date.now()}`;
  const pago2Ref = `TRX-ARCH-B-${Date.now()}`;
  const pago1Monto = 6100;
  const pago2Monto = 7200;

  const finanzasModule = await import('../../../finanzas/src/main');
  const contabilidadModule = await import('../../src/main');

  let finanzasServer: import('node:http').Server | undefined;
  let contabilidadServer: import('node:http').Server | undefined;

  try {
    const pago1 = await seedPago(tenantId, proyectoId, 'ARCH-A', pago1Monto);
    const pago2 = await seedPago(tenantId, proyectoId, 'ARCH-B', pago2Monto);

    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();

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
    let conciliacion1Id = '';
    let conciliacion2Id = '';

    await waitFor(async () => {
      const asiento1 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago1.id_pago } });
      const asiento2 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago2.id_pago } });
      const fiscal1 = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago1.id_pago } });
      const fiscal2 = await contabilidadPrisma.conciliacionFiscal.findFirstOrThrow({ where: { tenant_id: tenantId, pago_id: pago2.id_pago } });

      asiento1Id = asiento1.id_asiento;
      asiento2Id = asiento2.id_asiento;
      conciliacion1Id = fiscal1.id_conciliacion;
      conciliacion2Id = fiscal2.id_conciliacion;
    });

    await conciliarCfdiYsat(contabilidadStarted.baseUrl, token, asiento1Id, conciliacion1Id, pago1Monto);
    await conciliarCfdiYsat(contabilidadStarted.baseUrl, token, asiento2Id, conciliacion2Id, pago2Monto);

    const csvBase64 = toBase64Csv([
      ['referencia_bancaria', 'monto_banco', 'fecha_movimiento_bancario', 'banco', 'metodo_pago'],
      [pago1Ref, String(pago1Monto), '2026-03-18T13:00:00.000Z', 'BBVA', 'TRANSFERENCIA'],
      ['', 'monto_invalido', '', 'BBVA', 'TRANSFERENCIA'],
    ]);

    const validateResponse = await fetch(`${contabilidadStarted.baseUrl}/api/v1/contabilidad/conciliaciones-bancarias/archivo/validar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: 'estado_cuenta.csv',
        file_base64: csvBase64,
        lote_id: 'LOTE-CSV-VALIDAR',
      }),
    });

    assert.equal(validateResponse.status, 200);
    const validateBody = await validateResponse.json() as {
      success: boolean;
      data: {
        total_rows: number;
        valid_count: number;
        invalid_count: number;
      };
    };
    assert.equal(validateBody.success, true);
    assert.equal(validateBody.data.total_rows, 2);
    assert.equal(validateBody.data.valid_count, 1);
    assert.equal(validateBody.data.invalid_count, 1);

    const strictXlsxBase64 = toBase64Xlsx([
      {
        referencia_bancaria: pago1Ref,
        monto_banco: pago1Monto,
        fecha_movimiento_bancario: '2026-03-18T13:00:00.000Z',
        banco: 'BBVA',
        metodo_pago: 'TRANSFERENCIA',
      },
      {
        referencia_bancaria: 'TRX-ARCH-NO-EXISTE',
        monto_banco: 10,
        fecha_movimiento_bancario: '2026-03-18T13:10:00.000Z',
        banco: 'BBVA',
        metodo_pago: 'TRANSFERENCIA',
      },
    ]);

    const strictResponse = await fetch(`${contabilidadStarted.baseUrl}/api/v1/contabilidad/conciliaciones-bancarias/archivo/ejecutar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: 'estado_cuenta.xlsx',
        file_base64: strictXlsxBase64,
        sheet_name: 'EstadoCuenta',
        lote_id: 'LOTE-XLSX-STRICT',
      }),
    });

    assert.equal(strictResponse.status, 422);

    const executionXlsxBase64 = toBase64Xlsx([
      {
        referencia_lote: 'fila-1',
        referencia_bancaria: pago1Ref,
        monto_banco: pago1Monto,
        fecha_movimiento_bancario: '2026-03-18T13:00:00.000Z',
        banco: 'BBVA',
        metodo_pago: 'TRANSFERENCIA',
      },
      {
        referencia_lote: 'fila-2',
        id_asiento: asiento2Id,
        referencia_bancaria: pago2Ref,
        monto_banco: pago2Monto,
        fecha_movimiento_bancario: '2026-03-18T13:05:00.000Z',
        banco: 'BBVA',
        metodo_pago: 'TRANSFERENCIA',
      },
    ]);

    const executeResponse = await fetch(`${contabilidadStarted.baseUrl}/api/v1/contabilidad/conciliaciones-bancarias/archivo/ejecutar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: 'estado_cuenta.xlsx',
        file_base64: executionXlsxBase64,
        sheet_name: 'EstadoCuenta',
        lote_id: 'LOTE-XLSX-EJECUTAR',
        allow_partial: true,
      }),
    });

    assert.equal(executeResponse.status, 200);
    const executeBody = await executeResponse.json() as {
      success: boolean;
      data: {
        executed_rows: number;
        success_count: number;
        failure_count: number;
      };
    };
    assert.equal(executeBody.success, true);
    assert.equal(executeBody.data.executed_rows, 2);
    assert.equal(executeBody.data.success_count, 2);
    assert.equal(executeBody.data.failure_count, 0);

    await waitFor(async () => {
      const asiento1 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, id_asiento: asiento1Id } });
      const asiento2 = await contabilidadPrisma.asientoContable.findFirstOrThrow({ where: { tenant_id: tenantId, id_asiento: asiento2Id } });
      assert.equal(asiento1.estatus, 'CERRADO');
      assert.equal(asiento2.estatus, 'CERRADO');
      assert.equal(asiento1.bancario_status, 'CONCILIADO');
      assert.equal(asiento2.bancario_status, 'CONCILIADO');
    });

    console.log('ok - integracion real contabilidad valida y ejecuta conciliacion bancaria desde CSV/XLSX');
  } finally {
    await stopHttpApp(contabilidadServer);
    await stopHttpApp(finanzasServer);
    await contabilidadModule.shutdownEventBus();
    await finanzasModule.shutdownEventBus();
    await cleanupTenantData(tenantId);
    await contabilidadPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion contabilidad archivo CSV/XLSX');
  console.error(error);
  process.exitCode = 1;
});
