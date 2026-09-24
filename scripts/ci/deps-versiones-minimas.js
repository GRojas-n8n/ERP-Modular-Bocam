#!/usr/bin/env node
/**
 * deps-versiones-minimas.js
 *
 * Falla si alguna copia (incluidas las anidadas) de un paquete con incidente
 * de seguridad resuelve en package-lock.json por debajo de su versión mínima
 * parcheada. Solo revisa el árbol de producción (ignora entradas `dev`).
 *
 * Ver openspec/changes/bump-dependencias-cve-multer-nodemailer-express.
 *
 * Uso: node scripts/ci/deps-versiones-minimas.js   (sin red, sin infraestructura)
 */
const fs = require('fs');
const path = require('path');

// Mínimos = primera versión con parche de los advisories reportados por
// `npm audit --omit=dev` el 2026-09-24.
const MINIMOS = {
  multer: '2.3.0', // GHSA-wc9g-mqfw-jrwm, GHSA-535w-7cp7-47q4, GHSA-qfvm-cv95-jqjf, GHSA-qvfw-j98x-7q72
  nodemailer: '9.1.1', // GHSA-8m3c-c648-2xjj, GHSA-wmmp-3585-3rmp, GHSA-cc9r-2j5m-2m83, GHSA-2x7j-588g-ccc2
  express: '4.22.3', // vía qs
  qs: '6.16.0', // GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g
  'body-parser': '1.20.8', // vía qs
};

function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return NaN;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/** Nombre del paquete a partir de la clave del lockfile ("node_modules/a/node_modules/@s/b" → "@s/b"). */
function packageNameFromKey(key) {
  const idx = key.lastIndexOf('node_modules/');
  return idx === -1 ? null : key.slice(idx + 'node_modules/'.length);
}

/**
 * @param {{packages?: Record<string, {version?: string, dev?: boolean}>}} lock
 * @param {Record<string, string>} minimos
 * @returns {{paquete: string, ubicacion: string, version: string, minimo: string}[]}
 */
function findViolations(lock, minimos = MINIMOS) {
  const violaciones = [];
  for (const [key, entry] of Object.entries(lock.packages || {})) {
    const name = packageNameFromKey(key);
    if (!name || !(name in minimos)) continue;
    if (entry.dev) continue; // solo árbol de producción
    if (!entry.version) continue;
    const cmp = compareVersions(entry.version, minimos[name]);
    if (Number.isNaN(cmp) || cmp < 0) {
      violaciones.push({
        paquete: name,
        ubicacion: key,
        version: entry.version,
        minimo: minimos[name],
      });
    }
  }
  return violaciones;
}

function main() {
  const lockPath = path.resolve(__dirname, '..', '..', 'package-lock.json');
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const violaciones = findViolations(lock);
  if (violaciones.length === 0) {
    console.log('Versiones mínimas OK: ' + Object.keys(MINIMOS).join(', '));
    return 0;
  }
  console.error('Dependencias de producción por debajo del mínimo parcheado:');
  for (const v of violaciones) {
    console.error(`  - ${v.paquete}@${v.version} en ${v.ubicacion} (mínimo ${v.minimo})`);
  }
  return 1;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { MINIMOS, compareVersions, findViolations, packageNameFromKey };
