import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { parseOrRespond } from './parse-or-respond';

// Response fake mínimo: solo lo que parseOrRespond usa (status().json()).
function fakeResponse() {
  const calls: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      calls.status = code;
      return res;
    },
    json(body: unknown) {
      calls.body = body;
      return res;
    },
  };
  return { res: res as any, calls };
}

const schema = z.object({
  email: z.string().min(1),
  tenant_id: z.string().min(1),
});

test('parseOrRespond retorna los datos parseados cuando el payload es válido', () => {
  const { res, calls } = fakeResponse();
  const result = parseOrRespond(schema, { email: 'a@b.com', tenant_id: 't1' }, res);

  assert.deepEqual(result, { email: 'a@b.com', tenant_id: 't1' });
  assert.equal(calls.status, undefined, 'no debe escribir ninguna respuesta cuando el payload es válido');
});

test('parseOrRespond responde 400 con VALIDATION_ERROR cuando el payload es inválido', () => {
  const { res, calls } = fakeResponse();
  const result = parseOrRespond(schema, { email: '', tenant_id: 't1' }, res);

  assert.equal(result, undefined);
  assert.equal(calls.status, 400);
  const body = calls.body as any;
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(body.error.details));
});

test('parseOrRespond reporta un detalle por cada campo que falla, no solo el primero', () => {
  const { res, calls } = fakeResponse();
  parseOrRespond(schema, { email: '', tenant_id: '' }, res);

  const body = calls.body as any;
  const fields = body.error.details.map((d: { field: string }) => d.field);
  assert.deepEqual(fields.sort(), ['email', 'tenant_id']);
});

test('parseOrRespond rechaza un campo con forma inesperada (objeto en vez de string)', () => {
  const { res, calls } = fakeResponse();
  const result = parseOrRespond(schema, { email: { nested: true }, tenant_id: 't1' }, res);

  assert.equal(result, undefined);
  const body = calls.body as any;
  assert.equal(body.error.details[0].field, 'email');
});
