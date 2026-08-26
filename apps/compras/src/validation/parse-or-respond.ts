/**
 * ---------------------------------------------------------------------------
 * Helper de validación de entrada — spec:
 * openspec/changes/fix-compras-validacion-longitud-proveedor/
 *
 * Copiado de apps/personal/src/validation/parse-or-respond.ts (mismo patrón
 * que apps/auth, ver openspec/changes/archive/2026-08-20-validacion-zod-endpoints-auth),
 * adaptado para usar el `createApiError` propio de este servicio
 * (apps/compras/src/types.ts) — mantiene el mismo formato de respuesta
 * (`success`, `error.code/message/details`, `meta`) que ya usa el resto de
 * compras.
 *
 * `safeParse`, no `parse` con try/catch: una entrada inválida es una respuesta
 * HTTP normal, no una condición excepcional.
 * ---------------------------------------------------------------------------
 */

import type { Response } from 'express';
import type { ZodType } from 'zod';
import { createApiError } from '../types';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Valida `data` contra `schema`. Si es válido, retorna los datos ya
 * parseados/normalizados por Zod (`Output`). Si no, escribe la respuesta 400
 * en `res` y retorna `undefined` — el handler que llama a este helper SHALL
 * retornar de inmediato cuando reciba `undefined`, sin tocar Prisma.
 */
export function parseOrRespond<Output>(
  schema: ZodType<Output>,
  data: unknown,
  res: Response
): Output | undefined {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  const details: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : '(root)',
    message: issue.message,
  }));

  res.status(400).json(createApiError('VALIDATION_ERROR', 'La solicitud no cumple el formato esperado.', details));

  return undefined;
}
