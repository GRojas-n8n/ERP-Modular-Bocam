import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { DashboardView } from './DashboardView';

/**
 * Ver openspec/changes/dashboard-ejecutivo-finanzas-kpis/ (hallazgo H3, certificación M11).
 * Desde M8, GET /api/v1/finanzas/dashboard responde el contrato estándar { kpis, alertas, actividad_reciente }.
 * La tarjeta del dashboard ejecutivo seguía leyendo `resumenPresupuestal` y mostraba "Error" con la respuesta en 200.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Admin', role: ['admin'], projects: [{ id: 'proyecto-1', name: 'Obra', code: 'O-1' }] },
  }),
}));

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn((url: string): Promise<any> => {
    if (url === '/api/v1/finanzas/dashboard') {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            kpis: {
              total_autorizado: 1000, total_comprometido: 0, total_ejercido: 6.96, total_disponible: 993.04,
              porcentaje_ejercido: 1, saldo_bancos: 0, ocs_por_pagar: 0, cuentas_por_cobrar: 0, pagos_vencidos: 0,
            },
            alertas: [],
            actividad_reciente: [],
          },
        },
      });
    }
    return Promise.resolve({ data: { data: {} } });
  }),
}));

vi.mock('../lib/api', () => ({
  default: { get: getMock, post: vi.fn(() => Promise.resolve({ data: { data: null } })) },
  asistenteApi: {
    getAlertasPredictivas: vi.fn(() => Promise.resolve({ data: { data: { alertas: [] } } })),
    getResumenEjecutivo: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

describe('Dashboard ejecutivo — tarjeta de Finanzas', () => {
  it('con la respuesta estándar { kpis } muestra los montos y no "Error"', async () => {
    render(<DashboardView onNavigate={vi.fn()} />);
    const titulo = await screen.findByText('Finanzas');
    const tarjeta = titulo.closest('div.rounded-2xl, div.rounded-3xl, section, article') ?? document.body;
    await waitFor(() => expect(within(tarjeta as HTMLElement).queryByText('Error')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getAllByText(/\$1,000/).length).toBeGreaterThan(0));
  });
});
