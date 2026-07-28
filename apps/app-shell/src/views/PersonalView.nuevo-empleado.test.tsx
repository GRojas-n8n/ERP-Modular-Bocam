import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/fix-boton-nuevo-empleado-personal.
 * El botón "+ Nuevo Empleado" no tenía onClick y no existía ningún panel
 * de alta individual — el usuario hacía clic y no pasaba nada.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['personal_rh'] },
  }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

let postEmpleadoResult: 'ok' | 'error' = 'ok';

const empleadoCreadoMock = {
  id_empleado: 'emp-nuevo-1',
  numero_empleado: 'EMP-042',
  nombre: 'Juan',
  apellido_paterno: 'Pérez',
  puesto: 'Fierrero',
  categoria: 'OBRERO',
  estado: 'ACTIVO',
  salario_diario: 350,
};

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
    post: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') {
        if (postEmpleadoResult === 'error') {
          return Promise.reject({ response: { data: { error: { message: 'nombre, apellido_paterno, rfc, puesto y salario_diario son obligatorios.' } } } });
        }
        return Promise.resolve({ data: { data: empleadoCreadoMock } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

// FormField (ui-core) no asocia <label> con el input vía htmlFor/id, así
// que getByLabelText no funciona aquí — se ubica el input dentro del mismo
// contenedor que su etiqueta. Se busca dentro del panel (no de `screen`
// completo) porque la tabla de Empleados detrás también tiene una columna
// "Puesto" que colisiona con la etiqueta del formulario.
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

describe('PersonalView — botón "+ Nuevo Empleado"', () => {
  it('abre el panel de alta individual al hacer clic', async () => {
    render(<PersonalView activeSubView="empleados" />);

    const boton = await screen.findByRole('button', { name: /Nuevo Empleado/i });
    fireEvent.click(boton);

    expect(await screen.findByRole('button', { name: /Guardar empleado/i })).toBeInTheDocument();
  });

  it('valida los campos obligatorios antes de llamar al backend', async () => {
    const api = (await import('../lib/api')).default;
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /Nuevo Empleado/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Guardar empleado/i }));

    expect(await screen.findByText(/obligatorios/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalledWith('/api/v1/personal/empleados', expect.anything());
  });

  it('da de alta un empleado con los campos obligatorios y refresca la lista', async () => {
    postEmpleadoResult = 'ok';
    notify.mockClear();
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /Nuevo Empleado/i }));

    fireEvent.change(inputByLabel(/^Nombre$/i), { target: { value: 'Juan' } });
    fireEvent.change(inputByLabel(/Apellido paterno/i), { target: { value: 'Pérez' } });
    fireEvent.change(inputByLabel(/^RFC$/i), { target: { value: 'PEPJ800101ABC' } });
    fireEvent.change(inputByLabel(/^Puesto$/i), { target: { value: 'Fierrero' } });
    fireEvent.change(inputByLabel(/Salario diario/i), { target: { value: '350' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar empleado/i }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' })));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Guardar empleado/i })).not.toBeInTheDocument());
    expect(await screen.findByText('EMP-042')).toBeInTheDocument();
  });

  it('si el backend rechaza el alta, mantiene el panel abierto con el error', async () => {
    postEmpleadoResult = 'error';
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /Nuevo Empleado/i }));

    fireEvent.change(inputByLabel(/^Nombre$/i), { target: { value: 'Juan' } });
    fireEvent.change(inputByLabel(/Apellido paterno/i), { target: { value: 'Pérez' } });
    fireEvent.change(inputByLabel(/^RFC$/i), { target: { value: 'PEPJ800101ABC' } });
    fireEvent.change(inputByLabel(/^Puesto$/i), { target: { value: 'Fierrero' } });
    fireEvent.change(inputByLabel(/Salario diario/i), { target: { value: '350' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar empleado/i }));

    expect(await screen.findByText(/obligatorios/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar empleado/i })).toBeInTheDocument();
  });
});
