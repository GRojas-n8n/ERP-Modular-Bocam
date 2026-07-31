import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PersonalView } from './PersonalView';
import api from '../lib/api';

/**
 * Ver openspec/changes/mejoras-ux-personal-rh, grupo 7.
 * Antes el botón "Calcular Nomina" (en la pestaña Pre-Nómina) no tenía
 * ningún efecto — el backend ya soportaba el cálculo pero nadie lo
 * conectó. El formulario NO pide periodo_tipo: se toma de
 * ConfigNominaProyecto en el backend.
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

let prenominasResult: unknown[] = [];
let postCalcularResultado: 'ok' | 'error' = 'ok';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/personal/prenominas') return Promise.resolve({ data: { data: prenominasResult } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/personal/prenominas/calcular') {
        if (postCalcularResultado === 'error') {
          return Promise.reject({ response: { data: { error: { message: 'No hay empleados activos en este proyecto.' } } } });
        }
        return Promise.resolve({ data: { data: { id_prenomina: 'pn-nueva', codigo: 'NOM-2026-S01', periodo_tipo: 'SEMANAL', periodo_inicio: '2026-08-01', periodo_fin: '2026-08-07', total_neto: 15000, total_empleados: 3, estado: 'CALCULADA' } } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

const postMock = vi.mocked(api.post);

async function irATabPrenomina() {
  render(<PersonalView activeSubView="prenomina" />);
  await waitFor(() => expect(screen.getAllByRole('button', { name: /Calcular Nomina/i }).length).toBeGreaterThan(0));
}

// FormField (ui-core) no asocia <label> con el input vía htmlFor/id (mismo
// gotcha documentado en PersonalView.nuevo-empleado.test.tsx).
function panelDeCalculo(): HTMLElement {
  const boton = screen.getByRole('button', { name: /Calcular$/i });
  const panel = boton.closest('[class*="slide-in-from-right"]');
  if (!panel) throw new Error('No se encontró el panel de calcular nómina');
  return panel as HTMLElement;
}

function inputByLabel(text: RegExp): HTMLInputElement {
  const label = within(panelDeCalculo()).getByText(text);
  const input = label.closest('div')?.querySelector('input');
  if (!input) throw new Error(`No se encontró el input para la etiqueta ${text}`);
  return input as HTMLInputElement;
}

function botonHeaderCalcularNomina(): HTMLElement {
  return screen.getAllByRole('button', { name: /Calcular Nomina/i })[0];
}

describe('PersonalView — panel Calcular Nómina', () => {
  it('7.1 clic en el botón del header (pestaña Pre-Nómina) abre el panel', async () => {
    prenominasResult = [{ id_prenomina: 'pn-1', codigo: 'NOM-2026-S00', periodo_tipo: 'SEMANAL', periodo_inicio: '2026-07-01', periodo_fin: '2026-07-07', total_neto: 10000, total_empleados: 2, estado: 'CALCULADA' }];
    await irATabPrenomina();

    fireEvent.click(botonHeaderCalcularNomina());

    expect(inputByLabel(/periodo.*inicio/i)).toBeInTheDocument();
    expect(inputByLabel(/periodo.*fin/i)).toBeInTheDocument();
    expect(screen.queryByText(/periodo.*tipo/i)).not.toBeInTheDocument();
  });

  it('7.2 exige periodo_inicio y periodo_fin, y NO envía periodo_tipo', async () => {
    prenominasResult = [];
    postMock.mockClear();
    await irATabPrenomina();
    fireEvent.click(botonHeaderCalcularNomina());
    await screen.findByRole('button', { name: /Calcular$/i });

    fireEvent.click(screen.getByRole('button', { name: /Calcular$/i }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })));
    expect(postMock).not.toHaveBeenCalledWith('/api/v1/personal/prenominas/calcular', expect.anything());

    fireEvent.change(inputByLabel(/periodo.*inicio/i), { target: { value: '2026-08-01' } });
    fireEvent.change(inputByLabel(/periodo.*fin/i), { target: { value: '2026-08-07' } });
    fireEvent.click(screen.getByRole('button', { name: /Calcular$/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalled());
    const body = postMock.mock.calls.find(c => c[0] === '/api/v1/personal/prenominas/calcular')?.[1] as Record<string, unknown>;
    expect(body).toEqual({ periodo_inicio: '2026-08-01', periodo_fin: '2026-08-07' });
  });

  it('7.3 cálculo exitoso cierra el panel y refresca la lista de pre-nóminas', async () => {
    prenominasResult = [];
    postCalcularResultado = 'ok';
    await irATabPrenomina();
    fireEvent.click(botonHeaderCalcularNomina());
    await screen.findByRole('button', { name: /Calcular$/i });

    fireEvent.change(inputByLabel(/periodo.*inicio/i), { target: { value: '2026-08-01' } });
    fireEvent.change(inputByLabel(/periodo.*fin/i), { target: { value: '2026-08-07' } });
    fireEvent.click(screen.getByRole('button', { name: /Calcular$/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/personal/prenominas/calcular',
      { periodo_inicio: '2026-08-01', periodo_fin: '2026-08-07' },
    ));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Calcular$/i })).not.toBeInTheDocument());
    expect(await screen.findByText('NOM-2026-S01')).toBeInTheDocument();
  });

  it('7.4 error del backend mantiene el panel abierto con el mensaje', async () => {
    prenominasResult = [];
    postCalcularResultado = 'error';
    await irATabPrenomina();
    fireEvent.click(botonHeaderCalcularNomina());
    await screen.findByRole('button', { name: /Calcular$/i });

    fireEvent.change(inputByLabel(/periodo.*inicio/i), { target: { value: '2026-08-01' } });
    fireEvent.change(inputByLabel(/periodo.*fin/i), { target: { value: '2026-08-07' } });
    fireEvent.click(screen.getByRole('button', { name: /Calcular$/i }));

    expect(await screen.findByText(/No hay empleados activos en este proyecto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calcular$/i })).toBeInTheDocument();
  });

  it('7.5 el estado vacío de Pre-Nómina ofrece un CTA que abre el mismo panel', async () => {
    prenominasResult = [];
    await irATabPrenomina();

    expect(await screen.findByText(/Sin pre-nominas/i)).toBeInTheDocument();
    const ctas = screen.getAllByRole('button', { name: /Calcular Nomina/i });
    expect(ctas.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(ctas[ctas.length - 1]);
    await screen.findByRole('button', { name: /Calcular$/i });
    expect(inputByLabel(/periodo.*inicio/i)).toBeInTheDocument();
  });
});
