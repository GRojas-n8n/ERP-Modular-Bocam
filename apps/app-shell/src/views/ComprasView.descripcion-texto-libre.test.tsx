import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/fix-evaluacion-tecnica-admin-y-descripcion.
 * Bug: normalizeComp derivaba insumo_descripcion buscando insumo_id en el
 * catálogo — para una línea de texto libre (sin insumo_id) esto siempre
 * caía a '—', perdiendo la descripción real capturada en la requisición
 * al recargar la página o releer el cuadro desde el backend.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['procurement'] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const requisicionMock = {
  id_requisicion: 'req-1',
  codigo: 'REQ-0001',
  fecha_solicitud: '2026-07-01',
  solicitante_nombre: 'Residente Prueba',
  estado: 'APROBADA',
  tipo: 'IMPREVISTO',
  items: [
    {
      id_item: 'item-libre-1',
      insumo_id: null,
      cantidad: 1,
      descripcion_libre: 'Mini Split de 1 Tonelada (12,000 BTU) a 220V',
      unidad_libre: 'PZA',
      es_imprevisto: true,
    },
  ],
};

const comparativaMock = {
  id_cuadro: 'comp-1',
  requisicion_id: 'req-1',
  estado: 'BORRADOR',
  detalles: [
    {
      id_detalle: 'det-1',
      insumo_id: null,
      detalle_req_id: 'item-libre-1',
      proveedor_id: 'p1',
      proveedor: { razon_social: 'Proveedor Uno' },
      precio_ofertado: '8500',
      cantidad: 1,
    },
  ],
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: [requisicionMock] } });
      if (url === '/api/v1/compras/catalog/insumos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/comparativas') return Promise.resolve({ data: { data: [comparativaMock] } });
      if (url === '/api/v1/compras/comparativas/comp-1') return Promise.resolve({ data: { data: { ...comparativaMock, lineas_detalle: [] } } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {},
}));

describe('ComprasView — descripción de línea de texto libre tras normalizar desde el backend', () => {
  it('una línea sin insumo_id conserva la descripción real de la requisición, no un guion', async () => {
    render(<ComprasView activeSubView="requisiciones" />);

    const botonContinuar = await screen.findByRole('button', { name: /Continuar comparativa/i });
    fireEvent.click(botonContinuar);

    await waitFor(() => expect(screen.getAllByText('Mini Split de 1 Tonelada (12,000 BTU) a 220V').length).toBeGreaterThan(0));
  });
});
