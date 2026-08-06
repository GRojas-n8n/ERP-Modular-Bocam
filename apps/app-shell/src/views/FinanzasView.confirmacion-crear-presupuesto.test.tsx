import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FinanzasView } from './FinanzasView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Crear Presupuesto" ejecutaba el POST directo desde el onClick, sin
 * ninguna confirmación ni referencia al proyecto activo. Ahora debe pasar
 * primero por un diálogo no descartable (ni con clic afuera ni con Escape)
 * que muestra el proyecto activo, y solo llamar al backend si el usuario
 * confirma.
 */

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
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

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    post: postMock,
  },
}));

async function llenarYCrearPresupuesto() {
  render(<FinanzasView />);

  fireEvent.click((await screen.findAllByText(/Nuevo Presupuesto/i))[0]);

  fireEvent.change(await screen.findByPlaceholderText('PRES-MAT-001'), { target: { value: 'PRES-TEST-001' } });
  fireEvent.change(screen.getByPlaceholderText('Materiales de construcción — Cimentación'), { target: { value: 'Materiales de prueba' } });
  fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1000' } });

  fireEvent.click(screen.getByRole('button', { name: 'Crear Presupuesto' }));
}

describe('FinanzasView — confirmación de proyecto activo al crear Presupuesto', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await llenarYCrearPresupuesto();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/finanzas/presupuestos', expect.anything()));
  });

  it('cancelar el diálogo no crea el presupuesto', async () => {
    await llenarYCrearPresupuesto();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni crea el presupuesto', async () => {
    await llenarYCrearPresupuesto();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
