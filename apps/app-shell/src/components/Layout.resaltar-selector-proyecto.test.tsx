import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/resaltar-selector-proyecto/.
 *
 * El selector de proyecto competía visualmente con el label "Proyectos"
 * (opacity-60) y no tenía ningún tratamiento de énfasis — debía ser fácil
 * de localizar por el usuario. Se reusa `.glow-primary` (ya existente en
 * index.css) y se reduce la opacidad del label que lo precede.
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

describe('Layout — selector de proyecto resaltado', () => {
  it('el botón selector tiene la clase de énfasis glow-primary', () => {
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    const selectorBtn = screen.getByText('TCN-2024').closest('button')!;
    expect(selectorBtn.className).toContain('glow-primary');
  });

  it('el label "Proyectos" ya no compite en opacidad con el selector (sin opacity-60)', () => {
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    const label = screen.getByText('Proyectos');
    expect(label.className).not.toContain('opacity-60');
  });
});
