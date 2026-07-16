import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/unificar-presupuesto-a-partidas-gt (sección 5).
 * Cuando la requisición tiene concepto_id (partida real), "Autorizar" ya no
 * debe mostrar el selector de presupuesto ni pedirlo — el backend lo resuelve
 * automáticamente. Sin concepto_id, el flujo de selección manual se conserva
 * sin cambios (fallback).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Compras de Prueba', role: ['procurement'] } }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

const get = vi.fn((url: string) => {
  if (url.startsWith('/api/v1/finanzas/presupuestos')) {
    return Promise.resolve({ data: { data: [{ id_presupuesto: 'pres-fallback-1', codigo: 'PRES-1', descripcion: 'Fallback', monto_disponible: 10000 }] } });
  }
  return Promise.resolve({ data: { data: { ordenes_compra: [] } } });
});
const post = vi.fn((_url: string, _body: any) => Promise.resolve({ data: { data: {} } }));
vi.mock('../lib/api', () => ({
  default: {
    get: (url: string) => get(url),
    post: (url: string, body: any) => post(url, body),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'APROBADO_GT',
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

describe('ComparativaDetail — resolución de presupuesto por partida al autorizar', () => {
  it('con requisicionConceptoId: no llama GET /finanzas/presupuestos y no muestra selector', async () => {
    get.mockClear();
    post.mockClear();

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        requisicionConceptoId="concepto-real-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: /Generar Orden de Compra/i }));

    await waitFor(() => expect(post).toHaveBeenCalled());
    const [url, body] = post.mock.calls[0];
    expect(url).toContain('/convertir-oc');
    expect(body).not.toHaveProperty('presupuesto_id');

    expect(get.mock.calls.some(([u]) => String(u).startsWith('/api/v1/finanzas/presupuestos'))).toBe(false);
    expect(screen.queryByText('Seleccionar Presupuesto')).not.toBeInTheDocument();
  });

  it('sin requisicionConceptoId: conserva el flujo de selección manual (fallback)', async () => {
    get.mockClear();
    post.mockClear();

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-2"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: /Generar Orden de Compra/i }));

    await waitFor(() => expect(get).toHaveBeenCalledWith('/api/v1/finanzas/presupuestos'));
    await waitFor(() => expect(post).toHaveBeenCalled());
    const [url, body] = post.mock.calls[0];
    expect(url).toContain('/convertir-oc');
    expect(body).toHaveProperty('presupuesto_id', 'pres-fallback-1');
  });
});
