import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminView } from './AdminView';

/**
 * Bug reportado en producción: un usuario con rol gerencia_tecnica (sin rol
 * admin) que entra a Administración → Proyectos (accesible desde el punto
 * acceso-proyectos-gt-control-obra) veía "Error al cargar datos de
 * administración" en vez de la lista de proyectos.
 *
 * Causa raíz: loadAll() carga usuarios y proyectos con Promise.all — GET
 * /admin/users requiere rol admin exclusivamente, así que su 403 tumbaba
 * también la carga de /admin/proyectos, aunque ese endpoint sí acepta
 * gerencia_tecnica (ROLES_VER_CENTRO_COSTOS).
 */

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

const PROYECTO = { id_proyecto: 'proyecto-1', codigo_centro_costos: 'TCN-2024', nombre_oficial: 'Torre Corporativa Norte', tipo_contrato: 'PRECIO_UNITARIO', moneda_base: 'MXN', estatus: 'ABIERTO', activo: true };

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/auth/admin/users') {
        const err: any = new Error('Forbidden');
        err.response = { status: 403, data: { success: false, error: { code: 'AUTH_FORBIDDEN', message: 'Acceso denegado.' } } };
        return Promise.reject(err);
      }
      if (url === '/api/v1/auth/admin/proyectos') return Promise.resolve({ data: { data: [PROYECTO] } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  ventasApi: { getClientes: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}));

describe('AdminView — Proyectos no depende de tener acceso a Usuarios', () => {
  it('gerencia_tecnica ve la lista de proyectos aunque /admin/users le devuelva 403', async () => {
    render(<AdminView activeSubView="proyectos" />);

    await waitFor(() => expect(screen.getByText('Torre Corporativa Norte')).toBeInTheDocument());
    expect(screen.queryByText('Error al cargar datos de administración.')).not.toBeInTheDocument();
  });
});
