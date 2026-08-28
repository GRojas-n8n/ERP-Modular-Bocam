import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/sidebar-submenu-flyout-lateral/.
 *
 * El submenú de un módulo activo se expandía siempre hacia abajo, dentro
 * del flujo vertical del sidebar. En escritorio ahora debe mostrarse como
 * panel flotante lateral (posicionado a la derecha del ítem), cerrable con
 * clic-fuera/Escape — sin cambiar el acordeón vertical del drawer mobile.
 *
 * jsdom no evalúa media queries, así que estos tests verifican: (a) las
 * clases Tailwind de posicionamiento md: están presentes (positioning real
 * queda para verificación visual manual), y (b) el comportamiento real de
 * clic-fuera/Escape vía la clase `md:hidden` que controla la visibilidad
 * en escritorio.
 */

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

function submenuPanel(container: HTMLElement) {
  return container.querySelector('nav [data-submenu-flyout]') as HTMLElement;
}

describe('Layout — submenú lateral flotante en escritorio', () => {
  it('el panel de subItems tiene las clases de posicionamiento flyout (md:absolute md:left-full), además de las clases de acordeón mobile', () => {
    const { container } = render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    const panel = submenuPanel(container);
    expect(panel).toBeTruthy();
    expect(panel.className).toContain('md:absolute');
    expect(panel.className).toContain('md:left-full');
    // Acordeón mobile sin cambios: sigue en el flujo vertical por default (sin prefijo md:)
    expect(panel.className).toContain('relative');
    expect(panel.className).toContain('ml-4');
  });

  it('el panel se oculta (md:hidden) al hacer clic fuera de él', async () => {
    const { container } = render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={vi.fn()}>
        <div>contenido de la pagina</div>
      </Layout>
    );

    expect(submenuPanel(container).className).not.toContain('md:hidden');

    // El listener de clic-fuera se registra en un setTimeout(0) (mismo
    // patrón que el dropdown de proyecto, para no cerrarse con el mismo
    // clic que lo abrió) — hay que dejarlo correr antes de disparar el clic.
    await new Promise(r => setTimeout(r, 0));
    fireEvent.click(screen.getByText('contenido de la pagina'));

    expect(submenuPanel(container).className).toContain('md:hidden');
  });

  it('el panel se oculta (md:hidden) al presionar Escape', () => {
    const { container } = render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    expect(submenuPanel(container).className).not.toContain('md:hidden');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(submenuPanel(container).className).toContain('md:hidden');
  });

  it('clickear un subItem normal (sin targetView) cierra el flyout tras navegar', () => {
    const onSubNavigate = vi.fn();
    const { container } = render(
      <Layout onNavigate={vi.fn()} currentView="insumos" currentSubView="catalogo" onSubNavigate={onSubNavigate}>
        <div>contenido</div>
      </Layout>
    );

    const nav = container.querySelector('nav')!;
    fireEvent.click(within(nav).getByText('Insumos'));

    expect(onSubNavigate).toHaveBeenCalledWith('insumos');
    expect(submenuPanel(container).className).toContain('md:hidden');
  });
});
