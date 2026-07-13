import { describe, expect, it } from 'vitest';
import { mergeProveedoresConSolicitud, seedProveedoresDesdeSolicitud } from './comparativa-proveedores';

describe('seedProveedoresDesdeSolicitud', () => {
  it('mapea los proveedores invitados de la Solicitud de Cotización al shape del comparativo', () => {
    const invitados = [
      { proveedor_id: 'p1', proveedor_nombre: 'Ferretería Uno' },
      { proveedor_id: 'p2', proveedor_nombre: 'Materiales Dos' },
    ];

    const result = seedProveedoresDesdeSolicitud(invitados);

    expect(result).toEqual([
      { id: 'p1', nombre: 'Ferretería Uno' },
      { id: 'p2', nombre: 'Materiales Dos' },
    ]);
  });

  it('retorna un array vacío cuando no hay proveedores invitados', () => {
    expect(seedProveedoresDesdeSolicitud([])).toEqual([]);
  });

  it('respeta el tope de 3 proveedores aunque la solicitud tenga más invitados', () => {
    const invitados = [
      { proveedor_id: 'p1', proveedor_nombre: 'A' },
      { proveedor_id: 'p2', proveedor_nombre: 'B' },
      { proveedor_id: 'p3', proveedor_nombre: 'C' },
      { proveedor_id: 'p4', proveedor_nombre: 'D' },
    ];

    const result = seedProveedoresDesdeSolicitud(invitados);

    expect(result).toHaveLength(3);
    expect(result.map(p => p.id)).toEqual(['p1', 'p2', 'p3']);
  });

  it('usa "—" como nombre cuando el proveedor invitado no trae proveedor_nombre', () => {
    const invitados = [{ proveedor_id: 'p1', proveedor_nombre: '' }];

    const result = seedProveedoresDesdeSolicitud(invitados);

    expect(result).toEqual([{ id: 'p1', nombre: '—' }]);
  });
});

describe('mergeProveedoresConSolicitud', () => {
  it('repuebla proveedores invitados en un cuadro reabierto que no tiene proveedores aún (bug: "Continuar comparativa" mostraba la lista vacía)', () => {
    const invitados = [
      { proveedor_id: 'p1', proveedor_nombre: 'Ferretería Uno' },
      { proveedor_id: 'p2', proveedor_nombre: 'Materiales Dos' },
    ];

    const result = mergeProveedoresConSolicitud([], invitados);

    expect(result).toEqual([
      { id: 'p1', nombre: 'Ferretería Uno' },
      { id: 'p2', nombre: 'Materiales Dos' },
    ]);
  });

  it('conserva un proveedor ya presente (con precios capturados) que no está en la Solicitud de Cotización', () => {
    const actuales = [{ id: 'manual-1', nombre: 'Proveedor agregado a mano' }];

    const result = mergeProveedoresConSolicitud(actuales, []);

    expect(result).toEqual(actuales);
  });

  it('fusiona proveedores actuales con invitados nuevos, sin descartar los actuales', () => {
    const actuales = [{ id: 'p1', nombre: 'Ferretería Uno' }];
    const invitados = [
      { proveedor_id: 'p1', proveedor_nombre: 'Ferretería Uno' },
      { proveedor_id: 'p2', proveedor_nombre: 'Materiales Dos' },
      { proveedor_id: 'p3', proveedor_nombre: 'Aceros Tres' },
    ];

    const result = mergeProveedoresConSolicitud(actuales, invitados);

    expect(result).toEqual([
      { id: 'p1', nombre: 'Ferretería Uno' },
      { id: 'p2', nombre: 'Materiales Dos' },
      { id: 'p3', nombre: 'Aceros Tres' },
    ]);
  });

  it('respeta el tope máximo: no agrega invitados si ya se alcanzó el tope con los actuales', () => {
    const actuales = [
      { id: 'p1', nombre: 'A' },
      { id: 'p2', nombre: 'B' },
      { id: 'p3', nombre: 'C' },
    ];
    const invitados = [{ proveedor_id: 'p4', proveedor_nombre: 'D' }];

    const result = mergeProveedoresConSolicitud(actuales, invitados);

    expect(result).toEqual(actuales);
  });

  it('no duplica un proveedor presente tanto en actuales como en invitados', () => {
    const actuales = [{ id: 'p1', nombre: 'Ferretería Uno' }];
    const invitados = [{ proveedor_id: 'p1', proveedor_nombre: 'Ferretería Uno' }];

    const result = mergeProveedoresConSolicitud(actuales, invitados);

    expect(result).toEqual(actuales);
  });
});
