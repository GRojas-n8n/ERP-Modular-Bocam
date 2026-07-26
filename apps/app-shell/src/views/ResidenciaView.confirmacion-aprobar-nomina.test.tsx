import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/selector-proyecto-confirmacion-critica. El botón
 * "Aprobar" de prenómina en ResidenciaView ya tenía su propio modal de
 * confirmación (sin mencionar el proyecto activo); se migró a
 * ConfirmCriticalActionDialog para mostrar el proyecto activo, sin tocar el
 * hecho de que hoy solo actualiza estado local (bug de conexión al backend
 * ya registrado por separado, fuera de alcance de este change).
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

describe('ResidenciaView — confirmación crítica al aprobar prenómina', () => {
  it('el diálogo de confirmación muestra el proyecto activo antes de aprobar', async () => {
    render(<ResidenciaView activeSubView="nomina" />);

    const botonesAprobar = await screen.findAllByRole('button', { name: 'Aprobar' });
    fireEvent.click(botonesAprobar[0]);

    expect(screen.getByText(/Torre Corporativa Norte/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar aprobación' })).toBeInTheDocument();
  });

  it('cancelar no marca la prenómina como aprobada', async () => {
    render(<ResidenciaView activeSubView="nomina" />);

    const botonesAprobar = await screen.findAllByRole('button', { name: 'Aprobar' });
    const totalAntes = botonesAprobar.length;
    fireEvent.click(botonesAprobar[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getAllByRole('button', { name: 'Aprobar' }).length).toBe(totalAntes);
  });
});
