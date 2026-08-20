## Why

Una auditoría de seguridad (2026-08-06) encontró que solo `auth` y `asistente` tienen
rate limiting real (ver `openspec/changes/archive/2026-06-02-auth-hardening`). Los
otros 11 microservicios de negocio (`almacen`, `calidad`, `compras`, `contabilidad`,
`control-proyectos`, `finanzas`, `gerencia-tecnica`, `personal`, `reportes`,
`seguridad`, `ventas`) no tienen ningún límite de peticiones por IP/usuario — ni a
nivel de aplicación, ni en Caddy/nginx. Cualquier endpoint autenticado o no queda
expuesto a scraping masivo, fuerza bruta contra parámetros de negocio, o abuso que
degrade el servicio para el resto de los tenants, sin ningún mecanismo de contención.
Redis ya está disponible en infraestructura (`REDIS_URL`), por lo que no se necesita
aprovisionar nada nuevo — solo aplicar el patrón que ya existe en `auth`.

## What Changes

- **NUEVO** paquete compartido `packages/rate-limiter` que extrae el patrón ya usado
  en `apps/auth/src/main.ts` (`makeLimiter`: `express-rate-limit` + `rate-limit-redis`
  con `RedisStore`, cayendo a `MemoryStore` si `REDIS_URL` no está configurado) para
  que los 13 microservicios lo consuman en vez de reimplementarlo.
- **MODIFICADOS** los 11 microservicios sin rate limiting: se agrega un limiter
  general de aplicación en `app.use()`, después del `createAuthMiddleware` existente,
  con límites a definir en `design.md`.
- Se agrega el requisito como capability transversal de plataforma en el spec ya
  existente `despliegue-completo-microservicios` — igual que la cobertura RLS — en
  vez de crear 11 specs de negocio idénticos por servicio.
- Fuera de alcance: cambiar los límites ya configurados en `auth`/`asistente`, y
  rate limiting a nivel de Caddy/proxy (se cubre por separado si se decide necesario).

## Capabilities

### New Capabilities
- `rate-limiting-negocio`: paquete compartido de rate limiting Redis-backed y su
  aplicación mínima obligatoria en todo microservicio de negocio del ERP.

### Modified Capabilities
- `despliegue-completo-microservicios`: se agrega un nuevo Requirement — todo
  microservicio de negocio SHALL aplicar rate limiting de aplicación a sus
  endpoints — como brecha de despliegue detectable, igual que las brechas de RLS,
  nginx y base de datos ya documentadas en ese spec.

## Impact

- **Nuevo:** `packages/rate-limiter/` (paquete TypeScript compartido, sin base de
  datos ni migración).
- **Modificado:** `apps/{almacen,calidad,compras,contabilidad,control-proyectos,
  finanzas,gerencia-tecnica,personal,reportes,seguridad,ventas}/src/main.ts` — cada
  uno agrega una línea `app.use(createRateLimiter(...))` y la dependencia del
  paquete nuevo en su `package.json`.
- **Dependencia nueva** por servicio: `@bocam/rate-limiter` (interno), que a su vez
  depende de `express-rate-limit` + `rate-limit-redis` (ya usados en `auth`).
- **Sin cambios en:** `auth`, `asistente` (ya cubiertos), frontend, RLS, eventos,
  schema de base de datos.
