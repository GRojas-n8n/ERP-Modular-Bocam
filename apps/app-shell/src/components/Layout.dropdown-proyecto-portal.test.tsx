import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from './Layout';

/**
 * Ver openspec/changes/fix-dropdown-proyecto-transparente/.
 *
 * El header tiene `.glass-elevated` (backdrop-filter: blur). El panel del
 * dropdown de proyecto se renderizaba como hijo directo de ese mismo
 * subárbol, posicionado con `top-full` — al sobresalir del borde del
 * header, Chromium recompone esa porción con la capa de blur del header,
 * produciendo transparencia y superposición visual con el contenido detrás.
 *
 * El fix saca el panel del subárbol del header vía createPortal(document.body).
 * Este test verifica eso de forma determinística en jsdom: el panel NO debe
 * ser descendiente del <header>, sin importar estilos computados (jsdom no
 * calcula compositing real).
 */

let currentProjectId = 'proj-001';
const setCurrentProjectId = vi.fn((id: string) => { currentProjectId = id; });

const projects = [
  { id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' },
  { id: 'proj-002', name: 'Residencial Las Palmas', code: 'RLP-2024', status: 'En curso' },
];

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['admin'], projects },
    logout: vi.fn(),
    get currentProjectId() { return currentProjectId; },
    setCurrentProjectId,
  }),
}));

describe('Layout — dropdown de proyecto no debe ser transparente/superpuesto', () => {
  it('el panel de opciones se renderiza fuera del <header> (portal), no como descendiente suyo', () => {
    const { container } = render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    fireEvent.click(screen.getByText('TCN-2024'));

    const header = container.querySelector('header')!;
    const panel = screen.getByText('Seleccionar proyecto').closest('div')!;

    expect(header.contains(panel)).toBe(false);
  });

  it('seleccionar un proyecto en el panel portal sigue funcionando (cierra y cambia de proyecto)', () => {
    currentProjectId = 'proj-001';
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    fireEvent.click(screen.getByText('TCN-2024'));
    fireEvent.click(screen.getByText('Residencial Las Palmas'));

    expect(setCurrentProjectId).toHaveBeenCalledWith('proj-002');
    expect(screen.queryByText('Seleccionar proyecto')).not.toBeInTheDocument();
  });
});
