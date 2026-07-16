import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/fix-agregar-proveedor-rompe-enviar-evaluacion.
 * Hallazgo original: openspec/changes/archive/2026-07-14-feat-especificacion-ofrecida-proveedor.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Compras de Prueba', role: ['procurement'] } }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'BORRADOR',
    revision: 'A',
    primera_opcion_proveedor_id: null,
    segunda_opcion_proveedor_id: null,
    proveedores: [],
    lineas: [],
    lineas_detalle: [],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

describe('ComparativaDetail — agregar proveedor/línea manualmente preserva el estado', () => {
  it('agregar un proveedor desde el catálogo no cambia estado a EN_PROCESO', async () => {
    const onUpdate = vi.fn();

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        proveedoresCatalogo={[{ id: 'cat-1', razon_social: 'Proveedor Catálogo', rfc: 'ABC010101AB1' }]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={onUpdate}
        modo="compras"
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: /Agregar proveedor/i }));
    fireEvent.mouseDown(await screen.findByText('Proveedor Catálogo'));

    expect(onUpdate).toHaveBeenCalled();
    const payload = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(payload.estado).toBe('BORRADOR');
    expect(payload.proveedores).toHaveLength(1);
  });

  it('agregar una línea/material manualmente no cambia estado a EN_PROCESO', async () => {
    const onUpdate = vi.fn();

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa({
          proveedores: [{ id: 'prov-1', nombre: 'Proveedor Uno' } as any],
        })}
        insumos={[{ id: 'ins-1', clave: 'MAT-01', descripcion: 'Cemento gris', unidad: 'TON' } as any]}
        proveedoresCatalogo={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={onUpdate}
        modo="compras"
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: /Agregar material/i }));
    fireEvent.focus(await screen.findByPlaceholderText('Buscar material...'));
    fireEvent.mouseDown(await screen.findByText(/Cemento gris/i));
    const cantidadInput = screen.getByPlaceholderText('Cant.');
    fireEvent.change(cantidadInput, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /^Agregar$/ }));

    expect(onUpdate).toHaveBeenCalled();
    const payload = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(payload.estado).toBe('BORRADOR');
    expect(payload.lineas).toHaveLength(1);
  });
});
