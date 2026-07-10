import test from 'node:test';
import assert from 'node:assert/strict';
import { sesionExcedeLimite } from './sesion-policy';

test('sesionExcedeLimite es false justo al iniciar la sesión', () => {
  const inicio = new Date('2026-01-01T08:00:00Z');
  const ahora = new Date('2026-01-01T08:00:01Z');
  assert.equal(sesionExcedeLimite(inicio, ahora, 16), false);
});

test('sesionExcedeLimite es false dentro del límite (menos de maxHoras)', () => {
  const inicio = new Date('2026-01-01T08:00:00Z');
  const ahora = new Date('2026-01-01T20:00:00Z'); // 12h después
  assert.equal(sesionExcedeLimite(inicio, ahora, 16), false);
});

test('sesionExcedeLimite es true justo al cumplirse maxHoras', () => {
  const inicio = new Date('2026-01-01T08:00:00Z');
  const ahora = new Date('2026-01-02T00:00:01Z'); // 16h y 1s después
  assert.equal(sesionExcedeLimite(inicio, ahora, 16), true);
});

test('sesionExcedeLimite es true muy por encima del límite (persistencia de un día para otro)', () => {
  const inicio = new Date('2026-01-01T08:00:00Z');
  const ahora = new Date('2026-01-02T09:00:00Z'); // 25h después
  assert.equal(sesionExcedeLimite(inicio, ahora, 16), true);
});

test('sesionExcedeLimite retorna false si sesionIniciadaEn es null (compatibilidad con tokens previos al cambio)', () => {
  assert.equal(sesionExcedeLimite(null, new Date(), 16), false);
});
