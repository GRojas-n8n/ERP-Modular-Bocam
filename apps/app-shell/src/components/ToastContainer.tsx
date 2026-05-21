import React, { useEffect, useState } from 'react';
import { useNotification, Toast, ToastType } from '../context/NotificationContext';
import {
  IconCheckCircle2,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfo,
  IconX,
} from './Icons';
import { cn } from '@bocam/ui-core';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * ToastContainer — Notificaciones visuales globales (top-right)
 * ---------------------------------------------------------------------------
 */

// ── Estilos por tipo ──────────────────────────────────────────────────────────

const TOAST_STYLES: Record<
  ToastType,
  { bar: string; iconCls: string; border: string; Icon: React.FC<{ className?: string }> }
> = {
  success: {
    bar: 'bg-emerald-500',
    iconCls: 'text-emerald-500',
    border: 'border-emerald-500/25',
    Icon: IconCheckCircle2,
  },
  error: {
    bar: 'bg-red-500',
    iconCls: 'text-red-500',
    border: 'border-red-500/25',
    Icon: IconAlertCircle,
  },
  warning: {
    bar: 'bg-amber-500',
    iconCls: 'text-amber-500',
    border: 'border-amber-500/25',
    Icon: IconAlertTriangle,
  },
  info: {
    bar: 'bg-sky-500',
    iconCls: 'text-sky-500',
    border: 'border-sky-500/25',
    Icon: IconInfo,
  },
};

// ── Toast individual ──────────────────────────────────────────────────────────

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { dismiss } = useNotification();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const s = TOAST_STYLES[toast.type];
  const { Icon } = s;

  // Slide-in al montar
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(t);
  }, []);

  // Fade-out un poco antes del dismiss real
  useEffect(() => {
    const leaveDelay = toast.duration - 400;
    const t = setTimeout(() => setLeaving(true), leaveDelay > 0 ? leaveDelay : 100);
    return () => clearTimeout(t);
  }, [toast.duration]);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => dismiss(toast.id), 300);
  };

  return (
    <div
      className={cn(
        'relative flex w-80 min-w-[20rem] overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/20',
        'transition-all duration-300 ease-out',
        s.border,
        visible && !leaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-8 opacity-0',
      )}
    >
      {/* Barra lateral de color */}
      <div className={cn('w-1 flex-shrink-0 rounded-l-2xl', s.bar)} />

      {/* Contenido */}
      <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
        <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', s.iconCls)} />
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <p className="text-xs font-bold leading-tight text-foreground">{toast.title}</p>
          {toast.message && (
            <p className="text-[11px] leading-snug text-muted-foreground">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-1 mt-0.5 flex-shrink-0 rounded-md p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground"
          aria-label="Cerrar"
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Barra de progreso */}
      <div
        className={cn('absolute bottom-0 left-1 right-0 h-[2px] origin-left', s.bar, 'opacity-30')}
        style={{
          animation: `shrink ${toast.duration}ms linear forwards`,
        }}
      />

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

// ── Contenedor raíz ───────────────────────────────────────────────────────────

export const ToastContainer: React.FC = () => {
  const { toasts } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col items-end gap-2"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
};
