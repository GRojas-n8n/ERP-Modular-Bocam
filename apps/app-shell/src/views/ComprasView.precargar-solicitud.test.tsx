import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/precargar-solicitud-cotizacion. Reproduce el bug
 * reportado en producción: el botón "Crear Cuadro Comparativo" no aparecía
 * al cargar/recargar la vista aunque los proveedores ya hubieran respondido
 * — solo aparecía tras abrir manualmente "Ver Solicitud de Cotización" en
 * la misma sesión, porque solicitudesMap se llenaba solo bajo demanda.
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
  fecha_solicitud: '2026-07-13',
  solicitante_nombre: 'Residente Prueba',
  estado: 'APROBADA',
  tipo: 'IMPREVISTO',
  items: [],
};

const solicitudMock = {
  id_solicitud: 'sol-1',
  dias_habiles: 3,
  fecha_solicitud: '2026-07-13T00:00:00.000Z',
  fecha_limite: '2026-07-16T00:00:00.000Z',
  dias_habiles_restantes: 1,
  alerta_plazo: false,
  notas: null,
  proveedores: [
    { id_scp: 'scp-1', proveedor_id: 'p1', proveedor: { razon_social: 'Proveedor Uno' }, estado: 'RESPONDIO', pdf_nombre: null, notas_proveedor: null, fecha_respuesta: '2026-07-13T00:00:00.000Z' },
  ],
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: [requisicionMock] } });
      if (url === '/api/v1/compras/catalog/insumos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/comparativas') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/requisiciones/req-1/solicitud-cotizacion') return Promise.resolve({ data: { data: solicitudMock } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {},
}));

describe('ComprasView — precarga de Solicitud de Cotización', () => {
  it('el botón "Crear Cuadro Comparativo" aparece al montar la vista, sin abrir el panel de Solicitud de Cotización', async () => {
    render(<ComprasView activeSubView="requisiciones" />);

    const boton = await screen.findByRole('button', { name: /Crear Cuadro Comparativo/i });
    expect(boton).toBeInTheDocument();
  });
});
