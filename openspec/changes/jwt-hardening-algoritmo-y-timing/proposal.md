## Why

Una auditoría de seguridad (2026-08-06) encontró dos debilidades menores pero
concretas en la capa de autenticación, ambas de bajo esfuerzo de corrección:

1. `packages/auth-middleware/src/middleware.ts` llama `jwt.verify(token, jwtSecret)`
   sin pasar `algorithms` explícito. La librería `jsonwebtoken` infiere un algoritmo
   seguro por el tipo de la clave (string → familia HMAC) y no acepta `alg: none`,
   por lo que hoy no es explotable — pero depender de un default implícito de la
   librería en vez de declarar la política de firma explícitamente es una brecha de
   buena práctica que una futura actualización de dependencia o refactor podría
   debilitar sin que nadie lo note.
2. `apps/auth/src/main.ts` (`requireMasterSecret`) compara la clave maestra del API
   de administración de tenants con `secret !== MASTER_SECRET` — una comparación de
   string estándar de JavaScript que hace short-circuit en el primer carácter
   distinto, lo que en teoría permite un ataque de timing contra un secreto que
   protege la creación/baja de tenants completos.

## What Changes

- `createAuthMiddleware` (y cualquier otro `jwt.verify` del repo) SHALL pasar
  `algorithms: ['HS256']` explícito, para que un cambio futuro de configuración o
  de la librería no pueda ampliar silenciosamente qué algoritmos se aceptan.
- `requireMasterSecret` en `apps/auth/src/main.ts` SHALL comparar el secreto
  usando `crypto.timingSafeEqual` (con normalización de longitud previa para
  evitar que la propia comparación de longitudes filtre información) en vez de
  `!==`.
- Sin cambios de comportamiento observable para clientes legítimos — un token
  válido firmado con HS256 sigue aceptándose igual; un `MASTER_SECRET` correcto
  sigue autorizando igual.

## Capabilities

### Modified Capabilities
*(ninguna capability de negocio cambia de comportamiento — es hardening interno
  sin cambios de contrato observable)*

### New Capabilities
- `auth-verificacion-endurecida`: política explícita de algoritmo de firma JWT y
  comparación de tiempo constante para secretos administrativos.

## Impact

- **Modificado:** `packages/auth-middleware/src/middleware.ts` (agregar
  `algorithms: ['HS256']` a la llamada `jwt.verify`).
- **Modificado:** `apps/auth/src/main.ts` (`requireMasterSecret`, usar
  `crypto.timingSafeEqual`).
- **Sin cambios en:** frontend, otros microservicios (todos consumen
  `createAuthMiddleware` del mismo paquete, se benefician automáticamente sin
  tocar su propio código), schema de base de datos, eventos.
