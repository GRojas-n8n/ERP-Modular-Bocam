/**
 * Integración de la migración 20260930120000_blindar_compromiso_oc: atomicidad, orden del precheck, paridad con
 * rls-policies.sql y uso del SQL canónico en el CI.
 * Change: blindar-compromiso-oc-concurrencia-y-orden-eventos.
 *
 * Las pruebas con base de datos usan esquemas descartables (no tocan el esquema de las demás suites) y ejecutan el
 * archivo COMPLETO con `prisma db execute` (mismo protocolo que `prisma migrate deploy`).
 *
 * Runner: npm run test:integration:compromiso-oc-migracion -w @bocam/finanzas
 * Requiere: PostgreSQL (DATABASE_URL, superusuario). No requiere RabbitMQ.
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma';
import { MIGRATION_SQL_PATH, RLS_POLICIES_PATH, WORKFLOW_PATH, runSqlFile } from '../support/sql';

const baseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';

const withSchema = (schema: string) => {
  const u = new URL(baseUrl);
  u.searchParams.set('schema', schema);
  return u.toString();
};

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n')[0]}`); }
}

const sinComentarios = (sql: string) => sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
const normalizar = (s: string) => s.replace(/\s+/g, ' ').replace(/\s*([(),;])\s*/g, '$1').trim().toLowerCase();

// Sentencias RLS del tombstone (ALTER TABLE / DROP POLICY / CREATE POLICY), normalizadas.
function sentenciasTombstone(sql: string): string[] {
  const texto = sinComentarios(sql);
  const out: string[] = [];
  const re = /(ALTER TABLE "oc_cancelaciones_tombstone"[^;]*;|DROP POLICY IF EXISTS \w+ ON "oc_cancelaciones_tombstone";|CREATE POLICY \w+ ON "oc_cancelaciones_tombstone"[^;]*;)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) out.push(normalizar(m[1]));
  return out.sort();
}

