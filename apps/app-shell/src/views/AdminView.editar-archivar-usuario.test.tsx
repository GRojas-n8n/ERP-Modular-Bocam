import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminView } from './AdminView';

/**
 * Ver openspec/changes/editar-y-archivar-usuarios. Antes de este change, el
 * modal de edición de usuario ocultaba el campo Email (solo se mostraba al
 * crear), y la tabla de usuarios no tenía ninguna acción directa para
 * archivar/reactivar — solo un checkbox "Activo" dentro del propio modal.
 */

const { patchMock } = vi.hoisted(() => ({
  patchMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
}));

const USUARIO_ACTIVO = {
  id: 'user-activo-1',
  email: 'activo@empresa.com',
  nombre: 'Usuario Activo',
  roles: ['residencia'],
  activo: true,
  limite_aprobacion: 0,
  proyectos: [],
  created_at: '2026-01-01T00:00:00.000Z',
};

const USUARIO_INACTIVO = {
  id: 'user-inactivo-1',
  email: 'inactivo@empresa.com',
  nombre: 'Usuario Inactivo',
  roles: ['residencia'],
  activo: false,
  limite_aprobacion: 0,
  proyectos: [],
  created_at: '2026-01-01T00:00:00.000Z',
};

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    refreshUser: vi.fn(),
    currentProjectId: 'proj-001',
    user: {
      id: 'user-sesion-actual',
      name: 'Usuario de Prueba',
      role: ['admin'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/auth/admin/users') return Promise.resolve({ data: { data: [USUARIO_ACTIVO, USUARIO_INACTIVO] } });
      if (url === '/api/v1/auth/admin/proyectos') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: patchMock,
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  ventasApi: { getClientes: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}));

describe('AdminView — editar email de usuario', () => {
  beforeEach(() => {
    patchMock.mockClear();
  });

  it('muestra el campo Email (con el valor actual) al editar un usuario y permite cambiarlo', async () => {
    render(<AdminView activeSubView="usuarios" />);

    fireEvent.click((await screen.findAllByRole('button', { name: 'Editar' }))[0]);

    const inputEmail = await screen.findByDisplayValue(USUARIO_ACTIVO.email);
    fireEvent.change(inputEmail, { target: { value: 'nuevo@empresa.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith(
      `/api/v1/auth/admin/users/${USUARIO_ACTIVO.id}`,
      expect.objectContaining({ email: 'nuevo@empresa.com' })
    ));
  });
});

describe('AdminView — archivar/reactivar usuario', () => {
  beforeEach(() => {
    patchMock.mockClear();
  });

  it('el botón Archivar pide confirmación y solo llama al PATCH activo:false al confirmar', async () => {
    render(<AdminView activeSubView="usuarios" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Archivar' }));
    expect(patchMock).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Archivar usuario' }));

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith(
      `/api/v1/auth/admin/users/${USUARIO_ACTIVO.id}`,
      { activo: false }
    ));
  });

  it('cancelar el diálogo de Archivar no llama al backend', async () => {
    render(<AdminView activeSubView="usuarios" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Archivar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(patchMock).not.toHaveBeenCalled();
  });

  it('el botón Reactivar pide confirmación y llama al PATCH activo:true al confirmar', async () => {
    render(<AdminView activeSubView="usuarios" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Reactivar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Reactivar usuario' }));

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith(
      `/api/v1/auth/admin/users/${USUARIO_INACTIVO.id}`,
      { activo: true }
    ));
  });

  it('deshabilita el botón Archivar para la propia cuenta en sesión', async () => {
    const usuarioPropio = { ...USUARIO_ACTIVO, id: 'user-sesion-actual', nombre: 'Yo Mismo' };
    const apiModule = await import('../lib/api');
    (apiModule.default.get as any).mockImplementation((url: string) => {
      if (url === '/api/v1/auth/admin/users') return Promise.resolve({ data: { data: [usuarioPropio] } });
      if (url === '/api/v1/auth/admin/proyectos') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: null } });
    });

    render(<AdminView activeSubView="usuarios" />);

    const botonArchivar = await screen.findByRole('button', { name: 'Archivar' });
    expect(botonArchivar).toBeDisabled();
  });
});
