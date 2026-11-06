/**
 * Integración (PostgreSQL real): movimientos, transferencias y sincronización con GT a prueba de concurrencia.
 * Change: blindar-movimientos-y-sincronizacion-gt (hallazgos F18, F22 y F23).
 *
 * Invariante: monto_disponible = monto_autorizado - monto_comprometido - monto_ejercido.
 *
 * Runner: npm run test:integration:presupuesto-blindado -w @bocam/finanzas
 * Requiere: PostgreSQL con schema finanzas (db push + migraciones de Finanzas). Sin RabbitMQ.
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

const MIGRACION = join(__dirname, '..', '..', 'prisma', 'migrations', '20261111120000_unicidad_transferencias', 'migration.sql');
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const publicados: Array<{ type: string; tenantId: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  publicados.push({ type: event.event_type, tenantId: event.context?.tenant_id });
  return true;
} as any;

let finanzas: typeof import('../../src/main');
let compromiso: typeof import('../../src/compromiso-oc');
let server: Server | undefined;
let baseUrl = '';

const post = async (t: string, p: string, ruta: string, body: any) => {
  const token = signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles: ['finanzas'], projects: [p], limiteAprobacion: 999_999_999 } as any);
  const r = await fetch(`${baseUrl}/api/v1/finanzas/${ruta}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, body: (await r.json()) as any };
};

async function presupuestoManual(t: string, p: string, monto: number) {
  const pres = await admin.presupuestoAsignado.create({
    data: {
      tenant_id: t, proyecto_id: p, codigo: `PRES-BL-${randomUUID().slice(0, 8)}`, descripcion: 'Bolsa manual',
      monto_autorizado: monto, monto_disponible: monto, monto_comprometido: 0, monto_ejercido: 0,
      capitulo: 'MANO_OBRA', moneda: 'MXN', estatus: 'ACTIVO',
    } as any,
  });
  return pres.id_presupuesto;
}

const eventoGt = (t: string, p: string, conceptoId: string, monto: number) => ({
  event_type: 'gerencia_tecnica.saldo_partida_creado',
  timestamp: new Date().toISOString(),
  context: { tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
  payload: { partidas: [{ concepto_id: conceptoId, concepto_clave: `MAT-${conceptoId.slice(0, 4)}`, concepto_desc: 'Partida GT', monto_aprobado: monto, categoria_predominante: 'MATERIAL' }] },
});

const leer = async (id: string) => {
  const r = await admin.presupuestoAsignado.findUniqueOrThrow({ where: { id_presupuesto: id } });
  return {
    autorizado: Number(r.monto_autorizado), comprometido: Number(r.monto_comprometido),
    ejercido: Number(r.monto_ejercido), disponible: Number(r.monto_disponible),
  };
};
const invariante = async (id: string) => {
  const s = await leer(id);
  assert.equal(Math.round((s.autorizado - s.comprometido - s.ejercido) * 100), Math.round(s.disponible * 100),
    `invariante disponible = autorizado - comprometido - ejercido (${JSON.stringify(s)})`);
  return s;
};

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function main() {
  const m = runSqlFile(MIGRACION, dbUrl);
  if (!m.ok) throw new Error(`No se pudo aplicar la migración:\n${m.output}`);
  finanzas = await import('../../src/main');
  compromiso = await import('../../src/compromiso-oc');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  await test('1. la resincronización de GT respeta lo comprometido (F18)', async () => {
    const t = randomUUID(), p = randomUUID(), concepto = randomUUID();
    await finanzas.handleSaldoPartidaCreadoEvent(eventoGt(t, p, concepto, 1000) as any);
    const pres = await admin.presupuestoAsignado.findFirstOrThrow({ where: { tenant_id: t, proyecto_id: p, concepto_id: concepto } });
    const r = await compromiso.registrarCompromisoOc({ tenantId: t, proyectoId: p, userId: randomUUID() }, {
      ocId: randomUUID(), ocCodigo: 'OC-GT-1', monto: 300, presupuestoId: pres.id_presupuesto, validarSuficiencia: true,
      concepto: 'Compromiso', notas: 'prueba',
    } as any);
    assert.equal(r.estado, 'creado');
    await finanzas.handleSaldoPartidaCreadoEvent(eventoGt(t, p, concepto, 1000) as any);
    assert.deepEqual(await invariante(pres.id_presupuesto), { autorizado: 1000, comprometido: 300, ejercido: 0, disponible: 700 });
    await finanzas.handleSaldoPartidaCreadoEvent(eventoGt(t, p, concepto, 1200) as any);
    assert.equal((await invariante(pres.id_presupuesto)).disponible, 900, 'aumento de GT');
    await finanzas.handleSaldoPartidaCreadoEvent(eventoGt(t, p, concepto, 200) as any);
    assert.deepEqual(await invariante(pres.id_presupuesto), { autorizado: 200, comprometido: 300, ejercido: 0, disponible: -100 },
      'una reducción por debajo de lo comprometido queda visible como sobregiro, no se oculta');
    assert.equal(await admin.presupuestoAsignado.count({ where: { tenant_id: t, proyecto_id: p, concepto_id: concepto } }), 1, 'sin duplicar la partida');
  });

  await test('2. movimientos manuales: partida sincronizada 422, TRANSFERENCIA 400, montos inválidos 400', async () => {
    const t = randomUUID(), p = randomUUID(), concepto = randomUUID();
    await finanzas.handleSaldoPartidaCreadoEvent(eventoGt(t, p, concepto, 1000) as any);
    const sinc = await admin.presupuestoAsignado.findFirstOrThrow({ where: { tenant_id: t, concepto_id: concepto } });
    let r = await post(t, p, 'movimientos', { presupuesto_id: sinc.id_presupuesto, tipo: 'COMPROMISO', concepto: 'x', monto: 10 });
    assert.equal(r.status, 422); assert.equal(r.body.error.code, 'FIN_PARTIDA_SINCRONIZADA');
    const manual = await presupuestoManual(t, p, 1000);
    r = await post(t, p, 'movimientos', { presupuesto_id: manual, tipo: 'TRANSFERENCIA', concepto: 'x', monto: 10 });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_TRANSFERENCIA_POR_ENDPOINT');
    for (const monto of [-50, 0, '10.005', 'abc']) {
      r = await post(t, p, 'movimientos', { presupuesto_id: manual, tipo: 'COMPROMISO', concepto: 'x', monto });
      assert.equal(r.status, 400, `monto ${monto}`); assert.equal(r.body.error.code, 'FIN_MONTO_INVALIDO', `monto ${monto}`);
    }
    assert.deepEqual(await invariante(manual), { autorizado: 1000, comprometido: 0, ejercido: 0, disponible: 1000 });
  });

  await test('3. 20 compromisos simultáneos de 100 sobre 1,000: exactamente 10 pasan', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await presupuestoManual(t, p, 1000);
    const rs = await Promise.all(Array.from({ length: 20 }, (_, i) =>
      post(t, p, 'movimientos', { presupuesto_id: pres, tipo: 'COMPROMISO', concepto: `C${i}`, monto: 100 })));
    assert.equal(rs.filter((r) => r.status === 201).length, 10, JSON.stringify(rs.map((r) => r.status)));
    assert.ok(rs.filter((r) => r.status !== 201).every((r) => r.status === 422 && r.body.error.code === 'FIN_INSUFFICIENT_BUDGET'));
    assert.deepEqual(await invariante(pres), { autorizado: 1000, comprometido: 1000, ejercido: 0, disponible: 0 });
    assert.equal(await admin.movimientoPresupuestal.count({ where: { tenant_id: t, presupuesto_id: pres } }), 10);
  });

  await test('4. LIBERACION y DEVENGADO no exceden lo comprometido', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await presupuestoManual(t, p, 1000);
    assert.equal((await post(t, p, 'movimientos', { presupuesto_id: pres, tipo: 'COMPROMISO', concepto: 'c', monto: 300 })).status, 201);
    for (const tipo of ['LIBERACION', 'DEVENGADO']) {
      const r = await post(t, p, 'movimientos', { presupuesto_id: pres, tipo, concepto: 'x', monto: 301 });
      assert.equal(r.status, 422, tipo); assert.equal(r.body.error.code, 'FIN_EXCEDE_COMPROMETIDO', tipo);
    }
    assert.equal((await post(t, p, 'movimientos', { presupuesto_id: pres, tipo: 'DEVENGADO', concepto: 'd', monto: 100 })).status, 201);
    assert.equal((await post(t, p, 'movimientos', { presupuesto_id: pres, tipo: 'LIBERACION', concepto: 'l', monto: 200 })).status, 201);
    assert.deepEqual(await invariante(pres), { autorizado: 1000, comprometido: 0, ejercido: 100, disponible: 900 });
  });

  await test('5. transferencia: exige transferencia_id y mueve autorizado y disponible', async () => {
    const t = randomUUID(), p = randomUUID();
    const a = await presupuestoManual(t, p, 1000), b = await presupuestoManual(t, p, 500);
    let r = await post(t, p, 'transferencias-presupuestales', { presupuesto_origen_id: a, presupuesto_destino_id: b, monto: 100, concepto: 'x' });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_TRANSFERENCIA_ID_REQUERIDO');
    r = await post(t, p, 'transferencias-presupuestales', { transferencia_id: randomUUID(), presupuesto_origen_id: a, presupuesto_destino_id: b, monto: -100, concepto: 'x' });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'FIN_MONTO_INVALIDO');
    r = await post(t, p, 'transferencias-presupuestales', { transferencia_id: randomUUID(), presupuesto_origen_id: a, presupuesto_destino_id: b, monto: 250, concepto: 'Reasignación' });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.deepEqual(await invariante(a), { autorizado: 750, comprometido: 0, ejercido: 0, disponible: 750 });
    assert.deepEqual(await invariante(b), { autorizado: 750, comprometido: 0, ejercido: 0, disponible: 750 });
    assert.ok(publicados.some((e) => e.tenantId === t && e.type === 'finanzas.transferencia_presupuestal'));
  });

  await test('6. la misma transferencia simultánea se aplica una vez; con otro monto es 409', async () => {
    const t = randomUUID(), p = randomUUID();
    const a = await presupuestoManual(t, p, 1000), b = await presupuestoManual(t, p, 0);
    const id = randomUUID();
    const body = { transferencia_id: id, presupuesto_origen_id: a, presupuesto_destino_id: b, monto: 400, concepto: 'Reintento' };
    const rs = await Promise.all([0, 1, 2].map(() => post(t, p, 'transferencias-presupuestales', body)));
    assert.deepEqual(rs.map((r) => r.status).sort(), [200, 200, 201], JSON.stringify(rs.map((r) => r.body.error?.code ?? r.status)));
    assert.deepEqual(await invariante(a), { autorizado: 600, comprometido: 0, ejercido: 0, disponible: 600 });
    assert.deepEqual(await invariante(b), { autorizado: 400, comprometido: 0, ejercido: 0, disponible: 400 });
    assert.equal(await admin.movimientoPresupuestal.count({ where: { tenant_id: t, referencia_id: id } }), 2);
    assert.equal(publicados.filter((e) => e.tenantId === t && e.type === 'finanzas.transferencia_presupuestal').length, 1, 'un solo evento');
    const r = await post(t, p, 'transferencias-presupuestales', { ...body, monto: 401 });
    assert.equal(r.status, 409); assert.equal(r.body.error.code, 'FIN_TRANSFERENCIA_DUPLICADA');
  });

  await test('7. transferencias simultáneas no sobregiran el origen', async () => {
    const t = randomUUID(), p = randomUUID();
    const a = await presupuestoManual(t, p, 1000), b = await presupuestoManual(t, p, 0);
    const rs = await Promise.all(Array.from({ length: 5 }, () => post(t, p, 'transferencias-presupuestales',
      { transferencia_id: randomUUID(), presupuesto_origen_id: a, presupuesto_destino_id: b, monto: 300, concepto: 'Drenar' })));
    assert.equal(rs.filter((r) => r.status === 201).length, 3, JSON.stringify(rs.map((r) => r.status)));
    assert.deepEqual(await invariante(a), { autorizado: 100, comprometido: 0, ejercido: 0, disponible: 100 });
    assert.deepEqual(await invariante(b), { autorizado: 900, comprometido: 0, ejercido: 0, disponible: 900 });
  });

  await test('8. transferencias con partidas de GT: 422', async () => {
    const t = randomUUID(), p = randomUUID(), concepto = randomUUID();
    await finanzas.handleSaldoPartidaCreadoEvent(eventoGt(t, p, concepto, 1000) as any);
    const sinc = await admin.presupuestoAsignado.findFirstOrThrow({ where: { tenant_id: t, concepto_id: concepto } });
    const manual = await presupuestoManual(t, p, 1000);
    for (const [o, d] of [[sinc.id_presupuesto, manual], [manual, sinc.id_presupuesto]]) {
      const r = await post(t, p, 'transferencias-presupuestales', { transferencia_id: randomUUID(), presupuesto_origen_id: o, presupuesto_destino_id: d, monto: 10, concepto: 'x' });
      assert.equal(r.status, 422); assert.equal(r.body.error.code, 'FIN_PARTIDA_SINCRONIZADA');
    }
  });

  await test('9. el índice rechaza un movimiento duplicado de la misma transferencia; la migración es re-ejecutable', async () => {
    const t = randomUUID(), p = randomUUID();
    const a = await presupuestoManual(t, p, 1000);
    const id = randomUUID();
    const mov = () => admin.movimientoPresupuestal.create({
      data: { tenant_id: t, proyecto_id: p, presupuesto_id: a, tipo: 'TRANSFERENCIA', concepto: 'idx', monto: 1,
        referencia_modulo: 'finanzas', referencia_entidad: 'TransferenciaPresupuestal', referencia_id: id, usuario_id: randomUUID() } as any,
    });
    await mov();
    await assert.rejects(() => mov(), /Unique constraint|duplicate key/i);
    assert.ok(runSqlFile(MIGRACION, dbUrl).ok);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - presupuesto-blindado', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});
