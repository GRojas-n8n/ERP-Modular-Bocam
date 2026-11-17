import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardView } from './DashboardView';

/**
 * Ver openspec/changes/fix-avance-mock-mis-proyectos/.
 *
 * "Mis Proyectos" calculaba el avance de cada tarjeta con
 * `Math.min(35 + index * 20, 100)` — un valor sintético sin relación con
 * datos reales. Ahora debe venir de
 * GET /api/v1/control-proyectos/avance-resumen-multi.
 */

const projects = [
  { id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' },
  { id: 'proyecto-2', name: 'Residencial Las Palmas', code: 'RLP-2024', status: 'En curso' },
];

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['residencia'], projects },
  }),
}));

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn((url: string): Promise<any> => {
    if (url.startsWith('/api/v1/control-proyectos/avance-resumen-multi')) {
      return Promise.resolve({
        data: {
          data: [
            { proyecto_id: 'proyecto-1', avance_pct: 46, tiene_avances: true },
            { proyecto_id: 'proyecto-2', avance_pct: 0, tiene_avances: false },
          ],
        },
      });
    }
    return Promise.resolve({ data: { data: null } });
  }),
}));

vi.mock('../lib/api', () => ({
  default: { get: getMock, post: vi.fn(() => Promise.resolve({ data: { data: null } })) },
  asistenteApi: {
    getAlertasPredictivas: vi.fn(() => Promise.resolve({ data: { data: { alertas: [] } } })),
    getResumenEjecutivo: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

describe('DashboardView — Mis Proyectos — avance real (no sintético)', () => {
  it('un proyecto recién creado sin avances muestra "Sin avances registrados", no un % inventado', async () => {
    render(<DashboardView onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Residencial Las Palmas')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Sin avances registrados')).toBeInTheDocument());

    // El proyecto sin avances NUNCA debe mostrar el 35% sintético que
    // producía `35 + index * 20` para index 0, ni ningún otro % inventado.
    expect(screen.queryByText('35%')).not.toBeInTheDocument();
  });

  it('un proyecto con avance validado muestra el % real del backend', async () => {
    render(<DashboardView onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('46%')).toBeInTheDocument());
    expect(getMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avance-resumen-multi?proyecto_ids=proyecto-1,proyecto-2');
  });
});
