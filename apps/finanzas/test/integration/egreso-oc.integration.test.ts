/**
 * Integración (PostgreSQL real): egreso que liquida N OCs de N proveedores del mismo proyecto.
 * Change: corregir-egreso-oc-multiproveedor.
 *
 * Invariantes:
 *   - un egreso liquida OCs de varios proveedores del proyecto; la cuenta baja exactamente el total;
 *   - una OC de otro proyecto rechaza el egreso completo sin efectos;
 *   - abonos parciales hasta PAGADA; no se paga una OC ya pagada;
 *   - egresos concurrentes sobre la misma OC nunca pagan más que su saldo;
 *   - idempotencia por folio; mismo folio con otro contenido es 409;
 *   - saldo insuficiente no deja rastro; anticipo se descuenta de forma atómica;
 *   - presupuesto: comprometido → ejercido (DEVENGADO); cancelar tras abono libera solo el resto.
 *
 * Runner: npm run test:integration:egreso-oc -w @bocam/finanzas
 * Requiere: PostgreSQL con schema finanzas (db push + migración 20261109120000_egreso_oc_multiproveedor). Sin RabbitMQ.
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

const MIGRACION = join(__dirname, '..', '..', 'prisma', 'migrations', '20261109120000_egreso_oc_multiproveedor', 'migration.sql');
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });

type Publicado = { type: string; payload: any; tenantId: string };
const publicados: Publicado[] = [];
EventBus.prototype.publish = async function (event: any) {
  publicados.push({ type: event.event_type, payload: event.payload, tenantId: event.context?.tenant_id });
  return true;
} as any;

let finanzas: typeof import('../../src/main');
let egreso: typeof import('../../src/egreso-oc');
let compromiso: typeof import('../../src/compromiso-oc');
let server: Server | undefined;
let baseUrl = '';

const token = (t: string, p: string) =>
  signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles: ['finanzas'], projects: [p], limiteAprobacion: 999_999_999 } as any);

const postEgreso = async (t: string, p: string, body: any) => {
  const r = await fetch(`${baseUrl}/api/v1/finanzas/pagos-oc`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token(t, p)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: r.status, body: (await r.json()) as any };
};

const ctxOc = (t: string, p: string) => ({ tenantId: t, proyectoId: p, userId: randomUUID() });

async function sembrarPresupuesto(t: string, p: string, disponible: number) {
  const pres = await admin.presupuestoAsignado.create({
    data: {
      tenant_id: t, proyecto_id: p, codigo: `PRES-EG-${randomUUID().slice(0, 8)}`, descripcion: 'Presupuesto prueba egreso',
      monto_autorizado: disponible, monto_disponible: disponible, monto_comprometido: 0, monto_ejercido: 0,
      capitulo: 'MATERIALES', moneda: 'MXN', estatus: 'ACTIVO',
    } as any,
  });
  return pres.id_presupuesto;
}

async function sembrarCuenta(t: string, saldo: number) {
  const c = await admin.cuentaBancaria.create({
    data: { tenant_id: t, proyecto_id: null, banco: 'BBVA', numero_cuenta: `0${Date.now()}`.slice(0, 12), alias: 'Empresa', saldo },
  });
  return c.id_cuenta;
}

/** OC por pagar (proyección) + su COMPROMISO presupuestal, como quedan tras emitir la OC en Compras. */
async function sembrarOc(t: string, p: string, presupuestoId: string, total: number) {
  const ocId = randomUUID();
  const codigo = `OC-${ocId.slice(0, 6)}`;
  await egreso.registrarOcPorPagar(ctxOc(t, p), {
    oc_id: ocId, codigo, total, proveedor_id: randomUUID(), proveedor_nombre: `Proveedor ${codigo}`, concepto_id: null,
  });
  const r = await compromiso.registrarCompromisoOc(ctxOc(t, p), {
    ocId, ocCodigo: codigo, monto: total, presupuestoId, validarSuficiencia: true,
    concepto: `Compromiso ${codigo}`, notas: 'prueba egreso',
  });
  assert.equal(r.estado, 'creado', `compromiso de ${codigo}`);
  return ocId;
}

