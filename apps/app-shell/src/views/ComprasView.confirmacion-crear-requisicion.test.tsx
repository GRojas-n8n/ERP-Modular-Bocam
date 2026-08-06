import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Crear Requisición" ejecutaba el POST directo desde el onClick, sin ninguna
 * confirmación ni referencia al proyecto activo. Ahora debe pasar primero por
 * un diálogo no descartable (ni con clic afuera ni con Escape) que muestra el
 * proyecto activo, y solo llamar al backend si el usuario confirma.
 */

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(() => Promise.resolve({ data: { data: { id_requisicion: 'req-nueva' } } })),
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

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/catalog/insumos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/comparativas') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/presupuesto-activo') {
        return Promise.resolve({
          data: { data: { conceptos: [{ id: 'concepto-1', clave: '01.01', descripcion: 'Concreto', unidad_medida: 'M3' }] } },
        });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    post: postMock,
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {},
}));

async function abrirFormularioYLlenarloHastaGuardar() {
  render(<ComprasView activeSubView="requisiciones" />);

  fireEvent.click(await screen.findByText('Nueva Requisicion'));

  // Seleccionar partida del catálogo
  fireEvent.click(await screen.findByText('Concreto'));

  // Imprevisto evita tener que buscar/seleccionar un insumo del catálogo
  fireEvent.click(screen.getByText('⚠️ Imprevisto'));

  fireEvent.change(screen.getByPlaceholderText('Ej: Tabique rojo recocido 7x14x28 cm'), {
    target: { value: 'Material de prueba' },
  });
  fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '5' } });

  fireEvent.click(screen.getByRole('button', { name: 'Crear Req. Imprevisto' }));
}

describe('ComprasView — confirmación de proyecto activo al crear Requisición', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('el panel de alta muestra el proyecto activo en su subtítulo', async () => {
    render(<ComprasView activeSubView="requisiciones" />);

    fireEvent.click(await screen.findByText('Nueva Requisicion'));

    expect(await screen.findByText(/Proyecto: Torre Corporativa Norte/)).toBeInTheDocument();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await abrirFormularioYLlenarloHastaGuardar();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/compras/requisiciones', expect.anything()));
  });

  it('cancelar el diálogo no crea la requisición', async () => {
    await abrirFormularioYLlenarloHastaGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('un clic fuera del diálogo (overlay) no lo cierra ni crea la requisición', async () => {
    await abrirFormularioYLlenarloHastaGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    const overlay = document.querySelector('.absolute.inset-0.bg-black\\/50');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });

  it('la tecla Escape no cierra el diálogo ni crea la requisición', async () => {
    await abrirFormularioYLlenarloHastaGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
