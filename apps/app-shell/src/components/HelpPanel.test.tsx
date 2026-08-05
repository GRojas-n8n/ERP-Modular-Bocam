import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpPanel } from './HelpPanel';

describe('HelpPanel', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <HelpPanel viewId="almacen" activeSubView="inventario" isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el título del módulo y qué hace', () => {
    render(<HelpPanel viewId="almacen" activeSubView="inventario" isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /Almacén/ })).toBeInTheDocument();
    expect(screen.getByText(/Es principalmente de consulta/)).toBeInTheDocument();
  });

  it('muestra el flujo del proceso y los errores comunes', () => {
    render(<HelpPanel viewId="almacen" activeSubView="inventario" isOpen onClose={vi.fn()} />);
    expect(screen.getByText(/Compras recibe una Orden de Compra del proveedor/)).toBeInTheDocument();
    expect(screen.getByText(/Un egreso o salida a obra es rechazado/)).toBeInTheDocument();
  });

  it('abre expandida la sección de la pestaña activa y colapsadas las demás', () => {
    render(<HelpPanel viewId="almacen" activeSubView="movimientos" isOpen onClose={vi.fn()} />);
    const movimientos = screen.getByText('Movimientos').closest('details');
    const inventario = screen.getByText('Inventario').closest('details');
    expect(movimientos).toHaveProperty('open', true);
    expect(inventario).toHaveProperty('open', false);
  });

  it('cierra al presionar Escape', () => {
    const onClose = vi.fn();
    render(<HelpPanel viewId="almacen" activeSubView="inventario" isOpen onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('cierra al hacer clic en el botón de cerrar', () => {
    const onClose = vi.fn();
    render(<HelpPanel viewId="almacen" activeSubView="inventario" isOpen onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/cerrar/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no lanza excepción si el viewId no tiene ayuda registrada', () => {
    expect(() =>
      render(<HelpPanel viewId="modulo-inexistente" activeSubView="" isOpen onClose={vi.fn()} />)
    ).not.toThrow();
  });

  it('funciona para un módulo sin secciones en el nav (ej. ventas)', () => {
    render(<HelpPanel viewId="ventas" activeSubView="" isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /Ventas/ })).toBeInTheDocument();
  });
});
