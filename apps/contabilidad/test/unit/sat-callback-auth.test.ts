/**
 * Tests unitarios: apps/contabilidad/src/sat-callback-auth.ts
 * Spec: openspec/changes/fix-auth-callbacks-sat-contabilidad/
 *
 * Sin infraestructura (sin BD, sin RabbitMQ) — corre siempre. La comparación
 * en tiempo constante en sí no es probable con un test unitario (la timing
 * side-channel requiere medición estadística), así que aquí se prueba el
 * CONTRATO del wrapper: nunca lanza, nunca compara longitudes en crudo, y
 * rechaza secretos vacíos/mal tipados.
 */

import assert from 'node:assert/strict';
import { getSatCallbackSecret, safeSecretEquals } from '../../src/sat-callback-auth';

function main() {
  // Igualdad básica
  assert.equal(safeSecretEquals('abc', 'abc'), true);
  console.log('ok 1 - safeSecretEquals: valores iguales retorna true');

  assert.equal(safeSecretEquals('abc', 'abd'), false);
  console.log('ok 2 - safeSecretEquals: valores distintos (misma longitud) retorna false');

  // La prueba de regresión más valiosa: timingSafeEqual lanza RangeError si
  // los buffers no miden lo mismo — el wrapper debe hashear primero para que
  // esto NUNCA ocurra, sin importar cuánto difieran las longitudes de entrada.
  assert.doesNotThrow(() => safeSecretEquals('a', 'aaaaaaaaaaaa'));
  assert.equal(safeSecretEquals('a', 'aaaaaaaaaaaa'), false);
  console.log('ok 3 - safeSecretEquals: longitudes distintas no lanza RangeError y retorna false');

  assert.doesNotThrow(() => safeSecretEquals('aaaaaaaaaaaa', 'a'));
  assert.equal(safeSecretEquals('aaaaaaaaaaaa', 'a'), false);
  console.log('ok 4 - safeSecretEquals: longitudes distintas (orden invertido) no lanza y retorna false');

  // Secretos vacíos o mal tipados nunca autentican
  assert.equal(safeSecretEquals('', ''), false, 'un secreto configurado vacío nunca debe autenticar');
  assert.equal(safeSecretEquals('x', ''), false);
  assert.equal(safeSecretEquals(undefined, 'x'), false);
  assert.equal(safeSecretEquals(null, 'x'), false);
  assert.equal(safeSecretEquals(123 as any, 'x'), false);
  console.log('ok 5 - safeSecretEquals: valores vacíos/undefined/null/no-string siempre retornan false');

  // No-ASCII: comparar por bytes UTF-8, no por longitud de caracteres JS
  assert.equal(safeSecretEquals('ñ', 'ñ'), true);
  assert.equal(safeSecretEquals('ñ', 'na'), false);
  console.log('ok 6 - safeSecretEquals: maneja correctamente caracteres no-ASCII');

  // getSatCallbackSecret: sin el fallback a SAT_ADAPTER_API_KEY
  const prevCallback = process.env.SAT_CALLBACK_SHARED_SECRET;
  const prevAdapter = process.env.SAT_ADAPTER_API_KEY;
  try {
    delete process.env.SAT_CALLBACK_SHARED_SECRET;
    process.env.SAT_ADAPTER_API_KEY = 'clave-del-adaptador-externo';
    assert.equal(
      getSatCallbackSecret(), '',
      'getSatCallbackSecret NO debe caer a SAT_ADAPTER_API_KEY — son límites de confianza distintos'
    );
    console.log('ok 7 - getSatCallbackSecret: no cae a SAT_ADAPTER_API_KEY cuando falta SAT_CALLBACK_SHARED_SECRET');

    process.env.SAT_CALLBACK_SHARED_SECRET = 'secreto-propio';
    assert.equal(getSatCallbackSecret(), 'secreto-propio');
    console.log('ok 8 - getSatCallbackSecret: usa SAT_CALLBACK_SHARED_SECRET cuando está configurado');
  } finally {
    if (prevCallback === undefined) delete process.env.SAT_CALLBACK_SHARED_SECRET;
    else process.env.SAT_CALLBACK_SHARED_SECRET = prevCallback;
    if (prevAdapter === undefined) delete process.env.SAT_ADAPTER_API_KEY;
    else process.env.SAT_ADAPTER_API_KEY = prevAdapter;
  }

  console.log('ok - sat-callback-auth: secreto en tiempo constante + sin fallback al adaptador');
}

try {
  main();
} catch (e) {
  console.error('not ok - sat-callback-auth');
  console.error(e);
  process.exitCode = 1;
}
