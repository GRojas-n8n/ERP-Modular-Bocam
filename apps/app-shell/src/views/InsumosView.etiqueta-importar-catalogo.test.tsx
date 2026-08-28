import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/fix-etiqueta-boton-importar-catalogo-obra/.
 * "Importar OPUS" confundía el nombre del software externo de origen con
 * el nombre de la acción — debe decir "Importar Catálogo de Conceptos".
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
    if (url === '/api/v1/gerencia-tecnica/presupuestos') {
      return Promise.resolve({ data: { data: [] } });
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

describe('InsumosView — Catálogo de Obra — etiqueta del botón de importar', () => {
  it('el estado vacío "Sin catálogo cargado" dice "Importar Catálogo de Conceptos"', async () => {
    render(<InsumosView activeSubView="catalogo" />);

    await waitFor(() => expect(screen.getByText('Sin catálogo cargado')).toBeInTheDocument());

    // La barra de acciones y el CTA del estado vacío coexisten en pantalla
    // (misma acción, dos ubicaciones) — ambos deben decir el texto correcto.
    const botones = screen.getAllByRole('button', { name: 'Importar Catálogo de Conceptos' });
    expect(botones.length).toBe(2);
    expect(screen.queryByText(/Importar OPUS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Importar desde OPUS/i)).not.toBeInTheDocument();
  });

  it('la barra de acciones dice "Importar Catálogo de Conceptos" cuando ya hay un presupuesto cargado', async () => {
    getMock.mockImplementation((url: string) => {
      if (url === '/api/v1/gerencia-tecnica/presupuestos') {
        return Promise.resolve({
          data: {
            data: [{
              id: 'presupuesto-1', proyecto_id: 'proyecto-1', version: 1, estado: 'BORRADOR', importe_total: 1000,
              conceptos: [{ id: 'c-1', clave: 'C-001', descripcion: 'Concepto de prueba', unidad_medida: 'PZA', cantidad: 1, precio_unitario: 100, importe: 100 }],
              created_at: new Date().toISOString(),
            }],
          },
        });
      }
      return Promise.resolve({ data: { data: null } });
    });

    render(<InsumosView activeSubView="catalogo" />);

    await waitFor(() => expect(screen.getByText('C-001')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'Importar Catálogo de Conceptos' })).toBeInTheDocument();
    expect(screen.queryByText(/Importar OPUS/i)).not.toBeInTheDocument();
  });
});
