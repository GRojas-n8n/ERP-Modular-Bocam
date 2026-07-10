import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/seleccion-proveedor-recomendado-firma — tareas 2.4-2.5.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Residente de Prueba', role: ['resident'] } }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PROV_ID = 'prov-1';

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'EN_EVALUACION_TECNICA',
    revision: 'A',
    primera_opcion_proveedor_id: null,
    segunda_opcion_proveedor_id: null,
    proveedores: [{ id: PROV_ID, nombre: 'Proveedor Uno' } as any],
    lineas: [
      {
        id: 'linea-1',
        insumo_id: 'insumo-1',
        insumo_clave: 'MAT-001',
        insumo_descripcion: 'Varilla 3/8',
        insumo_unidad: 'PZA',
        cantidad: 10,
        precios: {},
        tiempos: {},
        ganador: null,
        evaluacion_tecnica: 'C',
      } as any,
    ],
    lineas_detalle: [{ insumo_id: 'insumo-1', especificaciones: [] }],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

describe('ComparativaDetail — gate del botón de firma sobre la selección de proveedor', () => {
  it('con veredicto y sugeridos completos pero sin selección guardada, el botón de firma no aparece', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Varilla 3/8')).toBeInTheDocument());

    // Completar veredicto + proveedor sugerido, SIN guardar la selección 1ª/2ª opción
    const textarea = screen.getByPlaceholderText(/Describe tu evaluación general/i);
    fireEvent.change(textarea, { target: { value: 'Todo en orden, recomiendo este proveedor.' } });
    fireEvent.click(screen.getByRole('button', { name: /A · Proveedor Uno/i }));

    expect(screen.queryByRole('button', { name: /Firmar y Bloquear/i })).not.toBeInTheDocument();
  });

  it('con selección guardada + veredicto + sugeridos + todo evaluado, el botón de firma aparece', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa({ primera_opcion_proveedor_id: PROV_ID })}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Varilla 3/8')).toBeInTheDocument());

    const textarea = screen.getByPlaceholderText(/Describe tu evaluación general/i);
    fireEvent.change(textarea, { target: { value: 'Todo en orden, recomiendo este proveedor.' } });
    fireEvent.click(screen.getByRole('button', { name: /A · Proveedor Uno/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /Firmar y Bloquear/i })).toBeInTheDocument());
  });
});
