import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InsumosView } from './InsumosView';

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: null,
    user: { id: 'admin-1', name: 'Admin', role: ['admin'], projects: [] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: apiGet.mockImplementation((url: string) => {
      if (url === '/api/v1/gerencia-tecnica/presupuestos') {
        return Promise.resolve({
          data: {
            data: [{
              id: 'presupuesto-filtrado-incorrectamente',
              proyecto_id: 'proyecto-inaccesible',
              version: 1,
              estado: 'BORRADOR',
              importe_total: 100,
              conceptos: [],
            }],
          },
        });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('InsumosView sin proyecto activo', () => {
  it('no consulta datos project-scoped y muestra un estado seguro sin acciones mutantes', async () => {
    apiGet.mockClear();
    render(<InsumosView />);

    await act(async () => { await Promise.resolve(); });

    expect(apiGet).not.toHaveBeenCalled();
    expect(screen.getByText(/proyecto.*requerido|selecciona.*proyecto|sin proyecto activo/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aprobar presupuesto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /importar catálogo/i })).not.toBeInTheDocument();
  });
});
