import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useArrowKeyNav } from './useArrowKeyNav';

interface Item {
  id: string;
  label: string;
}

const items: Item[] = [
  { id: '1', label: 'uno' },
  { id: '2', label: 'dos' },
  { id: '3', label: 'tres' },
  { id: '4', label: 'cuatro' },
  { id: '5', label: 'cinco' },
];

function pressKey(key: string, target: Element = document.body) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
}

afterEach(() => {
  cleanup();
});

describe('useArrowKeyNav', () => {
  it('ArrowDown navega al siguiente item y ArrowUp al anterior', () => {
    const onNavigate = vi.fn();
    renderHook(() =>
      useArrowKeyNav({ enabled: true, items, currentId: '3', getId: (i: Item) => i.id, onNavigate })
    );

    pressKey('ArrowDown');
    expect(onNavigate).toHaveBeenCalledWith(items[3]);

    onNavigate.mockClear();
    pressKey('ArrowUp');
    expect(onNavigate).toHaveBeenCalledWith(items[1]);
  });

  it('no navega mas alla de los extremos de la lista', () => {
    const onNavigateUp = vi.fn();
    const { unmount } = renderHook(() =>
      useArrowKeyNav({ enabled: true, items, currentId: '1', getId: (i: Item) => i.id, onNavigate: onNavigateUp })
    );
    pressKey('ArrowUp');
    expect(onNavigateUp).not.toHaveBeenCalled();
    unmount();

    const onNavigateDown = vi.fn();
    renderHook(() =>
      useArrowKeyNav({ enabled: true, items, currentId: '5', getId: (i: Item) => i.id, onNavigate: onNavigateDown })
    );
    pressKey('ArrowDown');
    expect(onNavigateDown).not.toHaveBeenCalled();
  });

  it('ignora las flechas si el foco esta en un input/textarea/select', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const onNavigate = vi.fn();
    renderHook(() =>
      useArrowKeyNav({ enabled: true, items, currentId: '3', getId: (i: Item) => i.id, onNavigate })
    );

    pressKey('ArrowDown', input);
    expect(onNavigate).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('no dispara onNavigate ni lanza error si currentId no esta en items', () => {
    const onNavigate = vi.fn();
    renderHook(() =>
      useArrowKeyNav({ enabled: true, items, currentId: 'no-existe', getId: (i: Item) => i.id, onNavigate })
    );

    expect(() => pressKey('ArrowDown')).not.toThrow();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('enabled=false no registra el listener', () => {
    const onNavigate = vi.fn();
    renderHook(() =>
      useArrowKeyNav({ enabled: false, items, currentId: '3', getId: (i: Item) => i.id, onNavigate })
    );

    pressKey('ArrowDown');
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
