import test from 'node:test';
import assert from 'node:assert/strict';
import { requisicionQuedoCubiertaPorLote } from './requisicion-cobertura';

test('todos los renglones cubiertos por OCs emitidas -> true', () => {
  const todosLosItemIds = ['item-1', 'item-2'];
  const gruposEmitidos = [
    { detalles: [{ insumo_id: 'insumo-1' }] },
    { detalles: [{ insumo_id: 'insumo-2' }] },
  ];
  const detalleReqIdPorInsumo = new Map([
    ['insumo-1', 'item-1'],
    ['insumo-2', 'item-2'],
  ]);

  assert.equal(requisicionQuedoCubiertaPorLote(todosLosItemIds, gruposEmitidos, detalleReqIdPorInsumo), true);
});

test('una OC del lote queda en ERROR_FINANZAS (no se incluye en gruposEmitidos) -> false', () => {
  const todosLosItemIds = ['item-1', 'item-2'];
  // Solo el grupo del renglon 1 quedo EMITIDA; el del renglon 2 quedo en
  // ERROR_FINANZAS y por eso no se pasa dentro de gruposEmitidos.
  const gruposEmitidos = [
    { detalles: [{ insumo_id: 'insumo-1' }] },
  ];
  const detalleReqIdPorInsumo = new Map([
    ['insumo-1', 'item-1'],
    ['insumo-2', 'item-2'],
  ]);

  assert.equal(requisicionQuedoCubiertaPorLote(todosLosItemIds, gruposEmitidos, detalleReqIdPorInsumo), false);
});

test('renglon ganador sin detalle_req_id -> cobertura incierta, false', () => {
  const todosLosItemIds = ['item-1'];
  const gruposEmitidos = [
    { detalles: [{ insumo_id: 'insumo-huerfano' }] },
  ];
  const detalleReqIdPorInsumo = new Map<string, string | null>([
    ['insumo-huerfano', null],
  ]);

  assert.equal(requisicionQuedoCubiertaPorLote(todosLosItemIds, gruposEmitidos, detalleReqIdPorInsumo), false);
});

test('requisicion sin items -> false (nunca marca COMPRADA sin renglones)', () => {
  assert.equal(requisicionQuedoCubiertaPorLote([], [], new Map()), false);
});

// Ver openspec/changes/generar-oc-imprevisto-y-ganador-automatico: renglones de texto
// libre (imprevisto) no tienen insumo_id — el detalle_req_id viaja directo en el grupo,
// no se deriva del mapa insumo->detalle_req_id (que para estos renglones no aplica).
test('renglon de texto libre (sin insumo_id, detalle_req_id directo) -> cobertura correcta', () => {
  const todosLosItemIds = ['item-libre-1'];
  const gruposEmitidos = [
    { detalles: [{ insumo_id: null, detalle_req_id: 'item-libre-1' }] },
  ];

  assert.equal(requisicionQuedoCubiertaPorLote(todosLosItemIds, gruposEmitidos, new Map()), true);
});
