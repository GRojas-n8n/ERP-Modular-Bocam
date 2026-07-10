import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Request } from 'express';
import { crearToolsChat } from './index';

function fakeReq(): Request {
  return { headers: { authorization: 'Bearer test-token' } } as unknown as Request;
}

test('crearToolsChat: registra las 7 tools con nombres únicos', () => {
  const registro = new Map<string, number>();
  const tools = crearToolsChat(fakeReq(), registro);

  const nombres = tools.map((t) => t.name);

  assert.equal(nombres.length, 7);
  assert.equal(new Set(nombres).size, 7);
  assert.deepEqual(
    nombres.sort(),
    [
      'consultar_calidad',
      'consultar_compras',
      'consultar_control_obra',
      'consultar_finanzas',
      'consultar_gerencia_tecnica',
      'consultar_personal',
      'consultar_seguridad',
    ].sort(),
  );
});
