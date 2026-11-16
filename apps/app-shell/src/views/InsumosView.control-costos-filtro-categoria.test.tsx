import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/fix-filtro-categoria-control-costos/.
 *
 * El selector de categoría de la pestaña "Control de Costos" nunca tuvo
 * datos reales detrás (`costosCategoriasDisp` se fijaba en `[]` en cada
 * carga): era un control interactivo sin ninguna opción seleccionable y
 * sin ningún efecto posible. Este test debe FALLAR contra el código previo
 * al fix (el `<select>` sigue presente) y PASAR una vez eliminado.
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
      if (url === '/api/v1/gerencia-tecnica/proyectos/proyecto-1/costos-wbs') {
        return Promise.resolve({
          data: {
            data: {
              conceptos: [
                { id: 'concepto-1', clave: 'C-001', descripcion: 'Concepto en riesgo', unidad_medida: 'PZA', presupuesto: 1000, comprometido: 1200, pagado: 900, pct_economico: 120, semaforo: 'rojo' },
                { id: 'concepto-2', clave: 'C-002', descripcion: 'Concepto sin desviación', unidad_medida: 'PZA', presupuesto: 1000, comprometido: 300, pagado: 200, pct_economico: 30, semaforo: 'verde' },
              ],
            },
          },
        });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

describe('InsumosView — Control de Costos — filtro de categoría (bug fix)', () => {
  it('no muestra ningún selector de categoría de gasto', async () => {
    render(<InsumosView activeSubView="control-costos" />);

    await waitFor(() => expect(screen.getByText('C-001')).toBeInTheDocument());

    expect(screen.queryByText('Todas las categorías')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('el filtro "Solo con desviación" muestra solo las partidas con semáforo amarillo/rojo', async () => {
    render(<InsumosView activeSubView="control-costos" />);

    await waitFor(() => expect(screen.getByText('C-001')).toBeInTheDocument());
    expect(screen.getByText('C-002')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /Solo con desviación/i }));

    expect(screen.getByText('C-001')).toBeInTheDocument();
    expect(screen.queryByText('C-002')).not.toBeInTheDocument();
  });
});
