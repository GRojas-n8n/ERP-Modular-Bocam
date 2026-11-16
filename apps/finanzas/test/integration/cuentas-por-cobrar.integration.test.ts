/**
 * Integración (PostgreSQL real): una estimación aprobada es cuenta por cobrar y su cobro abona el banco.
 * Change: cuentas-por-cobrar-estimaciones (hallazgo F20).
 *
 * Invariantes:
 *   - estimacion_aprobada crea UNA cuenta por cobrar (reentrega idempotente) y ningún pago programado;
 *   - una estimación ya programada como pago (registro previo) no se duplica;
 *   - el cobro abona la cuenta bancaria, acumula lo cobrado y cambia el estado (parcial, cobrada);
 *   - folio idempotente (200) y con otro contenido 409; el cobro no excede el saldo, ni en concurrencia;
 *   - RLS: un proyecto no ve ni cobra cuentas de otro; roles sin permiso 403;
 *   - la migración es re-ejecutable y su CHECK impide cobrar más que el monto.
 *
 * Runner: npm run test:integration:cuentas-por-cobrar -w @bocam/finanzas
 * Requiere: PostgreSQL con schema finanzas. Sin RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { runSqlFile } from '../support/sql';

const dbUrl =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
process.env.DATABASE_URL = dbUrl;
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });
const MIGRACION = join(__dirname, '..', '..', 'prisma', 'migrations', '20261112120000_cuentas_por_cobrar', 'migration.sql');

const publicados: Array<{ type: string; payload: any; tenantId: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  publicados.push({ type: event.event_type, payload: event.payload, tenantId: event.context?.tenant_id });
  return true;
} as any;

let server: Server | undefined;
let baseUrl = '';

const llamar = async (metodo: 'GET' | 'POST', t: string, p: string, ruta: string, body?: any, roles = ['finanzas']) => {
  const token = signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles, projects: [p], limiteAprobacion: 0 } as any);
  const r = await fetch(`${baseUrl}/api/v1/finanzas/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: r.status, body: (await r.json()) as any };
};

const evento = (t: string, p: string, estimacionId: string, total: number, presupuestoId = randomUUID()) => ({
  event_type: 'control_obra.estimacion_aprobada',
  timestamp: new Date().toISOString(),
  context: { tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: randomUUID() },
  payload: { estimacion_id: estimacionId, codigo: `EST-${estimacionId.slice(0, 6)}`, total_neto: total, presupuesto_id: presupuestoId, total_conceptos: 3 },
});

async function escenario(finanzas: any, total: number, saldoCuenta = 1000) {
  const t = randomUUID(), p = randomUUID(), est = randomUUID();
  await finanzas.handleEstimacionAprobadaEvent(evento(t, p, est, total) as any);
  const cxc = await admin.cuentaPorCobrar.findFirstOrThrow({ where: { tenant_id: t, origen_id: est } });
  const cuenta = await admin.cuentaBancaria.create({
    data: { tenant_id: t, proyecto_id: null, banco: 'BBVA', numero_cuenta: `CTA-${randomUUID().slice(0, 8)}`, alias: 'Empresa', saldo: saldoCuenta },
  });
  return { t, p, est, cxc: cxc.id_cxc, cuenta: cuenta.id_cuenta };
}

const cobrar = (e: { t: string; p: string; cxc: string; cuenta: string }, monto: number, folio = `SPEI-${randomUUID().slice(0, 8)}`) =>
  llamar('POST', e.t, e.p, `cuentas-por-cobrar/${e.cxc}/cobros`, { cuenta_id: e.cuenta, folio, monto, fecha_cobro: '2026-11-20' });

const cxcDe = async (id: string) => {
  const r = await admin.cuentaPorCobrar.findUniqueOrThrow({ where: { id_cxc: id } });
  return { cobrado: Number(r.cobrado), estado: r.estado };
};
const saldo = async (id: string) => Number((await admin.cuentaBancaria.findUniqueOrThrow({ where: { id_cuenta: id } })).saldo);

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function main() {
  const m = runSqlFile(MIGRACION, dbUrl);
  if (!m.ok) throw new Error(`No se pudo aplicar la migración:\n${m.output}`);
  const finanzas = await import('../../src/main');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  await test('1. estimación aprobada: una cuenta por cobrar, ningún pago programado; reentrega idempotente', async () => {
    const t = randomUUID(), p = randomUUID(), est = randomUUID();
    await finanzas.handleEstimacionAprobadaEvent(evento(t, p, est, 11600) as any);
    await finanzas.handleEstimacionAprobadaEvent(evento(t, p, est, 11600) as any);
    const cxc = await admin.cuentaPorCobrar.findMany({ where: { tenant_id: t } });
    assert.equal(cxc.length, 1);
    assert.equal(Number(cxc[0].monto), 11600); assert.equal(cxc[0].estado, 'POR_COBRAR'); assert.equal(cxc[0].proyecto_id, p);
    assert.equal(await admin.programaPagos.count({ where: { tenant_id: t } }), 0);
    const lista = await llamar('GET', t, p, 'cuentas-por-cobrar');
    assert.equal(lista.status, 200, JSON.stringify(lista.body));
    assert.equal(lista.body.data.length, 1); assert.equal(lista.body.data[0].saldo, 11600);
  });

  await test('2. estimación ya programada como pago (registro previo): no se duplica', async () => {
    const t = randomUUID(), p = randomUUID(), est = randomUUID();
    const pres = await admin.presupuestoAsignado.create({
      data: { tenant_id: t, proyecto_id: p, codigo: 'PRES-LEG', descripcion: 'x', monto_autorizado: 1, monto_disponible: 1, capitulo: 'SUBCONTRATOS', estatus: 'ACTIVO' } as any,
    });
    await admin.programaPagos.create({
      data: {
        tenant_id: t, proyecto_id: p, presupuesto_id: pres.id_presupuesto, concepto: 'Estimacion legado', beneficiario: 'Constructora (Self)',
        monto_programado: 500, fecha_programada: new Date(), estado: 'PENDIENTE', referencia_modulo: 'control-obra', referencia_entidad: 'Estimacion', referencia_id: est,
      },
    });
    await finanzas.handleEstimacionAprobadaEvent(evento(t, p, est, 500) as any);
    assert.equal(await admin.cuentaPorCobrar.count({ where: { tenant_id: t } }), 0);
  });

  await test('3. cobro parcial y total: abona el banco, acumula y publica cobro_registrado', async () => {
    const e = await escenario(finanzas, 1000);
    const r1 = await cobrar(e, 400, 'SPEI-A');
    assert.equal(r1.status, 201, JSON.stringify(r1.body));
    assert.equal(r1.body.data.estado, 'COBRO_PARCIAL'); assert.equal(r1.body.data.saldo, 600);
    assert.deepEqual(await cxcDe(e.cxc), { cobrado: 400, estado: 'COBRO_PARCIAL' });
    assert.equal(await saldo(e.cuenta), 1400);
    const r2 = await cobrar(e, 600, 'SPEI-B');
    assert.equal(r2.status, 201, JSON.stringify(r2.body));
    assert.deepEqual(await cxcDe(e.cxc), { cobrado: 1000, estado: 'COBRADA' });
    assert.equal(await saldo(e.cuenta), 2000);
    const evs = publicados.filter((x) => x.tenantId === e.t && x.type === 'finanzas.cobro_registrado');
    assert.equal(evs.length, 2);
    assert.equal(evs[1].payload.estado, 'COBRADA'); assert.equal(evs[1].payload.origen, 'ESTIMACION');
    assert.equal(evs[1].payload.origen_id, e.est); assert.equal(evs[1].payload.cuenta_id, e.cuenta);
    const cerrada = await cobrar(e, 1, 'SPEI-C');
    assert.equal(cerrada.status, 409); assert.equal(cerrada.body.error.code, 'FIN_CXC_COBRADA');
  });

  await test('4. folio repetido: mismo contenido 200 idempotente; otro contenido 409; el banco sube una vez', async () => {
    const e = await escenario(finanzas, 1000);
    assert.equal((await cobrar(e, 300, 'CHQ-1')).status, 201);
    const again = await cobrar(e, 300, 'CHQ-1');
    assert.equal(again.status, 200, JSON.stringify(again.body)); assert.equal(again.body.data.idempotente, true);
    const otro = await cobrar(e, 301, 'CHQ-1');
    assert.equal(otro.status, 409); assert.equal(otro.body.error.code, 'FIN_COBRO_DUPLICADO');
    assert.equal(await saldo(e.cuenta), 1300);
    assert.equal(publicados.filter((x) => x.tenantId === e.t && x.type === 'finanzas.cobro_registrado').length, 1);
  });

  await test('5. cobro mayor al saldo: 422 y nada cambia', async () => {
    const e = await escenario(finanzas, 1000);
    const r = await cobrar(e, 1000.01);
    assert.equal(r.status, 422); assert.equal(r.body.error.code, 'FIN_COBRO_EXCEDE_SALDO');
    assert.deepEqual(await cxcDe(e.cxc), { cobrado: 0, estado: 'POR_COBRAR' });
    assert.equal(await saldo(e.cuenta), 1000);
  });

  await test('6. 5 cobros simultáneos de 300 sobre 1,000: exactamente 3 pasan', async () => {
    const e = await escenario(finanzas, 1000);
    const rs = await Promise.all(Array.from({ length: 5 }, () => cobrar(e, 300)));
    assert.equal(rs.filter((r) => r.status === 201).length, 3, JSON.stringify(rs.map((r) => r.body.error?.code ?? r.status)));
    assert.ok(rs.filter((r) => r.status !== 201).every((r) => r.status === 422));
    assert.deepEqual(await cxcDe(e.cxc), { cobrado: 900, estado: 'COBRO_PARCIAL' });
    assert.equal(await saldo(e.cuenta), 1900);
  });

  await test('7. validaciones: sin cuenta 400, monto inválido 400, cuenta inexistente 404 sin rastro', async () => {
    const e = await escenario(finanzas, 1000);
    const sinCuenta = await llamar('POST', e.t, e.p, `cuentas-por-cobrar/${e.cxc}/cobros`, { folio: 'X', monto: 10 });
    assert.equal(sinCuenta.status, 400); assert.equal(sinCuenta.body.error.code, 'FIN_CUENTA_REQUERIDA');
    for (const monto of [0, -5, 1.234, 'abc']) {
      const r = await llamar('POST', e.t, e.p, `cuentas-por-cobrar/${e.cxc}/cobros`, { cuenta_id: e.cuenta, folio: 'X', monto });
      assert.equal(r.status, 400, `monto ${monto}`); assert.equal(r.body.error.code, 'FIN_MONTO_INVALIDO');
    }
    const r = await cobrar({ ...e, cuenta: randomUUID() }, 10);
    assert.equal(r.status, 404); assert.equal(r.body.error.code, 'FIN_CUENTA_NO_ENCONTRADA');
    assert.equal(await admin.cobroCxc.count({ where: { tenant_id: e.t } }), 0);
    assert.deepEqual(await cxcDe(e.cxc), { cobrado: 0, estado: 'POR_COBRAR' });
  });

  await test('8. RLS y roles: otro proyecto no ve ni cobra; superintendent 403', async () => {
    const e = await escenario(finanzas, 1000);
    const otro = randomUUID();
    const lista = await llamar('GET', e.t, otro, 'cuentas-por-cobrar');
    assert.equal(lista.status, 200); assert.equal(lista.body.data.length, 0);
    const r = await cobrar({ ...e, p: otro }, 10);
    assert.equal(r.status, 404); assert.equal(r.body.error.code, 'FIN_CXC_NO_ENCONTRADA');
    const sup = await llamar('POST', e.t, e.p, `cuentas-por-cobrar/${e.cxc}/cobros`, { cuenta_id: e.cuenta, folio: 'S', monto: 10 }, ['superintendent']);
    assert.equal(sup.status, 403);
    assert.equal(await saldo(e.cuenta), 1000);
  });

  await test('9. la migración es re-ejecutable y su CHECK impide cobrar más que el monto', async () => {
    const m = runSqlFile(MIGRACION, dbUrl);
    assert.ok(m.ok, m.output);
    const e = await escenario(finanzas, 1000);
    await assert.rejects(admin.$executeRaw`UPDATE "cuentas_por_cobrar" SET "cobrado" = 1000.01 WHERE "id_cxc" = ${e.cxc}::uuid`);
    await assert.rejects(admin.$executeRaw`UPDATE "cuentas_por_cobrar" SET "estado" = 'PAGADA' WHERE "id_cxc" = ${e.cxc}::uuid`);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - cuentas-por-cobrar', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});
