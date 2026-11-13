/**
 * Integración (PostgreSQL real): libro bancario. Change: libro-bancario (M6).
 *
 * Invariantes:
 *   - todo cambio de saldo deja un movimiento con tipo, origen, origen_id y saldo antes/después, en la misma
 *     transacción: egreso de OCs, pago programado, nómina, cobro, ajuste y saldo inicial;
 *   - el saldo de la cuenta es igual a abonos - cargos de su libro, y la cadena saldo_anterior/saldo_posterior
 *     no tiene huecos, aun con cargos simultáneos;
 *   - PATCH ya no acepta saldo; el ajuste exige motivo, folio idempotente y límite de autoridad;
 *   - número de cuenta y CLABE salen enmascarados;
 *   - el libro es inmutable y la migración re-ejecutable; el script de saldo inicial cuadra cuentas previas.
 *
 * Runner: npm run test:integration:libro-bancario -w @bocam/finanzas
 * Requiere: PostgreSQL con schema finanzas y `psql` en el PATH. Sin RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { REPO_ROOT, runSqlFile } from '../support/sql';

const dbUrl =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
process.env.DATABASE_URL = dbUrl;
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });
const MIGRACIONES = join(__dirname, '..', '..', 'prisma', 'migrations');
const MIGRACION = join(MIGRACIONES, '20261114120000_libro_bancario', 'migration.sql');
const PREVIAS = ['20261109120000_egreso_oc_multiproveedor', '20261112120000_cuentas_por_cobrar', '20261113120000_nominas_por_pagar'];
const SCRIPT_SALDO_INICIAL = join(REPO_ROOT, 'scripts', 'finanzas', 'saldo-inicial-libro-bancario.sql');

EventBus.prototype.publish = async function () { return true; } as any;

let server: Server | undefined;
let baseUrl = '';

type Metodo = 'GET' | 'POST' | 'PATCH';
const llamar = async (metodo: Metodo, t: string, p: string, ruta: string, body?: any, opts: { limite?: number; roles?: string[] } = {}) => {
  const token = signTenantToken({
    userId: randomUUID(), tenantId: t, proyectoId: p, roles: opts.roles ?? ['finanzas'], projects: [p], limiteAprobacion: opts.limite ?? 999_999_999,
  } as any);
  const r = await fetch(`${baseUrl}/api/v1/finanzas/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: r.status, body: (await r.json()) as any };
};

const crearCuenta = async (t: string, p: string, saldo?: number) => {
  const r = await llamar('POST', t, p, 'cuentas-bancarias', {
    banco: 'BBVA', numero_cuenta: '0123456789', clabe: '012180001234567891', alias: 'Empresa', ...(saldo === undefined ? {} : { saldo }),
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.data.id_cuenta as string;
};

const ajustar = (t: string, p: string, cuenta: string, body: any, limite?: number) =>
  llamar('POST', t, p, `cuentas-bancarias/${cuenta}/ajustes`, body, { limite });

const saldo = async (id: string) => Number((await admin.cuentaBancaria.findUniqueOrThrow({ where: { id_cuenta: id } })).saldo);

interface Mov { tipo: string; origen: string; origen_id: string; monto: number; saldo_anterior: number; saldo_posterior: number; referencia: string | null; motivo: string | null; proyecto_id: string | null }
const libro = async (cuenta: string): Promise<Mov[]> => {
  const filas = await admin.$queryRawUnsafe<any[]>(
    `SELECT "tipo", "origen", "origen_id"::text AS origen_id, "monto"::float8 AS monto, "saldo_anterior"::float8 AS saldo_anterior,
            "saldo_posterior"::float8 AS saldo_posterior, "referencia", "motivo", "proyecto_id"::text AS proyecto_id
       FROM "movimientos_bancarios" WHERE "cuenta_id" = $1::uuid ORDER BY "secuencia"`, cuenta);
  return filas;
};

/** saldo = abonos - cargos y cada saldo_anterior es el saldo_posterior del movimiento previo. */
async function assertCuadra(cuenta: string) {
  const movs = await libro(cuenta);
  let corrido = 0;
  for (const m of movs) {
    assert.equal(m.saldo_anterior, corrido, `cadena rota en ${m.origen} ${m.origen_id}`);
    corrido = Math.round((corrido + (m.tipo === 'ABONO' ? m.monto : -m.monto)) * 100) / 100;
    assert.equal(m.saldo_posterior, corrido, `saldo_posterior de ${m.origen} ${m.origen_id}`);
  }
  assert.equal(await saldo(cuenta), corrido, 'saldo de la cuenta = abonos - cargos del libro');
}

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

