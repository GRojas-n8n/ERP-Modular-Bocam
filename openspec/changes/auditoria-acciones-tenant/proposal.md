## Why

Hoy la única auditoría de "quién hizo qué" es `GET /api/v1/master/audit-log`
(`apps/auth/src/main.ts`, tabla `MasterAuditLog`), y esa tabla solo registra
acciones de **Master sobre tenants** (crear/editar/borrar tenant, intentos no
autorizados) — no tiene `tenant_id` y es intencionalmente cross-tenant sin RLS
(`apps/auth/prisma/schema.prisma:145-147`). No existe ningún registro
persistente de acciones de negocio dentro de un tenant (quién autorizó una OC,
quién registró un pago, quién desbloqueó una comparativa).

Un piloto con usuarios reales necesita que el administrador de un tenant
pueda reconstruir esas acciones — quién, cuándo, desde dónde — sin que el
equipo de Bocam tenga que entrar con la clave maestra a consultarlo por él.
Eso hoy es imposible: el rastro de actor existe solo de forma ad-hoc en
columnas sueltas (`PagoOC.usuario_id`, `CuadroComparativo.firmado_por`,
`AuditoriaDesbloqueoComparativa.desbloqueado_por`, etc.) y no es consultable
como bitácora.

## What Changes

- Nueva tabla `TenantAuditLog` en `apps/auth` (mismo servicio que ya posee
  `MasterAuditLog`), con `tenant_id` obligatorio y protegida por RLS
  (`apps/auth/prisma/rls-policies.sql`), siguiendo el patrón ya vigente en
  ese archivo para `users`/`proyectos`.
- Nuevo consumidor de eventos (`bocam.events`, topic exchange) en `apps/auth`
  que persiste una lista explícita de eventos de negocio auditables
  (autorizaciones, pagos, desbloqueos de comparativa, cambios de rol/usuario)
  usando el `context` que ya viaja en cada `BocamEvent`
  (`tenant_id`, `proyecto_id`, `user_id`, `correlation_id?` —
  `packages/event-bus/src/index.ts`). No se modifica ningún publisher
  existente: los eventos ya se emiten hoy, solo no se persisten.
- Nuevo endpoint `GET /api/v1/auth/audit-log` en `apps/auth`, protegido por
  el rol `admin` de tenant (no por `MASTER_SECRET`), con RLS forzando el
  `tenant_id` de la sesión — un admin de un tenant nunca puede ver los de
  otro. Soporta filtros por rango de fecha, `proyecto_id`, `entity_type` y
  `actor_user_id`.
- Catálogo inicial de eventos auditables a persistir (fase 1, ampliable):
  `compras.comparativa_aprobada_gt`, `compras.oc_creada`,
  `compras.oc_cancelada`, eventos de pago de `apps/finanzas`
  (`PagoRegistradoPayload` y equivalentes), y el desbloqueo de comparativa
  ya modelado en `AuditoriaDesbloqueoComparativa` de `apps/compras`.
- **BREAKING**: ninguno — es un endpoint y una tabla nuevos; no se modifica
  contrato de API existente.

## Capabilities

### New Capabilities
- `auditoria-tenant`: bitácora de acciones de negocio (quién hizo qué, cuándo,
  desde qué IP) scoped por tenant vía RLS, alimentada por `bocam.events` y
  consultable por el rol `admin` del tenant vía `GET /api/v1/auth/audit-log`,
  sin requerir la clave maestra de Master.

### Modified Capabilities
(ninguna — no cambia el comportamiento de `master/audit-log` ni de los
publishers de eventos existentes)

## Impact

- **Código**: `apps/auth/prisma/schema.prisma` (nuevo modelo
  `TenantAuditLog`), `apps/auth/prisma/rls-policies.sql` (nueva tabla con
  RLS), `apps/auth/src/main.ts` (nuevo endpoint + consumidor RabbitMQ),
  nueva migración Prisma.
- **Dependencias**: `packages/event-bus` (consumo, sin cambios de contrato),
  RabbitMQ (`bocam.events`, nueva cola de consumo dedicada para no competir
  con los consumidores de negocio existentes).
- **Otros servicios**: ninguno requiere cambios de código — solo se
  **consumen** eventos que `apps/compras` y `apps/finanzas` ya publican hoy.
- **Frontend**: nueva vista de auditoría dentro del área de administración
  del tenant, que llama únicamente a `/api/v1/auth/audit-log` (respeta la
  regla "no cross-service en frontend" de `CLAUDE.md`).
