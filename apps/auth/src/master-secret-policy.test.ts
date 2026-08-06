import test from 'node:test';
import assert from 'node:assert/strict';
import { secretsMatch } from './master-secret-policy';

test('secretsMatch acepta el secreto correcto', () => {
  assert.equal(secretsMatch('clave-maestra-123', 'clave-maestra-123'), true);
});

test('secretsMatch rechaza un secreto de la misma longitud pero distinto', () => {
  assert.equal(secretsMatch('clave-maestra-124', 'clave-maestra-123'), false);
});

test('secretsMatch rechaza un secreto de longitud distinta sin lanzar', () => {
  assert.doesNotThrow(() => {
    assert.equal(secretsMatch('corto', 'clave-maestra-123'), false);
  });
});

test('secretsMatch rechaza secreto vacío contra uno no vacío', () => {
  assert.equal(secretsMatch('', 'clave-maestra-123'), false);
});
