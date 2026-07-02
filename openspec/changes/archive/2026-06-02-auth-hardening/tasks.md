# Tasks — Auth Hardening

## 1. Dependencias

- [x] 1.1 Agregar en `apps/auth/package.json`:
  ```json
  "express-rate-limit": "^7.4.0",
  "rate-limit-redis": "^4.2.0",
  "redis": "^4.7.0"
  ```
  Ejecutar `npm install` en `apps/auth/` — instalado 7.5.1, 4.3.1, 4.7.1.

## 2. Schema Prisma

- [x] 2.1 Agregar modelo `MasterAuditLog` en `apps/auth/prisma/schema.prisma` según design.md.
  Sin `tenant_id`, sin RLS, con índices en `created_at` y `entity_id`.

- [x] 2.2 Crear archivo SQL de migración manual `apps/auth/prisma/migrations/20260602000000_auth_hardening/migration.sql`.
  (VPS: aplicar con `docker compose exec auth npx prisma migrate deploy`)

- [x] 2.3 Ejecutar `npx prisma generate` — generado correctamente, `PrismaClient.masterAuditLog` disponible.

## 3. Rate Limiter — Middleware

- [x] 3.1 Agregar cliente Redis en `apps/auth/src/main.ts` con reconexión automática.

- [x] 3.2 Agregar `app.set('trust proxy', 1)` antes de middlewares.

- [x] 3.3 Crear los 5 limiters según design.md:
  - `masterWriteLimiter` — 5 req/15min
  - `masterReadLimiter` — 30 req/15min
  - `masterModifyLimiter` — 10 req/15min
  - `loginLimiter` — 10 req/15min
  - `refreshLimiter` — 20 req/15min

- [x] 3.4 Fallback en memoria si Redis no está disponible (`store: redisStore as any`; si Redis falla, MemoryStore).

## 4. Aplicar Rate Limiters a los Endpoints

- [x] 4.1 `GET /api/v1/master/tenants` → `masterReadLimiter`
- [x] 4.2 `POST /api/v1/master/tenants` → `masterWriteLimiter`
- [x] 4.3 `PATCH /api/v1/master/tenants/:id` → `masterModifyLimiter`
- [x] 4.4 `DELETE /api/v1/master/tenants/:id` → `masterWriteLimiter`
- [x] 4.5 `POST /api/v1/auth/login` → `loginLimiter`
- [x] 4.6 `POST /api/v1/auth/refresh` → `refreshLimiter`

## 5. Audit Log — Función Helper

- [x] 5.1 Función `logMasterAction(opts)` implementada en `apps/auth/src/main.ts`.
  Best-effort: no bloquea el flujo. Usa `runAsSystem` → `prisma.masterAuditLog.create`.

## 6. Audit Log — Instrumentar Handlers

- [x] 6.1 `GET /api/v1/master/tenants` → `logMasterAction({ accion: 'LIST_TENANTS', ... })`
- [x] 6.2 `POST /api/v1/master/tenants` → `accion: 'CREATE_TENANT'`, `entity_id`, `payload: { nombre, rfc, plan }`. Logging en error 400 y 500.
- [x] 6.3 `PATCH /api/v1/master/tenants/:id` → `accion: 'UPDATE_TENANT'`, `entity_id`, campos que cambian.
- [x] 6.4 `DELETE /api/v1/master/tenants/:id` → `accion: 'DELETE_TENANT'`, `entity_id`.
- [x] 6.5 `requireMasterSecret` → `accion: 'UNAUTHORIZED_ATTEMPT'` en intentos fallidos (fire-and-forget).

## 7. Endpoint de Consulta del Audit Log

- [x] 7.1 `GET /api/v1/master/audit-log` implementado:
  - Requiere `masterReadLimiter` + `requireMasterSecret`
  - Query params: `desde`, `hasta`, `accion`, `entity_id`
  - Retorna máximo 200 registros, ordenados por `created_at DESC`
  - Loguea la propia consulta con `accion: 'GET_AUDIT_LOG'`

## 8. Deploy a VPS

- [x] 8.1 Aplicar migración en VPS: `docker compose exec auth npx prisma migrate deploy` (2026-07-02)
- [x] 8.2 Verificar `REDIS_URL` en VPS `.env` del módulo auth — confirmado: `redis://redis:6379`
- [x] 8.3 Build y redeploy: commit 477f270 (fix ERR_ERL_CREATED_IN_REQUEST_HANDLER) + rebuild (2026-07-02)
- [x] 8.4 Verificar en producción: container healthy, sin errores de rate-limit en logs
