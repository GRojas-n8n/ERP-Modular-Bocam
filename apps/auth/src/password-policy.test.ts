/**
 * Ver openspec/changes/cambio-password-y-logout.
 *
 * Extraído a `password-policy.ts` siguiendo el patrón `*-policy.ts` del repo:
 * `main.ts` tiene `app.listen` y conexiones a BD a nivel de módulo, así que no
 * se puede importar desde un test unitario.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LONGITUD_MINIMA_PASSWORD,
  validarPasswordNueva,
  esPasswordDeArranque,
} from './password-policy';

test('acepta una contraseña razonable', () => {
  const r = validarPasswordNueva({ actual: 'Bocam2026!', nueva: 'Obra-Carbonser-77' });
  assert.equal(r.valida, true);
});

test('rechaza una contraseña más corta que el mínimo', () => {
  const corta = 'a'.repeat(LONGITUD_MINIMA_PASSWORD - 1);
  const r = validarPasswordNueva({ actual: 'Bocam2026!', nueva: corta });
  assert.equal(r.valida, false);
  assert.equal(r.codigo, 'AUTH_PASSWORD_MUY_CORTA');
  assert.match(r.mensaje!, new RegExp(String(LONGITUD_MINIMA_PASSWORD)));
});

test('rechaza repetir la contraseña actual', () => {
  const r = validarPasswordNueva({ actual: 'Obra-Carbonser-77', nueva: 'Obra-Carbonser-77' });
  assert.equal(r.valida, false);
  assert.equal(r.codigo, 'AUTH_PASSWORD_SIN_CAMBIO');
});

test('rechaza la contraseña de arranque compartida', () => {
  // Todos los usuarios del piloto arrancan con la misma. Cambiarla por sí misma
  // desde otra cuenta dejaría la contraseña compartida en circulación.
  const r = validarPasswordNueva({ actual: 'lo-que-sea-1', nueva: 'Bocam2026!' });
  assert.equal(r.valida, false);
  assert.equal(r.codigo, 'AUTH_PASSWORD_DE_ARRANQUE');
});

test('la comparación con la actual no distingue espacios accidentales al final', () => {
  // El usuario copia y pega su contraseña actual con un espacio; sigue siendo
  // la misma contraseña a efectos de "no la cambiaste".
  const r = validarPasswordNueva({ actual: 'Obra-Carbonser-77', nueva: 'Obra-Carbonser-77 ' });
  assert.equal(r.valida, false);
  assert.equal(r.codigo, 'AUTH_PASSWORD_SIN_CAMBIO');
});

test('rechaza una contraseña de solo espacios', () => {
  const r = validarPasswordNueva({ actual: 'Bocam2026!', nueva: '            ' });
  assert.equal(r.valida, false);
  assert.equal(r.codigo, 'AUTH_PASSWORD_MUY_CORTA');
});

test('esPasswordDeArranque ignora mayúsculas y espacios', () => {
  assert.equal(esPasswordDeArranque('Bocam2026!'), true);
  assert.equal(esPasswordDeArranque('  bocam2026!  '), true);
  assert.equal(esPasswordDeArranque('Bocam2027!'), false);
});

test('no exige composición de caracteres, sí longitud', () => {
  // Una frase larga sin símbolos es mejor contraseña que 'Aa1!aa1!'. La política
  // premia longitud en vez de reglas de composición que empujan a post-its.
  assert.equal(validarPasswordNueva({ actual: 'x'.repeat(12), nueva: 'concreto premezclado eje a' }).valida, true);
});
