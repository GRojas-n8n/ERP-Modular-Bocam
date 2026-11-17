import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/acceso-proyectos-gt-control-obra/.
 *
 * "Proyectos" era un subItem único del grupo Administración. Ahora también
 * debe verse (como salto cross-grupo hacia la misma vista, sin duplicar
 * datos) desde Gerencia Técnica y desde Control de Obra, y el rol
 * control_obra debe poder verlo.
 *
 * Viewport forzado a mobile: el submenú en escritorio se renderiza vía
 * portal (ver fix-submenu-flyout-recortado-por-sidebar) — estos tests
 * verifican la navegación cross-grupo en sí, no el posicionamiento del
 * panel, así que se quedan en el acordeón inline dentro de <nav> para no
 * duplicar esa cobertura.
 */

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

const projects = [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }];
let currentRoles: string[] = ['gerencia_tecnica'];

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    get user() { return { id: 'user-1', name: 'Usuario de Prueba', role: currentRoles, projects }; },
    logout: vi.fn(),
    currentProjectId: 'proj-001',
    setCurrentProjectId: vi.fn(),
  }),
}));

describe('Layout — acceso a Proyectos desde Gerencia Técnica y Control de Obra', () => {
  it('un usuario gerencia_tecnica ve "Proyectos" dentro de su propio grupo y saltar navega a Administración', () => {
    setViewportWidth(375);
    currentRoles = ['gerencia_tecnica'];
    const onNavigate = vi.fn();
    const onSubNavigate = vi.fn();

    const { container } = render(
      <Layout onNavigate={onNavigate} currentView="insumos" currentSubView="catalogo" onSubNavigate={onSubNavigate}>
        <div>contenido</div>
      </Layout>
    );

    const nav = container.querySelector('nav')!;
    const proyectosBtn = within(nav).getByText('Proyectos').closest('button')!;
    fireEvent.click(proyectosBtn);

    expect(onNavigate).toHaveBeenCalledWith('admin');
    expect(onSubNavigate).toHaveBeenCalledWith('proyectos');
  });

  it('un usuario solo con rol control_obra ve "Proyectos" dentro de Control de Obra', () => {
    setViewportWidth(375);
    currentRoles = ['control_obra'];
    const onNavigate = vi.fn();
    const onSubNavigate = vi.fn();

    const { container } = render(
      <Layout onNavigate={onNavigate} currentView="control-obra" currentSubView="dashboard" onSubNavigate={onSubNavigate}>
        <div>contenido</div>
      </Layout>
    );

    const nav = container.querySelector('nav')!;
    const proyectosBtn = within(nav).getByText('Proyectos').closest('button')!;
    fireEvent.click(proyectosBtn);

    expect(onNavigate).toHaveBeenCalledWith('admin');
    expect(onSubNavigate).toHaveBeenCalledWith('proyectos');
  });

  it('un usuario solo con rol control_obra NO ve el grupo Gerencia Técnica (rol no autorizado en el padre)', () => {
    currentRoles = ['control_obra'];

    render(
      <Layout onNavigate={vi.fn()} currentView="control-obra" currentSubView="dashboard" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    expect(screen.queryByText('Gerencia Técnica')).not.toBeInTheDocument();
  });
});
