import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalView } from './PersonalView';
import api from '../lib/api';

/**
 * Ver openspec/changes/mejoras-ux-personal-rh, grupo 5.
 * Antes no existía ninguna UI para crear una AsignacionFrente — el paso
 * que realmente hace elegible a un empleado para asistencia/nómina de un
 * proyecto. Se agrega la sección junto a "Residente(s) asignado(s)".
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

const empleado1 = {
  id_empleado: 'emp-1', numero_empleado: 'EMP-001', nombre: 'Juan', apellido_paterno: 'Pérez',
  puesto: 'Fierrero', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 350, cuadrilla: null,
};

const dashboardMock = {
  resumen: { total_empleados: 1, empleados_activos: 1, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

let asignacionesResult: unknown[] = [];
let postAsignacionResultado: 'ok' | 'error' = 'ok';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [empleado1] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      if (url === '/api/v1/personal/empleados/emp-1/config-deducciones') return Promise.resolve({ data: { data: {} } });
      if (url === '/api/v1/personal/empleados/emp-1/residentes') return Promise.resolve({ data: { data: { asignaciones: [], parcial: false } } });
      if (url === '/api/v1/personal/empleados/emp-1/documentos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/personal/empleados/emp-1/credencial') return Promise.resolve({ data: { data: null } });
      if (url === '/api/v1/personal/residentes-disponibles') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/personal/asignaciones') return Promise.resolve({ data: { data: asignacionesResult } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/personal/asignaciones') {
        if (postAsignacionResultado === 'error') {
          return Promise.reject({ response: { data: { error: { message: 'frente_trabajo ya tiene el máximo de personal' } } } });
        }
        return Promise.resolve({ data: { data: { id_asignacion: 'asig-nueva', empleado_id: 'emp-1', frente_trabajo: 'Frente 2 — Acabados', turno: 'DIURNO', fecha_inicio: '2026-08-01', fecha_fin: null, estado: 'ACTIVA' } } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

const postMock = vi.mocked(api.post);
const getMock = vi.mocked(api.get);

async function abrirPanelDeducciones() {
  render(<PersonalView activeSubView="empleados" />);
  await screen.findByText('EMP-001');
  fireEvent.click(screen.getByText('Deducciones'));
  await screen.findByText('Asignación a Frente de Trabajo');
}

describe('PersonalView — sección Asignación a Frente de Trabajo', () => {
  it('5.1 lista las AsignacionFrente ACTIVA del empleado, filtradas client-side por empleado_id', async () => {
    asignacionesResult = [
      { id_asignacion: 'asig-1', empleado_id: 'emp-1', frente_trabajo: 'Frente 1 — Cimentación', turno: 'DIURNO', fecha_inicio: '2026-01-01', fecha_fin: null, estado: 'ACTIVA' },
      { id_asignacion: 'asig-2', empleado_id: 'emp-otro', frente_trabajo: 'Frente 3 — Otro Empleado', turno: 'DIURNO', fecha_inicio: '2026-01-01', fecha_fin: null, estado: 'ACTIVA' },
      { id_asignacion: 'asig-3', empleado_id: 'emp-1', frente_trabajo: 'Frente Viejo Completado', turno: 'DIURNO', fecha_inicio: '2025-01-01', fecha_fin: '2025-06-01', estado: 'COMPLETADA' },
    ];
    await abrirPanelDeducciones();

    expect(await screen.findByText('Frente 1 — Cimentación')).toBeInTheDocument();
    expect(screen.queryByText('Frente 3 — Otro Empleado')).not.toBeInTheDocument();
    expect(screen.queryByText('Frente Viejo Completado')).not.toBeInTheDocument();
  });

  it('5.2 muestra un estado vacío cuando el empleado no tiene asignaciones', async () => {
    asignacionesResult = [];
    await abrirPanelDeducciones();

    expect(await screen.findByText(/no tiene asignaci[oó]n a ning[uú]n frente de trabajo/i)).toBeInTheDocument();
  });

  it('5.3 exige frente_trabajo; sin él no envía la petición', async () => {
    asignacionesResult = [];
    postMock.mockClear();
    await abrirPanelDeducciones();

    fireEvent.click(screen.getByRole('button', { name: /Crear asignaci[oó]n/i }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' }),
    ));
    expect(postMock).not.toHaveBeenCalledWith('/api/v1/personal/asignaciones', expect.anything());
  });

  it('5.4 alta exitosa refresca la lista de asignaciones', async () => {
    asignacionesResult = [];
    postAsignacionResultado = 'ok';
    getMock.mockClear();
    await abrirPanelDeducciones();

    fireEvent.change(screen.getByLabelText(/frente de trabajo/i), { target: { value: 'Frente 2 — Acabados' } });

    asignacionesResult = [{ id_asignacion: 'asig-nueva', empleado_id: 'emp-1', frente_trabajo: 'Frente 2 — Acabados', turno: 'DIURNO', fecha_inicio: '2026-08-01', fecha_fin: null, estado: 'ACTIVA' }];
    fireEvent.click(screen.getByRole('button', { name: /Crear asignaci[oó]n/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/personal/asignaciones',
      expect.objectContaining({ empleado_id: 'emp-1', frente_trabajo: 'Frente 2 — Acabados' }),
    ));
    expect(await screen.findByText('Frente 2 — Acabados')).toBeInTheDocument();
  });

  it('5.5 error del backend se muestra sin limpiar el formulario ni la lista', async () => {
    asignacionesResult = [];
    postAsignacionResultado = 'error';
    await abrirPanelDeducciones();

    const inputFrente = screen.getByLabelText(/frente de trabajo/i) as HTMLInputElement;
    fireEvent.change(inputFrente, { target: { value: 'Frente 5 — Rechazado' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear asignaci[oó]n/i }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', title: expect.stringMatching(/máximo de personal/i) }),
    ));
    expect(inputFrente.value).toBe('Frente 5 — Rechazado');
    expect(screen.getByText(/no tiene asignaci[oó]n a ning[uú]n frente de trabajo/i)).toBeInTheDocument();
  });
});
