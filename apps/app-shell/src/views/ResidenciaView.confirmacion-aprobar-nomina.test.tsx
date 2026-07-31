import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/selector-proyecto-confirmacion-critica. El botón
 * de prenómina en ResidenciaView ya tenía su propio modal de confirmación
 * (sin mencionar el proyecto activo); se migró a ConfirmCriticalActionDialog
 * para mostrar el proyecto activo.
 *
 * Renombrado de "Aprobar" a "Marcar revisado" y conectado al backend real —
 * ver specs/features/01-revision-nomina-residencia.md (2.2, D2). El botón
 * ya NO autoriza el pago (eso sigue siendo exclusivo de personal_rh/admin,
 * separación de funciones); solo marca `revisado_por_residencia`.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'iretum-demo', name: 'Iretum Demo' },
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
      name: 'Residente de Prueba',
      role: ['residencia'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

describe('ResidenciaView — confirmación crítica al marcar prenómina como revisada', () => {
  it('el diálogo de confirmación muestra el proyecto activo antes de marcar revisado', async () => {
    render(<ResidenciaView activeSubView="nomina" />);

    const botonesAprobar = await screen.findAllByRole('button', { name: 'Marcar revisado' });
    fireEvent.click(botonesAprobar[0]);

    expect(screen.getByText(/Torre Corporativa Norte/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar revisión' })).toBeInTheDocument();
  });

  it('cancelar no marca la prenómina como revisada', async () => {
    render(<ResidenciaView activeSubView="nomina" />);

    const botonesAprobar = await screen.findAllByRole('button', { name: 'Marcar revisado' });
    const totalAntes = botonesAprobar.length;
    fireEvent.click(botonesAprobar[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getAllByRole('button', { name: 'Marcar revisado' }).length).toBe(totalAntes);
  });
});
