import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/control-presupuestal-estado-presupuesto-visible/.
 *
 * Antes de este change, un presupuesto en BORRADOR/EN_REVISION hacía que
 * Control Presupuestal mostrara el mismo error genérico que "no hay ningún
 * presupuesto" (404 GT_NO_PRESUPUESTO), sin indicar que solo falta
 * aprobarlo. Ahora el backend distingue el caso con
 * GT_PRESUPUESTO_PENDIENTE_APROBACION, y la vista debe mostrar un panel con
 * CTA de aprobación (solo para roles con permiso).
 */

let currentRoles: string[] = ['gerencia_tecnica'];

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    get user() { return { id: 'user-1', name: 'Usuario de Prueba', role: currentRoles }; },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const { getMock, patchMock } = vi.hoisted(() => ({
  getMock: vi.fn((url: string) => {
    if (url === '/api/v1/gerencia-tecnica/reportes/control-presupuestal') {
      const err: any = new Error('Not Found');
      err.response = {
        status: 404,
        data: { success: false, error: { code: 'GT_PRESUPUESTO_PENDIENTE_APROBACION', message: 'pendiente', details: { presupuesto_id: 'presupuesto-1', estado: 'BORRADOR' } } },
      };
      return Promise.reject(err);
    }
    return Promise.resolve({ data: { data: null } });
  }),
  patchMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
}));

vi.mock('../lib/api', () => ({
  default: { get: getMock, post: vi.fn(() => Promise.resolve({ data: { data: null } })), patch: patchMock },
}));

describe('InsumosView — Control Presupuestal — presupuesto pendiente de aprobación', () => {
  it('gerencia_tecnica ve el panel con estado BORRADOR y el CTA de aprobar; al aprobar, refresca', async () => {
    currentRoles = ['gerencia_tecnica'];
    render(<InsumosView activeSubView="control-presupuestal" />);

    await waitFor(() => expect(screen.getByText('Presupuesto pendiente de aprobación')).toBeInTheDocument());
    expect(screen.getByText('BORRADOR')).toBeInTheDocument();

    const boton = screen.getByRole('button', { name: 'Aprobar presupuesto' });
    fireEvent.click(boton);

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith('/api/v1/gerencia-tecnica/presupuestos/presupuesto-1/aprobar'));
  });

  it('un rol sin permiso de aprobar ve el panel informativo pero sin el botón', async () => {
    currentRoles = ['residencia'];
    render(<InsumosView activeSubView="control-presupuestal" />);

    await waitFor(() => expect(screen.getByText('Presupuesto pendiente de aprobación')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Aprobar presupuesto' })).not.toBeInTheDocument();
  });
});
