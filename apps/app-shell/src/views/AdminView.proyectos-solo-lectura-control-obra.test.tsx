import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminView } from './AdminView';

/**
 * Ver openspec/changes/acceso-proyectos-gt-control-obra/.
 *
 * control_obra ahora puede LEER la pestaña Proyectos (visibilidad desde su
 * propio menú), pero las acciones de escritura (alta/edición) siguen
 * exclusivas de admin/gerencia_tecnica/control_proyectos — ni el botón
 * "Nuevo Proyecto" ni "Editar" existían protegidos por rol antes de este
 * change (cualquiera que llegara a la pestaña los veía).
 */

const PROYECTO = {
  id_proyecto: 'proyecto-1',
  codigo_centro_costos: 'HCO-2026-001',
  nombre_oficial: 'Torre Corporativa Norte',
  tipo_contrato: 'PRECIO_UNITARIO',
  moneda_base: 'MXN',
  estatus: 'ABIERTO',
  activo: true,
};

let currentRoles: string[] = ['control_obra'];

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    refreshUser: vi.fn(),
    currentProjectId: 'proyecto-1',
    get user() {
      return {
        id: 'user-sesion-actual',
        name: 'Usuario de Prueba',
        role: currentRoles,
        projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'HCO-2026-001', status: 'ABIERTO' }],
      };
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
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

describe('AdminView — Proyectos — control_obra ve pero no puede crear/editar', () => {
  it('control_obra no ve "Nuevo Proyecto" ni "Editar"', async () => {
    currentRoles = ['control_obra'];
    render(<AdminView activeSubView="proyectos" />);

    await waitFor(() => expect(screen.getByText('Torre Corporativa Norte')).toBeInTheDocument());

    expect(screen.queryByText(/Nuevo Proyecto/)).not.toBeInTheDocument();
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });

  it('gerencia_tecnica sí ve "Nuevo Proyecto" y "Editar" (comportamiento sin cambios)', async () => {
    currentRoles = ['gerencia_tecnica'];
    render(<AdminView activeSubView="proyectos" />);

    await waitFor(() => expect(screen.getByText('Torre Corporativa Norte')).toBeInTheDocument());

    expect(screen.getByText(/Nuevo Proyecto/)).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });
});
