/**
 * Utilidades de SQL para las pruebas de integración de Finanzas.
 * splitSqlStatements divide un script SQL en sentencias respetando bloques $$...$$, comillas simples y comentarios,
 * porque Prisma ($executeRawUnsafe) no acepta varias sentencias en una sola llamada.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
