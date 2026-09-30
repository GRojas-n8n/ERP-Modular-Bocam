/**
 * Utilidades de SQL para las pruebas de integración de Finanzas.
 * splitSqlStatements divide un script SQL en sentencias respetando bloques $$...$$, comillas simples y comentarios,
 * porque Prisma ($executeRawUnsafe) no acepta varias sentencias en una sola llamada.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function splitSqlStatements(sql: string): string[] {
  const out: string[] = [];
  let current = '';
  let i = 0;
  let inDollar = false;
  let inQuote = false;

  while (i < sql.length) {
    const two = sql.slice(i, i + 2);

    if (!inDollar && !inQuote && two === '--') {
      const end = sql.indexOf('\n', i);
      i = end === -1 ? sql.length : end + 1;
      continue;
    }
    if (!inQuote && two === '$$') {
      inDollar = !inDollar;
      current += two;
      i += 2;
      continue;
    }
    const ch = sql[i];
    if (!inDollar && ch === "'") inQuote = !inQuote;
    if (!inDollar && !inQuote && ch === ';') {
      if (current.trim()) out.push(current.trim());
      current = '';
      i += 1;
      continue;
    }
    current += ch;
    i += 1;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

export const MIGRATION_DIR = join(__dirname, '..', '..', 'prisma', 'migrations', '20260930120000_blindar_compromiso_oc');

export function readMigrationSql(file: 'migration.sql' | 'rollback.sql'): string {
  return readFileSync(join(MIGRATION_DIR, file), 'utf8');
}

export const RLS_POLICIES_PATH = join(__dirname, '..', '..', 'prisma', 'rls-policies.sql');

export const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
export const PRISMA_SCHEMA_PATH = join(__dirname, '..', '..', 'prisma', 'schema.prisma');
export const WORKFLOW_PATH = join(REPO_ROOT, '.github', 'workflows', 'backend-e2e.yml');
export const MIGRATION_SQL_PATH = join(MIGRATION_DIR, 'migration.sql');
export const ROLLBACK_SQL_PATH = join(MIGRATION_DIR, 'rollback.sql');

/**
 * Ejecuta un archivo SQL COMPLETO, de una sola vez, con `prisma db execute` (mismo motor y protocolo que
 * `prisma migrate deploy`: el script viaja en un solo lote). Prisma ($executeRawUnsafe) no acepta varias
 * sentencias en una llamada, y ejecutarlas una por una perdería la atomicidad que se quiere probar.
 */
export function runSqlFile(file: string, databaseUrl: string): { ok: boolean; output: string } {
  const r = spawnSync(`npx --no-install prisma db execute --file "${file}" --schema "${PRISMA_SCHEMA_PATH}"`, {
    shell: true,
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    encoding: 'utf8',
  });
  return { ok: r.status === 0, output: `${r.stdout || ''}
${r.stderr || ''}` };
}
