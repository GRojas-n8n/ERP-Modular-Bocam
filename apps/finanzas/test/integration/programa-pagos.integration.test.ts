/**
 * Integración (PostgreSQL real): programar y ejecutar pagos con tesorería y presupuesto correctos.
 * Change: corregir-ejecucion-programa-pagos (hallazgos F13 y F19).
 *
 * Invariantes:
 *   - con compromiso: el pago devenga (comprometido → ejercido) y no toca el disponible;
 *   - sin compromiso: el pago ejerce del disponible y se rechaza si no alcanza;
 *   - dos ejecuciones simultáneas del mismo pago: una pasa, la otra 409; la cuenta se descuenta una vez;
 *   - la cuenta bancaria es obligatoria y un saldo insuficiente no deja rastro;
 *   - programar valida monto, presupuesto y fecha; el lote es todo o nada.
 *
 * Runner: npm run test:integration:programa-pagos -w @bocam/finanzas
 * Requiere: PostgreSQL con schema finanzas. Sin RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
process.env.DATABASE_URL = dbUrl;
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const publicados: Array<{ type: string; payload: any; tenantId: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  publicados.push({ type: event.event_type, payload: event.payload, tenantId: event.context?.tenant_id });
  return true;
} as any;

let server: Server | undefined;
let baseUrl = '';

const llamar = async (metodo: 'POST' | 'PATCH', t: string, p: string, ruta: string, body: any, limite = 999_999_999) => {
  const token = signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles: ['finanzas'], projects: [p], limiteAprobacion: limite } as any);
  const r = await fetch(`${baseUrl}/api/v1/finanzas/${ruta}`, {
    method: metodo, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, body: (await r.json()) as any };
};

async function escenario(disponible: number, saldoCuenta = 100_000) {
  const t = randomUUID(), p = randomUUID();
  const pres = await admin.presupuestoAsignado.create({
    data: {
      tenant_id: t, proyecto_id: p, codigo: `PRES-PP-${randomUUID().slice(0, 8)}`, descripcion: 'Subcontratos',
      monto_autorizado: disponible, monto_disponible: disponible, monto_comprometido: 0, monto_ejercido: 0,
      capitulo: 'SUBCONTRATOS', moneda: 'MXN', estatus: 'ACTIVO',
    } as any,
  });
  const cuenta = await admin.cuentaBancaria.create({
    data: { tenant_id: t, proyecto_id: null, banco: 'BBVA', numero_cuenta: `CTA-${randomUUID().slice(0, 8)}`, alias: 'Empresa', saldo: saldoCuenta },
  });
  return { t, p, pres: pres.id_presupuesto, cuenta: cuenta.id_cuenta };
}

const programar = (e: { t: string; p: string; pres: string }, monto: number, ref?: string) =>
  llamar('POST', e.t, e.p, 'pagos', {
    presupuesto_id: e.pres, concepto: 'Estimación subcontrato', beneficiario: 'Subcontratista SA', monto_programado: monto,
    fecha_programada: '2026-11-20', ...(ref ? { referencia_modulo: 'compras', referencia_entidad: 'Contrato', referencia_id: ref } : {}),
  });

const pagar = (e: { t: string; p: string; cuenta: string }, idPago: string, extra: any = {}) =>
  llamar('PATCH', e.t, e.p, `pagos/${idPago}/pagar`, { cuenta_id: e.cuenta, referencia_bancaria: 'SPEI-PP-1', metodo_pago: 'SPEI', ...extra });

const pres = async (id: string) => {
  const r = await admin.presupuestoAsignado.findUniqueOrThrow({ where: { id_presupuesto: id } });
  return { comprometido: Number(r.monto_comprometido), ejercido: Number(r.monto_ejercido), disponible: Number(r.monto_disponible) };
};
const saldo = async (id: string) => Number((await admin.cuentaBancaria.findUniqueOrThrow({ where: { id_cuenta: id } })).saldo);
const estadoPago = async (id: string) => (await admin.programaPagos.findUniqueOrThrow({ where: { id_pago: id } })).estado;

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function main() {
  const finanzas = await import('../../src/main');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  await test('1. con compromiso: devenga y no toca el disponible; descuenta la cuenta; evento con cuenta_id', async () => {
    const e = await escenario(1000);
    const ref = randomUUID();
    const c = await llamar('POST', e.t, e.p, 'movimientos', {
      presupuesto_id: e.pres, tipo: 'COMPROMISO', concepto: 'Contrato', monto: 600,
      referencia_modulo: 'compras', referencia_entidad: 'Contrato', referencia_id: ref,
    });
    assert.equal(c.status, 201, JSON.stringify(c.body));
    const prog = await programar(e, 600, ref);
    assert.equal(prog.status, 201, JSON.stringify(prog.body));
    const r = await pagar(e, prog.body.data.id_pago);
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.data.devengado, 600); assert.equal(r.body.data.ejercido_directo, 0);
    assert.deepEqual(await pres(e.pres), { comprometido: 0, ejercido: 600, disponible: 400 });
    assert.equal(await saldo(e.cuenta), 99_400);
    const ev = publicados.find((x) => x.tenantId === e.t && x.type === 'finanzas.pago_registrado');
    assert.equal(ev?.payload.cuenta_id, e.cuenta);
  });

  await test('2. sin compromiso: ejerce del disponible (antes dejaba comprometido negativo)', async () => {
    const e = await escenario(1000);
    const prog = await programar(e, 300);
    const r = await pagar(e, prog.body.data.id_pago);
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.deepEqual(await pres(e.pres), { comprometido: 0, ejercido: 300, disponible: 700 });
  });

  await test('3. sin compromiso y sin disponible: 422 y nada cambia', async () => {
    const e = await escenario(1000);
    const prog = await programar(e, 2000);
    const r = await pagar(e, prog.body.data.id_pago);
    assert.equal(r.status, 422); assert.equal(r.body.error.code, 'FIN_INSUFFICIENT_BUDGET');
    assert.deepEqual(await pres(e.pres), { comprometido: 0, ejercido: 0, disponible: 1000 });
    assert.equal(await saldo(e.cuenta), 100_000);
    assert.equal(await estadoPago(prog.body.data.id_pago), 'PENDIENTE');
  });

  await test('4. compromiso parcial: devenga lo comprometido y ejerce el resto', async () => {
    const e = await escenario(1000);
    const ref = randomUUID();
    await llamar('POST', e.t, e.p, 'movimientos', {
      presupuesto_id: e.pres, tipo: 'COMPROMISO', concepto: 'Contrato', monto: 300,
      referencia_modulo: 'compras', referencia_entidad: 'Contrato', referencia_id: ref,
    });
    const prog = await programar(e, 500, ref);
    const r = await pagar(e, prog.body.data.id_pago);
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.data.devengado, 300); assert.equal(r.body.data.ejercido_directo, 200);
    assert.deepEqual(await pres(e.pres), { comprometido: 0, ejercido: 500, disponible: 500 });
  });

  await test('5. ejecuciones simultáneas del mismo pago: una pasa, las demás 409; la cuenta baja una vez', async () => {
    for (let ronda = 0; ronda < 5; ronda++) {
      const e = await escenario(10_000);
      const prog = await programar(e, 1000);
      const rs = await Promise.all([0, 1, 2].map(() => pagar(e, prog.body.data.id_pago)));
      assert.deepEqual(rs.map((r) => r.status).sort(), [200, 409, 409], `ronda ${ronda}: ${JSON.stringify(rs.map((r) => r.body.error?.code ?? r.status))}`);
      assert.ok(rs.filter((r) => r.status === 409).every((r) => r.body.error.code === 'FIN_PAGO_YA_PAGADO'));
      assert.equal(await saldo(e.cuenta), 99_000, `ronda ${ronda}`);
      assert.deepEqual(await pres(e.pres), { comprometido: 0, ejercido: 1000, disponible: 9000 }, `ronda ${ronda}`);
    }
  });

  await test('6. cuenta obligatoria; saldo insuficiente no deja rastro', async () => {
    const e = await escenario(10_000, 100);
    const prog = await programar(e, 500);
    let r = await pagar(e, prog.body.data.id_pago, { cuenta_id: undefined });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_CUENTA_REQUERIDA');
    r = await pagar(e, prog.body.data.id_pago);
    assert.equal(r.status, 422); assert.equal(r.body.error.code, 'FIN_SALDO_INSUFICIENTE');
    assert.equal(await saldo(e.cuenta), 100);
    assert.equal(await estadoPago(prog.body.data.id_pago), 'PENDIENTE');
    assert.deepEqual(await pres(e.pres), { comprometido: 0, ejercido: 0, disponible: 10_000 });
    assert.equal(await admin.movimientoPresupuestal.count({ where: { tenant_id: e.t } }), 0);
  });

  await test('7. el límite de autoridad se evalúa con el monto real del pago', async () => {
    const e = await escenario(10_000);
    const prog = await programar(e, 5000);
    const r = await llamar('PATCH', e.t, e.p, `pagos/${prog.body.data.id_pago}/pagar`, { cuenta_id: e.cuenta }, 1000);
    assert.equal(r.status, 403); assert.equal(r.body.error.code, 'FIN_LIMIT_EXCEEDED');
    assert.equal(await saldo(e.cuenta), 100_000);
  });

  await test('8. programar valida monto, presupuesto y fecha', async () => {
    const e = await escenario(1000);
    const base = { presupuesto_id: e.pres, concepto: 'x', beneficiario: 'y', fecha_programada: '2026-11-20' };
    let r = await llamar('POST', e.t, e.p, 'pagos', { ...base, monto_programado: -10 });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_MONTO_INVALIDO');
    r = await llamar('POST', e.t, e.p, 'pagos', { ...base, presupuesto_id: randomUUID(), monto_programado: 10 });
    assert.equal(r.status, 404); assert.equal(r.body.error.code, 'FIN_PRESUPUESTO_NO_ENCONTRADO');
    r = await llamar('POST', e.t, e.p, 'pagos', { ...base, monto_programado: 10, fecha_programada: 'mañana' });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_FECHA_INVALIDA');
    const ref = randomUUID();
    const a = await programar(e, 100, ref), b = await programar(e, 100, ref);
    assert.equal(a.body.data.id_pago, b.body.data.id_pago, 'idempotente por referencia');
    assert.equal(b.body.data.idempotente, true);
  });

  await test('9. lote todo o nada', async () => {
    const e = await escenario(1000);
    const ok = (i: number) => ({ presupuesto_id: e.pres, concepto: `P${i}`, beneficiario: 'B', monto_programado: 10, fecha_programada: '2026-11-20' });
    let r = await llamar('POST', e.t, e.p, 'pagos/bulk', { pagos: [ok(1), { ...ok(2), monto_programado: 0 }, ok(3)] });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_MONTO_INVALIDO');
    r = await llamar('POST', e.t, e.p, 'pagos/bulk', { pagos: [ok(1), { ...ok(2), presupuesto_id: randomUUID() }] });
    assert.equal(r.status, 404);
    assert.equal(await admin.programaPagos.count({ where: { tenant_id: e.t } }), 0, 'ningún renglón se programó');
    r = await llamar('POST', e.t, e.p, 'pagos/bulk', { pagos: [ok(1), ok(2), ok(3)] });
    assert.equal(r.status, 201); assert.equal(r.body.data.count, 3);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - programa-pagos', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});
