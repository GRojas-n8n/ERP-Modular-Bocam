import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AdminView } from './AdminView';

/**
 * Pedido directo del usuario: los proyectos existentes en Administración →
 * Proyectos deben poder archivarse (y reactivarse), igual que ya existe
 * para Usuarios. El backend ya soportaba `activo` en
 * PATCH /admin/proyectos/:id (actualizarProyectoSchema) — solo faltaba la
 * acción en el frontend.
 */

const PROYECTO_ACTIVO = { id_proyecto: 'proyecto-1', codigo_centro_costos: 'TCN-2024', nombre_oficial: 'Torre Corporativa Norte', tipo_contrato: 'PRECIO_UNITARIO', moneda_base: 'MXN', estatus: 'ABIERTO', activo: true };
const PROYECTO_ARCHIVADO = { id_proyecto: 'proyecto-2', codigo_centro_costos: 'RLP-2023', nombre_oficial: 'Residencial Las Palmas', tipo_contrato: 'PRECIO_UNITARIO', moneda_base: 'MXN', estatus: 'CERRADO', activo: false };

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    refreshUser: vi.fn(),
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['gerencia_tecnica'], projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024' }] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const { patchMock } = vi.hoisted(() => ({ patchMock: vi.fn(() => Promise.resolve({ data: { data: null } })) }));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/auth/admin/proyectos') return Promise.resolve({ data: { data: [PROYECTO_ACTIVO, PROYECTO_ARCHIVADO] } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: patchMock,
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  ventasApi: { getClientes: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}));

describe('AdminView — archivar/reactivar Proyecto', () => {
  beforeEach(() => { patchMock.mockClear(); });

  it('un proyecto activo muestra "Archivar"; confirmar el diálogo llama al PATCH con activo:false', async () => {
    render(<AdminView activeSubView="proyectos" />);
    await screen.findByText('Torre Corporativa Norte');

    const fila = screen.getByText('Torre Corporativa Norte').closest('[class*="hover:bg-muted/20"]') as HTMLElement;
    fireEvent.click(within(fila).getByRole('button', { name: 'Archivar' }));

    await screen.findByText('¿Archivar el proyecto "Torre Corporativa Norte"?');
    fireEvent.click(screen.getByRole('button', { name: 'Archivar proyecto' }));

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith('/api/v1/auth/admin/proyectos/proyecto-1', { activo: false }));
  });

  it('un proyecto archivado muestra "Reactivar"; confirmar llama al PATCH con activo:true', async () => {
    render(<AdminView activeSubView="proyectos" />);
    await screen.findByText('Residencial Las Palmas');

    const fila = screen.getByText('Residencial Las Palmas').closest('[class*="hover:bg-muted/20"]') as HTMLElement;
    fireEvent.click(within(fila).getByRole('button', { name: 'Reactivar' }));

    await screen.findByText('¿Reactivar el proyecto "Residencial Las Palmas"?');
    fireEvent.click(screen.getByRole('button', { name: 'Reactivar proyecto' }));

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith('/api/v1/auth/admin/proyectos/proyecto-2', { activo: true }));
  });

  it('cancelar el diálogo de Archivar no llama al backend', async () => {
    render(<AdminView activeSubView="proyectos" />);
    await screen.findByText('Torre Corporativa Norte');

    const fila = screen.getByText('Torre Corporativa Norte').closest('[class*="hover:bg-muted/20"]') as HTMLElement;
    fireEvent.click(within(fila).getByRole('button', { name: 'Archivar' }));
    await screen.findByText('¿Archivar el proyecto "Torre Corporativa Norte"?');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('¿Archivar el proyecto "Torre Corporativa Norte"?')).not.toBeInTheDocument();
    expect(patchMock).not.toHaveBeenCalled();
  });
});
