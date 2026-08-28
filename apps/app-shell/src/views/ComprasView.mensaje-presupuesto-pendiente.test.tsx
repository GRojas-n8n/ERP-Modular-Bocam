import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/control-presupuestal-estado-presupuesto-visible/.
 *
 * El widget de resumen presupuestal en Trazabilidad (Compras) fallaba en
 * silencio ante cualquier error — incluido un presupuesto pendiente de
 * aprobación en GT, que se veía idéntico a "sin presupuesto" o a un error
 * de conexión. Ahora diferencia el mensaje según el código de error real
 * que reenvía el proxy de compras.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['procurement'], projects: [{ id: 'proyecto-1', name: 'Proyecto', code: 'P-1' }] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('../lib/api', () => ({
  default: {
    get: getMock,
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

function mockControlPresupuestalError(code: string) {
  getMock.mockImplementation((url: string) => {
    if (url.startsWith('/api/v1/compras/reportes/control-presupuestal')) {
      const err: any = new Error('error');
      err.response = { status: 404, data: { success: false, error: { code, message: code } } };
      return Promise.reject(err);
    }
    return Promise.resolve({ data: { data: null } });
  });
}

describe('ComprasView — Trazabilidad — mensaje diferenciado de presupuesto', () => {
  it('GT_PRESUPUESTO_PENDIENTE_APROBACION muestra el mensaje de pendiente de aprobación', async () => {
    mockControlPresupuestalError('GT_PRESUPUESTO_PENDIENTE_APROBACION');
    render(<ComprasView activeSubView="trazabilidad" />);

    await waitFor(() => expect(screen.getByText('Presupuesto del proyecto pendiente de aprobación en Gerencia Técnica.')).toBeInTheDocument());
  });

  it('GT_NO_PRESUPUESTO muestra el mensaje de "sin presupuesto activo"', async () => {
    mockControlPresupuestalError('GT_NO_PRESUPUESTO');
    render(<ComprasView activeSubView="trazabilidad" />);

    await waitFor(() => expect(screen.getByText('Sin presupuesto activo para este proyecto.')).toBeInTheDocument());
  });
});
