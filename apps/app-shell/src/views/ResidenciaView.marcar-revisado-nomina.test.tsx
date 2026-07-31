import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver specs/features/01-revision-nomina-residencia.md (2.1, 2.2).
 *
 * Cubre, con datos en la forma real del backend (no la forma vieja de
 * demoData que tenía cuadrillas/total_bruto/id):
 *  - el modal de detalle renderiza `detalles` por empleado sin crashear.
 *  - "Marcar revisado" llama PATCH .../marcar-revisado (nunca /autorizar) y
 *    refleja el estado que devuelve el backend, no un valor inventado.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: {
      id: 'user-1',
      name: 'Residente de Prueba',
      role: ['residencia'],
      projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PRENOMINA_ID = 'pn-real-001';

const { getMock, patchMock } = vi.hoisted(() => {
  const prenominaCalculada = {
    id_prenomina: 'pn-real-001',
    codigo: 'NOM-2026-S30',
    periodo_tipo: 'SEMANAL',
    periodo_inicio: '2026-07-13',
    periodo_fin: '2026-07-19',
    total_percepciones: 50000,
    total_deducciones: 5000,
    total_neto: 45000,
    total_empleados: 2,
    estado: 'CALCULADA',
    revisado_por_residencia: false,
    revisado_at: null,
    detalles: [
      {
        id_detalle: 'det-1', empleado_id: 'emp-1',
        total_percepciones: 25000, total_deducciones: 2500, neto_a_pagar: 22500,
        empleado: { nombre: 'Juan', apellido_paterno: 'Pérez', numero_empleado: 'EMP-001', puesto: 'Albañil' },
      },
      {
        id_detalle: 'det-2', empleado_id: 'emp-2',
        total_percepciones: 25000, total_deducciones: 2500, neto_a_pagar: 22500,
        empleado: { nombre: 'Ana', apellido_paterno: 'López', numero_empleado: 'EMP-002', puesto: 'Electricista' },
      },
    ],
  };

  return {
    getMock: vi.fn((url: string) => {
      if (url === '/api/v1/personal/prenominas') {
        return Promise.resolve({ data: { data: [prenominaCalculada] } });
      }
      if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
      return Promise.resolve({ data: { data: [] } });
    }),
    patchMock: vi.fn((url: string) => {
      if (url === `/api/v1/personal/prenominas/${prenominaCalculada.id_prenomina}/marcar-revisado`) {
        return Promise.resolve({
          data: { data: { ...prenominaCalculada, revisado_por_residencia: true, revisado_at: '2026-07-20T10:00:00Z' } },
        });
      }
      return Promise.reject(new Error(`PATCH inesperado en test: ${url}`));
    }),
  };
});

vi.mock('../lib/api', () => ({
  default: {
    get: getMock,
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: patchMock,
    delete: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

describe('ResidenciaView — marcar revisado de prenómina (datos reales del backend)', () => {
  it('el modal de detalle renderiza los empleados reales sin crashear', async () => {
    render(<ResidenciaView activeSubView="nomina" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle' }));

    expect(await screen.findByText(/Juan Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/Ana López/)).toBeInTheDocument();
  });

  it('"Marcar revisado" llama a /marcar-revisado (no a /autorizar) y refleja el estado del backend', async () => {
    render(<ResidenciaView activeSubView="nomina" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Marcar revisado' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar revisión' }));

    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith(
        `/api/v1/personal/prenominas/${PRENOMINA_ID}/marcar-revisado`,
        {}
      );
    });
    expect(patchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/autorizar'),
      expect.anything()
    );

    // Ya revisada: el botón "Marcar revisado" desaparece de la fila.
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Marcar revisado' })).not.toBeInTheDocument();
    });
  });
});