const leerCuenta = async (id: string) => Number((await admin.cuentaBancaria.findUniqueOrThrow({ where: { id_cuenta: id } })).saldo);
const leerPresupuesto = async (id: string) => {
  const p = await admin.presupuestoAsignado.findUniqueOrThrow({ where: { id_presupuesto: id } });
  return { comprometido: Number(p.monto_comprometido), ejercido: Number(p.monto_ejercido), disponible: Number(p.monto_disponible) };
};
const leerOc = async (t: string, ocId: string) => {
  const r = await admin.$queryRawUnsafe<Array<{ pagado: string; estado: string }>>(
    `SELECT "pagado"::text AS pagado, "estado" FROM "ocs_por_pagar" WHERE "tenant_id" = $1::uuid AND "oc_id" = $2::uuid`, t, ocId,
  );
  return { pagado: Number(r[0].pagado), estado: r[0].estado };
};
const contarPagos = (t: string) => admin.pagoOC.count({ where: { tenant_id: t } });

const base = (cuentaId: string, referencia: string) => ({
  fuente: 'CUENTA_BANCARIA', cuenta_id: cuentaId, tipo_pago: 'SPEI', referencia, concepto: 'Pago semana 45', fecha_pago: '2026-11-05',
});

const resultados: Array<{ name: string; ok: boolean; error?: string }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false, error: e.message }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n')[0]}`); }
}

