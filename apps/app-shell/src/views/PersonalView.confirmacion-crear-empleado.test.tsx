import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Guardar empleado" ejecutaba el POST directo desde el onClick, sin ninguna
 * confirmación ni referencia al proyecto activo. Ahora debe pasar primero por
 * un diálogo no descartable (ni con clic afuera ni con Escape) que muestra el
 * proyecto activo, y solo llamar al backend si el usuario confirma.
 */

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn((url: string) => {
    if (url === '/api/v1/personal/empleados') {
      return Promise.resolve({
        data: {
          data: {
            id_empleado: 'emp-nuevo-1',
            numero_empleado: 'EMP-042',
            nombre: 'Juan',
            apellido_paterno: 'Pérez',
            puesto: 'Fierrero',
            categoria: 'OBRERO',
            estado: 'ACTIVO',
            salario_diario: 350,
          },
        },
      });
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
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: postMock,
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

function panelDeAlta(): HTMLElement {
  const boton = screen.getByRole('button', { name: /Guardar empleado/i });
  const panel = boton.closest('[class*="slide-in-from-right"]');
  if (!panel) throw new Error('No se encontró el panel de alta de empleado');
  return panel as HTMLElement;
}

function inputByLabel(text: RegExp): HTMLInputElement {
  const label = within(panelDeAlta()).getByText(text);
  const input = label.closest('div')?.querySelector('input');
  if (!input) throw new Error(`No se encontró el input para la etiqueta ${text}`);
  return input as HTMLInputElement;
}

async function llenarFormularioYGuardar() {
  render(<PersonalView activeSubView="empleados" />);

  fireEvent.click(await screen.findByRole('button', { name: /Nuevo Empleado/i }));

  fireEvent.change(inputByLabel(/^Nombre$/i), { target: { value: 'Juan' } });
  fireEvent.change(inputByLabel(/Apellido paterno/i), { target: { value: 'Pérez' } });
  fireEvent.change(inputByLabel(/^RFC$/i), { target: { value: 'PEPJ800101ABC' } });
  fireEvent.change(inputByLabel(/^Puesto$/i), { target: { value: 'Fierrero' } });
  fireEvent.change(inputByLabel(/Salario diario/i), { target: { value: '350' } });

  fireEvent.click(screen.getByRole('button', { name: /Guardar empleado/i }));
}

describe('PersonalView — confirmación de proyecto activo al crear Empleado', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('el panel de alta muestra el proyecto activo en su subtítulo', async () => {
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /Nuevo Empleado/i }));

    expect(await screen.findByText(/Proyecto: Torre Corporativa Norte/)).toBeInTheDocument();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await llenarFormularioYGuardar();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/personal/empleados', expect.anything()));
  });

  it('cancelar el diálogo no crea el empleado', async () => {
    await llenarFormularioYGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('un clic fuera del diálogo (overlay) no lo cierra ni crea el empleado', async () => {
    await llenarFormularioYGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    const overlay = document.querySelector('.absolute.inset-0.bg-black\\/50');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });

  it('la tecla Escape no cierra el diálogo ni crea el empleado', async () => {
    await llenarFormularioYGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});
