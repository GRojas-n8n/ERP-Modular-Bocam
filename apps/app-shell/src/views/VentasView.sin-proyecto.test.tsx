import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VentasView } from './VentasView';

/**
 * Change fix-clientes-sin-proyecto-y-edicion-rfc (#173): en Ventas, Clientes es catálogo por tenant y se
 * consulta sin proyecto activo; Cotizaciones y Facturas siguen siendo project-scoped (aviso y ninguna
 * petición). Es la contraparte hermética del smoke post-deploy (test/smoke/post-deploy.smoke.spec.ts).
 */

const AVISO = 'Selecciona un proyecto activo para consultar cotizaciones y facturas.';

const { tenantState, getClientes, getCotizaciones, getFacturas } = vi.hoisted(() => ({
  tenantState: { currentProjectId: null as string | null },
  getClientes: vi.fn(),
  getCotizaciones: vi.fn(),
  getFacturas: vi.fn(),
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'tenant-real' },
    currentProjectId: tenantState.currentProjectId,
    user: { id: 'u1', name: 'Admin', role: ['admin'], projects: [] },
  }),
}));

vi.mock('../lib/api', () => ({
  ventasApi: { getClientes, getCotizaciones, getFacturas, createCliente: vi.fn(), updateCliente: vi.fn(), importarClientesLote: vi.fn() },
}));

const CLIENTE = { id_cliente: 'c1', razon_social: 'Cliente Uno SA', rfc_tax_id: 'CUN010101AAA', email_contacto: 'a@b.mx', telefono: '555', codigo_cliente: 'CLI-1' };

describe('VentasView — sin proyecto activo', () => {
  beforeEach(() => {
    tenantState.currentProjectId = null;
    getClientes.mockReset().mockResolvedValue({ data: { data: [CLIENTE] } });
    getCotizaciones.mockReset().mockResolvedValue({ data: { data: [] } });
    getFacturas.mockReset().mockResolvedValue({ data: { data: [] } });
  });

  it('Clientes se consulta y se muestra sin proyecto activo', async () => {
    render(<VentasView />);
    expect(await screen.findByText('Cliente Uno SA')).toBeInTheDocument();
    expect(getClientes).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Proyecto activo requerido')).not.toBeInTheDocument();
  });

  it('Cotizaciones y Facturas muestran el aviso de proyecto requerido y no consultan datos', async () => {
    render(<VentasView />);
    await screen.findByText('Cliente Uno SA');

    fireEvent.click(screen.getByRole('button', { name: /^Cotizaciones/ }));
    expect(await screen.findByText(AVISO)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Facturas/ }));
    expect(await screen.findByText(AVISO)).toBeInTheDocument();

    expect(getCotizaciones).not.toHaveBeenCalled();
    expect(getFacturas).not.toHaveBeenCalled();
    expect(getClientes).toHaveBeenCalledTimes(1);
  });

  it('con proyecto activo Cotizaciones y Facturas sí consultan y no muestran el aviso', async () => {
    tenantState.currentProjectId = 'proyecto-1';
    render(<VentasView />);
    await screen.findByText('Cliente Uno SA');

    fireEvent.click(screen.getByRole('button', { name: /^Cotizaciones/ }));
    await waitFor(() => expect(getCotizaciones).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: /^Facturas/ }));
    await waitFor(() => expect(getFacturas).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument();
  });
});
