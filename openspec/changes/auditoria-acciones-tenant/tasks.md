## 1. Modelo de datos y RLS

- [x] 1.1 Agregar modelo `TenantAuditLog` a `apps/auth/prisma/schema.prisma`
      (`tenant_id`, `proyecto_id`, `actor_user_id`, `event_type`,
      `entity_id`, `payload Json?`, `correlation_id`, `created_at`),
      `@@index([tenant_id, created_at])`, `@@map("tenant_audit_logs")`.
- [x] 1.2 Generar migración Prisma para `tenant_audit_logs`.
- [x] 1.3 Agregar políticas RLS para `tenant_audit_logs` en
      `apps/auth/prisma/rls-policies.sql` (`ENABLE`/`FORCE ROW LEVEL
      SECURITY` + policy por `tenant_id`, calcada de la de `users`). También
      se agregó `auth` a las opciones de
      `.github/workflows/deploy-vps-rls-apply.yml` (antes solo listaba
      finanzas/contabilidad) para poder desplegar esta política.
- [x] 1.4 Verificado contra Postgres real local (`docker exec bocam-postgres`):
      migración aplicada limpio con `prisma migrate deploy`, políticas RLS
      creadas sin conflicto junto a las 16 preexistentes de
      tenants/proyectos/users/user_project_access/refresh_tokens (18 filas
      en `pg_policies`, confirmado por query). El rol local (`postgres`,
      superusuario de docker-compose) tiene `BYPASSRLS`, así que esto
      confirma que las políticas se crean sin error — no que el motor las
      hace cumplir; esa verificación de enforcement real queda para la
      tarea 6.3 contra el rol `bocam_app` en staging/producción, igual que
      el resto de RLS de este repo. El aislamiento a nivel de aplicación
      (`createTenantContext` + filtro explícito) sí se verificó en runtime
      (tarea 4.3).

## 2. Consumidor de eventos

- [ ] 2.1 Definir la allowlist de `event_type` auditables en
      `apps/auth/src` (`compras.comparativa_aprobada_gt`,
      `compras.oc_creada`, `compras.oc_cancelada`,
      `finanzas.pago_registrado`, `finanzas.oc_pagada_total`,
      `finanzas.oc_pagada_parcial` — confirmar strings exactos contra
      `apps/compras` y `FinanzasEvents` en `apps/finanzas/src/types.ts`).
- [x] 2.2 Implementar handler que, por cada evento recibido cuyo
      `event_type` esté en la allowlist, escribe una fila en
      `TenantAuditLog` usando `context.tenant_id`/`proyecto_id`/`user_id`
      del `BocamEvent`, vía `createTenantContext()` de `apps/auth/src/db.ts`
      (el helper que ya usa el resto de `apps/auth` para RLS) para que la
      escritura respete RLS.
- [x] 2.3 Suscribir el handler con `EventBus.subscribe('compras.*', ...)`
      y `EventBus.subscribe('finanzas.*', ...)` con `queueName` dedicado
      (`auth.tenant_audit_compras`, `auth.tenant_audit_finanzas`)
      para no competir con las colas de negocio existentes; filtra por
      allowlist dentro del handler (`persistTenantAuditEvent`).
- [x] 2.4 Envuelto el arranque de la suscripción (`subscribeTenantAuditLog`)
      en el flag `AUDIT_LOG_CONSUMER_ENABLED` (default `true`).
