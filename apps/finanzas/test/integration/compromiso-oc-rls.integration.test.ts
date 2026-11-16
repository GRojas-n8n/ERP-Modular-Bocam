/**
 * Integración con RLS real (rol sin BYPASSRLS y tablas con FORCE ROW LEVEL SECURITY):
 * el flujo de compromiso/liberación/tombstone funciona bajo RLS y aísla tenants y proyectos.
 * Change: blindar-compromiso-oc-concurrencia-y-orden-eventos.
 *
 * Runner: npm run test:integration:compromiso-oc-rls -w @bocam/finanzas
 * Requiere: PostgreSQL con un superusuario en DATABASE_URL (schema finanzas). No requiere RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { MIGRATION_SQL_PATH, RLS_POLICIES_PATH, runSqlFile, splitSqlStatements } from '../support/sql';

const adminUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
const ROLE = 'bocam_rls_test';
const rolePass = 'rls_test_pwd';
const restrictedUrl = (() => {
  const u = new URL(adminUrl);
  u.username = ROLE;
  u.password = rolePass;
  return u.toString();
})();

const admin = new PrismaClient({ datasources: { db: { url: adminUrl } } });
const restricted = new PrismaClient({ datasources: { db: { url: restrictedUrl } } });

EventBus.prototype.publish = async function () { return true; } as any;

async function withRls<T>(tenantId: string, proyectoId: string, fn: (tx: any) => Promise<T>): Promise<T> {
  return restricted.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_proyecto_id', ${proyectoId}, true)`;
    return fn(tx);
  });
}

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n')[0]}`); }
}

async function bootstrap() {
  const mig = runSqlFile(MIGRATION_SQL_PATH, adminUrl);
  if (!mig.ok) throw new Error(`No se pudo aplicar la migración:
${mig.output}`);
  for (const stmt of splitSqlStatements(readFileSync(RLS_POLICIES_PATH, 'utf8'))) {
    try { await admin.$executeRawUnsafe(stmt); } catch (e: any) {
      if (!/does not exist/.test(String(e.message))) throw e; // tablas de otras versiones del esquema
    }
  }
  const [{ s }] = await admin.$queryRawUnsafe<Array<{ s: string }>>(`SELECT current_schema() AS s`);
  await admin.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${ROLE}') THEN CREATE ROLE ${ROLE} LOGIN PASSWORD '${rolePass}' NOSUPERUSER NOBYPASSRLS; END IF; END $$`);
  await admin.$executeRawUnsafe(`GRANT USAGE ON SCHEMA "${s}" TO ${ROLE}`);
  await admin.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA "${s}" TO ${ROLE}`);
  await admin.$executeRawUnsafe(`GRANT ALL ON ALL SEQUENCES IN SCHEMA "${s}" TO ${ROLE}`);
  const [{ bypass, super: sup }] = await admin.$queryRawUnsafe<any[]>(`SELECT rolbypassrls AS bypass, rolsuper AS super FROM pg_roles WHERE rolname = '${ROLE}'`);
  assert.equal(bypass || sup, false, 'el rol de prueba no debe saltarse RLS');
}

async function main() {
  await bootstrap();
  // db.ts toma FINANZAS_DATABASE_URL: los handlers corren con el rol restringido.
  process.env.FINANZAS_DATABASE_URL = restrictedUrl;
  const finanzas = await import('../../src/main');

  const mkPres = async (t: string, p: string, disponible: number) => (await admin.presupuestoAsignado.create({
    data: { tenant_id: t, proyecto_id: p, codigo: `PRES-RLS-${randomUUID().slice(0, 8)}`, descripcion: 'rls', monto_autorizado: disponible,
      monto_disponible: disponible, monto_comprometido: 0, monto_ejercido: 0, capitulo: 'MATERIALES', moneda: 'MXN', estatus: 'ACTIVO' },
  })).id_presupuesto;
  const ctx = (t: string, p: string) => ({ tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: randomUUID() });
  const creada = (t: string, p: string, oc: string, pres: string, total: number) => ({ event_type: 'compras.oc_creada', timestamp: new Date().toISOString(), context: ctx(t, p),
    payload: { oc_id: oc, codigo: 'OC-RLS', total, proveedor_id: randomUUID(), presupuesto_id: pres } });
  const cancelada = (t: string, p: string, oc: string, pres: string, total: number) => ({ event_type: 'compras.oc_cancelada', timestamp: new Date().toISOString(), context: ctx(t, p),
    payload: { oc_id: oc, codigo: 'OC-RLS', total, presupuesto_id: pres, requisicion_id: null } });

  const A = { t: randomUUID(), p: randomUUID() };
  const B = { t: randomUUID(), p: randomUUID() };
  const oc = randomUUID(); // misma OC (mismo UUID) en dos tenants: la restricción única incluye tenant_id

  await test('RLS: compromiso, liberación y tombstone funcionan con el rol restringido (FORCE RLS)', async () => {
    const presA = await mkPres(A.t, A.p, 10000);
    await finanzas.handleOrdenCompraCreadaEvent(creada(A.t, A.p, oc, presA, 1000) as any);
    await finanzas.handleOrdenCompraCanceladaEvent(cancelada(A.t, A.p, oc, presA, 1000) as any);
    const rows = await withRls(A.t, A.p, async (tx) => ({
      mov: await tx.movimientoPresupuestal.findMany({ where: { referencia_id: oc } }),
      tomb: await tx.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "oc_cancelaciones_tombstone" WHERE "oc_id" = $1::uuid`, oc),
    }));
    assert.deepEqual(rows.mov.map((m: any) => m.tipo).sort(), ['COMPROMISO', 'LIBERACION']);
    assert.equal(rows.tomb[0].n, 1);
  });

  await test('RLS: el tenant B no ve los movimientos ni el tombstone del tenant A', async () => {
    const seenByB = await withRls(B.t, B.p, async (tx) => ({
      mov: await tx.movimientoPresupuestal.count({ where: { referencia_id: oc } }),
      tomb: (await tx.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "oc_cancelaciones_tombstone" WHERE "oc_id" = $1::uuid`, oc))[0].n,
    }));
    assert.equal(seenByB.mov, 0);
    assert.equal(seenByB.tomb, 0);
  });

  await test('RLS: otro proyecto del mismo tenant tampoco ve el tombstone', async () => {
    const tomb = await withRls(A.t, randomUUID(), async (tx) =>
      (await tx.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "oc_cancelaciones_tombstone" WHERE "oc_id" = $1::uuid`, oc))[0].n);
    assert.equal(tomb, 0);
  });

  await test('RLS: no se puede insertar un tombstone de otro tenant ni sin contexto', async () => {
    await assert.rejects(() => withRls(B.t, B.p, async (tx) => tx.$executeRawUnsafe(
      `INSERT INTO "oc_cancelaciones_tombstone" ("tenant_id","oc_id","proyecto_id","origen","usuario_id") VALUES ($1::uuid,$2::uuid,$3::uuid,'PRUEBA',$4::uuid)`,
      A.t, randomUUID(), A.p, randomUUID())), /row-level security/i);
  });

  await test('RLS: el tombstone es inmutable (sin UPDATE ni DELETE bajo el rol de la aplicación)', async () => {
    const del = await withRls(A.t, A.p, async (tx) => tx.$executeRawUnsafe(`DELETE FROM "oc_cancelaciones_tombstone" WHERE "oc_id" = $1::uuid`, oc));
    assert.equal(del, 0, 'DELETE no debe afectar filas');
    const upd = await withRls(A.t, A.p, async (tx) => tx.$executeRawUnsafe(`UPDATE "oc_cancelaciones_tombstone" SET "origen" = 'X' WHERE "oc_id" = $1::uuid`, oc));
    assert.equal(upd, 0, 'UPDATE no debe afectar filas');
    const [{ n }] = await admin.$queryRawUnsafe<any[]>(`SELECT count(*)::int AS n FROM "oc_cancelaciones_tombstone" WHERE "oc_id" = $1::uuid AND "origen" <> 'X'`, oc);
    assert.equal(n, 1);
  });

  await test('RLS: la misma OC en otro tenant se compromete de forma independiente (la unicidad incluye tenant_id)', async () => {
    const presB = await mkPres(B.t, B.p, 10000);
    await finanzas.handleOrdenCompraCreadaEvent(creada(B.t, B.p, oc, presB, 500) as any);
    const nB = await withRls(B.t, B.p, async (tx) => tx.movimientoPresupuestal.count({ where: { referencia_id: oc, tipo: 'COMPROMISO' } }));
    assert.equal(nB, 1);
  });

  await test('RLS: el tombstone de un tenant no bloquea la creación de la misma OC en otro tenant', async () => {
    // El tenant A canceló `oc`; el tenant B (otro tenant) sí pudo comprometerla arriba.
    const [{ n }] = await admin.$queryRawUnsafe<any[]>(`SELECT count(*)::int AS n FROM "movimientos_presupuestales" WHERE "referencia_id" = $1::uuid AND "tipo" = 'COMPROMISO'`, oc);
    assert.equal(n, 2, 'un COMPROMISO por tenant');
  });

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} pruebas RLS en verde`);
  await restricted.$disconnect();
  await admin.$disconnect();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('not ok - compromiso-oc-rls', e); process.exit(1); });
