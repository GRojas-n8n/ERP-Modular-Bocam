const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  MINIMOS,
  compareVersions,
  findViolations,
  packageNameFromKey,
} = require('./deps-versiones-minimas');

test('compareVersions ordena por major, minor y patch', () => {
  assert.equal(compareVersions('2.2.0', '2.3.0'), -1);
  assert.equal(compareVersions('2.10.0', '2.3.0'), 1);
  assert.equal(compareVersions('4.22.3', '4.22.3'), 0);
  assert.equal(compareVersions('5.0.0', '4.22.3'), 1);
});

test('packageNameFromKey resuelve copias anidadas y scopes', () => {
  assert.equal(packageNameFromKey('node_modules/qs'), 'qs');
  assert.equal(packageNameFromKey('node_modules/a/node_modules/qs'), 'qs');
  assert.equal(packageNameFromKey('node_modules/@scope/pkg'), '@scope/pkg');
  assert.equal(packageNameFromKey('apps/auth'), null);
});

test('detecta multer por debajo del mínimo', () => {
  const lock = { packages: { 'node_modules/multer': { version: '2.2.0' } } };
  const v = findViolations(lock);
  assert.equal(v.length, 1);
  assert.equal(v[0].paquete, 'multer');
  assert.equal(v[0].minimo, '2.3.0');
});

test('detecta copias anidadas, no solo la de nivel raíz', () => {
  const lock = {
    packages: {
      'node_modules/qs': { version: '6.16.0' },
      'node_modules/algo/node_modules/qs': { version: '6.15.3' },
    },
  };
  const v = findViolations(lock);
  assert.equal(v.length, 1);
  assert.equal(v[0].ubicacion, 'node_modules/algo/node_modules/qs');
});

test('acepta versiones en o por encima del mínimo', () => {
  const lock = {
    packages: {
      'node_modules/multer': { version: '2.4.0' },
      'node_modules/nodemailer': { version: '9.1.1' },
      'node_modules/express': { version: '4.22.3' },
      'node_modules/body-parser': { version: '1.20.8' },
    },
  };
  assert.deepEqual(findViolations(lock), []);
});

test('ignora dependencias de desarrollo y paquetes no vigilados', () => {
  const lock = {
    packages: {
      'node_modules/qs': { version: '6.0.0', dev: true },
      'node_modules/lodash': { version: '1.0.0' },
    },
  };
  assert.deepEqual(findViolations(lock), []);
});

test('package-lock.json real: ninguna copia de producción por debajo del mínimo', () => {
  const lockPath = path.resolve(__dirname, '..', '..', 'package-lock.json');
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const violaciones = findViolations(lock, MINIMOS);
  assert.deepEqual(
    violaciones,
    [],
    'Paquetes por debajo del mínimo parcheado:\n' +
      violaciones.map((v) => `  ${v.paquete}@${v.version} (${v.ubicacion}) < ${v.minimo}`).join('\n'),
  );
});
