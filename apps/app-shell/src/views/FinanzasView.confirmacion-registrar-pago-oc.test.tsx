import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { FinanzasView } from './FinanzasView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Registrar Pago" (pago sobre una Orden de Compra) ejecutaba el POST
 * directo desde el onClick, sin ninguna confirmación ni referencia al
 * proyecto activo. Ahora debe pasar primero por un diálogo no descartable
 * (ni con clic afuera ni con Escape) que muestra el proyecto activo, y solo
 * llama al backend si el usuario confirma.
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

function dialogoConfirmacion(): HTMLElement {
  const overlay = document.querySelector('.fixed.inset-0.z-\\[60\\]');
  if (!overlay) throw new Error('No se encontró el diálogo de confirmación');
  return overlay as HTMLElement;
}

function modalRegistrarPago(): HTMLElement {
  const overlay = document.querySelector('.fixed.inset-0.z-50');
  if (!overlay) throw new Error('No se encontró el modal de registrar pago');
  return overlay as HTMLElement;
}

async function llenarYRegistrarPago() {
  render(<FinanzasView />);

  fireEvent.click(await screen.findByRole('button', { name: /Registrar Pago/i }));

  fireEvent.change(await screen.findByPlaceholderText('TRF-2026-001'), { target: { value: 'TRF-TEST-001' } });
  fireEvent.change(screen.getByPlaceholderText('Pago materiales factura F-001'), { target: { value: 'Pago de prueba' } });
  fireEvent.change(screen.getByPlaceholderText('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'), { target: { value: 'oc-1' } });
  fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '500' } });

  fireEvent.click(within(modalRegistrarPago()).getByRole('button', { name: /^Registrar Pago$/ }));
}

describe('FinanzasView — confirmación de proyecto activo al registrar Pago OC', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await llenarYRegistrarPago();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(within(dialogoConfirmacion()).getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/finanzas/pagos-oc', expect.anything()));
  });

  it('cancelar el diálogo no registra el pago', async () => {
    await llenarYRegistrarPago();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(within(dialogoConfirmacion()).getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni registra el pago', async () => {
    await llenarYRegistrarPago();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
