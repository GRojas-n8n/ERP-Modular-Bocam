import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/panel-purga-datos-prueba-compras — tareas 4.6-4.9.
 */

let currentRole = 'admin';

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: [currentRole] },
  }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

let purgaResumenMock = {
  requisiciones: [{ id: 'req-1', codigo: 'REQ-2026-001', estado: 'APROBADA', fecha_solicitud: '2026-07-01T00:00:00.000Z' }],
  ordenes_compra: [] as any[],
  proveedores: [] as any[],
};

let ejecutarPurgaImpl: (lote: any) => Promise<any> = () =>
  Promise.resolve({ data: { data: { requisiciones: 1, ordenes_compra: 0, proveedores: 0, advertencias: [] } } });

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/dashboard' || url === '/api/v1/compras/presupuesto-activo') {
        return Promise.resolve({ data: { data: null } });
      }
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {
    getRequisiciones: () => Promise.resolve({ data: { data: [] } }),
    getProveedores: () => Promise.resolve({ data: { data: [] } }),
    getResumenPurga: () => Promise.resolve({ data: { data: purgaResumenMock } }),
    ejecutarPurga: (lote: any) => ejecutarPurgaImpl(lote),
  },
}));

describe('ComprasView — Herramientas de Administrador — purga', () => {
  beforeEach(() => {
    notify.mockClear();
    currentRole = 'admin';
    purgaResumenMock = {
      requisiciones: [{ id: 'req-1', codigo: 'REQ-2026-001', estado: 'APROBADA', fecha_solicitud: '2026-07-01T00:00:00.000Z' }],
      ordenes_compra: [],
      proveedores: [],
    };
    ejecutarPurgaImpl = () => Promise.resolve({ data: { data: { requisiciones: 1, ordenes_compra: 0, proveedores: 0, advertencias: [] } } });
  });

  it('4.6 — no se renderiza para un usuario sin rol admin', async () => {
    currentRole = 'procurement';
    render(<ComprasView activeSubView="admin-purga" />);

    await waitFor(() => expect(screen.queryByText(/Zona de riesgo/i)).not.toBeInTheDocument());
  });

  it('4.7 — el botón de borrado definitivo permanece deshabilitado hasta escribir ELIMINAR exacto', async () => {
    render(<ComprasView activeSubView="admin-purga" />);

    await waitFor(() => expect(screen.getByText('REQ-2026-001')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Purgar seleccionados/i }));

    const modal = screen.getByText('Confirmar purga').closest('div')!.parentElement as HTMLElement;
    const botonEliminar = within(modal).getByRole('button', { name: /Eliminar definitivamente/i });
    const input = within(modal).getByPlaceholderText('ELIMINAR');

    expect(botonEliminar).toBeDisabled();

    fireEvent.change(input, { target: { value: 'eliminar' } });
    expect(botonEliminar).toBeDisabled();

    fireEvent.change(input, { target: { value: 'ELIMINAR' } });
    expect(botonEliminar).not.toBeDisabled();
  });

  it('4.8 — tras una purga exitosa, las listas se refrescan y desaparecen los registros purgados', async () => {
    render(<ComprasView activeSubView="admin-purga" />);

    await waitFor(() => expect(screen.getByText('REQ-2026-001')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Purgar seleccionados/i }));

    const modal = screen.getByText('Confirmar purga').closest('div')!.parentElement as HTMLElement;
    fireEvent.change(within(modal).getByPlaceholderText('ELIMINAR'), { target: { value: 'ELIMINAR' } });

    purgaResumenMock = { requisiciones: [], ordenes_compra: [], proveedores: [] };
    fireEvent.click(within(modal).getByRole('button', { name: /Eliminar definitivamente/i }));

    await waitFor(() => expect(screen.queryByText('REQ-2026-001')).not.toBeInTheDocument());
    expect(screen.queryByText('Confirmar purga')).not.toBeInTheDocument();
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('4.9 — una respuesta 409 muestra el detalle del bloqueo y no cierra el modal', async () => {
    ejecutarPurgaImpl = () => {
      const err: any = new Error('Conflict');
      err.response = {
        status: 409,
        data: { success: false, message: 'bloqueado', data: { entidad: 'requisicion', id: 'req-1', bloqueos: [{ tipo: 'ORDEN_COMPRA', cantidad: 1 }] } },
      };
      return Promise.reject(err);
    };

    render(<ComprasView activeSubView="admin-purga" />);

    await waitFor(() => expect(screen.getByText('REQ-2026-001')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Purgar seleccionados/i }));

    const modal = screen.getByText('Confirmar purga').closest('div')!.parentElement as HTMLElement;
    fireEvent.change(within(modal).getByPlaceholderText('ELIMINAR'), { target: { value: 'ELIMINAR' } });
    fireEvent.click(within(modal).getByRole('button', { name: /Eliminar definitivamente/i }));

    await waitFor(() => expect(screen.getByText(/ORDEN_COMPRA: 1/)).toBeInTheDocument());
    expect(screen.getByText('Confirmar purga')).toBeInTheDocument();
  });
});
