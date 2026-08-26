/**
 * ---------------------------------------------------------------------------
 * Helper de validación de entrada — spec:
 * openspec/changes/fix-500-importar-insumos-explosion-apu/
 *
 * Copiado de apps/compras/src/validation/parse-or-respond.ts (mismo origen:
 * apps/auth/src/validation/parse-or-respond.ts, ver
 * openspec/changes/archive/2026-08-20-validacion-zod-endpoints-auth), sin
 * adaptación — `createApiError`/`ApiResponse` de apps/gerencia-tecnica/src/types.ts
 * tienen el mismo shape (`success`, `error.code/message/details`, `meta`) que
 * auth/personal/compras.
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
