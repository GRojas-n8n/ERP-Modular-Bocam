import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@bocam/ui-core';

interface TableScrollShadowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Envuelve una tabla ancha en un contenedor con scroll horizontal y muestra
 * una sombra en el borde izquierdo/derecho cuando hay columnas ocultas de ese
 * lado — el scrollbar nativo por sí solo no es una señal suficientemente
 * visible de que hay más contenido desplazable.
 */
export function TableScrollShadow({ children, className }: TableScrollShadowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasHiddenLeft, setHasHiddenLeft] = useState(false);
  const [hasHiddenRight, setHasHiddenRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateShadows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setHasHiddenLeft(scrollLeft > 0);
      setHasHiddenRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    updateShadows();
    el.addEventListener('scroll', updateShadows);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateShadows);
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', updateShadows);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={scrollRef} className={cn('overflow-x-auto', className)}>
        {children}
      </div>
      {hasHiddenLeft && (
        <div
          aria-hidden="true"
          data-testid="table-scroll-shadow-left"
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent"
        />
      )}
      {hasHiddenRight && (
        <div
          aria-hidden="true"
          data-testid="table-scroll-shadow-right"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent"
        />
      )}
    </div>
  );
}
