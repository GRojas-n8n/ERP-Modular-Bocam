## ADDED Requirements

### Requirement: Consumo y persistencia de eventos auditables por tenant
`apps/auth` SHALL suscribirse, vía `EventBus.subscribe()`
(`packages/event-bus`), a la allowlist de `event_type` de negocio definida
como auditables (`compras.comparativa_aprobada_gt`, `compras.oc_creada`,
`compras.oc_cancelada`, eventos `finanzas.pago_*`), y SHALL persistir cada
uno recibido en `TenantAuditLog` con al menos:
`tenant_id`, `proyecto_id`, `actor_user_id`, `event_type`, `entity_id`,
`payload`, `correlation_id`, `created_at`, tomados del `context` y
`payload` del `BocamEvent` recibido.

Un evento cuyo `event_type` no esté en la allowlist SHALL ser ignorado (no
persistido) por este consumidor.

#### Scenario: Evento de OC creada se persiste en la bitácora del tenant correcto
- **WHEN** `apps/compras` publica `compras.oc_creada` con
  `context.tenant_id = T1`
- **THEN** `apps/auth` persiste una fila en `TenantAuditLog` con
  `tenant_id = T1` y `actor_user_id` igual al `context.user_id` del evento

#### Scenario: Evento fuera de la allowlist no se persiste
- **WHEN** `apps/compras` publica un `event_type` que no está en la
  allowlist de eventos auditables (p. ej. un evento de reintento interno)
- **THEN** `apps/auth` no crea ninguna fila en `TenantAuditLog` para ese
  mensaje

#### Scenario: Fallo de persistencia no bloquea al publisher
- **WHEN** la base de datos de `apps/auth` no está disponible en el
  momento en que llega un evento auditable
- **THEN** el consumidor de `apps/auth` hace `nack` del mensaje sin
  afectar la transacción ya completada en el servicio que publicó el
  evento (compras/finanzas)

### Requirement: Aislamiento por tenant vía RLS
`TenantAuditLog` SHALL tener Row Level Security habilitado y forzado
(`ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`), con una
política que solo permite ver/escribir filas cuyo `tenant_id` coincide con
el `tenant_id` de la sesión de base de datos actual, siguiendo el mismo
patrón que `apps/auth/prisma/rls-policies.sql` aplica a `users` y
`proyectos`.

#### Scenario: Un tenant nunca ve la bitácora de otro
- **WHEN** un usuario con rol `admin` del tenant T1 consulta
  `GET /api/v1/auth/audit-log`
- **THEN** la respuesta solo contiene filas cuyo `tenant_id` es T1, incluso
  si existen filas de otros tenants en la misma tabla física

### Requirement: Endpoint de consulta para admin de tenant
`apps/auth` SHALL exponer `GET /api/v1/auth/audit-log`, accesible a
usuarios autenticados con rol `admin` dentro de su propio tenant (sesión
JWT normal — no `MASTER_SECRET`), que retorna las entradas de
`TenantAuditLog` scoped al tenant de la sesión, ordenadas por
`created_at` descendente.

El endpoint SHALL soportar filtros opcionales por querystring:
`desde`, `hasta` (rango de fecha), `proyecto_id`, `event_type`,
`actor_user_id`.

#### Scenario: Admin de tenant reconstruye quién aprobó una OC
- **WHEN** un admin del tenant T1 llama
  `GET /api/v1/auth/audit-log?event_type=compras.oc_creada&proyecto_id=P1`
- **THEN** recibe la lista de OCs creadas en el proyecto P1 con el
  `actor_user_id` y `created_at` de cada una, sin necesitar la clave
  maestra de Master

#### Scenario: Usuario sin rol admin no puede consultar la bitácora
- **WHEN** un usuario autenticado sin rol `admin` en su tenant llama
  `GET /api/v1/auth/audit-log`
- **THEN** `apps/auth` responde 403 y no expone ninguna fila

#### Scenario: Master audit-log no cambia de comportamiento
- **WHEN** Master consulta `GET /api/v1/master/audit-log` con
  `MASTER_SECRET` válido
- **THEN** el comportamiento y la fuente de datos (`MasterAuditLog`) son
  exactamente los mismos que antes de este cambio — este endpoint no lee
  ni escribe `TenantAuditLog`
