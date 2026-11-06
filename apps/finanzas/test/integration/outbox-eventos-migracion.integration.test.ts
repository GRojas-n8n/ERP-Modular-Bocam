/**
 * Integración (PostgreSQL real) y pruebas estáticas: migración 20260930180000_outbox_eventos_finanzas (lote P1).
 * Change: hacer-confiables-publicadores-eventbus-criticos.
 *
 * La migración debe ser ADITIVA (solo crea la tabla outbox y sus objetos), atómica, idempotente y reversible sin perder
 * eventos pendientes. Cada prueba usa un esquema descartable, nunca el esquema de la aplicación.
 *
 * Runner: npm run test:integration:outbox-eventos-migracion -w @bocam/finanzas
 * Requiere: PostgreSQL (superusuario en DATABASE_URL, base desechable).
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '../../src/generated/prisma';
import { MIGRATION_DIR_OUTBOX, PRISMA_SCHEMA_PATH, WORKFLOW_PATH, runSqlFile, splitSqlStatements } from '../support/sql';

if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL (superusuario, base desechable).');
const adminUrl = process.env.DATABASE_URL as string;
const admin = new PrismaClient({ datasources: { db: { url: adminUrl } } });

const MIGRATION = join(MIGRATION_DIR_OUTBOX, 'migration.sql');
const ROLLBACK = join(MIGRATION_DIR_OUTBOX, 'rollback.sql');
const leer = (f: string) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n').slice(0, 6).join(' | ')}`); }
}

const esquemas: string[] = [];
async function nuevoEsquema() {
  const schema = `outbox_mig_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  esquemas.push(schema);
  const u = new URL(adminUrl);
  u.searchParams.set('schema', schema);
  const url = u.toString();
  const db = new PrismaClient({ datasources: { db: { url } } });
  return { schema, url, db };
}
const q = (sql: string) => admin.$queryRawUnsafe<any[]>(sql);
async function estado(schema: string) {
  return {
    tabla: (await q(`SELECT 1 FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = 'outbox_eventos' AND table_type = 'BASE TABLE'`)).length,
    checks: (await q(`SELECT conname FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = '${schema}' AND conname IN ('chk_outbox_estado','chk_outbox_valores') ORDER BY 1`)).map((r) => r.conname),
    indices: (await q(`SELECT indexname FROM pg_indexes WHERE schemaname = '${schema}' AND indexname LIKE '%outbox_finanzas%' ORDER BY 1`)).map((r) => r.indexname),
    politicas: (await q(`SELECT policyname FROM pg_policies WHERE schemaname = '${schema}' AND tablename = 'outbox_eventos' ORDER BY 1`)).map((r) => r.policyname),
    rls: (await q(`SELECT relrowsecurity AS rls, relforcerowsecurity AS forzado FROM pg_class WHERE oid = to_regclass('"${schema}".outbox_eventos')`))[0],
  };
}

async function main() {
  try {
    await test('aplica sobre un esquema limpio: tabla, CHECKs, índices únicos y RLS habilitado y forzado con 4 políticas', async () => {
      const { schema, url, db } = await nuevoEsquema();
      const r = runSqlFile(MIGRATION, url);
      assert.equal(r.ok, true, r.output);
      const e = await estado(schema);
      assert.equal(e.tabla, 1);
      assert.deepEqual(e.checks, ['chk_outbox_estado', 'chk_outbox_valores']);
      assert.deepEqual(e.indices, ['idx_outbox_finanzas_estado_proximo', 'uq_outbox_finanzas_agregado_seq', 'uq_outbox_finanzas_event', 'uq_outbox_finanzas_orden_global']);
      assert.deepEqual(e.politicas, ['rls_outbox_fin_insert', 'rls_outbox_fin_select', 'rls_outbox_fin_worker_delete', 'rls_outbox_fin_worker_update']);
      assert.deepEqual([e.rls.rls, e.rls.forzado], [true, true]);
      await db.$disconnect();
    });

    await test('es idempotente: aplicarla dos veces (como hace el CI tras db push) no falla ni duplica nada', async () => {
      const { schema, url, db } = await nuevoEsquema();
      assert.equal(runSqlFile(MIGRATION, url).ok, true);
      const primera = await estado(schema);
      const r2 = runSqlFile(MIGRATION, url);
      assert.equal(r2.ok, true, r2.output);
      assert.deepEqual(await estado(schema), primera);
      await db.$disconnect();
    });

    await test('es ADITIVA: no crea, altera ni borra nada fuera de outbox_eventos (el esquema previo queda idéntico)', async () => {
      const { schema, url, db } = await nuevoEsquema();
      await db.$executeRawUnsafe(`CREATE TABLE movimientos_presupuestales (id uuid PRIMARY KEY, tipo text)`);
      await db.$executeRawUnsafe(`INSERT INTO movimientos_presupuestales VALUES (gen_random_uuid(), 'COMPROMISO')`);
      const antes = await q(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = '${schema}' ORDER BY 1,2`);
      assert.equal(runSqlFile(MIGRATION, url).ok, true);
      const despues = await q(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name <> 'outbox_eventos' ORDER BY 1,2`);
      assert.deepEqual(despues, antes);
      assert.equal((await q(`SELECT count(*)::int AS n FROM "${schema}".movimientos_presupuestales`))[0].n, 1, 'los datos existentes no se tocan');
      await db.$disconnect();
    });

    await test('atomicidad: un fallo a mitad de la migración no deja CHECKs, índices ni políticas (sin esquema parcial)', async () => {
      const { schema, url, db } = await nuevoEsquema();
      // Tabla preexistente SIN la columna orden_global: los CHECKs y dos índices se crean y el tercer índice falla.
      await db.$executeRawUnsafe(`CREATE TABLE outbox_eventos (
        id_evento uuid PRIMARY KEY, event_id uuid, event_type varchar(100), tenant_id uuid, proyecto_id uuid, aggregate_type varchar(50),
        aggregate_id uuid, aggregate_seq int, estado varchar(20), intentos int)`);
      const r = runSqlFile(MIGRATION, url);
      assert.equal(r.ok, false, 'la migración debe fallar');
      assert.match(r.output, /orden_global/i);
      const e = await estado(schema);
      assert.deepEqual(e.checks, [], 'ningún CHECK quedó');
      assert.deepEqual(e.indices, [], 'ningún índice quedó');
      assert.deepEqual(e.politicas, [], 'ninguna política quedó');
      assert.equal(e.rls.rls, false, 'RLS no quedó habilitado a medias');
      await db.$disconnect();
    });

    await test('rollback: se NIEGA a borrar la tabla si hay eventos PENDIENTE o ERROR y no modifica nada', async () => {
      const { schema, url, db } = await nuevoEsquema();
      assert.equal(runSqlFile(MIGRATION, url).ok, true);
      const ins = (estadoFila: string) => db.$executeRawUnsafe(
        `INSERT INTO outbox_eventos (event_id,event_type,tenant_id,proyecto_id,aggregate_type,aggregate_id,aggregate_seq,payload,estado)
         VALUES ('${randomUUID()}','x','${randomUUID()}','${randomUUID()}','OrdenCompra','${randomUUID()}',1,'{}'::jsonb,'${estadoFila}')`);
      // Como superusuario RLS no aplica al INSERT directo; se insertan una PENDIENTE y una PUBLICADO.
      await ins('PENDIENTE'); await ins('PUBLICADO');
      const r = runSqlFile(ROLLBACK, url);
      assert.equal(r.ok, false);
      assert.match(r.output, /ROLLBACK_ABORTADO/);
      assert.equal((await q(`SELECT count(*)::int AS n FROM "${schema}".outbox_eventos`))[0].n, 2, 'no se perdió ninguna fila');
      assert.equal((await estado(schema)).tabla, 1);
      // También con una fila en ERROR.
      await db.$executeRawUnsafe(`DELETE FROM outbox_eventos WHERE estado = 'PENDIENTE'`);
      await ins('ERROR');
      const r2 = runSqlFile(ROLLBACK, url);
      assert.equal(r2.ok, false);
      assert.match(r2.output, /ROLLBACK_ABORTADO/);
      await db.$disconnect();
    });

    await test('rollback: con solo filas PUBLICADO (o vacía) elimina la tabla; sin tabla es un no-op', async () => {
      const { schema, url, db } = await nuevoEsquema();
      assert.equal(runSqlFile(MIGRATION, url).ok, true);
      await db.$executeRawUnsafe(
        `INSERT INTO outbox_eventos (event_id,event_type,tenant_id,proyecto_id,aggregate_type,aggregate_id,aggregate_seq,payload,estado)
         VALUES ('${randomUUID()}','x','${randomUUID()}','${randomUUID()}','OrdenCompra','${randomUUID()}',1,'{}'::jsonb,'PUBLICADO')`);
      const r = runSqlFile(ROLLBACK, url);
      assert.equal(r.ok, true, r.output);
      assert.equal((await estado(schema)).tabla, 0);
      assert.equal(runSqlFile(ROLLBACK, url).ok, true, 'repetirlo no falla');
      await db.$disconnect();
    });

    await test('estático: el script es una transacción explícita, solo toca outbox_eventos y no reemplaza funciones ni toca otras tablas', () => {
      const sql = leer(MIGRATION);
      const sentencias = splitSqlStatements(sql);
      assert.equal(sentencias[0].toUpperCase(), 'BEGIN');
      assert.equal(sentencias[sentencias.length - 1].toUpperCase(), 'COMMIT');
      assert.ok(!/CREATE\s+OR\s+REPLACE\s+FUNCTION/i.test(sql), 'no debe reemplazar funciones (el rol de runtime no es su dueño)');
      assert.ok(!sentencias.some((x) => /^(DROP\s+TABLE|TRUNCATE|DELETE\s+FROM|UPDATE\s|INSERT\s)/i.test(x)), 'no destruye ni modifica datos');
      for (const s of sentencias.filter((x) => /^(ALTER|CREATE|DROP)\s/i.test(x))) {
        assert.ok(/outbox_eventos|outbox_finanzas|rls_outbox_fin|chk_outbox/.test(s), `toca algo ajeno al outbox: ${s.slice(0, 80)}`);
      }
    });

    await test('estático: el modelo Prisma y la migración declaran las mismas columnas', () => {
      const prisma = leer(PRISMA_SCHEMA_PATH);
      const modelo = prisma.match(/model OutboxEvento \{([\s\S]*?)\n\}/)![1];
      const colsModelo = [...modelo.matchAll(/^\s{2}([a-z_]+)\s+\S+/gm)].map((m) => m[1]).sort();
      const tabla = leer(MIGRATION).match(/CREATE TABLE IF NOT EXISTS "outbox_eventos" \(([\s\S]*?)\n\);/)![1];
      const colsSql = [...tabla.matchAll(/^\s{2}"([a-z_]+)"\s+/gm)].map((m) => m[1]).sort();
      assert.deepEqual(colsModelo, colsSql);
    });

    await test('estático: el CI aplica el SQL canónico de la migración y ejecuta las tres suites del outbox', () => {
      const wf = leer(WORKFLOW_PATH);
      assert.ok(wf.includes('20260930180000_outbox_eventos_finanzas/migration.sql'), 'el workflow debe aplicar la migración del outbox con psql -f');
      for (const s of ['outbox-eventos', 'outbox-eventos-rls-ready', 'outbox-eventos-migracion']) {
        assert.ok(wf.includes(`test:integration:${s} `) || wf.includes(`test:integration:${s}\n`), `el workflow debe ejecutar ${s}`);
      }
    });

    await test('estático: el modo predeterminado en los despliegues es direct y el despachador/limpieza nunca se encienden por defecto', () => {
      const raiz = join(__dirname, '..', '..', '..', '..');
      const compose = leer(join(raiz, 'docker-compose.vps.yml'));
      assert.ok(!/FINANZAS_EVENT_MODE\s*[:=]\s*["']?outbox/i.test(compose), 'el compose no debe activar el modo outbox');
      assert.ok(!/FINANZAS_OUTBOX_DISPATCHER\s*[:=]\s*["']?on/i.test(compose), 'el compose no debe encender el despachador');
      assert.ok(!/FINANZAS_OUTBOX_CLEANUP\s*[:=]\s*["']?on/i.test(compose), 'el compose no debe encender la limpieza');
      const env = leer(join(raiz, '.env.vps.example'));
      assert.ok(!/FINANZAS_EVENT_MODE\s*=\s*outbox/i.test(env) && !/FINANZAS_OUTBOX_DISPATCHER\s*=\s*on/i.test(env));
    });
  } finally {
    for (const s of esquemas) await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${s}" CASCADE`).catch(() => undefined);
    await admin.$disconnect();
  }

  const fallidas = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fallidas.length}/${results.length} pruebas de migración en verde`);
  process.exit(fallidas.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
