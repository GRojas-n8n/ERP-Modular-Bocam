import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminView } from './AdminView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Agregar" (nueva categoría de gasto) ejecutaba el POST directo desde el
 * onClick, sin ninguna confirmación ni referencia al proyecto activo. Ahora
 * debe pasar primero por un diálogo no descartable (ni con clic afuera ni
 * con Escape) que muestra el proyecto activo, y solo llamar al backend si el
 * usuario confirma.
 */

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    refreshUser: vi.fn(),
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
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
      if (url.includes('/categorias-gasto')) {
        return Promise.resolve({ data: { data: { categorias: [], estado_proyecto: 'CONFIGURACION' } } });
      }
      if (url === '/api/v1/auth/admin/users') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/auth/admin/proyectos') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: postMock,
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function llenarYAgregarCategoria() {
  render(<AdminView activeSubView="categorias" />);

  const input = await screen.findByPlaceholderText('Ej: Concreto Hidráulico');
  fireEvent.change(input, { target: { value: 'Acero de refuerzo' } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
}

describe('AdminView — confirmación de proyecto activo al crear Categoría de gasto', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await llenarYAgregarCategoria();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/gerencia-tecnica/proyectos/proj-001/categorias-gasto',
      expect.anything()
    ));
  });

  it('cancelar el diálogo no crea la categoría', async () => {
    await llenarYAgregarCategoria();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni crea la categoría', async () => {
    await llenarYAgregarCategoria();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
