import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcularBloqueosRequisicion, calcularBloqueosProveedor } from './purga-bloqueos';

describe('calcularBloqueosRequisicion', () => {
  it('devuelve vacío si la Requisición no tiene OC asociadas', () => {
    const bloqueos = calcularBloqueosRequisicion([], []);
    assert.deepEqual(bloqueos, []);
  });

  it('devuelve el bloqueo de OC cuando existen OrdenCompra no incluidas en el lote', () => {
    const bloqueos = calcularBloqueosRequisicion(['oc-1', 'oc-2'], ['oc-1']);
    assert.equal(bloqueos.length, 1);
    assert.equal(bloqueos[0].tipo, 'ORDEN_COMPRA');
    assert.equal(bloqueos[0].cantidad, 1);
    assert.deepEqual(bloqueos[0].ids, ['oc-2']);
  });

  it('no bloquea si las OC referenciadas sí están incluidas en el mismo lote', () => {
    const bloqueos = calcularBloqueosRequisicion(['oc-1', 'oc-2'], ['oc-1', 'oc-2']);
    assert.deepEqual(bloqueos, []);
  });
});

describe('calcularBloqueosProveedor', () => {
  it('devuelve vacío si no quedan referencias tras aplicar el lote', () => {
    const bloqueos = calcularBloqueosProveedor(
      {
        ordenesCompra: ['oc-1'],
        comparativaDetalle: [],
        evaluacionEspecificacion: [],
        solicitudCotizacionProveedor: [],
      },
      { ordenesCompra: ['oc-1'] },
    );
    assert.deepEqual(bloqueos, []);
  });

  it('devuelve el conteo por tipo cuando sí quedan referencias', () => {
    const bloqueos = calcularBloqueosProveedor(
      {
        ordenesCompra: ['oc-1', 'oc-2'],
        comparativaDetalle: ['cd-1'],
        evaluacionEspecificacion: [],
        solicitudCotizacionProveedor: ['scp-1', 'scp-2'],
      },
      { ordenesCompra: ['oc-1'] },
    );
    assert.equal(bloqueos.length, 3);
    const porTipo = Object.fromEntries(bloqueos.map((b) => [b.tipo, b.cantidad]));
    assert.deepEqual(porTipo, {
      ORDEN_COMPRA: 1,
      COMPARATIVA_DETALLE: 1,
      SOLICITUD_COTIZACION_PROVEEDOR: 2,
    });
  });
});
