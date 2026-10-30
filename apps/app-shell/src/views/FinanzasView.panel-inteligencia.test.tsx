import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DEMO_RESUMEN_FINANCIERO } from '../lib/demoData';

/**
 * Ver openspec/changes/fix-encabezados-tablas-finanzas-y-panel-inteligencia.
 * El panel "Inteligencia Financiera" muestra textos fijos (Materiales al 85%,
 * "recuperación de $3,712.58") que no salen de ningún dato. Debe quedar oculto
 * detrás de la bandera `inteligenciaFinanciera`, apagada por defecto, sin
 * borrar su código.
 */

const flags = vi.hoisted(() => ({ inteligenciaFinanciera: false }));
vi.mock('../lib/feature-flags', () => ({ FLAGS: flags }));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
      name: 'Usuario de Prueba',
      role: ['finanzas'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => Promise.resolve({
      data: { data: url === '/api/v1/finanzas/dashboard' ? { resumen_presupuestal: DEMO_RESUMEN_FINANCIERO, alertas: [] } : [] },
    })),
    post: vi.fn(),
  },
}));

async function renderVista() {
  const { FinanzasView } = await import('./FinanzasView');
  render(<FinanzasView />);
  // Espera a que termine la carga: "Presupuestos Asignados" solo aparece después.
  await screen.findByRole('heading', { name: 'Presupuestos Asignados' });
}

describe('FinanzasView — panel "Inteligencia Financiera" detrás de bandera', () => {
  afterEach(() => cleanup());

  it('con la bandera apagada (por defecto) no muestra el panel ni sus textos fijos', async () => {
    flags.inteligenciaFinanciera = false;
    await renderVista();

    expect(screen.queryByText(/Inteligencia Financiera/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/punto critico del 85%/i)).not.toBeInTheDocument();
    expect(screen.queryByText('$3,712.58')).not.toBeInTheDocument();
  });

  it('con la bandera encendida conserva el panel tal cual', async () => {
    flags.inteligenciaFinanciera = true;
    await renderVista();

    expect(screen.getByText(/Inteligencia Financiera/i)).toBeInTheDocument();
    expect(screen.getByText('$3,712.58')).toBeInTheDocument();
  });
});