- [x] 2.5 Fallo de persistencia: no se captura dentro del handler a
      propósito — `EventBus`'s `bindAndConsume` (`packages/event-bus/src/
      index.ts`) ya envuelve cada `handler(event)` en try/catch y hace
      `nack(msg, false, false)` si lanza. El publisher corre en otro
      proceso/servicio y ya completó su transacción antes de publicar, así
      que nunca ve esta excepción.

## 3. Endpoint de consulta

- [x] 3.1 Implementado `GET /api/v1/auth/audit-log` en
      `apps/auth/src/main.ts`, protegido por `createAuthMiddleware` (ya
      montado globalmente para `/api/v1/auth/*`) + `requireAdminRole` (no
      `requireMasterSecret`).
- [x] 3.2 Consulta ejecutada bajo RLS con el `tenant_id` de la sesión vía
      `createTenantContext()`, ordenado por `created_at` descendente.
- [x] 3.3 Soporta filtros opcionales por querystring: `desde`, `hasta`,
      `proyecto_id`, `event_type`, `actor_user_id`.
- [x] 3.4 Rate limiting con `tenantAuditReadLimiter = makeLimiter(30)`,
      mismo patrón que `masterReadLimiter`.

## 4. Tests

- [x] 4.1 Test: evento en la allowlist con `tenant_id` T1 produce una fila
      en `TenantAuditLog` con `tenant_id = T1`.
      (`apps/auth/test/integration/tenant-audit-log.integration.test.ts`)
- [x] 4.2 Test: evento fuera de la allowlist no produce ninguna fila.
      (unit: `tenant-audit-log-policy.test.ts`; integración: mismo archivo
      que 4.1)
- [x] 4.3 Test de integración: admin de tenant T1 nunca recibe filas de
      tenant T2 en `GET /api/v1/auth/audit-log`, aunque existan en la
      tabla física. **Nota**: verifica aislamiento a nivel de aplicación
      (`createTenantContext` + filtro `tenant_id` explícito del endpoint);
      el rol de Postgres local (`postgres`, superusuario de
      docker-compose) tiene `BYPASSRLS`, así que no puede probar la
      política RLS en sí — eso se verifica contra el rol de runtime real
      (`bocam_app`) en staging/producción (tarea 6.3), igual que el resto
      de políticas RLS de este repo.
- [x] 4.4 Test: usuario sin rol `admin` recibe 403 en
      `GET /api/v1/auth/audit-log`.
- [x] 4.5 Test: `GET /api/v1/master/audit-log` sigue funcionando exacto
      igual que antes (no regresión sobre `MasterAuditLog`).
- [x] 4.6 Test: un fallo de persistencia no se silencia dentro del handler
      (`persistTenantAuditEvent` rechaza la promesa) — `EventBus`'s propio
      try/catch + `nack(msg, false, false)` es lo que evita que el fallo
      llegue al publisher (proceso/servicio distinto que ya completó su
      transacción antes de publicar).

**Regresión pre-existente detectada (no introducida por este cambio):**
`apps/auth/test/integration/validacion-zod-admin-users.integration.test.ts`
falla en main porque usa `roles: ['resident']` en su fixture — alias
retirado por `fix(rbac): retirar los alias resident/compras/technical del
sistema` (837e74d) sin actualizar este test. Confirmado corriendo el resto
de la suite de integración de `apps/auth` sin cambios de este change
(los demás 10 archivos de test pasan limpio). Fuera de alcance de
`auditoria-acciones-tenant` — no cubierto por su spec.

## 5. Frontend

- [x] 5.1 Nueva pestaña "Auditoría" en `AdminView.tsx`
      (`apps/app-shell/src/views/AdminView.tsx`), sub-item admin-only
      agregado a `Layout.tsx` (`ALL_NAV_ITEMS`), que llama únicamente a
      `/api/v1/auth/audit-log` (respeta "no cross-service en frontend" de
      `CLAUDE.md`). Verificado en el navegador (Playwright headless vía
      skill `run-app-shell`): login como admin, navegación
      Administración → Auditoría, sin errores de consola nuevos, estado
      vacío "Sin acciones registradas para estos filtros" correcto.
- [x] 5.2 Filtros de UI para rango de fecha (Desde/Hasta), proyecto, tipo
      de evento (`EVENTOS_AUDITORIA`, sincronizado con la allowlist de
      `tenant-audit-log-policy.ts`) y actor (usuario), mapeados 1:1 a los
      parámetros del endpoint. Cada fila resuelve el nombre del actor y el
      código del proyecto contra los usuarios/proyectos ya cargados por
      `AdminView` (sin llamada adicional).

## 6. Despliegue y verificación

- [ ] 6.1 Deploy con `AUDIT_LOG_CONSUMER_ENABLED=false` en producción
      primero, verificar que `apps/auth` arranca sin error de conexión a
      RabbitMQ/colas.
- [ ] 6.2 Activar el flag, generar una acción real en staging o producción
      (ej. crear una OC) y confirmar que aparece en la bitácora del
      tenant correspondiente vía el endpoint.
- [ ] 6.3 Confirmar aislamiento entre tenants en producción real (mismo
      patrón de verificación que otros changes RLS de este repo).
- [ ] 6.4 Documentar en `openspec/changes/auditoria-acciones-tenant/` la
      verificación en producción antes de archivar el change.
