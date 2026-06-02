# Proposal — Auth Hardening: Rate Limiting + Audit Log

## Why

El endpoint `POST /api/v1/master/tenants` (y los demás bajo `/master/`) protege el
aislamiento multi-tenant del sistema. Hoy su única defensa es un secret estático en el
header — sin rate limiting ni trazabilidad. Si el `MASTER_SECRET` se filtra (log de CI,
variable de entorno expuesta, shell history), un atacante puede crear tenants arbitrarios,
modificar configuraciones o hacer soft-delete de tenants reales sin dejar rastro.

Adicionalmente, el endpoint de login (`POST /api/v1/auth/login`) no tiene protección
contra fuerza bruta — un atacante puede probar passwords indefinidamente.

## What Changes

- **NUEVO** middleware `rateLimiter` basado en Redis (ya disponible en infraestructura)
  aplicado a `/master/*` (5 req/15 min por IP) y a `/auth/login` (10 req/15 min por IP).
- **NUEVA** tabla `MasterAuditLog` — registra cada llamada a `/master/*`: acción,
  `entity_id`, IP, user-agent, status de respuesta, timestamp.
- **MODIFICADOS** los 4 handlers de `/master/` para escribir en `MasterAuditLog` antes
  de retornar respuesta (incluyendo los fallidos).
- **NUEVO** endpoint `GET /api/v1/master/audit-log` para consultar el histórico de
  operaciones master (requiere `MASTER_SECRET`).

## Capabilities

### New Capabilities

- `rate-limiting-auth`: Rate limiting en Redis para `/master/*` y `/auth/login` con
  ventanas de tiempo configurables y respuesta `429 Too Many Requests`.
- `master-audit-log`: Tabla `MasterAuditLog` + escritura automática en todos los handlers
  de `/master/` + endpoint de consulta.

### Modified Capabilities

*(Ninguna spec existente cambia requisitos — son capacidades nuevas de seguridad)*

## Impact

- **Backend:** `apps/auth/` — schema Prisma (1 modelo nuevo), nuevo middleware rate
  limiter, modificación de 4 handlers existentes, 1 endpoint nuevo.
- **Dependencia nueva:** `express-rate-limit` + `rate-limit-redis` en `apps/auth/`.
- **Redis:** ya disponible en infraestructura (`REDIS_URL` en docker-compose).
- **Sin cambios en:** frontend, otros módulos, `api.ts`, eventos.
- **Sin migración de datos:** la tabla `MasterAuditLog` arranca vacía.
