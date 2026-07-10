import { test } from 'node:test';
import assert from 'node:assert/strict';
import type Anthropic from '@anthropic-ai/sdk';
import { extraerInvocacionesTools, construirParcial } from './chat-turno';

type Mensaje = Anthropic.Beta.Messages.BetaMessageParam;

function mensajesTurnoTresTools(fallaCompras: boolean, fallaFinanzas: boolean): Mensaje[] {
  return [
    { role: 'user', content: '¿cómo va la obra Torre Cuenca?' },
    {
      role: 'assistant',
      content: [
        { type: 'tool_use', id: 'toolu_1', name: 'consultar_compras', input: {} },
        { type: 'tool_use', id: 'toolu_2', name: 'consultar_finanzas', input: {} },
        { type: 'tool_use', id: 'toolu_3', name: 'consultar_control_obra', input: {} },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: 'toolu_1',
          is_error: fallaCompras,
          content: fallaCompras ? 'Error: timeout' : '{"req_pendientes":2}',
        },
        {
          type: 'tool_result',
          tool_use_id: 'toolu_2',
          is_error: fallaFinanzas,
          content: fallaFinanzas ? 'Error: timeout' : '{"presupuesto":100}',
        },
        {
          type: 'tool_result',
          tool_use_id: 'toolu_3',
          is_error: false,
          content: '{"avance_pct":45}',
        },
      ],
    },
    { role: 'assistant', content: [{ type: 'text', text: 'Respuesta consolidada.' }] },
  ];
}

test('extraerInvocacionesTools: identifica las 3 tools invocadas con su resultado', () => {
  const invocaciones = extraerInvocacionesTools(mensajesTurnoTresTools(true, false));

  assert.equal(invocaciones.length, 3);
  assert.deepEqual(
    invocaciones.find((i) => i.nombre === 'consultar_compras'),
    { nombre: 'consultar_compras', esError: true },
  );
  assert.deepEqual(
    invocaciones.find((i) => i.nombre === 'consultar_control_obra'),
    { nombre: 'consultar_control_obra', esError: false },
  );
});

test('construirParcial: turno con 3 tools invocadas y 1 falla -> parcial true con el servicio identificado', () => {
  const invocaciones = extraerInvocacionesTools(mensajesTurnoTresTools(true, false));
  const resultado = construirParcial(invocaciones);

  assert.equal(resultado.parcial, true);
  assert.deepEqual(resultado.servicios_fallidos, ['consultar_compras']);
});

test('construirParcial: turno con todas las tools exitosas -> parcial false', () => {
  const invocaciones = extraerInvocacionesTools(mensajesTurnoTresTools(false, false));
  const resultado = construirParcial(invocaciones);

  assert.equal(resultado.parcial, false);
  assert.deepEqual(resultado.servicios_fallidos, []);
});

test('construirParcial: sin tools invocadas -> parcial false, sin servicios fallidos', () => {
  const resultado = construirParcial([]);

  assert.equal(resultado.parcial, false);
  assert.deepEqual(resultado.servicios_fallidos, []);
});

test('construirParcial: no duplica el mismo servicio si falla más de una vez en el turno', () => {
  const invocaciones = [
    { nombre: 'consultar_compras', esError: true },
    { nombre: 'consultar_compras', esError: true },
  ];
  const resultado = construirParcial(invocaciones);

  assert.deepEqual(resultado.servicios_fallidos, ['consultar_compras']);
});
