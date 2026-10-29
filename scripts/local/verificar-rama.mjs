#!/usr/bin/env node
// Se ejecuta antes de `npm run dev` / `npm run dev:ventas` (hooks predev).
// Muestra la rama activa y, si no es la rama de pruebas locales, pide confirmación.
// Para saltar la pregunta: PERMITIR_OTRA_RAMA=1 npm run dev
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const RAMA_ESPERADA = 'entorno-local';

let rama;
try {
  rama = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch {
  console.warn('[rama] No se pudo leer la rama de git; se continúa sin verificar.');
  process.exit(0);
}

console.log(`\n[rama] Rama activa: ${rama}\n`);

if (rama === RAMA_ESPERADA) process.exit(0);

console.warn(`[rama] AVISO: No estás en "${RAMA_ESPERADA}".`);
console.warn(`[rama]     Para cambiarte: git switch ${RAMA_ESPERADA}\n`);

if (process.env.PERMITIR_OTRA_RAMA === '1') process.exit(0);

if (!process.stdin.isTTY) {
  console.error('[rama] Arranque detenido. Usa PERMITIR_OTRA_RAMA=1 para forzarlo.');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question(`[rama] ¿Arrancar de todos modos en "${rama}"? (s/N) `, (respuesta) => {
  rl.close();
  if (/^s(i|í)?$/i.test(respuesta.trim())) process.exit(0);
  console.error('[rama] Arranque cancelado.');
  process.exit(1);
});
