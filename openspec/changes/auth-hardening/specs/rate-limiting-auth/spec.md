# Spec: Rate Limiting Auth

## CA-1 — 429 en exceso de límite
- Cuando un IP supera el límite de requests en la ventana de tiempo, el servidor responde `429 Too Many Requests` con body `{ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', ... } }`.
- El header `Retry-After` indica los segundos hasta que se libera la ventana.

## CA-2 — Límites por endpoint
- `POST /master/tenants` y `DELETE /master/tenants/:id`: 5 req / 15 min por IP.
- `PATCH /master/tenants/:id`: 10 req / 15 min por IP.
- `GET /master/tenants`: 30 req / 15 min por IP.
- `POST /auth/login`: 10 req / 15 min por IP.
- `POST /auth/refresh`: 20 req / 15 min por IP.

## CA-3 — Persistencia en Redis
- Los contadores de rate limit se almacenan en Redis. Un reinicio del contenedor auth NO resetea los contadores.
- La key en Redis sigue el formato: `rl:{endpoint_prefix}:{ip}`.

## CA-4 — Degradación elegante
- Si Redis no está disponible al recibir la request, el rate limiter usa memoria local como fallback.
- Se loguea un warning: `[Auth] Redis no disponible — usando rate limiter en memoria`.
- El sistema sigue funcionando (no retorna 503 por falta de Redis).

## CA-5 — IP real detrás de proxy
- `app.set('trust proxy', 1)` activo para leer `X-Forwarded-For` de Caddy.
- El rate limiting aplica sobre el IP original del cliente, no sobre el IP interno de Caddy.
