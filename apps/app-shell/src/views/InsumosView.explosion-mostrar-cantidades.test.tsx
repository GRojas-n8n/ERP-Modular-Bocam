import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/explosion-insumos-mostrar-cantidades/.
 *
 * La pestaña "Insumos" (Explosión de Insumos) llamaba a
 * GET /api/v1/gerencia-tecnica/insumos, que no trae `cantidad_presupuestada`.
 * El backend ya calcula esa cantidad (suma de composiciones APU del
 * presupuesto activo) en GET /api/v1/gerencia-tecnica/insumos/explosion —
 * la vista debe usar ese endpoint y mostrar la columna "Cantidad".
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba' },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn((url: string): Promise<any> => {
    if (url === '/api/v1/gerencia-tecnica/insumos/explosion') {
      return Promise.resolve({
        data: {
          data: [{
            id: 'insumo-1',
            proyecto_id: 'proyecto-1',
            clave: 'CFM001',
            descripcion: 'TUBO CONDUIT PVC 2\'\'',
            tipo_insumo: 'MATERIAL',
            unidad_medida: 'M',
            costo_base: 65,
            activo: true,
            cantidad_presupuestada: 13.44,
          }],
        },
      });
    }
    // El endpoint plano /insumos (sin cantidad) no debe ser el que usa esta
    // pestaña — si el test llega a depender de esta rama, algo está mal.
    if (url === '/api/v1/gerencia-tecnica/insumos') {
      return Promise.resolve({ data: { data: [{ id: 'insumo-1', clave: 'CFM001', descripcion: 'TUBO CONDUIT PVC 2\'\'', tipo_insumo: 'MATERIAL', unidad_medida: 'M', costo_base: 65, activo: true }] } });
    }
    return Promise.resolve({ data: { data: null } });
  }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: getMock,
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

describe('InsumosView — Insumos — muestra cantidad presupuestada', () => {
  it('llama a /insumos/explosion (no al endpoint plano) y muestra la columna Cantidad con su valor', async () => {
    render(<InsumosView activeSubView="insumos" />);

    await waitFor(() => expect(screen.getByText('CFM001')).toBeInTheDocument());

    expect(getMock).toHaveBeenCalledWith('/api/v1/gerencia-tecnica/insumos/explosion');
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === '13.44 M')).toBeInTheDocument();
  });
});
