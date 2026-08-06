/**
 * ---------------------------------------------------------------------------
 * Helper de validación de entrada — spec:
 * openspec/changes/validacion-zod-endpoints-auth/specs/validacion-entrada-zod/
 *
 * Ejecuta `schema.safeParse(data)` y, si falla, responde 400 en el formato de
 * error estándar del proyecto (`success: false`, `error.code`, `error.message`,
 * `error.details`) — consistente con las respuestas 401 de auth-middleware y
 * 429 de los rate limiters de este mismo servicio (ver main.ts).
 *
 * `safeParse`, no `parse` con try/catch: una entrada inválida es una respuesta
 * HTTP normal, no una condición excepcional (ver design.md, Decisión 4).
 * ---------------------------------------------------------------------------
 */

import type { Response } from 'express';
import type { ZodType } from 'zod';

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

  res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'La solicitud no cumple el formato esperado.',
      details,
    },
  });

  return undefined;
}
