import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Guardar Cuadrilla" ejecutaba el POST directo desde el onClick, sin
 * ninguna confirmación ni referencia al proyecto activo. Ahora debe pasar
 * primero por un diálogo no descartable (ni con clic afuera ni con Escape)
 * que muestra el proyecto activo, y solo llama al backend si el usuario
 * confirma.
 */

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn((url: string) => {
    if (url === '/api/v1/personal/cuadrillas') {
      return Promise.resolve({ data: { data: { id_cuadrilla: 'cuad-1', codigo: 'CUAD-001' } } });
    }
    return Promise.resolve({ data: { data: null } });
  }),
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
      name: 'Usuario de Prueba',
      role: ['personal_rh'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const dashboardMock = {
  resumen: { total_empleados: 0, empleados_activos: 0, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: postMock,
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function llenarYGuardarCuadrilla() {
  render(<PersonalView activeSubView="cuadrillas" />);

  fireEvent.click((await screen.findAllByText('Nueva Cuadrilla'))[0]);

  const nombreInputs = await screen.findAllByRole('textbox');
  fireEvent.change(nombreInputs[0], { target: { value: 'Cuadrilla de prueba' } });
  fireEvent.change(nombreInputs[1], { target: { value: 'Cimentación' } });

  fireEvent.click(screen.getByRole('button', { name: /Guardar Cuadrilla/i }));
}

describe('PersonalView — confirmación de proyecto activo al crear Cuadrilla', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await llenarYGuardarCuadrilla();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/personal/cuadrillas', expect.anything()));
  });

  it('cancelar el diálogo no crea la cuadrilla', async () => {
    await llenarYGuardarCuadrilla();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni crea la cuadrilla', async () => {
    await llenarYGuardarCuadrilla();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
