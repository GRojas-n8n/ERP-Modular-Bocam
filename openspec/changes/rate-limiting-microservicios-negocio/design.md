## Context

`apps/auth/src/main.ts` ya implementa un patrón de rate limiting probado en
producción: `makeLimiter(max)` crea un `express-rate-limit` con ventana fija de
15 minutos, usando `RedisStore` (paquete `rate-limit-redis`) cuando `REDIS_URL`
está configurado, y cayendo a la `MemoryStore` por defecto de `express-rate-limit`
si no lo está — sin bloquear el arranque del servicio ni intentar reconectar
indefinidamente (`reconnectStrategy` limitado a 3 intentos). El mismo `redisClient`
de Node ya se usa para otras cosas en `auth`; en los otros 11 servicios no existe
ninguna conexión a Redis para rate limiting hoy.

Los 11 microservicios sin rate limiting comparten la misma forma de arranque
(`express()`, `app.use(createAuthMiddleware(...))`, luego las rutas) — es la
superficie de inserción natural para el limiter nuevo, igual que ya se hizo con
`createAuthMiddleware`.

## Goals / Non-Goals

**Goals:**
- Un límite de aplicación mínimo, uniforme y mecánico en los 11 microservicios que
  hoy no tienen ninguno, sin reimplementar la lógica de Redis/fallback por servicio.
- Reusar exactamente el mismo comportamiento observado en `auth` (ventana, fallback,
  respuesta 429, headers estándar) para no introducir un segundo patrón a mantener.
- Dejar el paquete lo bastante configurable para que cada servicio pueda ajustar su
  máximo de peticiones más adelante sin tocar la lógica compartida.

**Non-Goals:**
- No se diseñan límites por-ruta finos en esta iteración (ej. un límite distinto
  para "crear orden de compra" vs "listar catálogo"). Se aplica un límite general
  por servicio; el ajuste fino queda como trabajo de seguimiento una vez que haya
  datos reales de tráfico por endpoint.
- No se toca el rate limiting ya existente en `auth`/`asistente`.
- No se agrega rate limiting a nivel de Caddy/reverse proxy — se evalúa aparte si
  el límite de aplicación resulta insuficiente.
- No se audita ni cambia el rol de conexión de Redis ni su configuración de
  persistencia — se usa la misma instancia ya desplegada.

## Decisions

**1. Paquete compartido `packages/rate-limiter`, no copiar/pegar 11 veces.**
Alternativa considerada: repetir `makeLimiter` en cada `main.ts` como se hizo en
`auth`. Se descarta porque ya hay precedente en el repo (`packages/auth-middleware`,
`packages/event-bus`, `packages/observability`) de extraer lógica transversal a un
paquete compartido en vez de duplicarla; 11 copias del mismo store de Redis serían
11 lugares distintos para arreglar el mismo bug.

**2. API del paquete: una función `createRateLimiter(options)` que retorna un
middleware Express**, con firma equivalente a `makeLimiter` de `auth` pero
parametrizable (`windowMs`, `max`, nombre del servicio para logs de error de
Redis). Cada servicio decide su propio `max` en su `main.ts`.

**3. Límite general por defecto: 300 peticiones / 15 min por IP** para los 11
servicios de negocio. Es más permisivo que el límite de `auth` (`login`: 10/15min,
lectura maestra: 30/15min) porque estos son servicios de uso normal dentro de
jornada laboral con navegación de UI (múltiples requests por vista), no endpoints
de autenticación de alto riesgo. Alternativa considerada: copiar los límites de
`auth` tal cual — se descarta porque 30 req/15min bloquearía uso normal de un
dashboard con varios paneles cargando en paralelo.

**4. Un solo limiter global por servicio (`app.use`), no uno distinto por ruta.**
Mantiene el rollout mecánico e idéntico en los 11 servicios, consistente con que
esto es una brecha de plataforma (como RLS/nginx/base de datos en
`despliegue-completo-microservicios`), no una decisión de negocio caso por caso.

**5. Mismo comportamiento de fallo que `auth`: si Redis no está disponible, el
limiter sigue funcionando en memoria del proceso**, no se cae el servicio. Esto ya
está probado en producción vía `auth` y se hereda gratis al reusar el paquete.

## Risks / Trade-offs

- [Riesgo] Un límite general de 300/15min podría ser demasiado bajo para un uso
  legítimo intensivo (ej. importación masiva desde `reportes` o `almacen`) →
  Mitigación: el `max` es parametrizable por servicio desde el día uno; si algún
  servicio necesita un límite mayor, se ajusta en su `main.ts` sin tocar el paquete.
- [Riesgo] `MemoryStore` de fallback no comparte estado entre réplicas si algún
  servicio llega a correr con más de un contenedor → Mitigación: hoy todos los
  servicios corren en una sola réplica en `docker-compose.vps.yml`; documentar la
  limitación en el README del paquete para cuando eso cambie.
- [Trade-off] Un límite global por servicio (en vez de por-ruta) no distingue entre
  un endpoint de lectura barato y uno de escritura costoso → aceptado como punto de
  partida; el ajuste fino queda fuera de alcance (ver Non-Goals).

## Migration Plan

1. Crear `packages/rate-limiter` con tests unitarios (fallback a memoria sin
   `REDIS_URL`, uso de `RedisStore` con `REDIS_URL`, respuesta 429 con el código de
   error estándar del proyecto).
2. Aplicar el paquete en un microservicio piloto (`compras`, por ser el de mayor
   tráfico documentado) y verificar en local que no rompe el flujo normal de la UI.
3. Rodar al resto de los 10 microservicios restantes, uno por uno, con su propio
   commit/PR o agrupados — a decidir en `tasks.md`.
4. Sin rollback especial necesario: revertir es quitar la línea `app.use(...)` de
   cada servicio; no hay migración de datos ni cambio de schema involucrado.

## Open Questions

- ¿El límite de 300/15min por IP es correcto para todos los servicios por igual, o
  `reportes`/`almacen` (que manejan archivos grandes) necesitan un límite distinto
  desde el arranque? Se deja como decisión a validar durante el rollout, servicio
  por servicio, en vez de bloquear la propuesta completa.
