import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/editar-datos-empleado.
 * Antes de este change no existía forma de corregir los datos generales
 * (nombre, RFC, CURP, NSS, puesto, salario, etc.) de un empleado ya creado.
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

const empleadoMock = {
  id_empleado: 'emp-existente-1',
  numero_empleado: 'EMP-010',
  nombre: 'Ana',
  apellido_paterno: 'García',
  apellido_materno: 'López',
  rfc: 'GALA800101AB1',
  curp: 'GALA800101MDFRPN01',
  nss: '12345678901',
  puesto: 'Albañil',
  categoria: 'OBRERO',
  estado: 'ACTIVO',
  salario_diario: 320,
  telefono: '5511112222',
  email: 'ana@example.com',
  contacto_emergencia_nombre: 'Juan García',
  contacto_emergencia_telefono: '5533334444',
  contacto_emergencia_parentesco: 'Esposo',
};

const dashboardMock = {
  resumen: { total_empleados: 1, empleados_activos: 1, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

let patchEmpleadoResult: 'ok' | 'error' | 'rfc_duplicado' = 'ok';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [empleadoMock] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn((url: string, body: any) => {
      if (url === `/api/v1/personal/empleados/${empleadoMock.id_empleado}`) {
        if (patchEmpleadoResult === 'error') {
          return Promise.reject({ response: { data: { error: { message: 'nombre, apellido_paterno, rfc, puesto y salario_diario son obligatorios.' } } } });
        }
        if (patchEmpleadoResult === 'rfc_duplicado') {
          return Promise.reject({ response: { data: { error: { message: 'Ya existe un empleado con ese RFC en este tenant.' } } } });
        }
        return Promise.resolve({ data: { data: { ...empleadoMock, ...body } } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
  },
}));

// Mismo patrón que PersonalView.nuevo-empleado.test.tsx: FormField (ui-core)
// no asocia <label> con el input vía htmlFor/id, así que se ubica el input
// dentro del contenedor del panel de edición (no de `screen` completo) para
// no colisionar con la columna "Puesto" de la tabla detrás.
function panelDeEdicion(): HTMLElement {
  const boton = screen.getByRole('button', { name: /Guardar cambios/i });
  const panel = boton.closest('[class*="slide-in-from-right"]');
  if (!panel) throw new Error('No se encontró el panel de edición de empleado');
  return panel as HTMLElement;
}

function inputByLabel(text: RegExp): HTMLInputElement {
  const label = within(panelDeEdicion()).getByText(text);
  const input = label.closest('div')?.querySelector('input');
  if (!input) throw new Error(`No se encontró el input para la etiqueta ${text}`);
  return input as HTMLInputElement;
}

describe('PersonalView — botón "Editar" empleado', () => {
  it('abre el panel de edición precargado con los datos actuales del empleado', async () => {
    render(<PersonalView activeSubView="empleados" />);

    const boton = await screen.findByRole('button', { name: /^Editar$/i });
    fireEvent.click(boton);

    expect(await screen.findByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
    expect(inputByLabel(/^Nombre$/i).value).toBe('Ana');
    expect(inputByLabel(/^RFC$/i).value).toBe('GALA800101AB1');
    expect(inputByLabel(/^Puesto$/i).value).toBe('Albañil');
    expect(inputByLabel(/Contacto de emergencia \(nombre\)/i).value).toBe('Juan García');
    expect(inputByLabel(/Contacto de emergencia \(teléfono\)/i).value).toBe('5533334444');
    expect(inputByLabel(/Contacto de emergencia \(parentesco\)/i).value).toBe('Esposo');
  });

  it('valida los campos obligatorios antes de llamar al backend', async () => {
    const api = (await import('../lib/api')).default;
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /^Editar$/i }));
    fireEvent.change(inputByLabel(/^RFC$/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(await screen.findByText(/obligatorios/i)).toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('edición exitosa llama al PATCH, cierra el panel y refresca la fila', async () => {
    patchEmpleadoResult = 'ok';
    notify.mockClear();
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /^Editar$/i }));
    fireEvent.change(inputByLabel(/^Puesto$/i), { target: { value: 'Capataz' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' })));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Guardar cambios/i })).not.toBeInTheDocument());
    expect(await screen.findByText('Capataz')).toBeInTheDocument();
  });

  it('edita solo el teléfono del contacto de emergencia y lo envía en el PATCH', async () => {
    patchEmpleadoResult = 'ok';
    const api = (await import('../lib/api')).default;
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /^Editar$/i }));
    fireEvent.change(inputByLabel(/Contacto de emergencia \(teléfono\)/i), { target: { value: '5590001111' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(
      `/api/v1/personal/empleados/${empleadoMock.id_empleado}`,
      expect.objectContaining({ contacto_emergencia_telefono: '5590001111' }),
    ));
  });

  it('si el backend rechaza por RFC duplicado, mantiene el panel abierto con el error', async () => {
    patchEmpleadoResult = 'rfc_duplicado';
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: /^Editar$/i }));
    fireEvent.change(inputByLabel(/^RFC$/i), { target: { value: 'OTRO800101XYZ' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(await screen.findByText(/Ya existe un empleado con ese RFC/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
  });
});