function psql(file: string, vars: Record<string, string>) {
  const u = new URL(dbUrl);
  const schema = u.searchParams.get('schema') || 'public';
  u.search = '';
  const args = [u.toString(), '-X', '-v', `schema=${schema}`, ...Object.entries(vars).flatMap(([k, v]) => ['-v', `${k}=${v}`]), '-f', file];
  const r = spawnSync('psql', args, { encoding: 'utf8' });
  return { ok: r.status === 0, output: `${r.stdout || ''}\n${r.stderr || ''}` };
}

async function main() {
  for (const previa of PREVIAS) {
    const m = runSqlFile(join(MIGRACIONES, previa, 'migration.sql'), dbUrl);
    if (!m.ok) throw new Error(`No se pudo aplicar ${previa}:\n${m.output}`);
  }
  const m = runSqlFile(MIGRACION, dbUrl);
  if (!m.ok) throw new Error(`No se pudo aplicar la migración:\n${m.output}`);
  const finanzas = await import('../../src/main');
  const egreso = await import('../../src/egreso-oc');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  await test('1. alta con saldo inicial: movimiento SALDO_INICIAL; número y CLABE enmascarados en alta, lista y edición', async () => {
    const t = randomUUID(), p = randomUUID();
    const r = await llamar('POST', t, p, 'cuentas-bancarias', { banco: 'BBVA', numero_cuenta: '0123456789', clabe: '012180001234567891', alias: 'Empresa', saldo: 5000 });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.data.numero_cuenta, '****6789');
    assert.equal(r.body.data.clabe, '****7891');
    const cuenta = r.body.data.id_cuenta;
    const movs = await libro(cuenta);
    assert.equal(movs.length, 1);
    assert.deepEqual([movs[0].tipo, movs[0].origen, movs[0].origen_id, movs[0].monto], ['ABONO', 'SALDO_INICIAL', cuenta, 5000]);
    await assertCuadra(cuenta);

    const lista = await llamar('GET', t, p, 'cuentas-bancarias');
    assert.equal(lista.status, 200);
    assert.equal(lista.body.data[0].numero_cuenta, '****6789');
    assert.equal(lista.body.data[0].clabe, '****7891');
    const edit = await llamar('PATCH', t, p, `cuentas-bancarias/${cuenta}`, { alias: 'Operación' });
    assert.equal(edit.status, 200, JSON.stringify(edit.body));
    assert.equal(edit.body.data.alias, 'Operación');
    assert.equal(edit.body.data.numero_cuenta, '****6789');

    const sinSaldo = await crearCuenta(t, p);
    assert.equal((await libro(sinSaldo)).length, 0, 'sin saldo inicial no hay movimiento');
    const negativo = await llamar('POST', t, p, 'cuentas-bancarias', { banco: 'BBVA', numero_cuenta: '1', alias: 'X', saldo: -10 });
    assert.equal(negativo.status, 400); assert.equal(negativo.body.error.code, 'FIN_MONTO_INVALIDO');
    const limite = await llamar('POST', t, p, 'cuentas-bancarias', { banco: 'BBVA', numero_cuenta: '1', alias: 'X', saldo: 5000 }, { limite: 1000 });
    assert.equal(limite.status, 403); assert.equal(limite.body.error.code, 'FIN_LIMIT_EXCEEDED');
  });

  await test('2. PATCH con saldo: 400 FIN_SALDO_NO_EDITABLE y nada cambia', async () => {
    const t = randomUUID(), p = randomUUID();
    const cuenta = await crearCuenta(t, p, 1000);
    const r = await llamar('PATCH', t, p, `cuentas-bancarias/${cuenta}`, { alias: 'Otro', saldo: 999_999 });
    assert.equal(r.status, 400, JSON.stringify(r.body));
    assert.equal(r.body.error.code, 'FIN_SALDO_NO_EDITABLE');
    assert.equal(await saldo(cuenta), 1000);
    assert.equal((await admin.cuentaBancaria.findUniqueOrThrow({ where: { id_cuenta: cuenta } })).alias, 'Empresa');
    assert.equal((await libro(cuenta)).length, 1);
  });

  await test('3. ajuste: abono y cargo con motivo; folio idempotente; folio con otro contenido 409; validaciones', async () => {
    const t = randomUUID(), p = randomUUID();
    const cuenta = await crearCuenta(t, p, 1000);
    const abono = await ajustar(t, p, cuenta, { tipo: 'ABONO', monto: 250.5, folio: 'AJ-1', motivo: 'Intereses del mes de octubre' });
    assert.equal(abono.status, 201, JSON.stringify(abono.body));
    assert.equal(abono.body.data.saldo_posterior, 1250.5);
    assert.equal(abono.body.data.idempotente, false);
    const cargo = await ajustar(t, p, cuenta, { tipo: 'CARGO', monto: 50, folio: 'AJ-2', motivo: 'Comisión bancaria por SPEI' });
    assert.equal(cargo.status, 201, JSON.stringify(cargo.body));
    assert.equal(await saldo(cuenta), 1200.5);

    const otra = await ajustar(t, p, cuenta, { tipo: 'CARGO', monto: 50, folio: 'AJ-2', motivo: 'Comisión bancaria por SPEI' });
    assert.equal(otra.status, 200); assert.equal(otra.body.data.idempotente, true);
    const distinto = await ajustar(t, p, cuenta, { tipo: 'CARGO', monto: 60, folio: 'AJ-2', motivo: 'Comisión bancaria por SPEI' });
    assert.equal(distinto.status, 409); assert.equal(distinto.body.error.code, 'FIN_AJUSTE_DUPLICADO');

    const casos: Array<[any, number, string, number?]> = [
      [{ tipo: 'CARGO', monto: 10, folio: 'AJ-3', motivo: 'corto' }, 400, 'FIN_MOTIVO_INVALIDO'],
      [{ tipo: 'OTRO', monto: 10, folio: 'AJ-3', motivo: 'Motivo suficientemente largo' }, 400, 'FIN_TIPO_INVALIDO'],
      [{ tipo: 'CARGO', monto: 10.001, folio: 'AJ-3', motivo: 'Motivo suficientemente largo' }, 400, 'FIN_MONTO_INVALIDO'],
      [{ tipo: 'CARGO', monto: 10, motivo: 'Motivo suficientemente largo' }, 400, 'FIN_FOLIO_INVALIDO'],
      [{ tipo: 'CARGO', monto: 99_999, folio: 'AJ-3', motivo: 'Motivo suficientemente largo' }, 422, 'FIN_SALDO_INSUFICIENTE'],
      [{ tipo: 'ABONO', monto: 5000, folio: 'AJ-3', motivo: 'Motivo suficientemente largo' }, 403, 'FIN_LIMIT_EXCEEDED', 1000],
    ];
    for (const [body, status, code, limite] of casos) {
      const r = await ajustar(t, p, cuenta, body, limite);
      assert.equal(r.status, status, `${code}: ${JSON.stringify(r.body)}`);
      assert.equal(r.body.error.code, code);
    }
    const rol = await llamar('POST', t, p, `cuentas-bancarias/${cuenta}/ajustes`,
      { tipo: 'ABONO', monto: 1, folio: 'AJ-4', motivo: 'Motivo suficientemente largo' }, { roles: ['compras'] });
    assert.equal(rol.status, 403);
    const ajena = await ajustar(randomUUID(), p, cuenta, { tipo: 'ABONO', monto: 1, folio: 'AJ-5', motivo: 'Motivo suficientemente largo' });
    assert.equal(ajena.status, 404); assert.equal(ajena.body.error.code, 'FIN_CUENTA_NO_ENCONTRADA');

    assert.equal(await saldo(cuenta), 1200.5);
    const movs = await libro(cuenta);
    assert.deepEqual(movs.map((x) => [x.origen, x.tipo, x.referencia]), [
      ['SALDO_INICIAL', 'ABONO', null], ['AJUSTE', 'ABONO', 'AJ-1'], ['AJUSTE', 'CARGO', 'AJ-2'],
    ]);
    assert.equal(movs[2].motivo, 'Comisión bancaria por SPEI');
    await assertCuadra(cuenta);
  });

  await test('4. cada operación deja su movimiento con origen: egreso OC, pago programado, nómina y cobro; el libro cuadra', async () => {
    const t = randomUUID(), p = randomUUID();
    const cuenta = await crearCuenta(t, p, 100_000);
    const pres = await admin.presupuestoAsignado.create({
      data: {
        tenant_id: t, proyecto_id: p, codigo: `PRES-LB-${randomUUID().slice(0, 8)}`, descripcion: 'Libro bancario',
        monto_autorizado: 50_000, monto_disponible: 50_000, monto_comprometido: 0, monto_ejercido: 0, capitulo: 'MATERIALES', moneda: 'MXN', estatus: 'ACTIVO',
      } as any,
    });

    // Egreso de OC
    const ocId = randomUUID();
    await egreso.registrarOcPorPagar({ tenantId: t, proyectoId: p, userId: randomUUID() }, {
      oc_id: ocId, codigo: `OC-${ocId.slice(0, 6)}`, total: 3000, proveedor_id: randomUUID(), proveedor_nombre: 'Aceros SA', concepto_id: null,
    });
    const eg = await llamar('POST', t, p, 'pagos-oc', {
      proyecto_id: p, fuente: 'CUENTA_BANCARIA', cuenta_id: cuenta, tipo_pago: 'SPEI', referencia: 'SPEI-EG-1', concepto: 'Pago OC',
      fecha_pago: '2026-11-13', detalles: [{ oc_id: ocId, monto_aplicado: 3000 }],
    });
    assert.equal(eg.status, 201, JSON.stringify(eg.body));

    // Pago programado
    const prog = await llamar('POST', t, p, 'pagos', {
      presupuesto_id: pres.id_presupuesto, concepto: 'Subcontrato', beneficiario: 'Sub SA', monto_programado: 2000, fecha_programada: '2026-11-20',
    });
    assert.equal(prog.status, 201, JSON.stringify(prog.body));
    const pp = await llamar('PATCH', t, p, `pagos/${prog.body.data.id_pago}/pagar`, { cuenta_id: cuenta, referencia_bancaria: 'SPEI-PP-1', metodo_pago: 'SPEI' });
    assert.equal(pp.status, 200, JSON.stringify(pp.body));

    // Nómina
    const pn = randomUUID();
    await finanzas.handleNominaAutorizadaEvent({
      event_type: 'personal.nomina_autorizada', timestamp: new Date().toISOString(),
      context: { tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: randomUUID() },
      payload: { prenomina_id: pn, codigo: 'PN-1', periodo_tipo: 'SEMANAL', periodo_inicio: '2026-11-02T00:00:00.000Z', periodo_fin: '2026-11-08T00:00:00.000Z',
        total_percepciones: 1500, total_deducciones: 0, total_neto: 1500, total_empleados: 4 },
    } as any);
    const nom = await llamar('POST', t, p, `nominas-por-pagar/${pn}/pagar`, { cuenta_id: cuenta, referencia: 'SPEI-NOM-1', fecha_pago: '2026-11-13' });
    assert.equal(nom.status, 201, JSON.stringify(nom.body));

    // Cobro
    const est = randomUUID();
    await finanzas.handleEstimacionAprobadaEvent({
      event_type: 'control_obra.estimacion_aprobada', timestamp: new Date().toISOString(),
      context: { tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: randomUUID() },
      payload: { estimacion_id: est, codigo: 'EST-1', total_neto: 8000, presupuesto_id: pres.id_presupuesto, total_conceptos: 2 },
    } as any);
    const cxc = await admin.cuentaPorCobrar.findFirstOrThrow({ where: { tenant_id: t, origen_id: est } });
    const co = await llamar('POST', t, p, `cuentas-por-cobrar/${cxc.id_cxc}/cobros`, { cuenta_id: cuenta, folio: 'COB-1', monto: 8000, fecha_cobro: '2026-11-13' });
    assert.equal(co.status, 201, JSON.stringify(co.body));

    assert.equal(await saldo(cuenta), 100_000 - 3000 - 2000 - 1500 + 8000);
    const movs = await libro(cuenta);
    assert.deepEqual(movs.map((x) => [x.origen, x.tipo, x.monto]), [
      ['SALDO_INICIAL', 'ABONO', 100_000], ['EGRESO_OC', 'CARGO', 3000], ['PAGO_PROGRAMADO', 'CARGO', 2000],
      ['NOMINA', 'CARGO', 1500], ['COBRO_CXC', 'ABONO', 8000],
    ]);
    assert.equal(movs[1].origen_id, eg.body.data.pago_id); assert.equal(movs[1].referencia, 'SPEI-EG-1');
    assert.equal(movs[2].origen_id, prog.body.data.id_pago); assert.equal(movs[2].referencia, 'SPEI-PP-1');
    assert.equal(movs[3].origen_id, pn); assert.equal(movs[3].referencia, 'SPEI-NOM-1');
    assert.equal(movs[4].origen_id, co.body.data.id_cobro); assert.equal(movs[4].referencia, 'COB-1');
    for (const x of movs.slice(1)) assert.equal(x.proyecto_id, p, 'el movimiento guarda el proyecto de la operación');
    await assertCuadra(cuenta);

    // Reintentos idempotentes no duplican movimientos.
    const egOtra = await llamar('POST', t, p, 'pagos-oc', {
      proyecto_id: p, fuente: 'CUENTA_BANCARIA', cuenta_id: cuenta, tipo_pago: 'SPEI', referencia: 'SPEI-EG-1', concepto: 'Pago OC',
      fecha_pago: '2026-11-13', detalles: [{ oc_id: ocId, monto_aplicado: 3000 }],
    });
    assert.equal(egOtra.status, 200, JSON.stringify(egOtra.body));
    const coOtra = await llamar('POST', t, p, `cuentas-por-cobrar/${cxc.id_cxc}/cobros`, { cuenta_id: cuenta, folio: 'COB-1', monto: 8000, fecha_cobro: '2026-11-13' });
    assert.equal(coOtra.status, 200, JSON.stringify(coOtra.body));
    assert.equal((await libro(cuenta)).length, 5);

    // Un rechazo (saldo insuficiente) no deja movimiento.
    const prog2 = await llamar('POST', t, p, 'pagos', {
      presupuesto_id: pres.id_presupuesto, concepto: 'Grande', beneficiario: 'Sub SA', monto_programado: 45_000, fecha_programada: '2026-11-20',
    });
    const sinSaldo = await ajustar(t, p, cuenta, { tipo: 'CARGO', monto: 60_000, folio: 'AJ-VACIA', motivo: 'Vaciar la cuenta para la prueba' });
    assert.equal(sinSaldo.status, 201, JSON.stringify(sinSaldo.body));
    const pp2 = await llamar('PATCH', t, p, `pagos/${prog2.body.data.id_pago}/pagar`, { cuenta_id: cuenta, referencia_bancaria: 'SPEI-PP-2' });
    assert.equal(pp2.status, 422); assert.equal(pp2.body.error.code, 'FIN_SALDO_INSUFICIENTE');
    assert.equal((await libro(cuenta)).length, 6);
    await assertCuadra(cuenta);
  });

  await test('5. 10 cargos simultáneos de $100 sobre $500: pasan 5, la cuenta queda en 0 y la cadena no tiene huecos', async () => {
    const t = randomUUID(), p = randomUUID();
    const cuenta = await crearCuenta(t, p, 500);
    const rs = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      ajustar(t, p, cuenta, { tipo: 'CARGO', monto: 100, folio: `CC-${i}`, motivo: 'Cargo concurrente de prueba' })));
    assert.equal(rs.filter((r) => r.status === 201).length, 5, JSON.stringify(rs.map((r) => r.status)));
    assert.equal(rs.filter((r) => r.status === 422).length, 5);
    assert.equal(await saldo(cuenta), 0);
    assert.equal((await libro(cuenta)).length, 6);
    await assertCuadra(cuenta);
  });

  await test('6. GET movimientos: paginado por secuencia, sin repetir; filtro por origen; otro tenant 404', async () => {
    const t = randomUUID(), p = randomUUID();
    const cuenta = await crearCuenta(t, p, 1000);
    for (let i = 0; i < 4; i++) await ajustar(t, p, cuenta, { tipo: 'CARGO', monto: 10, folio: `PG-${i}`, motivo: 'Comisión de prueba paginada' });
    const uno = await llamar('GET', t, p, `cuentas-bancarias/${cuenta}/movimientos?limit=3`);
    assert.equal(uno.status, 200, JSON.stringify(uno.body));
    assert.equal(uno.body.data.length, 3);
    assert.equal(uno.body.data[0].referencia, 'PG-3', 'más reciente primero');
    assert.equal(typeof uno.body.data[0].monto, 'number');
    const cursor = uno.body.meta.paginacion.next_cursor;
    assert.ok(cursor);
    const dos = await llamar('GET', t, p, `cuentas-bancarias/${cuenta}/movimientos?limit=3&cursor=${cursor}`);
    assert.equal(dos.body.data.length, 2);
    assert.equal(dos.body.meta.paginacion.next_cursor, null);
    const ids = [...uno.body.data, ...dos.body.data].map((x: any) => x.id_movimiento);
    assert.equal(new Set(ids).size, 5);
    const solo = await llamar('GET', t, p, `cuentas-bancarias/${cuenta}/movimientos?origen=SALDO_INICIAL`);
    assert.equal(solo.body.data.length, 1);
    const malo = await llamar('GET', t, p, `cuentas-bancarias/${cuenta}/movimientos?cursor=xx`);
    assert.equal(malo.status, 400);
    const otro = await llamar('GET', randomUUID(), p, `cuentas-bancarias/${cuenta}/movimientos`);
    assert.equal(otro.status, 404);
  });

  await test('7. el libro es inmutable y la migración es re-ejecutable con sus CHECK', async () => {
    const t = randomUUID(), p = randomUUID();
    const cuenta = await crearCuenta(t, p, 100);
    await assert.rejects(admin.$executeRawUnsafe(`UPDATE "movimientos_bancarios" SET "monto" = 1 WHERE "cuenta_id" = $1::uuid`, cuenta), /inmutable/);
    await assert.rejects(admin.$executeRawUnsafe(`DELETE FROM "movimientos_bancarios" WHERE "cuenta_id" = $1::uuid`, cuenta), /inmutable/);
    assert.ok(runSqlFile(MIGRACION, dbUrl).ok, 'segunda aplicación');
    const ins = (monto: number, ant: number, post: number, origen = 'SALDO_INICIAL') => admin.$executeRawUnsafe(
      `INSERT INTO "movimientos_bancarios" ("id_movimiento", "tenant_id", "cuenta_id", "tipo", "origen", "origen_id", "monto", "saldo_anterior", "saldo_posterior")
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 'ABONO', $6, gen_random_uuid(), $3, $4, $5)`, t, cuenta, monto, ant, post, origen);
    await assert.rejects(ins(0, 0, 0), /ck_movimientos_bancarios_monto/);
    await assert.rejects(ins(10, 0, 11), /ck_movimientos_bancarios_saldo/);
    await assert.rejects(ins(10, 0, 10, 'AJUSTE'), /ck_movimientos_bancarios_ajuste/);
  });

  await test('8. script de saldo inicial: simulación no guarda; aplicado cuadra cuentas previas al libro, re-ejecutable', async () => {
    const t = randomUUID(), p = randomUUID();
    // Cuenta previa al libro (saldo editado a mano) que después ya registró un cargo con libro.
    const previa = await admin.cuentaBancaria.create({
      data: { tenant_id: t, proyecto_id: null, banco: 'Banorte', numero_cuenta: '999', alias: 'Previa', saldo: 700 },
    });
    const c = await ajustar(t, p, previa.id_cuenta, { tipo: 'CARGO', monto: 200, folio: 'PRE-1', motivo: 'Cargo posterior al despliegue' });
    assert.equal(c.status, 201, JSON.stringify(c.body));

    const sim = psql(SCRIPT_SALDO_INICIAL, {});
    assert.ok(sim.ok, sim.output);
    assert.match(sim.output, /SIMULACION/);
    assert.equal((await libro(previa.id_cuenta)).length, 1);

    const ap = psql(SCRIPT_SALDO_INICIAL, { aplicar: '1' });
    assert.ok(ap.ok, ap.output);
    assert.match(ap.output, /APLICADO/);
    const movs = await libro(previa.id_cuenta);
    assert.deepEqual(movs.map((x) => [x.origen, x.tipo, x.monto, x.saldo_anterior, x.saldo_posterior]), [
      ['SALDO_INICIAL', 'ABONO', 700, 0, 700], ['AJUSTE', 'CARGO', 200, 700, 500],
    ]);
    await assertCuadra(previa.id_cuenta);

    const otra = psql(SCRIPT_SALDO_INICIAL, { aplicar: '1' });
    assert.ok(otra.ok, otra.output);
    assert.equal((await libro(previa.id_cuenta)).length, 2, 're-ejecutable');
    assert.doesNotMatch(otra.output, new RegExp(previa.id_cuenta), 'la cuenta ya no aparece como descuadrada');
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - libro-bancario', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});
