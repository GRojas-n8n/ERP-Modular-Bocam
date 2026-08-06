import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Crear asignación" (Asignación a Frente de Trabajo) ejecutaba el POST
 * directo desde el onClick, sin ninguna confirmación ni referencia al
 * proyecto activo. Ahora debe pasar primero por un diálogo no descartable
 * (ni con clic afuera ni con Escape) que muestra el proyecto activo, y solo
 * llama al backend si el usuario confirma.
 */

const EMPLEADO = {
  id_empleado: 'emp-1', numero_empleado: 'EMP-001', nombre: 'Juan', apellido_paterno: 'Pérez',
  puesto: 'Fierrero', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 350,
};

const dashboardMock = {
  resumen: { total_empleados: 1, empleados_activos: 1, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn((url: string) => {
    if (url === '/api/v1/personal/asignaciones') {
      return Promise.resolve({ data: { data: { id_asignacion: 'asig-1' } } });
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

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [EMPLEADO] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      if (url === `/api/v1/personal/empleados/${EMPLEADO.id_empleado}/config-deducciones`) {
        return Promise.resolve({ data: { data: {} } });
      }
      if (url === `/api/v1/personal/empleados/${EMPLEADO.id_empleado}/credencial`) {
        return Promise.resolve({ data: { data: null } });
      }
      return Promise.resolve({ data: { data: [] } });
    }),
    post: postMock,
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function abrirConfigYLlenarAsignacion() {
  render(<PersonalView activeSubView="empleados" />);

  fireEvent.click(await screen.findByText('Deducciones'));
  fireEvent.change(await screen.findByLabelText('Frente de trabajo'), { target: { value: 'Frente 1 — Cimentación' } });

  fireEvent.click(screen.getByRole('button', { name: 'Crear asignación' }));
}

describe('PersonalView — confirmación de proyecto activo al crear Asignación a Frente de Trabajo', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await abrirConfigYLlenarAsignacion();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/personal/asignaciones', expect.anything()));
  });

  it('cancelar el diálogo no crea la asignación', async () => {
    await abrirConfigYLlenarAsignacion();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni crea la asignación', async () => {
    await abrirConfigYLlenarAsignacion();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
