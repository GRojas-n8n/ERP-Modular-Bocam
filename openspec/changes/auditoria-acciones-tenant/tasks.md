## 1. Modelo de datos y RLS

- [ ] 1.1 Agregar modelo `TenantAuditLog` a `apps/auth/prisma/schema.prisma`
      (`tenant_id`, `proyecto_id`, `actor_user_id`, `event_type`,
      `entity_id`, `payload Json?`, `correlation_id`, `created_at`),
      `@@index([tenant_id, created_at])`, `@@map("tenant_audit_logs")`.
- [ ] 1.2 Generar migración Prisma para `tenant_audit_logs`.
- [ ] 1.3 Agregar políticas RLS para `tenant_audit_logs` en
      `apps/auth/prisma/rls-policies.sql` (`ENABLE`/`FORCE ROW LEVEL
      SECURITY` + policy por `tenant_id`, calcada de la de `users`).
- [ ] 1.4 Verificar contra Postgres real (siguiendo el patrón de commits
      previos "verificar migracion ... contra Postgres real") que un rol
      de aplicación con `tenant_id` A no puede leer filas de `tenant_id` B.

## 2. Consumidor de eventos

- [ ] 2.1 Definir la allowlist de `event_type` auditables en
      `apps/auth/src` (`compras.comparativa_aprobada_gt`,
      `compras.oc_creada`, `compras.oc_cancelada`,
      `finanzas.pago_registrado`, `finanzas.oc_pagada_total`,
      `finanzas.oc_pagada_parcial` — confirmar strings exactos contra
      `apps/compras` y `FinanzasEvents` en `apps/finanzas/src/types.ts`).
- [ ] 2.2 Implementar handler que, por cada evento recibido cuyo
      `event_type` esté en la allowlist, escribe una fila en
      `TenantAuditLog` usando `context.tenant_id`/`proyecto_id`/`user_id`
      del `BocamEvent`, vía el patrón `runInContext` de
      `packages/tenant-idempotency` para que la escritura respete RLS.
- [ ] 2.3 Suscribir el handler con `EventBus.subscribe('compras.*', ...)`
      y `EventBus.subscribe('finanzas.*', ...)` con `queueName` dedicado
      (p. ej. `auth.tenant_audit_compras`, `auth.tenant_audit_finanzas`)
      para no competir con las colas de negocio existentes; filtrar por
      allowlist dentro del handler.
- [ ] 2.4 Envolver el arranque de la suscripción en el flag
      `AUDIT_LOG_CONSUMER_ENABLED` (default `true`).
- [ ] 2.5 Manejar fallo de persistencia con `nack` sin relanzar excepción
      hacia el publisher (best-effort, igual que `logMasterAction`).

## 3. Endpoint de consulta

- [ ] 3.1 Implementar `GET /api/v1/auth/audit-log` en
      `apps/auth/src/main.ts`, protegido por middleware de sesión +
      `requireRoles(['admin'])` (no `requireMasterSecret`).
- [ ] 3.2 Ejecutar la consulta bajo RLS con el `tenant_id` de la sesión
      (vía `runInContext`), ordenado por `created_at` descendente.
- [ ] 3.3 Soportar filtros opcionales por querystring: `desde`, `hasta`,
      `proyecto_id`, `event_type`, `actor_user_id`.
- [ ] 3.4 Aplicar rate limiting de lectura consistente con el resto de
      endpoints de `apps/auth` (reusar `masterReadLimiter` o crear uno
      equivalente para tenant).

## 4. Tests

- [ ] 4.1 Test: evento en la allowlist con `tenant_id` T1 produce una fila
      en `TenantAuditLog` con `tenant_id = T1`.
- [ ] 4.2 Test: evento fuera de la allowlist no produce ninguna fila.
- [ ] 4.3 Test de integración RLS: admin de tenant T1 nunca recibe filas
      de tenant T2 en `GET /api/v1/auth/audit-log`, aunque existan en la
      tabla física.
- [ ] 4.4 Test: usuario sin rol `admin` recibe 403 en
      `GET /api/v1/auth/audit-log`.
- [ ] 4.5 Test: `GET /api/v1/master/audit-log` sigue funcionando exacto
      igual que antes (no regresión sobre `MasterAuditLog`).
- [ ] 4.6 Test: fallo simulado de DB durante el consumo de un evento no
      propaga error al publisher (el evento se `nack`ea, el flujo de
      negocio original no se ve afectado).

## 5. Frontend

- [ ] 5.1 Nueva vista de auditoría en el área de administración del
      tenant que llama únicamente a `/api/v1/auth/audit-log` (respetar
      "no cross-service en frontend" de `CLAUDE.md`).
- [ ] 5.2 Filtros de UI para rango de fecha, proyecto, tipo de evento y
      actor, mapeados 1:1 a los parámetros del endpoint.

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
