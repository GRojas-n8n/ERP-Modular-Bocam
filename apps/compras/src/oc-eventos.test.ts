import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOcCanceladaPayload, buildOcCreadaPayload } from './oc-eventos';

const dec = (n: number) => ({ toNumber: () => n });

const oc = {
  id_orden: '11111111-1111-4111-8111-111111111111',
  codigo: 'OC-AUTO-1-1',
  total: dec(1160),
  proveedor_id: '22222222-2222-4222-8222-222222222222',
  presupuesto_id: '33333333-3333-4333-8333-333333333333',
  requisicion_id: '44444444-4444-4444-8444-444444444444',
};

const creada = () => buildOcCreadaPayload({
  oc,
  proyectoId: '55555555-5555-4555-8555-555555555555',
  presupuestoId: oc.presupuesto_id,
  requisicionId: oc.requisicion_id,
  conceptoId: '66666666-6666-4666-8666-666666666666',
  items: [{ insumo_id: 'i-1', cantidad: 2, precio_unitario: 500 }],
});

test('oc_creada incluye presupuesto_id', () => {
  assert.equal(creada().presupuesto_id, oc.presupuesto_id);
});

test('oc_creada conserva los campos que ya publicaba y los que exigen los consumidores', () => {
  const p = creada();
  assert.equal(p.oc_id, oc.id_orden);
  assert.equal(p.codigo, oc.codigo);
  assert.equal(p.total, 1160);
  assert.equal(typeof p.total, 'number');
  assert.equal(p.proveedor_id, oc.proveedor_id);
  assert.equal(p.proyecto_id, '55555555-5555-4555-8555-555555555555');
  assert.equal(p.requisicion_id, oc.requisicion_id);
  assert.equal(p.concepto_id, '66666666-6666-4666-8666-666666666666');
  assert.deepEqual(p.items, [{ insumo_id: 'i-1', cantidad: 2, precio_unitario: 500 }]);
});

test('oc_creada sin requisicion ni concepto publica null (como antes)', () => {
  const p = buildOcCreadaPayload({ oc, proyectoId: 'p', presupuestoId: oc.presupuesto_id, requisicionId: undefined, conceptoId: undefined, items: [] });
  assert.equal(p.requisicion_id, null);
  assert.equal(p.concepto_id, null);
});

test('oc_cancelada conserva su contrato actual', () => {
  assert.deepEqual(buildOcCanceladaPayload(oc), {
    oc_id: oc.id_orden,
    codigo: oc.codigo,
    total: 1160,
    presupuesto_id: oc.presupuesto_id,
    requisicion_id: oc.requisicion_id,
  });
});

test('oc_creada y oc_cancelada comparten oc_id, codigo, total y presupuesto_id', () => {
  const a = creada();
  const b = buildOcCanceladaPayload(oc);
  for (const campo of ['oc_id', 'codigo', 'total', 'presupuesto_id'] as const) {
    assert.equal(a[campo], b[campo], campo);
  }
});

// openspec: oc-creada-subtotal-iva. Contabilidad separa costo e IVA en la póliza de pasivo.
test('oc_creada publica subtotal e iva cuando la OC los trae, y total = subtotal + iva', () => {
  const p = buildOcCreadaPayload({
    oc: { ...oc, subtotal: dec(1000), iva: dec(160) },
    proyectoId: 'p', presupuestoId: oc.presupuesto_id, items: [],
  });
  assert.equal(p.subtotal, 1000);
  assert.equal(p.iva, 160);
  assert.equal(p.total, 1160);
});

test('oc_creada sin subtotal ni iva (OC antigua) publica null, no inventa montos', () => {
  const p = creada();
  assert.equal(p.subtotal, null);
  assert.equal(p.iva, null);
});
