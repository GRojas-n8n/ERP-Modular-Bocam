import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from './Layout';
import { getProjectColor } from '@bocam/ui-core';

/**
 * Ver openspec/changes/selector-proyecto-confirmacion-critica. El indicador
 * de proyecto activo debe distinguirse por color, no solo por texto, cuando
 * el usuario tiene varios proyectos asignados.
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

describe('Layout — indicador de proyecto activo con color determinístico', () => {
  it('el botón selector usa el color determinístico del proyecto activo', () => {
    currentProjectId = 'proj-001';
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    const selectorBtn = screen.getByText('TCN-2024').closest('button')!;
    const expectedColor = getProjectColor('proj-001');
    expect(selectorBtn.className).toContain(expectedColor.border);
    expect(selectorBtn.className).toContain(expectedColor.bgSoft);
  });

  it('cada proyecto del dropdown muestra su propio color, no todos el mismo', () => {
    currentProjectId = 'proj-001';
    render(
      <Layout onNavigate={vi.fn()} currentView="dashboard" currentSubView="" onSubNavigate={vi.fn()}>
        <div>contenido</div>
      </Layout>
    );

    fireEvent.click(screen.getByText('TCN-2024'));

    const colorA = getProjectColor('proj-001');
    const colorB = getProjectColor('proj-002');
    expect(colorA.dot).not.toBe(colorB.dot);

    const itemB = screen.getByText('Residencial Las Palmas').closest('button')!;
    expect(itemB.innerHTML).toContain(colorB.dot);
  });
});
