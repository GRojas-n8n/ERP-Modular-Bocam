import { useEffect, useRef } from 'react';

// Ver openspec/changes/sesion-jwt-inactividad. Señales de actividad real del
// usuario — no incluye tráfico HTTP (eso ya lo cubre el refresh reactivo del
// interceptor de api.ts, que es un mecanismo distinto y complementario).
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'] as const;

/**
 * Dispara onTimeout tras `timeoutMinutes` minutos sin actividad del usuario
 * (mousemove/keydown/click/scroll). Cualquier actividad reinicia el
 * temporizador. Sin efecto si `enabled` es false (ej. usuario no
 * autenticado).
 */
export function useInactivityLogout(enabled: boolean, timeoutMinutes: number, onTimeout: () => void): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref para el callback: evita que un onTimeout inline recreado en cada
  // render reinicie el efecto (y por tanto el temporizador) sin que el
  // usuario haya hecho nada.
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!enabled) return undefined;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onTimeoutRef.current(), timeoutMinutes * 60 * 1000);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [enabled, timeoutMinutes]);
}
