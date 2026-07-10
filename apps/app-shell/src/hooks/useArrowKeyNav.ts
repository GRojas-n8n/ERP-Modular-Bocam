import { useEffect, useRef } from 'react';

const TEXT_INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

interface UseArrowKeyNavParams<T> {
  enabled: boolean;
  items: T[];
  currentId: string | null;
  getId: (item: T) => string;
  onNavigate: (item: T) => void;
}

/**
 * Navegación con ArrowUp/ArrowDown sobre una lista de catálogo (sin
 * wrap-around). Ver openspec/changes/navegacion-teclado-catalogos.
 */
export function useArrowKeyNav<T>({ enabled, items, currentId, getId, onNavigate }: UseArrowKeyNavParams<T>): void {
  const paramsRef = useRef({ items, currentId, getId, onNavigate });
  paramsRef.current = { items, currentId, getId, onNavigate };

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      if (activeTag && TEXT_INPUT_TAGS.has(activeTag)) return;

      const { items: currentItems, currentId: currentCurrentId, getId: currentGetId, onNavigate: currentOnNavigate } = paramsRef.current;
      if (currentCurrentId === null) return;

      const index = currentItems.findIndex(item => currentGetId(item) === currentCurrentId);
      if (index === -1) return;

      const nextIndex = event.key === 'ArrowDown' ? index + 1 : index - 1;
      if (nextIndex < 0 || nextIndex >= currentItems.length) return;

      currentOnNavigate(currentItems[nextIndex]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
