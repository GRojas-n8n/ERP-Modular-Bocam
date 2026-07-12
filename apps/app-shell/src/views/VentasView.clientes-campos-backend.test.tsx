import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VentasView } from './VentasView';

/**
 * Ver openspec/changes/fix-ventas-clientes-render-campos-backend — tareas 1.1-1.2.
 *
 * GET /clientes devuelve el shape real del schema (razon_social,
 * rfc_tax_id, email_contacto) — nunca nombre/rfc/email, que solo existen
 * en DEMO_CLIENTES. Este test reproduce el crash contra ese shape real.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ tenant: { id: 'bocam-real', name: 'Constructora Bocam' }, user: { role: ['admin'] } }),
}));

const CLIENTE_BACKEND_REAL = {
  id_cliente: 'cli-real-1',
  tenant_id: 'tenant-1',
  tercero_id: null,
  rfc_tax_id: 'ABC010101AB1',
  razon_social: 'Cliente Real S.A. de C.V.',
  email_contacto: 'contacto@clientereal.com',
  telefono: '5551234567',
  estatus: 'ACTIVO',
  codigo_cliente: '001',
};

vi.mock('../lib/api', () => ({
  ventasApi: {
    getClientes: vi.fn(() => Promise.resolve({ data: { data: [CLIENTE_BACKEND_REAL] } })),
    getCotizaciones: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    getFacturas: vi.fn(() => Promise.resolve({ data: { data: [] } })),
  },
}));

describe('VentasView — tab Clientes contra el shape real del backend', () => {
  it('no crashea y muestra razon_social/rfc_tax_id reales (no nombre/rfc)', async () => {
    render(<VentasView />);

    expect(await screen.findByText('Cliente Real S.A. de C.V.')).toBeInTheDocument();
    expect(screen.getByText('ABC010101AB1')).toBeInTheDocument();
  });
});
