// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Clasificación: Estrictamente Confidencial.
// -----------------------------------------------------------------------------
// Módulo: Contabilidad — Autenticación del callback de integración SAT
//
// Los 3 endpoints en /integraciones/sat/* (claim-dispatch, callback,
// failure-callback) están exentos de JWT (INTEGRATION_CALLBACK_PATHS en
// main.ts) porque su llamador legítimo es el propio worker de contabilidad
// (sat-worker.ts), no un usuario con sesión. Se autentican en su lugar con un
// único secreto compartido de proceso.
//
// HISTORIA (fix-auth-callbacks-sat-contabilidad, 2026-07-27): hasta este
// change, `getSatCallbackSecret()` caía a `SAT_ADAPTER_API_KEY` (la credencial
// que usamos para llamar HACIA AFUERA al adaptador SAT externo) si
// `SAT_CALLBACK_SHARED_SECRET` no estaba configurado, y la comparación era
// `!==` (no constante en tiempo). Este módulo corrige ambas cosas:
// - SIN fallback: `SAT_CALLBACK_SHARED_SECRET` es obligatorio y exclusivo.
// - Comparación en tiempo constante vía SHA-256 + `timingSafeEqual`.
// -----------------------------------------------------------------------------

import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { createApiError } from './types';
import { getCorrelationId } from '../../../packages/observability/src';

/**
 * Secreto compartido para los callbacks del worker SAT hacia esta API.
 * Deliberadamente SIN fallback a `SAT_ADAPTER_API_KEY` — esa es la credencial
 * saliente hacia el adaptador externo; reusarla como credencial entrante
 * colapsa dos límites de confianza distintos en un solo valor.
 */
export function getSatCallbackSecret(): string {
  return process.env.SAT_CALLBACK_SHARED_SECRET || '';
}

/**
 * Compara dos valores en tiempo constante. Hashea ambos lados con SHA-256
 * ANTES de `timingSafeEqual` para que los buffers comparados midan siempre
 * 32 bytes — evita el error común de comparar `.length` primero (que además
 * de reintroducir un canal lateral, sería necesario porque `timingSafeEqual`
 * lanza `RangeError` si los buffers no miden lo mismo).
 */
export function safeSecretEquals(provided: unknown, expected: unknown): boolean {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false;
  if (expected.length === 0) return false;
  const a = createHash('sha256').update(provided, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(a, b);
}

/**
 * Middleware: exige el header `x-bocam-secret` y lo compara contra
 * `SAT_CALLBACK_SHARED_SECRET`. Reproduce la semántica que antes estaba
 * duplicada byte a byte en los 3 endpoints de callback SAT.
 */
export function requireSatCallbackSecret(req: Request, res: Response, next: NextFunction): void {
  const correlationId = getCorrelationId(req);
  const callbackSecret = getSatCallbackSecret();
  if (!callbackSecret) {
    res.status(503).json(createApiError('CONT_SAT_CALLBACK_NOT_CONFIGURED', 'No hay secreto configurado para callback SAT.', undefined, correlationId));
    return;
  }

  const providedSecret = req.header('x-bocam-secret');
  if (!safeSecretEquals(providedSecret, callbackSecret)) {
    res.status(401).json(createApiError('CONT_SAT_CALLBACK_UNAUTHORIZED', 'Callback SAT no autorizado.', undefined, correlationId));
    return;
  }

  next();
}