async function main() {
  const m = runSqlFile(MIGRACION, dbUrl);
  if (!m.ok) throw new Error(`No se pudo aplicar la migración:\n${m.output}`);
  finanzas = await import('../../src/main');
  egreso = await import('../../src/egreso-oc');
  compromiso = await import('../../src/compromiso-oc');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  await test('1. un egreso liquida 3 OCs de 3 proveedores del mismo proyecto', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await sembrarPresupuesto(t, p, 10_000);
    const cuenta = await sembrarCuenta(t, 10_000);
    const [a, b, c] = [await sembrarOc(t, p, pres, 1000), await sembrarOc(t, p, pres, 2000), await sembrarOc(t, p, pres, 500)];
    const r = await postEgreso(t, p, { ...base(cuenta, 'SPEI-001'), detalles: [
      { oc_id: a, monto_aplicado: 1000 }, { oc_id: b, monto_aplicado: 2000 }, { oc_id: c, monto_aplicado: 500 },
    ] });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.data.monto_total, 3500);
    assert.equal(new Set(r.body.data.detalles.map((d: any) => d.proveedor_id)).size, 3, 'tres proveedores distintos');
    assert.equal(await leerCuenta(cuenta), 6500);
    for (const oc of [a, b, c]) assert.equal((await leerOc(t, oc)).estado, 'PAGADA');
    assert.deepEqual(await leerPresupuesto(pres), { comprometido: 0, ejercido: 3500, disponible: 6500 });
    const devengados = await admin.movimientoPresupuestal.count({ where: { tenant_id: t, tipo: 'DEVENGADO', referencia_modulo: 'finanzas' } });
    assert.equal(devengados, 3);
    const ev = publicados.filter((e) => e.tenantId === t);
    assert.equal(ev.filter((e) => e.type === 'finanzas.oc_pagada_total').length, 3);
    const egresoEv = ev.find((e) => e.type === 'finanzas.egreso_oc_registrado');
    assert.ok(egresoEv, 'publica egreso_oc_registrado');
    assert.equal(egresoEv!.payload.detalles.length, 3);
  });

  await test('2. una OC de otro proyecto rechaza el egreso completo sin efectos', async () => {
    const t = randomUUID(), p = randomUUID(), q = randomUUID();
    const presP = await sembrarPresupuesto(t, p, 10_000), presQ = await sembrarPresupuesto(t, q, 10_000);
    const cuenta = await sembrarCuenta(t, 10_000);
    const deP = await sembrarOc(t, p, presP, 1000), deQ = await sembrarOc(t, q, presQ, 1000);
    const r = await postEgreso(t, p, { ...base(cuenta, 'SPEI-002'), detalles: [
      { oc_id: deP, monto_aplicado: 1000 }, { oc_id: deQ, monto_aplicado: 1000 },
    ] });
    assert.equal(r.status, 422, JSON.stringify(r.body));
    // Con RLS del proyecto P, la OC de Q no es visible: se rechaza como no por pagar o de otro proyecto.
    assert.ok(['FIN_OC_OTRO_PROYECTO', 'FIN_OC_NO_POR_PAGAR'].includes(r.body.error.code), r.body.error.code);
    assert.equal(await leerCuenta(cuenta), 10_000);
    assert.equal(await contarPagos(t), 0);
    assert.equal((await leerOc(t, deP)).pagado, 0);
    assert.deepEqual(await leerPresupuesto(presP), { comprometido: 1000, ejercido: 0, disponible: 9000 });
  });

  await test('3. abono parcial, abono final y rechazo de OC ya pagada', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await sembrarPresupuesto(t, p, 10_000);
    const cuenta = await sembrarCuenta(t, 10_000);
    const oc = await sembrarOc(t, p, pres, 1000);
    let r = await postEgreso(t, p, { ...base(cuenta, 'CH-100'), tipo_pago: 'CHEQUE', detalles: [{ oc_id: oc, monto_aplicado: 400 }] });
    assert.equal(r.status, 201);
    assert.deepEqual(await leerOc(t, oc), { pagado: 400, estado: 'PAGO_PARCIAL' });
    assert.equal(r.body.data.detalles[0].saldo_oc_antes, 1000);
    assert.equal(r.body.data.detalles[0].saldo_oc_despues, 600);
    assert.ok(publicados.some((e) => e.tenantId === t && e.type === 'finanzas.oc_pagada_parcial'));
    r = await postEgreso(t, p, { ...base(cuenta, 'CH-101'), tipo_pago: 'CHEQUE', detalles: [{ oc_id: oc, monto_aplicado: 600 }] });
    assert.equal(r.status, 201);
    assert.deepEqual(await leerOc(t, oc), { pagado: 1000, estado: 'PAGADA' });
    r = await postEgreso(t, p, { ...base(cuenta, 'CH-102'), tipo_pago: 'CHEQUE', detalles: [{ oc_id: oc, monto_aplicado: 1 }] });
    assert.equal(r.status, 409);
    assert.equal(r.body.error.code, 'FIN_OC_PAGADA');
    assert.equal(await leerCuenta(cuenta), 9000);
  });

  await test('4. egresos concurrentes sobre la misma OC nunca pagan más que su saldo', async () => {
    for (let ronda = 0; ronda < 8; ronda++) {
      const t = randomUUID(), p = randomUUID();
      const pres = await sembrarPresupuesto(t, p, 10_000);
      const cuenta = await sembrarCuenta(t, 10_000);
      const oc = await sembrarOc(t, p, pres, 1000);
      const rs = await Promise.all([0, 1].map((i) =>
        postEgreso(t, p, { ...base(cuenta, `SPEI-C${ronda}-${i}`), detalles: [{ oc_id: oc, monto_aplicado: 800 }] })));
      const estados = rs.map((r) => r.status).sort();
      assert.deepEqual(estados, [201, 422], `ronda ${ronda}: ${JSON.stringify(rs.map((r) => r.body.error?.code ?? r.status))}`);
      assert.equal(rs.find((r) => r.status === 422)!.body.error.code, 'FIN_MONTO_EXCEDE_SALDO');
      assert.equal(await leerCuenta(cuenta), 9200, `ronda ${ronda}: la cuenta se descuenta una sola vez`);
      assert.deepEqual(await leerOc(t, oc), { pagado: 800, estado: 'PAGO_PARCIAL' });
    }
  });

  await test('5. mismo folio: reintento idempotente; contenido distinto es 409', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await sembrarPresupuesto(t, p, 10_000);
    const cuenta = await sembrarCuenta(t, 10_000);
    const oc = await sembrarOc(t, p, pres, 1000);
    const body = { ...base(cuenta, 'SPEI-IDEM'), detalles: [{ oc_id: oc, monto_aplicado: 300 }] };
    const r1 = await postEgreso(t, p, body);
    const r2 = await postEgreso(t, p, body);
    assert.equal(r1.status, 201);
    assert.equal(r2.status, 200);
    assert.equal(r2.body.data.idempotente, true);
    assert.equal(r2.body.data.pago_id, r1.body.data.pago_id);
    assert.equal(await leerCuenta(cuenta), 9700);
    const eventos = publicados.filter((e) => e.tenantId === t && e.type === 'finanzas.egreso_oc_registrado');
    assert.equal(eventos.length, 1, 'el reintento no republica');
    const r3 = await postEgreso(t, p, { ...body, detalles: [{ oc_id: oc, monto_aplicado: 350 }] });
    assert.equal(r3.status, 409);
    assert.equal(r3.body.error.code, 'FIN_FOLIO_DUPLICADO');
    assert.equal(await leerCuenta(cuenta), 9700);
  });

  await test('6. saldo insuficiente no deja rastro', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await sembrarPresupuesto(t, p, 10_000);
    const cuenta = await sembrarCuenta(t, 100);
    const oc = await sembrarOc(t, p, pres, 1000);
    const r = await postEgreso(t, p, { ...base(cuenta, 'SPEI-SIN'), detalles: [{ oc_id: oc, monto_aplicado: 500 }] });
    assert.equal(r.status, 422);
    assert.equal(r.body.error.code, 'FIN_SALDO_INSUFICIENTE');
    assert.equal(await leerCuenta(cuenta), 100);
    assert.equal(await contarPagos(t), 0);
    assert.deepEqual(await leerOc(t, oc), { pagado: 0, estado: 'POR_PAGAR' });
    assert.deepEqual(await leerPresupuesto(pres), { comprometido: 1000, ejercido: 0, disponible: 9000 });
  });

  await test('7. cancelar una OC con abono libera solo lo no pagado', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await sembrarPresupuesto(t, p, 10_000);
    const cuenta = await sembrarCuenta(t, 10_000);
    const oc = await sembrarOc(t, p, pres, 1000);
    const r = await postEgreso(t, p, { ...base(cuenta, 'SPEI-CAN'), detalles: [{ oc_id: oc, monto_aplicado: 400 }] });
    assert.equal(r.status, 201);
    const codigo = r.body.data.detalles[0].oc_codigo;
    await compromiso.registrarCancelacionOc(ctxOc(t, p), { ocId: oc, ocCodigo: codigo, origen: 'EVENTO', concepto: 'Cancelación', notas: 'prueba' });
    await egreso.cancelarOcPorPagar(ctxOc(t, p), oc);
    assert.deepEqual(await leerPresupuesto(pres), { comprometido: 0, ejercido: 400, disponible: 9600 });
    assert.equal((await leerOc(t, oc)).estado, 'CANCELADA');
    const r2 = await postEgreso(t, p, { ...base(cuenta, 'SPEI-CAN-2'), detalles: [{ oc_id: oc, monto_aplicado: 100 }] });
    assert.equal(r2.status, 409);
    assert.equal(r2.body.error.code, 'FIN_OC_CANCELADA');
  });

  await test('8. egreso con anticipo se descuenta de forma atómica', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await sembrarPresupuesto(t, p, 10_000);
    await admin.proyectoFinanzas.create({ data: { tenant_id: t, proyecto_id: p, anticipo_total: 1000, anticipo_usado: 0 } });
    const [a, b] = [await sembrarOc(t, p, pres, 700), await sembrarOc(t, p, pres, 700)];
    const cuerpo = (ref: string, oc: string) => ({ fuente: 'ANTICIPO', tipo_pago: 'TRANSFERENCIA', referencia: ref, concepto: 'Con anticipo',
      fecha_pago: '2026-11-05', detalles: [{ oc_id: oc, monto_aplicado: 700 }] });
    const rs = await Promise.all([postEgreso(t, p, cuerpo('ANT-1', a)), postEgreso(t, p, cuerpo('ANT-2', b))]);
    assert.deepEqual(rs.map((r) => r.status).sort(), [201, 422]);
    assert.equal(rs.find((r) => r.status === 422)!.body.error.code, 'FIN_ANTICIPO_INSUFICIENTE');
    const pf = await admin.proyectoFinanzas.findFirstOrThrow({ where: { tenant_id: t, proyecto_id: p } });
    assert.equal(Number(pf.anticipo_usado), 700);
  });

  const fallidas = resultados.filter((r) => !r.ok);
  console.log(`\n${resultados.length - fallidas.length}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(fallidas.length ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - egreso-oc', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});
