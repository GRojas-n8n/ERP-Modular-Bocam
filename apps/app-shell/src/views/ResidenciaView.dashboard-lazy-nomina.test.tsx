import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/residencia-consolidar-dashboard.
 *
 * La carga inicial de ResidenciaView ya no debe llamar a
 * /api/v1/personal/prenominas ni /api/v1/personal/complementos — esos
 * datos ahora se cargan solo cuando se activa la pestaña "Nómina",
 * igual que el resto de pestañas (equipo, asistencia, requisiciones).
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
    if (url === '/api/v1/personal/prenominas') return Promise.resolve({ data: { data: [{
      id_prenomina: 'pn-1', codigo: 'PN-001', periodo_tipo: 'QUINCENAL',
      periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
      total_percepciones: 1200, total_deducciones: 200, total_neto: 1000,
      total_empleados: 3, estado: 'CALCULADA', revisado_por_residencia: false, revisado_at: null,
    }] } });
    if (url === '/api/v1/personal/complementos') return Promise.resolve({ data: { data: [] } });
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

function urlsLlamadas() {
  return getMock.mock.calls.map((call) => call[0]);
}

describe('ResidenciaView — carga perezosa de Nómina', () => {
  beforeEach(() => {
    getMock.mockClear();
  });

  it('NO llama a /api/v1/personal/* al montar con la pestaña por defecto (estimaciones)', async () => {
    render(<ResidenciaView />);

    // Esperar a que la carga inicial termine (dashboard/residente se llama siempre).
    await waitFor(() => expect(urlsLlamadas()).toContain('/api/v1/control-proyectos/dashboard/residente'));

    const urls = urlsLlamadas();
    expect(urls).not.toContain('/api/v1/personal/prenominas');
    expect(urls).not.toContain('/api/v1/personal/complementos');
  });

  it('llama a prenominas y complementos al activar la pestaña Nómina', async () => {
    render(<ResidenciaView activeSubView="nomina" />);

    await screen.findByText('PN-001');

    const urls = urlsLlamadas();
    expect(urls).toContain('/api/v1/personal/prenominas');
    expect(urls).toContain('/api/v1/personal/complementos');
  });
});
