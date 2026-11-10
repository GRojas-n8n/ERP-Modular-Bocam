/**
 * Integración (PostgreSQL real): eventos de nómina idempotentes ante reentregas, también simultáneas.
 * Change: blindar-consumidores-finanzas.
 *
 * Invariantes:
 *   - dos entregas simultáneas de personal.nomina_autorizada producen un solo COMPROMISO y un solo incremento;
 *   - lo mismo para personal.nomina_pagada y el EJERCIDO;
 *   - el índice uq_movimiento_nomina rechaza un segundo COMPROMISO/EJERCIDO aun sin pasar por el handler;
 *   - el índice no afecta otros tipos ni otras entidades.
 *
 * Runner: npm run test:integration:nomina-idempotencia -w @bocam/finanzas
 * Requiere: PostgreSQL con schema finanzas (db push + migración 20261110120000_unicidad_movimientos_nomina).
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { PrismaClient } from '../../src/generated/prisma';
import { runSqlFile } from '../support/sql';

const dbUrl =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
process.env.DATABASE_URL = dbUrl;

const MIGRACION = join(__dirname, '..', '..', 'prisma', 'migrations', '20261110120000_unicidad_movimientos_nomina', 'migration.sql');
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let finanzas: typeof import('../../src/main');

async function bolsaManoObra(t: string, p: string, monto: number) {
  const pres = await admin.presupuestoAsignado.create({
    data: {
      tenant_id: t, proyecto_id: p, codigo: `MO-${randomUUID().slice(0, 8)}`, descripcion: 'Mano de obra',
      monto_autorizado: monto, monto_disponible: monto, monto_comprometido: 0, monto_ejercido: 0,
      capitulo: 'MANO_OBRA', moneda: 'MXN', estatus: 'ACTIVO',
    } as any,
  });
  return pres.id_presupuesto;
}

const evento = (tipo: string, t: string, p: string, prenominaId: string, total: number) => ({
  event_type: tipo,
  timestamp: new Date().toISOString(),
  context: { tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
  payload: { prenomina_id: prenominaId, codigo: `PN-${prenominaId.slice(0, 6)}`, total_neto: total },
});

const leer = async (id: string) => {
  const p = await admin.presupuestoAsignado.findUniqueOrThrow({ where: { id_presupuesto: id } });
  return { comprometido: Number(p.monto_comprometido), ejercido: Number(p.monto_ejercido), disponible: Number(p.monto_disponible) };
};
const contar = (t: string, prenominaId: string, tipo: string) =>
  admin.movimientoPresupuestal.count({ where: { tenant_id: t, referencia_entidad: 'PreNomina', referencia_id: prenominaId, tipo: tipo as any } });

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function main() {
  const m = runSqlFile(MIGRACION, dbUrl);
  if (!m.ok) throw new Error(`No se pudo aplicar la migración:\n${m.output}`);
  finanzas = await import('../../src/main');

  await test('1. nomina_autorizada simultánea: un solo COMPROMISO', async () => {
    for (let ronda = 0; ronda < 6; ronda++) {
      const t = randomUUID(), p = randomUUID(), pn = randomUUID();
      const pres = await bolsaManoObra(t, p, 100_000);
      const ev = evento('personal.nomina_autorizada', t, p, pn, 12_345.67);
      const rs = await Promise.allSettled([0, 1, 2].map(() => finanzas.handleNominaAutorizadaEvent(ev as any)));
      assert.deepEqual(rs.map((r) => r.status), ['fulfilled', 'fulfilled', 'fulfilled'], `ronda ${ronda}: ninguna entrega falla`);
      assert.equal(await contar(t, pn, 'COMPROMISO'), 1, `ronda ${ronda}: un COMPROMISO`);
      assert.deepEqual(await leer(pres), { comprometido: 12_345.67, ejercido: 0, disponible: 87_654.33 }, `ronda ${ronda}`);
    }
  });

  await test('2. nomina_pagada simultánea: un solo EJERCIDO', async () => {
    for (let ronda = 0; ronda < 6; ronda++) {
      const t = randomUUID(), p = randomUUID(), pn = randomUUID();
      const pres = await bolsaManoObra(t, p, 100_000);
      await finanzas.handleNominaAutorizadaEvent(evento('personal.nomina_autorizada', t, p, pn, 5_000) as any);
      const ev = evento('personal.nomina_pagada', t, p, pn, 5_000);
      const rs = await Promise.allSettled([0, 1, 2].map(() => finanzas.handleNominaPagadaEvent(ev as any)));
      assert.deepEqual(rs.map((r) => r.status), ['fulfilled', 'fulfilled', 'fulfilled'], `ronda ${ronda}`);
      assert.equal(await contar(t, pn, 'EJERCIDO'), 1, `ronda ${ronda}: un EJERCIDO`);
      assert.deepEqual(await leer(pres), { comprometido: 0, ejercido: 5_000, disponible: 95_000 }, `ronda ${ronda}`);
    }
  });

  await test('3. el índice rechaza un segundo COMPROMISO/EJERCIDO directo y respeta su alcance', async () => {
    const t = randomUUID(), p = randomUUID(), pn = randomUUID();
    const pres = await bolsaManoObra(t, p, 100_000);
    const mov = (tipo: string, entidad = 'PreNomina', modulo = 'personal') => admin.movimientoPresupuestal.create({
      data: { tenant_id: t, proyecto_id: p, presupuesto_id: pres, tipo: tipo as any, concepto: 'idx', monto: 1,
        referencia_modulo: modulo, referencia_entidad: entidad, referencia_id: pn, usuario_id: randomUUID() },
    });
    await mov('COMPROMISO');
    await assert.rejects(() => mov('COMPROMISO'), /Unique constraint|duplicate key/i, 'segundo COMPROMISO');
    await mov('EJERCIDO');
    await assert.rejects(() => mov('EJERCIDO'), /Unique constraint|duplicate key/i, 'segundo EJERCIDO');
    await mov('LIBERACION'); await mov('LIBERACION'); // otros tipos no están sujetos a la regla
    await mov('COMPROMISO', 'Estimacion', 'control-obra'); await mov('COMPROMISO', 'Estimacion', 'control-obra'); // otras entidades tampoco
  });

  await test('4. la migración es re-ejecutable', async () => {
    const r = runSqlFile(MIGRACION, dbUrl);
    assert.ok(r.ok, r.output);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await admin.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => { console.error('not ok - nomina-idempotencia', e); await admin.$disconnect().catch(() => undefined); process.exit(1); });
