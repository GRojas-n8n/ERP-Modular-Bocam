import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AlmacenView } from './AlmacenView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Registrar Activo" ejecutaba el POST directo desde el onClick, sin ninguna
 * confirmación ni referencia al proyecto activo. Ahora debe pasar primero por
 * un diálogo no descartable (ni con clic afuera ni con Escape) que muestra el
 * proyecto activo, y solo llamar al backend si el usuario confirma.
 */

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(() => Promise.resolve({ data: { data: { id_activo: 'activo-nuevo-1' } } })),
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
      name: 'Usuario de Prueba',
      role: ['admin'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/almacen/activos') return Promise.resolve({ data: { data: [] } });
      if (url.startsWith('/api/v1/almacen/activos/traspasos')) return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/almacen/dashboard') return Promise.resolve({ data: { data: null } });
      if (url === '/api/v1/almacen/inventario') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/almacen/movimientos') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: postMock,
  },
}));

async function abrirFormularioYLlenarloHastaGuardar() {
  render(<AlmacenView activeSubView="activos" />);

  fireEvent.click(await screen.findByText('Nuevo Activo'));

  fireEvent.change(screen.getByPlaceholderText('Ej: VEH-01'), { target: { value: 'VEH-99' } });
  fireEvent.change(screen.getByPlaceholderText('Ej: Camioneta Pickup 4x4'), { target: { value: 'Camioneta de prueba' } });

  fireEvent.click(screen.getByRole('button', { name: 'Registrar Activo' }));
}

describe('AlmacenView — confirmación de proyecto activo al crear Activo', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('el panel de alta muestra el proyecto activo en su subtítulo', async () => {
    render(<AlmacenView activeSubView="activos" />);

    fireEvent.click(await screen.findByText('Nuevo Activo'));

    expect(await screen.findByText(/Proyecto: Torre Corporativa Norte/)).toBeInTheDocument();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await abrirFormularioYLlenarloHastaGuardar();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/almacen/activos', expect.anything()));
  });

  it('cancelar el diálogo no crea el activo', async () => {
    await abrirFormularioYLlenarloHastaGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('un clic fuera del diálogo (overlay) no lo cierra ni crea el activo', async () => {
    await abrirFormularioYLlenarloHastaGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    const overlay = document.querySelector('.absolute.inset-0.bg-black\\/50');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });

  it('la tecla Escape no cierra el diálogo ni crea el activo', async () => {
    await abrirFormularioYLlenarloHastaGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
