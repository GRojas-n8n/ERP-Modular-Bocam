import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/selector-proyecto-confirmacion-critica. El diálogo de
 * firma (antes un modal ad-hoc sin referencia al proyecto) ahora usa
 * ConfirmCriticalActionDialog y debe mostrar el nombre del proyecto activo,
 * para que el usuario no firme sobre el proyecto equivocado.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    currentProjectId: 'proj-002',
    user: {
      id: 'user-1',
      name: 'Residente de Prueba',
      role: ['residencia'],
      projects: [
        { id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' },
        { id: 'proj-002', name: 'Residencial Las Palmas', code: 'RLP-2024', status: 'En curso' },
      ],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PROV_ID = 'prov-1';

function buildComparativa(): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'EN_EVALUACION_TECNICA',
    revision: 'A',
    primera_opcion_proveedor_id: PROV_ID,
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
  } as unknown as ComparativaLocal;
}

describe('ComparativaDetail — el diálogo de firma muestra el proyecto activo', () => {
  it('el diálogo de confirmación de firma incluye el nombre del proyecto activo', async () => {
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

    const textarea = screen.getByPlaceholderText(/Describe tu evaluación general/i);
    fireEvent.change(textarea, { target: { value: 'Todo en orden, recomiendo este proveedor.' } });
    fireEvent.click(screen.getByRole('button', { name: /A · Proveedor Uno/i }));

    fireEvent.click(await screen.findByRole('button', { name: /Firmar y Bloquear →/i }));

    expect(await screen.findByText(/Residencial Las Palmas/)).toBeInTheDocument();
  });
});
