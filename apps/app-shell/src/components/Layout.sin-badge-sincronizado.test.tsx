import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/aprovechar-ancho-header-selector-proyecto. El badge
 * "Sistema sincronizado" es decorativo (sin lógica real detrás) y se elimina
 * para que el selector de proyecto aproveche ese espacio en el header.
 */

const projects = [
  { id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' },
];

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['admin'], projects },
    logout: vi.fn(),
    currentProjectId: 'proj-001',
    setCurrentProjectId: vi.fn(),
  }),
}));

describe('Layout — sin badge "Sistema sincronizado"', () => {
  it('no renderiza el badge decorativo "Sistema sincronizado" en el header', () => {
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    expect(screen.queryByText(/sistema sincronizado/i)).not.toBeInTheDocument();
  });
});
