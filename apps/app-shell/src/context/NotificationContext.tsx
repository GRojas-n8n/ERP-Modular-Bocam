import React, { createContext, useCallback, useContext, useState } from 'react';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Notificaciones globales — Toast / Banner inter-módulo
 * ---------------------------------------------------------------------------
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

interface NotificationCtx {
  toasts: Toast[];
  notify: (opts: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationCtx | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = useCallback(
    (opts: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = opts.duration ?? 4500;
      const toast: Toast = { ...opts, id, duration };
      // Máximo 4 toasts visibles simultáneamente
      setToasts(prev => [...prev.slice(-3), toast]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <NotificationContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationCtx => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de <NotificationProvider>');
  return ctx;
};
