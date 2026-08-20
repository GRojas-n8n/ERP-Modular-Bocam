## ADDED Requirements

### Requirement: El sistema SHALL proveer un paquete compartido de rate limiting reusable por todos los microservicios
El repositorio SHALL exponer un paquete `packages/rate-limiter` con una función
`createRateLimiter(options)` que retorna un middleware Express de rate limiting,
respaldado por Redis (`REDIS_URL`) cuando esté disponible, con fallback automático
a almacenamiento en memoria del proceso cuando `REDIS_URL` no esté configurado —
sin bloquear el arranque del servicio ni reintentar la conexión indefinidamente.

#### Scenario: REDIS_URL configurado
- **WHEN** un microservicio arranca con `REDIS_URL` definido y usa
  `createRateLimiter(...)`
- **THEN** el límite de peticiones se aplica usando `RedisStore`, compartiendo
  estado entre reinicios del proceso dentro de la ventana de tiempo configurada

#### Scenario: REDIS_URL no configurado
- **WHEN** un microservicio arranca sin `REDIS_URL` y usa `createRateLimiter(...)`
- **THEN** el límite de peticiones se aplica usando almacenamiento en memoria del
  proceso, el servicio arranca normalmente, y no se intenta ninguna conexión a
  Redis

### Requirement: Toda petición que exceda el límite configurado SHALL recibir una respuesta 429 estandarizada
El middleware de rate limiting SHALL responder con código HTTP 429 y un cuerpo JSON
con la forma estándar de error del proyecto (`success: false`, `error.code`,
`error.message`) cuando una IP exceda el máximo de peticiones configurado dentro de
la ventana de tiempo.

#### Scenario: Límite excedido
- **WHEN** una IP realiza más peticiones que el `max` configurado dentro de la
  ventana de tiempo activa
- **THEN** las peticiones adicionales dentro de esa ventana SHALL responder 429 con
  `error.code: 'RATE_LIMIT_EXCEEDED'`, sin llegar al handler de la ruta
