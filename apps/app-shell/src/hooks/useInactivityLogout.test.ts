import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInactivityLogout } from './useInactivityLogout';

describe('useInactivityLogout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dispara onTimeout tras el timeout configurado sin actividad', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityLogout(true, 15, onTimeout));

    vi.advanceTimersByTime(15 * 60 * 1000 - 1);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('un evento de actividad (mousemove) reinicia el temporizador antes del timeout', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityLogout(true, 15, onTimeout));

    vi.advanceTimersByTime(10 * 60 * 1000);
    window.dispatchEvent(new Event('mousemove'));

    // Si no se hubiera reiniciado, el timeout original (a los 15 min) ya
    // habría pasado en este punto (10 + 6 = 16 min).
    vi.advanceTimersByTime(6 * 60 * 1000);
    expect(onTimeout).not.toHaveBeenCalled();

    // Pero 15 min después del reinicio (a los 10 min), sí debe disparar.
    vi.advanceTimersByTime(9 * 60 * 1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('un evento de teclado (keydown) también reinicia el temporizador', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityLogout(true, 15, onTimeout));

    vi.advanceTimersByTime(14 * 60 * 1000);
    window.dispatchEvent(new Event('keydown'));
    vi.advanceTimersByTime(14 * 60 * 1000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('enabled=false nunca dispara onTimeout, sin importar el tiempo transcurrido', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityLogout(false, 15, onTimeout));

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('desmontar el hook limpia el temporizador (no dispara onTimeout tras desmontar)', () => {
    const onTimeout = vi.fn();
    const { unmount } = renderHook(() => useInactivityLogout(true, 15, onTimeout));

    unmount();
    vi.advanceTimersByTime(20 * 60 * 1000);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
