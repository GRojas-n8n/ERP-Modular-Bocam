/**
 * Validación única de montos de dinero en Finanzas: número finito, mayor a 0 y con máximo 2 decimales.
 * La usan el egreso de OCs (egreso-oc.ts) y los movimientos y transferencias presupuestales
 * (presupuesto-blindado.ts). openspec: blindar-movimientos-y-sincronizacion-gt.
 */
import { Prisma } from './generated/prisma';

export type Dec = Prisma.Decimal;
export const Decimal = Prisma.Decimal;

/** Con error, `motivo` trae el mensaje; sin error, `monto` trae el valor. Se comprueba con `if (r.motivo)`. */
export type ResultadoMonto = { monto: Dec; motivo?: undefined } | { monto?: undefined; motivo: string };

export function parsearMontoPositivo(valor: unknown, campo: string): ResultadoMonto {
  if (valor === null || valor === undefined || valor === '') return { motivo: `${campo} es obligatorio.` };
  if (typeof valor !== 'number' && typeof valor !== 'string') return { motivo: `${campo} no es un número válido.` };
  let d: Dec;
  try {
    d = new Decimal(String(valor));
  } catch {
    return { motivo: `${campo} no es un número válido.` };
  }
  if (!d.isFinite() || d.lte(0)) return { motivo: `${campo} debe ser mayor a 0.` };
  if (d.decimalPlaces() > 2) return { motivo: `${campo} admite máximo 2 decimales.` };
  return { monto: d };
}
