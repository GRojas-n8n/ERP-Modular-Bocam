import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

/**
 * Guard del App Shell sin proyecto activo (change fix-clientes-sin-proyecto-y-edicion-rfc, #173):
 * los módulos project-scoped muestran "Proyecto activo requerido"; Ventas NO se bloquea globalmente
 * porque Clientes es catálogo por tenant (Cotizaciones y Facturas se protegen dentro de VentasView).
 * Contraparte hermética de la parte de guard del smoke post-deploy.
 */

const { getClientes, stub } = vi.hoisted(() => ({
  getClientes: vi.fn(),
  // Las demás vistas no son objeto de esta prueba.
  stub: (nombre: string) => () => <div>{`vista-${nombre}`}</div>,
}));

vi.mock('./context/TenantContext', () => ({
  TenantProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTenant: () => ({
    isAuthenticated: true,
    tenant: { id: 'tenant-real' },
    currentProjectId: null,
    user: { id: 'u1', name: 'Admin', role: ['admin'], projects: [] },
  }),
}));
vi.mock('./context/NotificationContext', () => ({ NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('./components/ToastContainer', () => ({ ToastContainer: () => null }));
vi.mock('./components/ChatAsistente', () => ({ ChatAsistente: () => null }));
vi.mock('./lib/api', () => ({
  ventasApi: { getClientes, getCotizaciones: vi.fn(), getFacturas: vi.fn(), createCliente: vi.fn(), updateCliente: vi.fn(), importarClientesLote: vi.fn() },
}));

// Layout mínimo: un botón por vista para navegar como lo hace el menú real.
vi.mock('./components/Layout', () => ({
  Layout: ({ children, onNavigate }: { children: React.ReactNode; onNavigate: (v: string) => void }) => (
    <div>
      {['compras', 'insumos', 'residencia', 'control-obra', 'seguridad', 'ventas'].map(v => (
        <button key={v} onClick={() => onNavigate(v)}>{`ir-${v}`}</button>
      ))}
      {children}
    </div>
  ),
}));

vi.mock('./views/LoginView', () => ({ LoginView: stub('login') }));
vi.mock('./views/DashboardView', () => ({ DashboardView: stub('dashboard') }));
vi.mock('./views/InsumosView', () => ({ InsumosView: stub('insumos') }));
vi.mock('./views/ComprasView', () => ({ ComprasView: stub('compras') }));
vi.mock('./views/ComparativaPrecios', () => ({ ComparativaPrecios: stub('comparativa') }));
vi.mock('./views/FinanzasView', () => ({ FinanzasView: stub('finanzas') }));
vi.mock('./views/ControlObraView', () => ({ ControlObraView: stub('control-obra') }));
vi.mock('./views/PersonalView', () => ({ PersonalView: stub('personal') }));
vi.mock('./views/SeguridadView', () => ({ SeguridadView: stub('seguridad') }));
vi.mock('./views/MasterView', () => ({ MasterView: stub('master') }));
vi.mock('./views/AdminView', () => ({ AdminView: stub('admin') }));
vi.mock('./views/ResidenciaView', () => ({ ResidenciaView: stub('residencia') }));
vi.mock('./views/CalidadView', () => ({ CalidadView: stub('calidad') }));
vi.mock('./views/AlmacenView', () => ({ AlmacenView: stub('almacen') }));
vi.mock('./views/ContabilidadView', () => ({ default: stub('contabilidad') }));

describe('App — guard sin proyecto activo', () => {
  it('los módulos project-scoped muestran "Proyecto activo requerido" y no montan la vista', async () => {
    getClientes.mockResolvedValue({ data: { data: [] } });
    render(<App />);
    for (const vista of ['compras', 'insumos', 'residencia', 'control-obra', 'seguridad']) {
      fireEvent.click(screen.getByText(`ir-${vista}`));
      expect(await screen.findByText('Proyecto activo requerido'), vista).toBeInTheDocument();
      expect(screen.queryByText(`vista-${vista}`), vista).not.toBeInTheDocument();
    }
  });

  it('Ventas no se bloquea globalmente: monta VentasView (Clientes) sin proyecto', async () => {
    getClientes.mockResolvedValue({ data: { data: [] } });
    render(<App />);
    fireEvent.click(screen.getByText('ir-ventas'));
    expect(await screen.findByRole('button', { name: /^Clientes/ })).toBeInTheDocument();
    expect(screen.queryByText('Proyecto activo requerido')).not.toBeInTheDocument();
  });
});
