import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/sidebar-submenu-flyout-lateral/ y
 * openspec/changes/fix-submenu-flyout-recortado-por-sidebar/.
 *
 * El submenú de un módulo activo se expandía siempre hacia abajo, dentro
 * del flujo vertical del sidebar. En escritorio ahora debe mostrarse como
 * panel flotante lateral, cerrable con clic-fuera/Escape — sin cambiar el
 * acordeón vertical del drawer mobile.
 *
 * Bug encontrado en producción tras el primer intento (posicionamiento
 * puramente CSS con `absolute`/`md:hidden`): <nav> tiene overflow-y-auto y
 * el <aside> desktop tiene overflow-hidden, así que el panel quedaba
 * recortado dentro del ancho del sidebar en vez de flotar sobre el
 * contenido. El fix usa un portal a document.body (mismo patrón que el
 * dropdown de proyecto), así que estos tests verifican eso de forma
 * determinística: el panel no debe ser descendiente de <nav>/<aside> — debe
 * colgar directo de document.body.
 */

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

const projects = [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }];

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['gerencia_tecnica'], projects },
    logout: vi.fn(),
    currentProjectId: 'proj-001',
    setCurrentProjectId: vi.fn(),
  }),
}));

function flyoutPanel() {
  return document.body.querySelector(':scope > [data-submenu-flyout]') as HTMLElement | null;
}

describe('Layout — submenú lateral flotante en escritorio (portal, no recortado por el sidebar)', () => {
  it('en escritorio, el panel se renderiza como hijo directo de document.body — no como descendiente de <nav> (que recorta con overflow)', () => {
    setViewportWidth(1280);
    const { container } = render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    const nav = container.querySelector('nav')!;
    const panel = flyoutPanel();
    expect(panel).toBeTruthy();
    expect(nav.contains(panel)).toBe(false);
    expect(panel!.className).toContain('fixed');
  });

  it('en mobile (< 768px), NO existe ningún panel-portal — el submenú sigue siendo acordeón inline dentro del sidebar', () => {
    setViewportWidth(375);
    const { container } = render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    expect(flyoutPanel()).toBeNull();
    const nav = container.querySelector('nav')!;
    expect(within(nav).getByText('Insumos')).toBeInTheDocument();
  });

  it('el panel (escritorio) se cierra al hacer clic fuera de él', async () => {
    setViewportWidth(1280);
    render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={vi.fn()}>
        <div>contenido de la pagina</div>
      </Layout>
    );

    expect(flyoutPanel()).toBeTruthy();

    // El listener de clic-fuera se registra en un setTimeout(0) (mismo
    // patrón que el dropdown de proyecto, para no cerrarse con el mismo
    // clic que lo abrió) — hay que dejarlo correr antes de disparar el clic.
    await new Promise(r => setTimeout(r, 0));
    fireEvent.click(screen.getByText('contenido de la pagina'));

    expect(flyoutPanel()).toBeNull();
  });

  it('el panel (escritorio) se cierra al presionar Escape', () => {
    setViewportWidth(1280);
    render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    expect(flyoutPanel()).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(flyoutPanel()).toBeNull();
  });

  it('clickear un subItem normal (sin targetView) navega y cierra el panel', () => {
    setViewportWidth(1280);
    const onSubNavigate = vi.fn();
    render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={onSubNavigate}>
        <div>contenido</div>
      </Layout>
    );

    fireEvent.click(within(flyoutPanel()!).getByText('Insumos'));

    expect(onSubNavigate).toHaveBeenCalledWith('insumos');
    expect(flyoutPanel()).toBeNull();
  });
});
