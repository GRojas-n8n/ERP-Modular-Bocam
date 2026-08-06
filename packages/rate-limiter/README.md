# @bocam/rate-limiter

Middleware Express de rate limiting general de aplicación, compartido por
todos los microservicios de negocio del ecosistema BOCAM. Extraído del patrón
`makeLimiter` ya probado en producción en `apps/auth/src/main.ts`.

## Uso

```typescript
import { createRateLimiter } from '../../../packages/rate-limiter/src';

app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300, serviceName: 'compras' }));
```

Debe aplicarse en `app.use()` **después** del middleware de autenticación JWT
(`createAuthMiddleware`), como límite general para todo el servicio.

## Opciones

| Campo | Obligatorio | Default | Descripción |
|---|---|---|---|
| `max` | Sí | — | Máximo de peticiones por IP dentro de la ventana. |
| `windowMs` | No | `15 * 60 * 1000` (15 min) | Ventana de tiempo en milisegundos. |
| `serviceName` | No | `'rate-limiter'` | Prefijo de logs de error/advertencia de la conexión a Redis. |
| `redisUrl` | No | `process.env.REDIS_URL` | Override explícito, pensado para tests. |

## Comportamiento Redis / fallback a memoria

- Si `REDIS_URL` está configurado, el límite se respalda en `RedisStore`
  (paquete `rate-limit-redis`), compartiendo estado entre reinicios del
  proceso.
- Si `REDIS_URL` **no** está configurado, no se intenta ninguna conexión a
  Redis — el límite se aplica con la `MemoryStore` por defecto de
  `express-rate-limit` (memoria del proceso).
- La conexión a Redis se dispara en segundo plano (fire-and-forget) al crear
  el limiter, con `reconnectStrategy` limitado a 3 intentos (500ms entre cada
  uno). Nunca bloquea el arranque del servicio ni reintenta indefinidamente.

## ⚠️ Limitación de `MemoryStore` con múltiples réplicas

Cuando el limiter cae al fallback en memoria (`MemoryStore`), el conteo de
peticiones vive **dentro del proceso de Node** de esa réplica únicamente. Si
un microservicio llega a correr con más de un contenedor/réplica (p. ej.
`docker compose up --scale <servicio>=2`, o un despliegue con réplicas
horizontales), cada réplica lleva su propio contador independiente:

- El límite efectivo por IP se multiplica por el número de réplicas activas
  (ej. 2 réplicas con `max: 300` permiten hasta ~600 peticiones/ventana antes
  de que *todas* devuelvan 429 de forma consistente).
- El balanceo de peticiones entre réplicas hace el comportamiento no
  determinista: la misma IP puede recibir 200 en una réplica y 429 en otra
  para peticiones dentro de la misma ventana.

Hoy todos los microservicios corren en una sola réplica en
`docker-compose.vps.yml`, así que esto no es un problema activo. Si eso
cambia, hay que asegurar `REDIS_URL` configurado en ese servicio — con
`RedisStore` el conteo se comparte correctamente entre réplicas porque vive
en Redis, no en cada proceso.

## Tests

```bash
npm test -w @bocam/rate-limiter
```

Cubren: fallback a memoria sin `REDIS_URL` (sin intentar conexión a Redis),
uso de `RedisStore` con un cliente Redis mockeado (incluye verificación del
`reconnectStrategy` limitado a 3 intentos), y la forma estándar del cuerpo
JSON en una respuesta 429 (`success: false`, `error.code: 'RATE_LIMIT_EXCEEDED'`).
