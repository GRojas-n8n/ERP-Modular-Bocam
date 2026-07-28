import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/mostrar-nombre-proyecto-header. El nombre del proyecto
 * activo debe ser visible en el botón colapsado del selector sin abrir el
 * dropdown, no solo el código corto.
 */

const projects = [
  { id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' },
  { id: 'proj-002', name: 'Residencial Las Palmas', code: 'RLP-2024', status: 'En curso' },
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

describe('Layout — nombre del proyecto activo visible sin abrir el dropdown', () => {
  it('muestra el nombre completo del proyecto en el botón colapsado del selector', () => {
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    // Sin hacer click para abrir el dropdown, el nombre ya debe ser visible.
    expect(screen.getByText('Torre Corporativa Norte')).toBeInTheDocument();
  });
});
