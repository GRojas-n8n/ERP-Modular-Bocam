import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver specs/features/02-asignacion-empleados-residente-prestamos.md (sección 5).
 *
 * Cubre el tab "Mi equipo": agrupación por categoría, badge de "Compartido"
 * para empleados prestados a otro proyecto, y que no crashee con
 * por_categoria: [] (residente sin equipo asignado).
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

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn((url: string): Promise<any> => {
    if (url === '/api/v1/personal/mis-empleados/resumen') {
      return Promise.resolve({
        data: {
          data: {
            por_categoria: [
              {
                categoria: 'OBRERO', total: 2,
                empleados: [
                  { id_empleado: 'emp-1', nombre: 'Juan Pérez', numero_empleado: 'EMP-001', compartido: false, proyecto_actual_id: null },
                  { id_empleado: 'emp-2', nombre: 'Ana López',  numero_empleado: 'EMP-002', compartido: true,  proyecto_actual_id: 'proyecto-2' },
                ],
              },
            ],
          },
        },
      });
    }
    if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
    return Promise.resolve({ data: { data: [] } });
  }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: getMock,
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

describe('ResidenciaView — Mi equipo', () => {
  it('agrupa por categoría y marca "Compartido" al empleado prestado', async () => {
    render(<ResidenciaView activeSubView="equipo" />);

    expect(await screen.findByText('OBRERO')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('Compartido')).toBeInTheDocument();
  });

  it('no crashea cuando por_categoria viene vacío', async () => {
    getMock.mockImplementation((url: string): Promise<any> => {
      if (url === '/api/v1/personal/mis-empleados/resumen') {
        return Promise.resolve({ data: { data: { por_categoria: [] } } });
      }
      if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
      return Promise.resolve({ data: { data: [] } });
    });

    render(<ResidenciaView activeSubView="equipo" />);

    expect(await screen.findByText('Sin personal asignado')).toBeInTheDocument();
  });
});
