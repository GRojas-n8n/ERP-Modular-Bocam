/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Paquete: @bocam/rate-limiter — Tipos públicos.
 * ---------------------------------------------------------------------------
 */

export interface RateLimiterOptions {
  /** Ventana de tiempo en milisegundos. Por defecto 15 minutos. */
  windowMs?: number;
  /** Máximo de peticiones por IP dentro de la ventana. Obligatorio. */
  max: number;
  /**
   * Nombre del microservicio, usado únicamente para prefijar los logs de
   * error/advertencia de la conexión a Redis (ej. '[compras] Redis rate-limit error').
   * Por defecto 'rate-limiter'.
   */
  serviceName?: string;
  /**
   * Override explícito de la URL de Redis. Por defecto se lee de
   * `process.env.REDIS_URL`. Pensado principalmente para tests — en
   * producción no se debe usar, se deja que cada servicio configure
   * REDIS_URL en su entorno.
   */
  redisUrl?: string;
}
