import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/descarga-qr-empleados-filtrada.
 * Filtros previos a la selección de empleados para imprimir credenciales o
 * descargar QR: por categoría, cuadrilla, frente de trabajo, residente
 * vigente y texto libre (nombre/número).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['personal_rh'] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,fake')) },
}));

vi.mock('../lib/credencialesPrint', () => ({
  construirHojaCredenciales: vi.fn(() => '<html></html>'),
  construirHojaSoloQR: vi.fn(() => '<html></html>'),
}));

const empleadoObreroFrenteA = {
  id_empleado: 'emp-1', numero_empleado: 'EMP-001', nombre: 'Juan', apellido_paterno: 'Pérez',
  puesto: 'Fierrero', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 350,
  cuadrilla: { nombre: 'Cuadrilla Alfa', codigo: 'CUA-01' },
  asignaciones: [{ frente_trabajo: 'Frente 1 — Cimentación' }],
  asignacionesResidente: [{ residente_id: 'res-1' }],
};
const empleadoTecnicoFrenteB = {
  id_empleado: 'emp-2', numero_empleado: 'EMP-002', nombre: 'Pedro', apellido_paterno: 'González',
  puesto: 'Técnico Instrumentista', categoria: 'TECNICO', estado: 'ACTIVO', salario_diario: 500,
  cuadrilla: null,
  asignaciones: [{ frente_trabajo: 'Frente 2 — Estructura' }],
  asignacionesResidente: [{ residente_id: 'res-2' }],
};

const residentesDisponiblesMock = [
  { id: 'res-1', nombre: 'Ing. Ana López', email: 'ana@bocam.com.mx' },
  { id: 'res-2', nombre: 'Ing. Luis Ruiz', email: 'luis@bocam.com.mx' },
];

const dashboardMock = {
  resumen: { total_empleados: 2, empleados_activos: 2, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [empleadoObreroFrenteA, empleadoTecnicoFrenteB] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      if (url === '/api/v1/personal/residentes-disponibles') return Promise.resolve({ data: { data: residentesDisponiblesMock } });
      if (url === '/api/v1/personal/cuadrillas') return Promise.resolve({ data: { data: [{ id_cuadrilla: 'cua-1', nombre: 'Cuadrilla Alfa', codigo: 'CUA-01', especialidad: 'Cimentación', estado: 'ACTIVA' }] } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function renderYEsperarCarga() {
  render(<PersonalView activeSubView="empleados" />);
  await screen.findByText('EMP-001');
  await screen.findByText('EMP-002');
}

describe('PersonalView — filtros sobre el listado de selección de credenciales', () => {
  it('filtra por categoría', async () => {
    await renderYEsperarCarga();

    fireEvent.change(screen.getByLabelText(/filtrar por categoría/i), { target: { value: 'TECNICO' } });

    await waitFor(() => expect(screen.queryByText('EMP-001')).not.toBeInTheDocument());
    expect(screen.getByText('EMP-002')).toBeInTheDocument();
  });

  it('filtra por cuadrilla', async () => {
    await renderYEsperarCarga();

    fireEvent.change(screen.getByLabelText(/filtrar por cuadrilla/i), { target: { value: 'CUA-01' } });

    await waitFor(() => expect(screen.queryByText('EMP-002')).not.toBeInTheDocument());
    expect(screen.getByText('EMP-001')).toBeInTheDocument();
  });

  it('filtra por frente de trabajo', async () => {
    await renderYEsperarCarga();

    fireEvent.change(screen.getByLabelText(/filtrar por frente/i), { target: { value: 'Frente 2 — Estructura' } });

    await waitFor(() => expect(screen.queryByText('EMP-001')).not.toBeInTheDocument());
    expect(screen.getByText('EMP-002')).toBeInTheDocument();
  });

  it('filtra por residente vigente', async () => {
    await renderYEsperarCarga();

    fireEvent.change(screen.getByLabelText(/filtrar por residente/i), { target: { value: 'res-1' } });

    await waitFor(() => expect(screen.queryByText('EMP-002')).not.toBeInTheDocument());
    expect(screen.getByText('EMP-001')).toBeInTheDocument();
  });

  it('filtra por texto libre de nombre o número de empleado', async () => {
    await renderYEsperarCarga();

    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre o número/i), { target: { value: 'EMP-002' } });

    await waitFor(() => expect(screen.queryByText('EMP-001')).not.toBeInTheDocument());
    expect(screen.getByText('EMP-002')).toBeInTheDocument();
  });

  it('combina varios filtros a la vez (AND)', async () => {
    await renderYEsperarCarga();

    fireEvent.change(screen.getByLabelText(/filtrar por categoría/i), { target: { value: 'OBRERO' } });
    fireEvent.change(screen.getByLabelText(/filtrar por residente/i), { target: { value: 'res-1' } });

    await waitFor(() => expect(screen.queryByText('EMP-002')).not.toBeInTheDocument());
    expect(screen.getByText('EMP-001')).toBeInTheDocument();

    // Un filtro que no matchea ninguno de los dos, junto con uno que sí, no debe mostrar nada.
    fireEvent.change(screen.getByLabelText(/filtrar por residente/i), { target: { value: 'res-2' } });
    await waitFor(() => expect(screen.queryByText('EMP-001')).not.toBeInTheDocument());
    expect(screen.queryByText('EMP-002')).not.toBeInTheDocument();
  });

  it('"seleccionar todos" solo marca los empleados visibles tras filtrar', async () => {
    await renderYEsperarCarga();

    fireEvent.change(screen.getByLabelText(/filtrar por categoría/i), { target: { value: 'TECNICO' } });
    await waitFor(() => expect(screen.queryByText('EMP-001')).not.toBeInTheDocument());

    const checkboxSeleccionarTodos = screen.getByTitle(/seleccionar todos/i);
    fireEvent.click(checkboxSeleccionarTodos);

    expect(await screen.findByRole('button', { name: /imprimir credenciales \(1\)/i })).toBeInTheDocument();
  });
});
