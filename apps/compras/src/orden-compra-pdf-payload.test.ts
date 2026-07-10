import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOcPdfPayload, InsumoCatalogo } from './orden-compra-pdf-payload';

const orden = {
  codigo: 'OC-AUTO-1-1',
  proveedor_nombre: 'Aceros del Norte SA de CV',
  subtotal: 1000,
  iva: 160,
  total: 1160,
  items: [
    { insumo_id: 'insumo-1', cantidad: 10, precio_unitario: 100, importe: 1000 },
  ],
};

test('buildOcPdfPayload produce el shape { oc: {...} } esperado por /api/v1/reportes/oc-pdf', () => {
  const insumoById = new Map<string, InsumoCatalogo>([
    ['insumo-1', { id: 'insumo-1', clave: 'MAT-001', descripcion: 'Varilla 3/8', unidad_medida: 'PZA' }],
  ]);

  const payload = buildOcPdfPayload(orden, insumoById);

  assert.deepEqual(payload, {
    oc: {
      numero: 'OC-AUTO-1-1',
      proveedor: 'Aceros del Norte SA de CV',
      items: [
        { descripcion: '[MAT-001] Varilla 3/8', unidad: 'PZA', cantidad: 10, precio_unitario: 100, importe: 1000 },
      ],
      subtotal: 1000,
      iva: 160,
      total: 1160,
    },
  });
});

test('buildOcPdfPayload: insumo no encontrado en el catálogo no revienta, usa descripción de fallback', () => {
  const insumoById = new Map<string, InsumoCatalogo>();

  const payload = buildOcPdfPayload(orden, insumoById);

  assert.equal(payload.oc.items[0].descripcion, 'Insumo no encontrado en catálogo');
  assert.equal(payload.oc.items[0].unidad, '');
});
