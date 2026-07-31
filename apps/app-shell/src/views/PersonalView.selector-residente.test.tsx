import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalView } from './PersonalView';
import api from '../lib/api';

/**
 * Ver openspec/changes/mejoras-ux-personal-rh, grupo 4.
 * Antes, "Residente(s) asignado(s)" usaba un campo de texto libre para
 * capturar un UUID a mano, sin ninguna nota de que asignar un residente no
 * hace elegible al empleado para asistencia/nómina de un proyecto.
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

let residentesAsignadosResult: { asignaciones: unknown[]; parcial: boolean } = { asignaciones: [], parcial: false };
let residentesDisponiblesFalla = false;
const residentesDisponibles = [
  { id: 'res-1', nombre: 'Residente Uno', email: 'res1@bocam.local' },
  { id: 'res-2', nombre: 'Residente Dos', email: 'res2@bocam.local' },
];

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [empleado1] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      if (url === '/api/v1/personal/empleados/emp-1/config-deducciones') return Promise.resolve({ data: { data: {} } });
      if (url === '/api/v1/personal/empleados/emp-1/residentes') return Promise.resolve({ data: { data: residentesAsignadosResult } });
      if (url === '/api/v1/personal/empleados/emp-1/documentos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/personal/empleados/emp-1/credencial') return Promise.resolve({ data: { data: null } });
      if (url === '/api/v1/personal/residentes-disponibles') {
        return residentesDisponiblesFalla
          ? Promise.reject(new Error('directorio no disponible'))
          : Promise.resolve({ data: { data: residentesDisponibles } });
      }
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados/emp-1/residentes') {
        return Promise.resolve({ data: { data: { id_asignacion: 'asig-1', residente_id: 'res-1', fecha_inicio: new Date().toISOString(), fecha_fin: null } } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

const postMock = vi.mocked(api.post);

async function abrirPanelDeducciones() {
  render(<PersonalView activeSubView="empleados" />);
  await screen.findByText('EMP-001');
  fireEvent.click(screen.getByText('Deducciones'));
  await screen.findByText('Residente(s) asignado(s)');
}

describe('PersonalView — selector de residente + aviso de elegibilidad', () => {
  it('4.1 la nota aclaratoria es visible con y sin residentes asignados', async () => {
    residentesAsignadosResult = { asignaciones: [], parcial: false };
    residentesDisponiblesFalla = false;
    await abrirPanelDeducciones();

    expect(await screen.findByText(/no hace elegible al empleado/i)).toBeInTheDocument();
  });

  it('4.2 el campo de texto libre se reemplaza por un <select> poblado con el directorio', async () => {
    residentesAsignadosResult = { asignaciones: [], parcial: false };
    residentesDisponiblesFalla = false;
    await abrirPanelDeducciones();

    expect(screen.queryByPlaceholderText(/ID del usuario Residente/i)).not.toBeInTheDocument();
    const select = await screen.findByLabelText(/residente a asignar/i);
    expect(select.tagName).toBe('SELECT');
    expect(await screen.findByRole('option', { name: 'Residente Uno' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Residente Dos' })).toBeInTheDocument();
  });

  it('4.3 si el directorio falla, el selector se deshabilita con mensaje y el resto del panel sigue operando', async () => {
    residentesAsignadosResult = { asignaciones: [], parcial: false };
    residentesDisponiblesFalla = true;
    await abrirPanelDeducciones();

    const select = await screen.findByLabelText(/residente a asignar/i);
    expect(select).toBeDisabled();
    expect(await screen.findByText(/directorio de residentes no disponible/i)).toBeInTheDocument();

    // el resto del panel (ej. toggle de IMSS) sigue operando
    expect(screen.getByText(/IMSS/i)).toBeInTheDocument();
  });

  it('4.4 asignar el residente elegido en el selector llama POST con el id correcto', async () => {
    residentesAsignadosResult = { asignaciones: [], parcial: false };
    residentesDisponiblesFalla = false;
    postMock.mockClear();
    await abrirPanelDeducciones();

    const select = await screen.findByLabelText(/residente a asignar/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'res-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/personal/empleados/emp-1/residentes',
      expect.objectContaining({ residente_id: 'res-2' }),
    ));
  });
});
