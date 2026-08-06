## ADDED Requirements

### Requirement: Todo microservicio de negocio SHALL aplicar rate limiting de aplicación a sus endpoints
Todo microservicio de negocio (cualquiera de `apps/` distinto de `auth` y `asistente`, que ya tienen su propio rate limiting específico) SHALL aplicar un middleware de rate limiting en `app.use()`, después del middleware de autenticación JWT, usando el paquete compartido `packages/rate-limiter`. Un microservicio de negocio sin ningún rate limiting aplicado SHALL considerarse una brecha de despliegue, detectable de la misma forma que las brechas de RLS, nginx y base de datos ya documentadas en este spec.

#### Scenario: Microservicio de negocio sin rate limiting
- **WHEN** un microservicio en `apps/` (excluyendo `auth` y `asistente`) no tiene
  ningún middleware de rate limiting aplicado en su `app.use()`
- **THEN** se considera una brecha de seguridad de despliegue y SHALL corregirse
  aplicando `createRateLimiter(...)` del paquete compartido antes de considerarse
  listo para producción

#### Scenario: Microservicio de negocio con rate limiting aplicado
- **WHEN** un microservicio en `apps/` tiene `app.use(createRateLimiter(...))`
  aplicado después de `createAuthMiddleware(...)`
- **THEN** toda petición que exceda el límite configurado SHALL recibir 429 antes
  de llegar a cualquier handler de ruta, incluyendo rutas públicas no excluidas del
  rate limiter
