import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PersonalView } from './PersonalView';
import api from '../lib/api';

/**
 * Ver openspec/changes/mejoras-ux-personal-rh, grupo 6.
 * Antes el botón "Nueva Cuadrilla" (en la pestaña Cuadrillas) no tenía
 * ningún efecto — el backend ya soportaba la operación pero nadie la
 * conectó. Se agrega el panel real + el CTA del estado vacío.
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

const dashboardMock = {
  resumen: { total_empleados: 0, empleados_activos: 0, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

let cuadrillasResult: unknown[] = [];
let postCuadrillaResultado: 'ok' | 'error' = 'ok';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/personal/cuadrillas') return Promise.resolve({ data: { data: cuadrillasResult } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/personal/cuadrillas') {
        if (postCuadrillaResultado === 'error') {
          return Promise.reject({ response: { data: { error: { message: 'Ya existe una cuadrilla con ese nombre' } } } });
        }
        return Promise.resolve({ data: { data: { id_cuadrilla: 'cua-nueva', nombre: 'Cuadrilla Norte', codigo: 'CUA-01', especialidad: 'Albañilería', estado: 'ACTIVA', _count: { miembros: 0 } } } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

const postMock = vi.mocked(api.post);

async function irATabCuadrillas() {
  render(<PersonalView activeSubView="cuadrillas" />);
  await waitFor(() => expect(screen.getAllByRole('button', { name: /Nueva Cuadrilla/i }).length).toBeGreaterThan(0));
}

// Con la lista vacía hay dos botones "Nueva Cuadrilla" (header + CTA del
// estado vacío) — el del header es siempre el primero en el DOM.
function botonHeaderNuevaCuadrilla(): HTMLElement {
  return screen.getAllByRole('button', { name: /Nueva Cuadrilla/i })[0];
}

// FormField (ui-core) no asocia <label> con el input vía htmlFor/id (mismo
// gotcha documentado en PersonalView.nuevo-empleado.test.tsx) — se ubica el
// input dentro del panel por su etiqueta en vez de getByLabelText.
function panelDeAlta(): HTMLElement {
  const boton = screen.getByRole('button', { name: /Guardar Cuadrilla/i });
  const panel = boton.closest('[class*="slide-in-from-right"]');
  if (!panel) throw new Error('No se encontró el panel de alta de cuadrilla');
  return panel as HTMLElement;
}

function inputByLabel(text: RegExp): HTMLInputElement {
  const label = within(panelDeAlta()).getByText(text);
  const input = label.closest('div')?.querySelector('input');
  if (!input) throw new Error(`No se encontró el input para la etiqueta ${text}`);
  return input as HTMLInputElement;
}

describe('PersonalView — panel Nueva Cuadrilla', () => {
  it('6.1 clic en el botón del header (pestaña Cuadrillas) abre el panel', async () => {
    cuadrillasResult = [{ id_cuadrilla: 'cua-1', nombre: 'Existente', codigo: 'CUA-01', especialidad: 'Plomería', estado: 'ACTIVA', _count: { miembros: 2 } }];
    await irATabCuadrillas();

    fireEvent.click(botonHeaderNuevaCuadrilla());

    await screen.findByRole('button', { name: /Guardar Cuadrilla/i });
    expect(inputByLabel(/^Nombre$/i)).toBeInTheDocument();
    expect(inputByLabel(/Especialidad/i)).toBeInTheDocument();
  });

  it('6.2 valida nombre y especialidad obligatorios sin enviar la petición', async () => {
    cuadrillasResult = [];
    postMock.mockClear();
    await irATabCuadrillas();
    fireEvent.click(botonHeaderNuevaCuadrilla());
    await screen.findByRole('button', { name: /Guardar Cuadrilla/i });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cuadrilla/i }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })));
    expect(postMock).not.toHaveBeenCalledWith('/api/v1/personal/cuadrillas', expect.anything());
  });

  it('6.3 alta exitosa cierra el panel y refresca la lista', async () => {
    cuadrillasResult = [];
    postCuadrillaResultado = 'ok';
    await irATabCuadrillas();
    fireEvent.click(botonHeaderNuevaCuadrilla());
    await screen.findByRole('button', { name: /Guardar Cuadrilla/i });

    fireEvent.change(inputByLabel(/^Nombre$/i), { target: { value: 'Cuadrilla Norte' } });
    fireEvent.change(inputByLabel(/Especialidad/i), { target: { value: 'Albañilería' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cuadrilla/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/personal/cuadrillas',
      expect.objectContaining({ nombre: 'Cuadrilla Norte', especialidad: 'Albañilería' }),
    ));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Guardar Cuadrilla/i })).not.toBeInTheDocument());
    expect(await screen.findByText('Cuadrilla Norte')).toBeInTheDocument();
  });

  it('6.4 error del backend mantiene el panel abierto con el mensaje', async () => {
    cuadrillasResult = [];
    postCuadrillaResultado = 'error';
    await irATabCuadrillas();
    fireEvent.click(botonHeaderNuevaCuadrilla());
    await screen.findByRole('button', { name: /Guardar Cuadrilla/i });

    fireEvent.change(inputByLabel(/^Nombre$/i), { target: { value: 'Cuadrilla Sur' } });
    fireEvent.change(inputByLabel(/Especialidad/i), { target: { value: 'Herrería' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cuadrilla/i }));

    expect(await screen.findByText(/Ya existe una cuadrilla con ese nombre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Cuadrilla/i })).toBeInTheDocument();
    expect(inputByLabel(/^Nombre$/i).value).toBe('Cuadrilla Sur');
  });

  it('6.5 el estado vacío de Cuadrillas ofrece un CTA que abre el mismo panel', async () => {
    cuadrillasResult = [];
    await irATabCuadrillas();

    expect(await screen.findByText(/Sin cuadrillas registradas/i)).toBeInTheDocument();
    const ctas = screen.getAllByRole('button', { name: /Nueva Cuadrilla/i });
    expect(ctas.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(ctas[ctas.length - 1]);
    await screen.findByRole('button', { name: /Guardar Cuadrilla/i });
    expect(inputByLabel(/^Nombre$/i)).toBeInTheDocument();
  });
});
