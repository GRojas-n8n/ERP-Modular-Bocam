/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Paquete: @bocam/rate-limiter
 * Archivo: rate-limiter.ts — Middleware Express de rate limiting general de
 * aplicación, respaldado por Redis con fallback a memoria del proceso.
 *
 * Extraído del patrón `makeLimiter` de `apps/auth/src/main.ts` (probado en
 * producción) para que los demás microservicios de negocio lo reutilicen en
 * vez de reimplementar la lógica de conexión a Redis.
 *
 * COMPORTAMIENTO:
 * - Si `REDIS_URL` (o `options.redisUrl`) está configurado, el límite se
 *   respalda en Redis vía `RedisStore`, compartiendo estado entre reinicios
 *   del proceso.
 * - Si no está configurado, NO se intenta ninguna conexión a Redis — el
 *   límite se aplica con la `MemoryStore` por defecto de `express-rate-limit`
 *   (memoria del proceso).
 * - La conexión a Redis, cuando aplica, se dispara en segundo plano
 *   (fire-and-forget) con `reconnectStrategy` limitado a 3 intentos: nunca
 *   bloquea el arranque del servicio ni reintenta indefinidamente.
 * ---------------------------------------------------------------------------
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import type { Request, RequestHandler, Response } from 'express';
import type { RateLimiterOptions } from './types';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REDIS_RECONNECT_ATTEMPTS = 3;
const REDIS_RECONNECT_DELAY_MS = 500;

/** Subconjunto mínimo del cliente de `redis` que este módulo necesita. Permite
 * inyectar un doble de prueba sin depender de una conexión real a Redis. */
export interface MinimalRedisClient {
  on(event: 'error', listener: (err: Error) => void): unknown;
  connect(): Promise<unknown>;
  sendCommand(args: string[]): Promise<unknown>;
  /** No-op en el doble de prueba; en el cliente real evita que la conexión
   * mantenga vivo el proceso cuando no queda ningún otro handle activo. */
  unref?(): unknown;
}

export interface RateLimiterDeps {
  createClient: (config: { url: string; socket: { reconnectStrategy: (retries: number) => number | false } }) => MinimalRedisClient;
}

const defaultDeps: RateLimiterDeps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createClient: (config) => createClient(config) as any,
};

function buildRateLimitHandler(windowMs: number) {
  const retryAfterSeconds = Math.ceil(windowMs / 1000);
  const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
  return (_req: Request, res: Response) =>
    void res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Demasiadas solicitudes. Intenta de nuevo en ${retryAfterMinutes} minuto(s).`,
        retry_after_seconds: retryAfterSeconds,
      },
    });
}

/**
 * Crea un middleware Express de rate limiting general, respaldado por Redis
 * cuando `REDIS_URL` está disponible, con fallback automático a memoria.
 *
 * @param options - `max` es obligatorio; `windowMs` por defecto 15 minutos.
 * @param deps - Solo para tests: permite inyectar una fábrica de cliente Redis.
 * @returns Middleware de Express listo para usar con `app.use()`, DESPUÉS
 * del middleware de autenticación JWT (`createAuthMiddleware`).
 *
 * @example
 * ```typescript
 * import { createRateLimiter } from '@bocam/rate-limiter';
 *
 * app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));
 * app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300, serviceName: 'compras' }));
 * ```
 */
export function createRateLimiter(options: RateLimiterOptions, deps: RateLimiterDeps = defaultDeps): RequestHandler {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const serviceName = options.serviceName ?? 'rate-limiter';
  const redisUrl = (options.redisUrl ?? process.env.REDIS_URL)?.trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any;

  if (redisUrl) {
    const redisClient = deps.createClient({
      url: redisUrl,
      socket: {
        // Máximo 3 reintentos con 500ms entre ellos — nunca bloquea el arranque
        // ni reintenta indefinidamente (mismo patrón que apps/auth/src/main.ts).
        reconnectStrategy: (retries) => (retries >= MAX_REDIS_RECONNECT_ATTEMPTS ? false : REDIS_RECONNECT_DELAY_MS),
      },
    });

    redisClient.on('error', (err: Error) =>
      console.error(`[${serviceName}] Redis rate-limit error:`, err.message)
    );

    // unref() (node-redis v4): esta conexión es una mejora opcional, no debe
    // impedir que el proceso salga por sí mismo si no queda ningún otro
    // handle activo — relevante sobre todo para scripts/tests que arrancan
    // la app directamente (sin esto, el proceso queda colgado para siempre
    // aunque todo el trabajo haya terminado). En servidores de producción no
    // cambia nada: el propio listener HTTP ya mantiene el proceso vivo.
    redisClient.unref?.();

    // Fire-and-forget: no se hace `await` de esta conexión. node-redis encola
    // los comandos emitidos antes de que el socket termine de conectar, así
    // que no es necesario bloquear el arranque del servicio para usar el
    // limiter de inmediato.
    redisClient.connect().catch((err: Error) => {
      console.warn(
        `[${serviceName}] Redis no disponible para rate limiting — ver logs de conexión.`,
        err.message
      );
    });

    store = new RedisStore({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sendCommand: (...args: string[]) => redisClient.sendCommand(args) as any,
    });
  }

  return rateLimit({
    windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    handler: buildRateLimitHandler(windowMs),
  });
}
