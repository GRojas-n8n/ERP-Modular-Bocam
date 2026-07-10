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
