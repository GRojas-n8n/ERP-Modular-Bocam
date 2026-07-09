import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Reproduce el bug reportado: un usuario viendo "Catálogo de Obra" no se daba
 * cuenta de que la tabla tenía columnas ocultas hacia la derecha, porque el
 * único indicador era el scrollbar nativo (casi invisible). Este test debe
 * FALLAR contra el código previo al fix (sin ninguna señal visual de overflow
 * disponible) y PASAR una vez aplicado `TableScrollShadow` (tarea 3.1).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba' },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/gerencia-tecnica/presupuestos') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 'presupuesto-1',
                proyecto_id: 'proyecto-1',
                version: 1,
                estado: 'BORRADOR',
                importe_total: 1000,
                conceptos: [
                  {
                    id: 'concepto-1',
                    clave: 'C-001',
                    descripcion: 'Concepto de prueba con columnas suficientes para exceder el ancho visible',
                    unidad_medida: 'PZA',
                    cantidad: 10,
                    precio_unitario: 100,
                    importe: 1000,
                    precio_actual: 110,
                    delta_pct: 10,
                  },
                ],
                created_at: new Date().toISOString(),
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

function mockScrollMetrics(el: HTMLElement, metrics: { scrollLeft: number; scrollWidth: number; clientWidth: number }) {
  Object.defineProperty(el, 'scrollLeft', { value: metrics.scrollLeft, configurable: true });
  Object.defineProperty(el, 'scrollWidth', { value: metrics.scrollWidth, configurable: true });
  Object.defineProperty(el, 'clientWidth', { value: metrics.clientWidth, configurable: true });
}

describe('InsumosView — Catálogo de Obra — affordance de scroll horizontal', () => {
  it('muestra una señal visual cuando la tabla tiene columnas ocultas a la derecha', async () => {
    render(<InsumosView />);

    // Esperar a que cargue el catálogo (aparece la clave del concepto de prueba)
    await waitFor(() => expect(screen.getByText('C-001')).toBeInTheDocument());

    const table = screen.getByRole('table');
    const scrollContainer = table.closest('.overflow-x-auto') as HTMLElement | null;
    expect(scrollContainer).not.toBeNull();

    mockScrollMetrics(scrollContainer!, { scrollLeft: 0, scrollWidth: 1200, clientWidth: 400 });
    fireEvent.scroll(scrollContainer!);

    expect(screen.getByTestId('table-scroll-shadow-right')).toBeInTheDocument();
  });
});
