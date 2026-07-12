import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/estado-respuesta-proveedor-comparativo — tareas 2.1-2.3.
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
    estado: 'EN_PROCESO',
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

describe('ComparativaDetail — badge de estado de respuesta del proveedor', () => {
  it('proveedor RESPONDIO muestra badge "Respondió"', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa({
          proveedores: [{ id: 'prov-1', nombre: 'Proveedor Uno', estado_respuesta: 'RESPONDIO' } as any],
        })}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Proveedor Uno')).toBeInTheDocument());
    expect(screen.getByText('Respondió')).toBeInTheDocument();
  });

  it('proveedor DECLINO muestra badge "Declinó" y proveedor PENDIENTE muestra badge "Pendiente"', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa({
          proveedores: [
            { id: 'prov-1', nombre: 'Proveedor Declino', estado_respuesta: 'DECLINO' } as any,
            { id: 'prov-2', nombre: 'Proveedor Pendiente', estado_respuesta: 'PENDIENTE' } as any,
          ],
        })}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Proveedor Declino')).toBeInTheDocument());
    expect(screen.getByText('Declinó')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('proveedor sin estado_respuesta (agregado manualmente) no muestra ningún badge de estado', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa({
          proveedores: [{ id: 'prov-1', nombre: 'Proveedor Manual' } as any],
        })}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Proveedor Manual')).toBeInTheDocument());
    expect(screen.queryByText('Respondió')).not.toBeInTheDocument();
    expect(screen.queryByText('Declinó')).not.toBeInTheDocument();
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  });
});
