import { describe, expect, it } from 'vitest';
import { seedProveedoresDesdeSolicitud } from './comparativa-proveedores';

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
