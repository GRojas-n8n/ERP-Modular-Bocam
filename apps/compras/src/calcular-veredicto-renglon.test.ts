import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularVeredictoRenglon } from './calcular-veredicto-renglon';

test('todas C -> C', () => {
  assert.equal(calcularVeredictoRenglon(['C', 'C', 'C']), 'C');
});

test('alguna NC (sin importar el resto) -> NC', () => {
  assert.equal(calcularVeredictoRenglon(['C', 'NC', 'DA']), 'NC');
  assert.equal(calcularVeredictoRenglon(['NC', '?', 'DA']), 'NC');
});

test('sin NC, alguna "?" -> "?"', () => {
  assert.equal(calcularVeredictoRenglon(['C', '?', 'DA']), '?');
});

test('sin NC ni "?", alguna DA -> DA', () => {
  assert.equal(calcularVeredictoRenglon(['C', 'DA', 'C']), 'DA');
});

test('alguna PENDIENTE (sin importar el resto) -> PENDIENTE', () => {
  assert.equal(calcularVeredictoRenglon(['PENDIENTE', 'C', 'C']), 'PENDIENTE');
  assert.equal(calcularVeredictoRenglon(['NC', 'PENDIENTE']), 'PENDIENTE');
});
