import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TableScrollShadow } from './TableScrollShadow';

/**
 * jsdom no calcula layout real, así que scrollWidth/clientWidth/scrollLeft
 * se simulan manualmente sobre el div con overflow-x-auto (primer <div> del
 * wrapper) y se dispara un evento 'scroll' para forzar el recálculo del
 * componente, que en producción correría con el layout real del navegador.
 */
function mockScrollMetrics(el: HTMLElement, metrics: { scrollLeft: number; scrollWidth: number; clientWidth: number }) {
  Object.defineProperty(el, 'scrollLeft', { value: metrics.scrollLeft, configurable: true });
  Object.defineProperty(el, 'scrollWidth', { value: metrics.scrollWidth, configurable: true });
  Object.defineProperty(el, 'clientWidth', { value: metrics.clientWidth, configurable: true });
}

function getScrollContainer(container: HTMLElement): HTMLElement {
  const el = container.querySelector('.overflow-x-auto');
  if (!el) throw new Error('No se encontró el contenedor con overflow-x-auto');
  return el as HTMLElement;
}

describe('TableScrollShadow', () => {
  it('no muestra ninguna sombra cuando la tabla cabe completa en el ancho visible', () => {
    const { container } = render(
      <TableScrollShadow>
        <table>
          <tbody>
            <tr><td>fila</td></tr>
          </tbody>
        </table>
      </TableScrollShadow>,
    );
    const el = getScrollContainer(container);
    mockScrollMetrics(el, { scrollLeft: 0, scrollWidth: 300, clientWidth: 300 });
    fireEvent.scroll(el);

    expect(screen.queryByTestId('table-scroll-shadow-left')).not.toBeInTheDocument();
    expect(screen.queryByTestId('table-scroll-shadow-right')).not.toBeInTheDocument();
  });

  it('muestra la sombra derecha cuando hay columnas ocultas a la derecha en la posición inicial', () => {
    const { container } = render(
      <TableScrollShadow>
        <table>
          <tbody>
            <tr><td>fila ancha</td></tr>
          </tbody>
        </table>
      </TableScrollShadow>,
    );
    const el = getScrollContainer(container);
    mockScrollMetrics(el, { scrollLeft: 0, scrollWidth: 1000, clientWidth: 300 });
    fireEvent.scroll(el);

    expect(screen.getByTestId('table-scroll-shadow-right')).toBeInTheDocument();
    expect(screen.queryByTestId('table-scroll-shadow-left')).not.toBeInTheDocument();
  });

  it('oculta la sombra derecha al desplazar la tabla hasta el final', () => {
    const { container } = render(
      <TableScrollShadow>
        <table>
          <tbody>
            <tr><td>fila ancha</td></tr>
          </tbody>
        </table>
      </TableScrollShadow>,
    );
    const el = getScrollContainer(container);
    mockScrollMetrics(el, { scrollLeft: 700, scrollWidth: 1000, clientWidth: 300 });
    fireEvent.scroll(el);

    expect(screen.queryByTestId('table-scroll-shadow-right')).not.toBeInTheDocument();
  });

  it('muestra la sombra izquierda cuando el usuario desplazó la tabla desde el extremo izquierdo', () => {
    const { container } = render(
      <TableScrollShadow>
        <table>
          <tbody>
            <tr><td>fila ancha</td></tr>
          </tbody>
        </table>
      </TableScrollShadow>,
    );
    const el = getScrollContainer(container);
    mockScrollMetrics(el, { scrollLeft: 400, scrollWidth: 1000, clientWidth: 300 });
    fireEvent.scroll(el);

    expect(screen.getByTestId('table-scroll-shadow-left')).toBeInTheDocument();
    expect(screen.getByTestId('table-scroll-shadow-right')).toBeInTheDocument();
  });
});
