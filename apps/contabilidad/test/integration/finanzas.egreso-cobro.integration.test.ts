/**
 * Integración (PostgreSQL real): pólizas de egreso multiproveedor, de cobro y de estimación con el contrato real.
 * Change: poliza-egreso-oc-y-cobro (M7; hallazgos F7 y F27).
 *
 * Invariantes:
 *   - egreso de 3 OCs de proveedores distintos: una póliza EGRESO, un cargo a 2100 por OC y abonos a 1100 que suman el
 *     total; abre conciliación bancaria (por referencia) y fiscal; la reentrega no duplica;
 *   - un egreso cuyo detalle no suma el total no genera póliza;
 *   - cobro: póliza COBRO (cargo 1100, abono 1200), idempotente;
 *   - estimacion_aprobada con total_neto (lo que publica Control de Proyectos) genera la póliza ESTIMACION.
 *
 * Runner: npm run test:integration:finanzas-egreso-cobro -w @bocam/contabilidad
 * Requiere: PostgreSQL con schema contabilidad y el seed del catálogo de cuentas. Sin RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';

const dbUrl = (process.env.CONTABILIDAD_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad')
  .replace(/schema=[a-z_]+/, 'schema=contabilidad');
process.env.DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

EventBus.prototype.publish = async function () { return true; } as any;

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

const ctx = () => ({ tenant_id: randomUUID(), proyecto_id: randomUUID(), user_id: randomUUID(), correlation_id: randomUUID() });

async function lineas(asientoId: string) {
  const movs = await prisma.movimientoPoliza.findMany({ where: { asiento_id: asientoId }, orderBy: { orden: 'asc' } });
  const cuentas = await prisma.cuentaContable.findMany({ where: { id_cuenta: { in: movs.map((m) => m.cuenta_id) } } });
  const clave = new Map(cuentas.map((c) => [c.id_cuenta, c.clave]));
  return movs.map((m) => ({ clave: clave.get(m.cuenta_id), cargo: Number(m.cargo), abono: Number(m.abono) }));
}

async function main() {
  const contabilidad = await import('../../src/main');
  const catalogo = await prisma.cuentaContable.count({ where: { clave: { in: ['1100', '1200', '2100', '4100'] } } });
  assert.equal(catalogo, 4, 'falta el seed del catálogo de cuentas (seed_catalogo_cuentas.sql)');

  await test('1. egreso de 3 proveedores: una póliza, 3 cargos a Proveedores, abonos a Bancos; conciliaciones; idempotente', async () => {
    const c = ctx(), pagoId = randomUUID();
    const evento = {
      event_type: 'finanzas.egreso_oc_registrado', timestamp: new Date().toISOString(), context: c,
      payload: {
        pago_id: pagoId, proyecto_id: c.proyecto_id, fuente: 'CUENTA_BANCARIA', cuenta_id: randomUUID(), tipo_pago: 'SPEI',
        referencia: 'SPEI-M7-001', fecha_pago: '2026-11-10T00:00:00.000Z', monto_total: 1750.5, moneda: 'MXN',
        detalles: [
          { oc_id: randomUUID(), oc_codigo: 'OC-001', proveedor_id: randomUUID(), proveedor_nombre: 'Aceros del Norte', concepto_id: null, monto_aplicado: 1000 },
          { oc_id: randomUUID(), oc_codigo: 'OC-002', proveedor_id: randomUUID(), proveedor_nombre: 'Concretos SA', concepto_id: null, monto_aplicado: 500.5 },
          { oc_id: randomUUID(), oc_codigo: 'OC-003', proveedor_id: randomUUID(), proveedor_nombre: 'Eléctrica Baja', concepto_id: null, monto_aplicado: 250 },
        ],
      },
    };
    await contabilidad.handleEgresoOcRegistradoEvent(evento as any);
    await contabilidad.handleEgresoOcRegistradoEvent(evento as any);

    const asientos = await prisma.asientoContable.findMany({ where: { tenant_id: c.tenant_id } });
    assert.equal(asientos.length, 1, 'una sola póliza aunque el evento llegue dos veces');
    const a = asientos[0];
    assert.equal(a.tipo_poliza, 'EGRESO'); assert.equal(Number(a.monto_total), 1750.5);
    assert.equal(a.beneficiario, '3 proveedores');
    const l = await lineas(a.id_asiento);
    assert.equal(l.length, 6);
    assert.deepEqual(l.filter((x) => x.cargo > 0).map((x) => [x.clave, x.cargo]), [['2100', 1000], ['2100', 500.5], ['2100', 250]]);
    assert.ok(l.filter((x) => x.abono > 0).every((x) => x.clave === '1100'));
    const cargo = l.reduce((s, x) => s + x.cargo, 0), abono = l.reduce((s, x) => s + x.abono, 0);
    assert.ok(Math.abs(cargo - 1750.5) < 0.001 && Math.abs(abono - 1750.5) < 0.001, `cuadre ${cargo} / ${abono}`);

    const banco = await prisma.conciliacionBancaria.findMany({ where: { tenant_id: c.tenant_id } });
    assert.equal(banco.length, 1); assert.equal(banco[0].referencia_bancaria, 'SPEI-M7-001'); assert.equal(banco[0].pago_id, pagoId);
    assert.equal(await prisma.conciliacionFiscal.count({ where: { tenant_id: c.tenant_id } }), 1);
  });

  await test('2. egreso cuyo detalle no suma el total: sin póliza', async () => {
    const c = ctx();
    await contabilidad.handleEgresoOcRegistradoEvent({
      event_type: 'finanzas.egreso_oc_registrado', timestamp: new Date().toISOString(), context: c,
      payload: {
        pago_id: randomUUID(), proyecto_id: c.proyecto_id, fuente: 'CUENTA_BANCARIA', cuenta_id: null, tipo_pago: 'CHEQUE',
        referencia: 'CHQ-1', fecha_pago: '2026-11-10T00:00:00.000Z', monto_total: 999,
        detalles: [{ oc_id: randomUUID(), oc_codigo: 'OC-9', proveedor_id: randomUUID(), proveedor_nombre: 'X', concepto_id: null, monto_aplicado: 100 }],
      },
    } as any);
    assert.equal(await prisma.asientoContable.count({ where: { tenant_id: c.tenant_id } }), 0);
  });

  await test('3. cobro de estimación: póliza COBRO (Bancos contra Cuentas por Cobrar), idempotente', async () => {
    const c = ctx(), idCobro = randomUUID();
    const evento = {
      event_type: 'finanzas.cobro_registrado', timestamp: new Date().toISOString(), context: c,
      payload: {
        id_cobro: idCobro, cxc_id: randomUUID(), proyecto_id: c.proyecto_id, origen: 'ESTIMACION', origen_id: randomUUID(),
        codigo: 'EST-007', cuenta_id: randomUUID(), folio: 'SPEI-IN-1', monto: 11600, moneda: 'MXN',
        fecha_cobro: '2026-11-12T00:00:00.000Z', cobrado_total: 11600, saldo: 0, estado: 'COBRADA',
      },
    };
    await contabilidad.handleCobroRegistradoEvent(evento as any);
    await contabilidad.handleCobroRegistradoEvent(evento as any);
    const asientos = await prisma.asientoContable.findMany({ where: { tenant_id: c.tenant_id } });
    assert.equal(asientos.length, 1);
    assert.equal(asientos[0].tipo_poliza, 'COBRO'); assert.ok(asientos[0].folio_poliza.startsWith('POL-ING-'));
    assert.deepEqual(await lineas(asientos[0].id_asiento), [
      { clave: '1100', cargo: 11600, abono: 0 },
      { clave: '1200', cargo: 0, abono: 11600 },
    ]);
  });

  await test('4. estimacion_aprobada con total_neto (payload real de Control de Proyectos): póliza ESTIMACION', async () => {
    const c = ctx(), est = randomUUID();
    await contabilidad.handleEstimacionAprobadaEvent({
      event_type: 'control_obra.estimacion_aprobada', timestamp: new Date().toISOString(), context: c,
      payload: { estimacion_id: est, codigo: 'EST-REAL', total_neto: 11600, presupuesto_id: randomUUID(), total_conceptos: 3 },
    } as any);
    const a = await prisma.asientoContable.findFirst({ where: { tenant_id: c.tenant_id, external_event_key: `control_obra.estimacion_aprobada:${est}` } });
    assert.ok(a, 'antes se descartaba como invalid_payload por esperar monto_total');
    assert.equal(Number(a!.monto_total), 11600);
    assert.deepEqual((await lineas(a!.id_asiento)).map((x) => x.clave), ['1200', '4100']);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await prisma.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - finanzas.egreso-cobro', e);
  process.exit(1);
});
