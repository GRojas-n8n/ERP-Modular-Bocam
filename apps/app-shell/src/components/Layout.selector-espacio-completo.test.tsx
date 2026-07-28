import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/expandir-selector-proyecto-espacio-completo. El
 * selector de proyecto ya no debe tener un tope de ancho fijo en pantallas
 * grandes — debe poder extenderse hasta el grupo de íconos de la derecha.
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

describe('Layout — selector de proyecto sin tope de ancho fijo', () => {
  it('el botón del selector no tiene un max-w fijo en px para pantallas grandes', () => {
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    const selectorBtn = screen.getByText('Torre Corporativa Norte').closest('button')!;
    expect(selectorBtn.className).not.toMatch(/max-w-\[\d+px\]/);
    expect(selectorBtn.className).toContain('max-w-full');
  });
});
