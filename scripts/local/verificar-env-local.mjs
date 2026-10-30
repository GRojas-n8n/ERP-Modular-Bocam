#!/usr/bin/env node
// Bloquea el arranque del entorno local si .env.local o docker-compose.local.yml
// contienen alguna URL o host que salga de la máquina (VPS, dominios públicos,
// SMTP, SAT, Sentry, Anthropic...). Lo llama scripts/local/iretum-local.ps1.
// Uso: node scripts/local/verificar-env-local.mjs [.env.local] [docker-compose.local.yml]
import { readFileSync, existsSync } from 'node:fs';

const [envPath = '.env.local', composePath = 'docker-compose.local.yml'] = process.argv.slice(2);

// Hosts permitidos: nombres de servicio de la red docker iretum-local y loopback.
const HOSTS_LOCALES = new Set([
  'localhost', '127.0.0.1', '::1',
  'postgres', 'redis', 'rabbitmq',
  'auth', 'gerencia-tecnica', 'compras', 'finanzas', 'personal', 'seguridad',
  'ventas', 'contabilidad', 'calidad', 'reportes', 'asistente', 'almacen',
  'control-proyectos', 'app-shell', 'mailpit',
]);

// Variables que deben ir vacías o ausentes: activarlas conecta con servicios externos.
const DEBEN_IR_VACIAS = [
  'SENTRY_DSN', 'ANTHROPIC_API_KEY', 'SAT_ADAPTER_BASE_URL', 'SAT_ADAPTER_API_KEY',
];

// El correo solo puede ir a la captura local (Mailpit) o estar apagado.
const SMTP_PERMITIDOS = new Set(['', 'mailpit']);

const errores = [];

function revisarUrls(texto, origen) {
  for (const m of texto.matchAll(/\b([a-z][a-z0-9+.-]*):\/\/(?:[^\s@'"\/]*@)?(\[[^\]]+\]|[^\s:\/'"?#]+)/gi)) {
    const host = m[2].replace(/^\[|\]$/g, '').toLowerCase();
    if (!HOSTS_LOCALES.has(host)) errores.push(`${origen}: URL hacia "${host}" (${m[1]}://...)`);
  }
}

if (!existsSync(envPath)) {
  console.error(`[env-local] No existe ${envPath}.`);
  process.exit(1);
}

const env = readFileSync(envPath, 'utf8');
revisarUrls(env, envPath);
for (const linea of env.split(/\r?\n/)) {
  const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && DEBEN_IR_VACIAS.includes(m[1]) && m[2].trim() !== '') {
    errores.push(`${envPath}: ${m[1]} debe ir vacía en local`);
  }
  if (m && m[1] === 'SMTP_HOST' && !SMTP_PERMITIDOS.has(m[2].trim().replace(/^["']|["']$/g, ''))) {
    errores.push(`${envPath}: SMTP_HOST solo puede ser "mailpit" en local`);
  }
  if (m && m[2].includes('CAMBIAR')) {
    errores.push(`${envPath}: ${m[1]} conserva el valor de plantilla (…CAMBIAR)`);
  }
}

if (existsSync(composePath)) {
  const compose = readFileSync(composePath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n');
  revisarUrls(compose, composePath);
  for (const nombre of DEBEN_IR_VACIAS) {
    const m = compose.match(new RegExp(`^\\s*${nombre}:\\s*(.*)$`, 'm'));
    if (m && !/^(""|''|)$/.test(m[1].trim())) errores.push(`${composePath}: ${nombre} debe ir vacía en local`);
  }
  for (const m of compose.matchAll(/^\s*SMTP_HOST:\s*(.*)$/gm)) {
    if (!SMTP_PERMITIDOS.has(m[1].trim().replace(/^["']|["']$/g, ''))) {
      errores.push(`${composePath}: SMTP_HOST solo puede ser "mailpit" en local (encontrado: ${m[1].trim()})`);
    }
  }
}

if (errores.length) {
  console.error('[env-local] Arranque BLOQUEADO: hay configuración que sale de tu máquina:');
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('[env-local] OK: todas las URLs apuntan a localhost o a la red docker iretum-local.');
