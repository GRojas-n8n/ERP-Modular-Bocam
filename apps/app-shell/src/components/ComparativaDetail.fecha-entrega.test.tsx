import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/fecha-entrega-estimada-por-partida — tareas 3.1-3.2.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Compras de Prueba', role: ['procurement'] } }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const { putMock, patchMock } = vi.hoisted(() => ({
  putMock: vi.fn((_url: string, _body?: unknown) => Promise.resolve({ data: { data: {} } })),
  patchMock: vi.fn((_url: string, _body?: unknown) => Promise.resolve({ data: { data: {} } })),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    put: putMock,
    patch: patchMock,
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
  comprasApi: {},
  asistenteApi: {},
}));

const PROV_ID = 'prov-1';

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'BORRADOR',
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
        precios: { [PROV_ID]: '1500' },
        fechasEntrega: {},
        ganador: null,
        evaluacion_tecnica: 'PENDIENTE',
      } as any,
    ],
    lineas_detalle: [{ insumo_id: 'insumo-1', especificaciones: [] }],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

function ControlledComparativaDetail() {
  const [comparativa, setComparativa] = useState(buildComparativa());
  return (
    <ComparativaDetail
      requisicionFolio="REQ-TEST-1"
      comparativa={comparativa}
      insumos={[]}
      isDemo={false}
      onBack={vi.fn()}
      onUpdate={setComparativa}
      modo="compras"
    />
  );
}

describe('ComparativaDetail — fecha de entrega estimada por partida', () => {
  it('modo Compras muestra un input de fecha por proveedor+línea y lo incluye al guardar cotizaciones', async () => {
    render(<ControlledComparativaDetail />);

    await waitFor(() => expect(screen.getByTestId(`fecha-entrega-${PROV_ID}-linea-1`)).toBeInTheDocument());

    const fechaInput = screen.getByTestId(`fecha-entrega-${PROV_ID}-linea-1`) as HTMLInputElement;
    expect(fechaInput).toBeInTheDocument();
    expect(fechaInput.type).toBe('date');

    fireEvent.change(fechaInput, { target: { value: '2026-08-20' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar a Evaluación Técnica/i }));

    await waitFor(() => expect(putMock).toHaveBeenCalled());
    const [, payload] = putMock.mock.calls[0];
    const precioEnviado = (payload as any).proveedores[0].precios.find((p: any) => p.insumo_id === 'insumo-1');
    expect(precioEnviado.fecha_entrega_estimada).toBe('2026-08-20');
  });

  it('el input de fecha está deshabilitado cuando el cuadro está bloqueado', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa({ estado: 'LOCKED' })}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByTestId(`fecha-entrega-${PROV_ID}-linea-1`)).toBeInTheDocument());

    const fechaInput = screen.getByTestId(`fecha-entrega-${PROV_ID}-linea-1`) as HTMLInputElement;
    expect(fechaInput.disabled).toBe(true);
  });
});
