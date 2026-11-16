/**
 * Integración (PostgreSQL real): nómina pagada por Finanzas desde una cuenta bancaria.
 * Change: nomina-pagada-por-finanzas (M9).
 *
 * Invariantes:
 *   - personal.nomina_autorizada proyecta UNA nómina por pagar (reentrega idempotente), con o sin presupuesto MANO_OBRA;
 *   - el pago descuenta la cuenta una vez, devenga el compromiso y publica finanzas.nomina_pagada;
 *   - reintento con la misma referencia 200; otra referencia 409; pagos simultáneos: uno pasa;
 *   - personal.nomina_pagada posterior no vuelve a afectar el presupuesto; sin compromiso no deja comprometido negativo;
 *   - sin presupuesto la nómina se paga igual (obligación laboral) y se reporta sin_presupuesto;
 *   - saldo insuficiente, límite, cuenta faltante u otro proyecto: rechazo sin efectos.
 *
 * Runner: npm run test:integration:nomina-por-pagar -w @bocam/finanzas
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
import { runSqlFile } from '../support/sql';
import { join } from 'node:path';

const dbUrl =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
process.env.DATABASE_URL = dbUrl;
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });
const MIGRACION = join(__dirname, '..', '..', 'prisma', 'migrations', '20261113120000_nominas_por_pagar', 'migration.sql');

const publicados: Array<{ type: string; payload: any; tenantId: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  publicados.push({ type: event.event_type, payload: event.payload, tenantId: event.context?.tenant_id });
  return true;
} as any;

let server: Server | undefined;
let baseUrl = '';

const llamar = async (metodo: 'GET' | 'POST', t: string, p: string, ruta: string, body?: any, limite = 999_999_999) => {
  const token = signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles: ['finanzas'], projects: [p], limiteAprobacion: limite } as any);
  const r = await fetch(`${baseUrl}/api/v1/finanzas/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: r.status, body: (await r.json()) as any };
};

const evento = (tipo: string, t: string, p: string, prenominaId: string, total: number) => ({
  event_type: tipo,
  timestamp: new Date().toISOString(),
  context: { tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: randomUUID() },
  payload: {
    prenomina_id: prenominaId, codigo: `PN-${prenominaId.slice(0, 6)}`, periodo_tipo: 'SEMANAL',
    periodo_inicio: '2026-11-02T00:00:00.000Z', periodo_fin: '2026-11-08T00:00:00.000Z',
    total_percepciones: total, total_deducciones: 0, total_neto: total, total_empleados: 12,
  },
});

async function escenario(finanzas: any, total: number, opts: { presupuesto?: number; saldo?: number } = {}) {
  const t = randomUUID(), p = randomUUID(), pn = randomUUID();
  let pres: string | null = null;
  if (opts.presupuesto !== undefined) {
    const r = await admin.presupuestoAsignado.create({
      data: {
        tenant_id: t, proyecto_id: p, codigo: 'MO', descripcion: 'Mano de obra', monto_autorizado: opts.presupuesto,
        monto_disponible: opts.presupuesto, monto_comprometido: 0, monto_ejercido: 0, capitulo: 'MANO_OBRA', estatus: 'ACTIVO',
      } as any,
    });
    pres = r.id_presupuesto;
  }
  const cuenta = await admin.cuentaBancaria.create({
    data: { tenant_id: t, proyecto_id: null, banco: 'BBVA', numero_cuenta: `CTA-${randomUUID().slice(0, 8)}`, alias: 'Nómina', saldo: opts.saldo ?? 100_000 },
  });
  await finanzas.handleNominaAutorizadaEvent(evento('personal.nomina_autorizada', t, p, pn, total) as any);
  return { t, p, pn, pres, cuenta: cuenta.id_cuenta };
}

const pagar = (e: { t: string; p: string; pn: string; cuenta: string }, referencia = 'SPEI-NOM-1', limite?: number) =>
  llamar('POST', e.t, e.p, `nominas-por-pagar/${e.pn}/pagar`, { cuenta_id: e.cuenta, referencia, fecha_pago: '2026-11-09' }, limite);

const saldo = async (id: string) => Number((await admin.cuentaBancaria.findUniqueOrThrow({ where: { id_cuenta: id } })).saldo);
const pres = async (id: string) => {
  const r = await admin.presupuestoAsignado.findUniqueOrThrow({ where: { id_presupuesto: id } });
  return { comprometido: Number(r.monto_comprometido), ejercido: Number(r.monto_ejercido), disponible: Number(r.monto_disponible) };
};
const estado = async (t: string, pn: string) => (await admin.nominaPorPagar.findUniqueOrThrow({ where: { tenant_id_prenomina_id: { tenant_id: t, prenomina_id: pn } } })).estado;

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

  await test('1. autorizada: una nómina por pagar (idempotente) y su compromiso; aparece en la lista', async () => {
    const e = await escenario(finanzas, 15_000, { presupuesto: 50_000 });
    await finanzas.handleNominaAutorizadaEvent(evento('personal.nomina_autorizada', e.t, e.p, e.pn, 15_000) as any);
    assert.equal(await admin.nominaPorPagar.count({ where: { tenant_id: e.t } }), 1);
    assert.deepEqual(await pres(e.pres!), { comprometido: 15_000, ejercido: 0, disponible: 35_000 });
    const lista = await llamar('GET', e.t, e.p, 'nominas-por-pagar');
    assert.equal(lista.status, 200, JSON.stringify(lista.body));
    assert.equal(lista.body.data.length, 1); assert.equal(lista.body.data[0].total_neto, 15_000);
  });

  await test('2. pago: descuenta la cuenta, devenga, publica finanzas.nomina_pagada; reintento 200; otra referencia 409', async () => {
    const e = await escenario(finanzas, 15_000, { presupuesto: 50_000 });
    const r = await pagar(e);
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.data.efecto_presupuestal, 'devengado');
    assert.equal(await saldo(e.cuenta), 85_000);
    assert.deepEqual(await pres(e.pres!), { comprometido: 0, ejercido: 15_000, disponible: 35_000 });
    assert.equal(await estado(e.t, e.pn), 'PAGADA');
    const ev = publicados.filter((x) => x.tenantId === e.t && x.type === 'finanzas.nomina_pagada');
    assert.equal(ev.length, 1);
    assert.equal(ev[0].payload.prenomina_id, e.pn); assert.equal(ev[0].payload.cuenta_id, e.cuenta); assert.equal(ev[0].payload.referencia, 'SPEI-NOM-1');
    const again = await pagar(e);
    assert.equal(again.status, 200); assert.equal(again.body.data.idempotente, true);
    const otra = await pagar(e, 'SPEI-NOM-2');
    assert.equal(otra.status, 409); assert.equal(otra.body.error.code, 'FIN_NOMINA_YA_PAGADA');
    assert.equal(await saldo(e.cuenta), 85_000);

    // Personal confirma después con personal.nomina_pagada: no vuelve a afectar el presupuesto.
    await finanzas.handleNominaPagadaEvent(evento('personal.nomina_pagada', e.t, e.p, e.pn, 15_000) as any);
    assert.deepEqual(await pres(e.pres!), { comprometido: 0, ejercido: 15_000, disponible: 35_000 });
  });

  await test('3. 3 pagos simultáneos de la misma nómina: uno pasa, la cuenta baja una vez', async () => {
    const e = await escenario(finanzas, 10_000, { presupuesto: 50_000 });
    const rs = await Promise.all(['A', 'B', 'C'].map((x) => pagar(e, `SPEI-${x}`)));
    assert.equal(rs.filter((r) => r.status === 201).length, 1, JSON.stringify(rs.map((r) => r.body.error?.code ?? r.status)));
    assert.ok(rs.filter((r) => r.status !== 201).every((r) => r.status === 409));
    assert.equal(await saldo(e.cuenta), 90_000);
    assert.deepEqual(await pres(e.pres!), { comprometido: 0, ejercido: 10_000, disponible: 40_000 });
  });

  await test('4. sin presupuesto MANO_OBRA: la nómina se paga igual (sin_presupuesto)', async () => {
    const e = await escenario(finanzas, 8_000);
    const r = await pagar(e);
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.data.efecto_presupuestal, 'sin_presupuesto');
    assert.equal(await saldo(e.cuenta), 92_000);
  });

  await test('5. rechazos sin efectos: saldo insuficiente 422, límite 403, sin cuenta 400, otro proyecto 404', async () => {
    const e = await escenario(finanzas, 15_000, { presupuesto: 50_000, saldo: 1_000 });
    let r = await pagar(e);
    assert.equal(r.status, 422); assert.equal(r.body.error.code, 'FIN_SALDO_INSUFICIENTE');
    r = await pagar({ ...e, cuenta: e.cuenta }, 'SPEI-L', 5_000);
    assert.equal(r.status, 403); assert.equal(r.body.error.code, 'FIN_LIMIT_EXCEEDED');
    r = await llamar('POST', e.t, e.p, `nominas-por-pagar/${e.pn}/pagar`, { referencia: 'X' });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_CUENTA_REQUERIDA');
    r = await pagar({ ...e, p: randomUUID() });
    assert.equal(r.status, 404); assert.equal(r.body.error.code, 'FIN_NOMINA_NO_ENCONTRADA');
    assert.equal(await saldo(e.cuenta), 1_000);
    assert.equal(await estado(e.t, e.pn), 'POR_PAGAR');
    assert.deepEqual(await pres(e.pres!), { comprometido: 15_000, ejercido: 0, disponible: 35_000 });
  });

  await test('6. personal.nomina_pagada sin compromiso (flujo previo): no deja comprometido negativo', async () => {
    const t = randomUUID(), p = randomUUID();
    const r = await admin.presupuestoAsignado.create({
      data: { tenant_id: t, proyecto_id: p, codigo: 'MO', descripcion: 'MO', monto_autorizado: 1000, monto_disponible: 1000, capitulo: 'MANO_OBRA', estatus: 'ACTIVO' } as any,
    });
    await finanzas.handleNominaPagadaEvent(evento('personal.nomina_pagada', t, p, randomUUID(), 500) as any);
    assert.deepEqual(await pres(r.id_presupuesto), { comprometido: 0, ejercido: 0, disponible: 1000 });
  });

  await test('7. la migración es re-ejecutable y su CHECK exige cuenta y referencia en una nómina PAGADA', async () => {
    assert.ok(runSqlFile(MIGRACION, dbUrl).ok);
    await assert.rejects(admin.$executeRaw`INSERT INTO "nominas_por_pagar" ("tenant_id", "prenomina_id", "proyecto_id", "codigo", "total_neto", "estado")
      VALUES (${randomUUID()}::uuid, ${randomUUID()}::uuid, ${randomUUID()}::uuid, 'X', 10, 'PAGADA')`);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - nomina-por-pagar', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});
