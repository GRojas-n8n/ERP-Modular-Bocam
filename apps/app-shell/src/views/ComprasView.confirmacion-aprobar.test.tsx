import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/selector-proyecto-confirmacion-critica. Antes de este
 * change, "Aprobar Requisición" ejecutaba el PATCH directo desde el
 * onClick, sin ninguna confirmación ni referencia al proyecto activo — un
 * usuario con varios proyectos abiertos podía aprobar sin darse cuenta en
 * cuál. Ahora debe pasar primero por un diálogo que muestra el proyecto
 * activo, y solo llamar al backend si el usuario confirma.
 */

const { patchMock } = vi.hoisted(() => ({
  patchMock: vi.fn(() => Promise.resolve({ data: { data: { estado: 'APROBADA' } } })),
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
      name: 'Usuario de Prueba',
      role: ['procurement'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const requisicionPendiente = {
  id_requisicion: 'req-1',
  codigo: 'REQ-0001',
  fecha_solicitud: '2026-07-26',
  solicitante_nombre: 'Residente Prueba',
  estado: 'PENDIENTE',
  tipo: 'NORMAL',
  items: [],
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: [requisicionPendiente] } });
      if (url === '/api/v1/compras/catalog/insumos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/comparativas') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: patchMock,
  },
  comprasApi: {},
}));

describe('ComprasView — confirmación crítica al aprobar requisición', () => {
  beforeEach(() => {
    patchMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    render(<ComprasView activeSubView="requisiciones" />);

    const botonAprobar = await screen.findByRole('button', { name: /Aprobar/i });
    fireEvent.click(botonAprobar);

    expect(patchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/Torre Corporativa Norte/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Aprobar'));

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith('/api/v1/compras/requisiciones/req-1/aprobar'));
  });

  it('cancelar el diálogo no ejecuta la aprobación', async () => {
    render(<ComprasView activeSubView="requisiciones" />);

    const botonAprobar = await screen.findByRole('button', { name: /Aprobar/i });
    fireEvent.click(botonAprobar);
    await screen.findByText(/Torre Corporativa Norte/);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(patchMock).not.toHaveBeenCalled();
  });
});
