# Tasks — Auth Hardening

## 1. Dependencias

- [ ] 1.1 Agregar en `apps/auth/package.json`:
  ```json
  "express-rate-limit": "^7.4.0",
  "rate-limit-redis": "^4.2.0"
  ```
  Ejecutar `npm install` en la raíz del monorepo para actualizar `package-lock.json`.

## 2. Schema Prisma

- [ ] 2.1 Agregar modelo `MasterAuditLog` en `apps/auth/prisma/schema.prisma` según design.md.
  Sin `tenant_id`, sin RLS, con índices en `created_at` y `entity_id`.

- [ ] 2.2 Ejecutar `npx prisma migrate dev --name auth-hardening` en `apps/auth/`.
  Verificar que el SQL genera la tabla `master_audit_logs` con todos los campos e índices.

- [ ] 2.3 Ejecutar `npx prisma generate` y verificar tipos generados.

## 3. Rate Limiter — Middleware

- [ ] 3.1 Agregar cliente Redis en `apps/auth/src/main.ts` con reconexión automática:
  ```typescript
  import { createClient } from 'redis';
  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('[Auth] Redis rate-limit error:', err));
  ```
  Conectar en el arranque: `await redisClient.connect()`.

- [ ] 3.2 Agregar `app.set('trust proxy', 1)` antes de los middlewares para leer IP real
  detrás de Caddy (`X-Forwarded-For`).

- [ ] 3.3 Crear los limiters según la tabla de design.md:
  - `masterWriteLimiter` — 5 req/15min (POST y DELETE de tenants)
  - `masterReadLimiter` — 30 req/15min (GET de tenants)
  - `masterModifyLimiter` — 10 req/15min (PATCH de tenants)
  - `loginLimiter` — 10 req/15min (POST /auth/login)
  - `refreshLimiter` — 20 req/15min (POST /auth/refresh)

- [ ] 3.4 Con fallback en memoria si Redis no está disponible:
  ```typescript
  const store = redisClient.isReady
    ? new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) })
    : undefined; // express-rate-limit usa MemoryStore si store es undefined
  ```

## 4. Aplicar Rate Limiters a los Endpoints

- [ ] 4.1 `GET /api/v1/master/tenants` → agregar `masterReadLimiter` como primer middleware.
- [ ] 4.2 `POST /api/v1/master/tenants` → agregar `masterWriteLimiter`.
- [ ] 4.3 `PATCH /api/v1/master/tenants/:id` → agregar `masterModifyLimiter`.
- [ ] 4.4 `DELETE /api/v1/master/tenants/:id` → agregar `masterWriteLimiter`.
- [ ] 4.5 `POST /api/v1/auth/login` → agregar `loginLimiter` antes de `requireMasterSecret`.
- [ ] 4.6 `POST /api/v1/auth/refresh` → agregar `refreshLimiter`.

## 5. Audit Log — Función Helper

- [ ] 5.1 Crear función helper en `apps/auth/src/main.ts`:
  ```typescript
  async function logMasterAction(opts: {
    accion: string; entity_id?: string; ip?: string;
    user_agent?: string; payload?: object; status_code: number; error_msg?: string;
  }) {
    try {
      await runAsSystem(async (prisma) => prisma.masterAuditLog.create({ data: { ...opts, entity_type: 'tenant' } }));
    } catch (_) { /* best-effort */ }
  }
  ```

## 6. Audit Log — Instrumentar Handlers

- [ ] 6.1 En `GET /api/v1/master/tenants` → llamar `logMasterAction({ accion: 'LIST_TENANTS', status_code: 200, ... })` al final del try y en el catch.

- [ ] 6.2 En `POST /api/v1/master/tenants` → llamar con `accion: 'CREATE_TENANT'`, `entity_id: tenant.id_tenant`, `payload: { nombre, rfc, plan }` (sin logo_url ni primary_color que son irrelevantes para el audit). Loguear también cuando falla (status 400/500).

- [ ] 6.3 En `PATCH /api/v1/master/tenants/:id` → llamar con `accion: 'UPDATE_TENANT'`, `entity_id: req.params.id`, `payload` con solo los campos que cambian (sin valores de color si no es relevante).

- [ ] 6.4 En `DELETE /api/v1/master/tenants/:id` → llamar con `accion: 'DELETE_TENANT'`, `entity_id: req.params.id`.

- [ ] 6.5 Loguear también los intentos fallidos (401 por secret incorrecto) directamente en `requireMasterSecret` middleware:
  ```typescript
  // En el else del if (secret !== MASTER_SECRET):
  await logMasterAction({ accion: 'UNAUTHORIZED_ATTEMPT', status_code: 401, ip: req.ip, user_agent: req.headers['user-agent'] });
  ```

## 7. Endpoint de Consulta del Audit Log

- [ ] 7.1 Implementar `GET /api/v1/master/audit-log`:
  - Requiere `requireMasterSecret` y `masterReadLimiter`
  - Query params: `desde` (fecha ISO, default últimas 24h), `hasta`, `accion`, `entity_id`
  - Retorna los registros ordenados por `created_at DESC`, máximo 200 por página
  - Loguear la propia consulta en `MasterAuditLog` con `accion: 'GET_AUDIT_LOG'`

## 8. Deploy a VPS

- [ ] 8.1 Aplicar migración: `docker compose exec auth npx prisma migrate deploy`
- [ ] 8.2 Verificar que `REDIS_URL` esté en el `.env` del VPS (ya debe existir para otros módulos).
- [ ] 8.3 Build y redeploy de auth: `docker compose build --no-cache auth && docker compose up -d auth`
- [ ] 8.4 Verificar en producción:
  - Hacer más de 5 POSTs a `/master/tenants` en menos de 15 min → debe retornar `429`
  - Verificar que cada operación master aparece en `GET /master/audit-log`
  - Verificar que intentos con secret incorrecto quedan registrados
