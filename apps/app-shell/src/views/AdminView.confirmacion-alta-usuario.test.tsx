import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminView } from './AdminView';

/**
 * Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos/, tarea 4.
 * Crear un usuario nuevo debe pedir confirmación del proyecto activo antes
 * de enviar la petición — editar un usuario existente no cambia.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    refreshUser: vi.fn(),
    currentProjectId: 'proyecto-1',
    user: { id: 'user-sesion-actual', name: 'Usuario de Prueba', role: ['admin'], projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024' }] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PROYECTO = { id_proyecto: 'proyecto-1', codigo_centro_costos: 'TCN-2024', nombre_oficial: 'Torre Corporativa Norte', tipo_contrato: 'PRECIO_UNITARIO', moneda_base: 'MXN', estatus: 'ABIERTO', activo: true };

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn(() => Promise.resolve({ data: { data: null } })) }));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/auth/admin/users') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/auth/admin/proyectos') return Promise.resolve({ data: { data: [PROYECTO] } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: postMock,
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  ventasApi: { getClientes: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}));

describe('AdminView — confirmación de proyecto activo al crear Usuario', () => {
  it('clic en "Crear Usuario" no envía nada hasta confirmar el diálogo', async () => {
    render(<AdminView activeSubView="usuarios" />);

    fireEvent.click(await screen.findByRole('button', { name: '+ Nuevo Usuario' }));
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), { target: { value: 'Usuario Nuevo' } });
    fireEvent.change(screen.getByPlaceholderText('usuario@empresa.com'), { target: { value: 'nuevo@empresa.com' } });
    fireEvent.change(document.querySelector('input[type="password"]') as HTMLInputElement, { target: { value: 'clave-segura-123' } });
    fireEvent.click(screen.getByText('Administrador'));

    fireEvent.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    await screen.findByText('¿Crear este usuario?');
    expect(screen.getByText(/Proyecto activo: Torre Corporativa Norte/)).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('confirmar el diálogo sí envía la petición de creación', async () => {
    render(<AdminView activeSubView="usuarios" />);

    fireEvent.click(await screen.findByRole('button', { name: '+ Nuevo Usuario' }));
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), { target: { value: 'Usuario Nuevo' } });
    fireEvent.change(screen.getByPlaceholderText('usuario@empresa.com'), { target: { value: 'nuevo@empresa.com' } });
    fireEvent.change(document.querySelector('input[type="password"]') as HTMLInputElement, { target: { value: 'clave-segura-123' } });
    fireEvent.click(screen.getByText('Administrador'));

    fireEvent.click(screen.getByRole('button', { name: 'Crear Usuario' }));
    await screen.findByText('¿Crear este usuario?');

    const botones = screen.getAllByRole('button', { name: 'Crear Usuario' });
    fireEvent.click(botones[botones.length - 1]);

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/auth/admin/users', expect.objectContaining({ nombre: 'Usuario Nuevo' })));
  });
});