async function main() {
  const migracion = readFileSync(MIGRATION_SQL_PATH, 'utf8').replace(/\r\n/g, '\n');
  const admin = new PrismaClient({ datasources: { db: { url: baseUrl } } });

  // ── Estáticas ──────────────────────────────────────────────────────────────
  await test('la migración es una transacción explícita (BEGIN … COMMIT) y el precheck va antes de cualquier DDL', () => {
    const cuerpo = sinComentarios(migracion).trim();
    assert.match(cuerpo, /^BEGIN;/, 'debe empezar con BEGIN;');
    assert.match(cuerpo, /COMMIT;\s*$/, 'debe terminar con COMMIT;');
    const iPrecheck = cuerpo.indexOf('DO $$');
    const iPrimerDdl = cuerpo.search(/\b(ALTER TABLE|CREATE (UNIQUE )?INDEX|CREATE TABLE|CREATE OR REPLACE FUNCTION|CREATE POLICY|DROP )/);
    assert.ok(iPrecheck > 0 && iPrimerDdl > iPrecheck, 'la comprobación de duplicados debe preceder a todo DDL');
    assert.ok(cuerpo.includes('MIGRACION_ABORTADA'));
  });

  await test('el CI aplica exactamente el SQL canónico de la migración (sin copia inline que pueda divergir)', () => {
    const wf = readFileSync(WORKFLOW_PATH, 'utf8');
    assert.ok(wf.includes('-f apps/finanzas/prisma/migrations/20260930120000_blindar_compromiso_oc/migration.sql'), 'el workflow debe usar psql -f sobre el archivo de la migración');
    assert.ok(!wf.includes('uq_movimiento_oc_compromiso_liberacion'), 'el workflow no debe duplicar el DDL');
    assert.ok(!wf.includes('oc_cancelaciones_tombstone'), 'el workflow no debe duplicar el DDL');
  });

  await test('paridad: el RLS del tombstone en la migración es idéntico al de rls-policies.sql', () => {
    const a = sentenciasTombstone(migracion);
    const b = sentenciasTombstone(readFileSync(RLS_POLICIES_PATH, 'utf8'));
    assert.ok(a.length >= 6, `se esperaban ENABLE, FORCE y 2×(DROP+CREATE POLICY); hay ${a.length}`);
    assert.deepEqual(a, b);
  });

  // ── Con base de datos (esquemas descartables) ──────────────────────────────
  const esquemas: string[] = [];
  async function nuevoEsquema(): Promise<{ schema: string; url: string; db: PrismaClient }> {
    const schema = `mig_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    esquemas.push(schema);
    const url = withSchema(schema);
    const db = new PrismaClient({ datasources: { db: { url } } });
    await db.$executeRawUnsafe(`CREATE TABLE movimientos_presupuestales (
      id_movimiento uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, tipo text NOT NULL,
      referencia_modulo text, referencia_entidad text, referencia_id uuid)`);
    return { schema, url, db };
  }
  const existe = async (schema: string) => {
    const q = (sql: string) => admin.$queryRawUnsafe<any[]>(sql);
    return {
      indice: (await q(`SELECT 1 FROM pg_indexes WHERE schemaname = '${schema}' AND indexname = 'uq_movimiento_oc_compromiso_liberacion'`)).length,
      tabla: (await q(`SELECT 1 FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = 'oc_cancelaciones_tombstone' AND table_type = 'BASE TABLE'`)).length,
      check: (await q(`SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = '${schema}' AND c.conname = 'chk_movimiento_oc_referencia_id'`)).length,
      funcion: (await q(`SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = '${schema}' AND p.proname = 'current_proyecto_id'`)).length,
    };
  };

  try {
    await test('atomicidad: un fallo posterior al precheck revierte índice, CHECK, tabla y funciones (sin esquema parcial)', async () => {
      const { schema, url, db } = await nuevoEsquema();
      // Inyección: una vista con el nombre del tombstone hace que CREATE TABLE IF NOT EXISTS se omita y que el posterior
      // ALTER TABLE ... ENABLE ROW LEVEL SECURITY falle, es decir, DESPUÉS del precheck, del CHECK, del índice y de las funciones.
      await db.$executeRawUnsafe(`CREATE VIEW oc_cancelaciones_tombstone AS SELECT 1 AS x`);
      const r = runSqlFile(MIGRATION_SQL_PATH, url);
      assert.equal(r.ok, false, 'la migración debe fallar');
      assert.match(r.output, /oc_cancelaciones_tombstone|not supported|not a table/i, `el fallo debe venir del paso de RLS: ${r.output.slice(0, 300)}`);
      const estado = await existe(schema);
      assert.deepEqual(estado, { indice: 0, tabla: 0, check: 0, funcion: 0 }, 'no debe quedar nada de la migración');
      await db.$disconnect();
    });

    await test('el precheck de duplicados ocurre antes de cualquier DDL (no se crea nada)', async () => {
      const { schema, url, db } = await nuevoEsquema();
      const t = randomUUID(), oc = randomUUID();
      for (let i = 0; i < 2; i++) {
        await db.$executeRawUnsafe(`INSERT INTO movimientos_presupuestales (tenant_id, tipo, referencia_modulo, referencia_entidad, referencia_id) VALUES ('${t}', 'COMPROMISO', 'compras', 'OrdenCompra', '${oc}')`);
      }
      const r = runSqlFile(MIGRATION_SQL_PATH, url);
      assert.equal(r.ok, false);
      assert.match(r.output, /MIGRACION_ABORTADA/);
      assert.deepEqual(await existe(schema), { indice: 0, tabla: 0, check: 0, funcion: 0 });
      const n = await db.$queryRawUnsafe<Array<{ n: bigint }>>(`SELECT count(*)::bigint AS n FROM movimientos_presupuestales`);
      assert.equal(Number(n[0].n), 2, 'no se borró ni modificó ninguna fila');
      await db.$disconnect();
    });

    await test('el precheck también rechaza movimientos de OC sin referencia_id previos a la migración', async () => {
      const { schema, url, db } = await nuevoEsquema();
      await db.$executeRawUnsafe(`INSERT INTO movimientos_presupuestales (tenant_id, tipo, referencia_modulo, referencia_entidad, referencia_id) VALUES ('${randomUUID()}', 'LIBERACION', 'compras', 'OrdenCompra', NULL)`);
      const r = runSqlFile(MIGRATION_SQL_PATH, url);
      assert.equal(r.ok, false);
      assert.match(r.output, /MIGRACION_ABORTADA/);
      assert.deepEqual(await existe(schema), { indice: 0, tabla: 0, check: 0, funcion: 0 });
      await db.$disconnect();
    });

    await test('la migración se aplica con un rol dueño de las tablas pero NO de las funciones RLS (rol de runtime de producción)', async () => {
      const rol = 'mig_runtime_test';
      await admin.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${rol}') THEN CREATE ROLE ${rol} LOGIN PASSWORD 'pwd_mig' NOSUPERUSER NOBYPASSRLS; END IF; END $$`);
      const { schema, url, db } = await nuevoEsquema();
      // Las funciones ya existen y pertenecen al administrador, como en producción (las aplica rls-policies.sql).
      await db.$executeRawUnsafe(`CREATE FUNCTION current_tenant_id() RETURNS uuid AS $$ SELECT NULL::uuid $$ LANGUAGE sql STABLE`);
      await db.$executeRawUnsafe(`CREATE FUNCTION current_proyecto_id() RETURNS uuid AS $$ SELECT NULL::uuid $$ LANGUAGE sql STABLE`);
      await admin.$executeRawUnsafe(`ALTER TABLE "${schema}".movimientos_presupuestales OWNER TO ${rol}`);
      await admin.$executeRawUnsafe(`GRANT USAGE, CREATE ON SCHEMA "${schema}" TO ${rol}`);
      const urlRol = new URL(url);
      urlRol.username = rol;
      urlRol.password = 'pwd_mig';
      const r = runSqlFile(MIGRATION_SQL_PATH, urlRol.toString());
      assert.ok(r.ok, `la migración debe poder correr con el rol de runtime: ${r.output.slice(0, 400)}`);
      assert.deepEqual(await existe(schema), { indice: 1, tabla: 1, check: 1, funcion: 1 });
      const duenios = await admin.$queryRawUnsafe<any[]>(`SELECT p.proname, pg_get_userbyid(p.proowner) AS duenio FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = '${schema}' AND p.proname IN ('current_tenant_id', 'current_proyecto_id')`);
      assert.ok(duenios.every((d) => d.duenio !== rol), 'las funciones no se recrearon: siguen siendo del administrador');
      const tabla = await admin.$queryRawUnsafe<any[]>(`SELECT tableowner FROM pg_tables WHERE schemaname = '${schema}' AND tablename = 'oc_cancelaciones_tombstone'`);
      assert.equal(tabla[0].tableowner, rol);
      await db.$disconnect();
    });

    await test('control positivo: sobre datos limpios la migración se aplica completa y es idempotente', async () => {
      const { schema, url, db } = await nuevoEsquema();
      await db.$executeRawUnsafe(`INSERT INTO movimientos_presupuestales (tenant_id, tipo, referencia_modulo, referencia_entidad, referencia_id) VALUES ('${randomUUID()}', 'COMPROMISO', 'personal', 'PreNomina', NULL)`); // fuera del alcance
      for (let i = 0; i < 2; i++) {
        const r = runSqlFile(MIGRATION_SQL_PATH, url);
        assert.ok(r.ok, `corrida ${i + 1}: ${r.output.slice(0, 300)}`);
      }
      assert.deepEqual(await existe(schema), { indice: 1, tabla: 1, check: 1, funcion: 1 });
      const rls = await admin.$queryRawUnsafe<any[]>(`SELECT c.relrowsecurity, c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = '${schema}' AND c.relname = 'oc_cancelaciones_tombstone'`);
      assert.equal(rls[0].relrowsecurity, true);
      assert.equal(rls[0].relforcerowsecurity, true);
      await db.$disconnect();
    });
  } finally {
    for (const s of esquemas) await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${s}" CASCADE`).catch(() => undefined);
    await admin.$disconnect();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} pruebas de migración en verde`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('not ok - compromiso-oc-migracion', e); process.exit(1); });
