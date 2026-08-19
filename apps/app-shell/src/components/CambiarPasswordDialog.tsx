import React, { useState } from 'react';
import { changePasswordApi } from '../lib/api';

/**
 * Cambio de contraseña autoservicio.
 *
 * Hasta ahora no existía: todos los usuarios del piloto compartían la
 * contraseña de arranque sin forma de cambiarla salvo pidiéndoselo a un
 * administrador. Ver openspec/changes/cambio-password-y-logout.
 *
 * El servidor revoca todas las sesiones al cambiarla, así que al terminar hay
 * que cerrar sesión — de ahí `onCambioExitoso`, que el Layout usa para llevar
 * al usuario de vuelta al login.
 */

const LONGITUD_MINIMA = 12;

interface Props {
  onCerrar: () => void;
  onCambioExitoso: () => void;
}

export const CambiarPasswordDialog: React.FC<Props> = ({ onCerrar, onCambioExitoso }) => {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  // Se valida en el cliente solo lo que el usuario puede corregir sin ir al
  // servidor. La política real vive en apps/auth/src/password-policy.ts y es la
  // que manda: este chequeo evita un viaje de ida y vuelta, no lo sustituye.
  const coinciden = nueva === confirmacion;
  const suficienteLargo = nueva.trim().length >= LONGITUD_MINIMA;
  const puedeEnviar = actual.length > 0 && suficienteLargo && coinciden && !guardando;

  const enviar = async () => {
    setError(null);
    setGuardando(true);
    try {
      await changePasswordApi(actual, nueva);
      setListo(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message
        ?? err.response?.data?.message
        ?? 'No se pudo cambiar la contraseña. Intenta de nuevo.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cambiar-password-titulo"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-background p-6 shadow-xl">
        <h2 id="cambiar-password-titulo" className="mb-1 text-base font-black tracking-tight text-foreground">
          Cambiar contraseña
        </h2>

        {listo ? (
          <>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              Contraseña actualizada. Se cerraron todas tus sesiones, incluida esta:
              vuelve a entrar con la contraseña nueva.
            </p>
            <button
              onClick={onCambioExitoso}
              data-testid="ir-a-login"
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ir al inicio de sesión
            </button>
          </>
        ) : (
          <>
            <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
              Al cambiarla se cerrarán todas tus sesiones abiertas, en este y en otros
              dispositivos.
            </p>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Contraseña actual
                </span>
                <input
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  value={actual}
                  onChange={e => setActual(e.target.value)}
                  className="rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Contraseña nueva
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={nueva}
                  onChange={e => setNueva(e.target.value)}
                  className="rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className={`text-[10px] ${suficienteLargo || nueva.length === 0 ? 'text-muted-foreground' : 'text-amber-600'}`}>
                  Mínimo {LONGITUD_MINIMA} caracteres. Una frase que recuerdes funciona bien.
                </span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Repetir contraseña nueva
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmacion}
                  onChange={e => setConfirmacion(e.target.value)}
                  className="rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {confirmacion.length > 0 && !coinciden && (
                  <span className="text-[10px] text-amber-600">Las dos contraseñas no coinciden.</span>
                )}
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={onCerrar}
                className="flex-1 rounded-xl border border-border/40 px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Cancelar
              </button>
              <button
                onClick={() => void enviar()}
                disabled={!puedeEnviar}
                data-testid="confirmar-cambio-password"
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {guardando ? 'Guardando...' : 'Cambiar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
