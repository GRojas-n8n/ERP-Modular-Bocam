import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/cotizar-items-texto-libre-comparativa — tarea 7.4.
 * Dos líneas de texto libre (sin insumo_id) del mismo cuadro y proveedor no
 * deben colapsar en una sola al normalizar la respuesta del backend — antes
 * del fix, agrupar solo por insumo_id (null para ambas) las fusionaba.
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
  items: [],
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
      precio_ofertado: '100',
      cantidad: 1,
    },
    {
      id_detalle: 'det-2',
      insumo_id: null,
      detalle_req_id: 'item-libre-2',
      proveedor_id: 'p1',
      proveedor: { razon_social: 'Proveedor Uno' },
      precio_ofertado: '200',
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

describe('ComprasView — líneas de texto libre no colapsan al normalizar', () => {
  it('dos líneas de texto libre (sin insumo_id) del mismo proveedor se muestran como líneas distintas, con sus precios propios', async () => {
    render(<ComprasView activeSubView="requisiciones" />);

    const botonContinuar = await screen.findByRole('button', { name: /Continuar comparativa/i });
    fireEvent.click(botonContinuar);

    await waitFor(() => expect(screen.getByDisplayValue('100')).toBeInTheDocument());
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
  });
});
