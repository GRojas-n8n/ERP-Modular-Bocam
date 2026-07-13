import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/auto-poblar-proveedores-comparativa. Reproduce el bug
 * reportado en producción: un cuadro comparativo ya creado (sin precios
 * capturados aún, por lo que el backend no tiene ComparativaDetalle y
 * `proveedores` llega vacío) debe repoblarse con los proveedores invitados en
 * la Solicitud de Cotización al hacer clic en "Continuar comparativa", sin
 * que Compras tenga que agregarlos manualmente.
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
  tipo: 'MATERIAL',
  items: [],
};

const comparativaMock = {
  id_cuadro: 'comp-1',
  requisicion_id: 'req-1',
  estado: 'BORRADOR',
  detalles: [], // sin precios capturados aún -> proveedores llega vacío desde el backend
};

const solicitudMock = {
  id_solicitud: 'sol-1',
  dias_habiles: 3,
  fecha_solicitud: '2026-07-01T00:00:00.000Z',
  fecha_limite: '2026-07-04T00:00:00.000Z',
  dias_habiles_restantes: 1,
  alerta_plazo: false,
  notas: null,
  proveedores: [
    { id_scp: 'scp-1', proveedor_id: 'p1', proveedor: { razon_social: 'Ferretería Uno' }, estado: 'RESPONDIO', pdf_nombre: null, notas_proveedor: null, fecha_respuesta: '2026-07-02T00:00:00.000Z' },
    { id_scp: 'scp-2', proveedor_id: 'p2', proveedor: { razon_social: 'Materiales Dos' }, estado: 'RESPONDIO', pdf_nombre: null, notas_proveedor: null, fecha_respuesta: '2026-07-02T00:00:00.000Z' },
  ],
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: [requisicionMock] } });
      if (url === '/api/v1/compras/catalog/insumos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/comparativas') return Promise.resolve({ data: { data: [comparativaMock] } });
      if (url === '/api/v1/compras/requisiciones/req-1/solicitud-cotizacion') return Promise.resolve({ data: { data: solicitudMock } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {},
}));

describe('ComprasView — reabrir Cuadro Comparativo ya creado', () => {
  it('repuebla los proveedores invitados en la Solicitud de Cotización al hacer clic en "Continuar comparativa"', async () => {
    render(<ComprasView activeSubView="requisiciones" />);

    const botonContinuar = await screen.findByRole('button', { name: /Continuar comparativa/i });
    fireEvent.click(botonContinuar);

    await waitFor(() => expect(screen.getByText('Ferretería Uno')).toBeInTheDocument());
    expect(screen.getByText('Materiales Dos')).toBeInTheDocument();
  });
});
