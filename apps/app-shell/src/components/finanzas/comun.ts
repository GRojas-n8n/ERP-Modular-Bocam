/** Utilidades compartidas por las secciones de Finanzas (openspec: pantalla-egreso-multiproveedor). */

export interface CuentaBancaria {
  id_cuenta: string;
  alias: string;
  banco: string;
  saldo: number;
}

export const formatoMoneda = (monto: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);

/** Mensaje del formato único de errores de Finanzas ({ error: { code, message } }), con respaldo al formato anterior. */
export function mensajeDeError(err: any, porDefecto: string): string {
  return err?.response?.data?.error?.message ?? err?.response?.data?.message ?? porDefecto;
}

/** Monto positivo con máximo 2 decimales; null si no es válido. */
export function montoValido(texto: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(texto.trim())) return null;
  const n = Number(texto);
  return n > 0 ? n : null;
}

export const redondear2 = (n: number) => Math.round(n * 100) / 100;

export const hoyIso = () => new Date().toISOString().slice(0, 10);

export const CLASE_CAMPO = 'w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm';
export const CLASE_ETIQUETA = 'mb-1 block text-[10px] font-black uppercase tracking-widest text-muted-foreground';
