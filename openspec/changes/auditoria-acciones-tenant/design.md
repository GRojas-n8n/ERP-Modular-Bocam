## Context

`apps/auth` ya resuelve el mismo problema a nivel Master: `MasterAuditLog`
registra acciones con `{ accion, entity_type, entity_id, ip_address,
user_agent, payload, status_code, error_msg, created_at }`, escrito
best-effort desde `logMasterAction()` (`apps/auth/src/main.ts:147-166`) y
leído por `GET /api/v1/master/audit-log` protegido por
`requireMasterSecret`. Esa tabla es deliberadamente cross-tenant y sin RLS.

Lo que falta es el equivalente **dentro** de un tenant: acciones de negocio
(autorizar, pagar, desbloquear) que hoy solo dejan rastro como una columna
suelta de actor en la tabla del dominio (`PagoOC.usuario_id`,
`CuadroComparativo.firmado_por`, `AuditoriaDesbloqueoComparativa.
desbloqueado_por`) y nunca como una bitácora consultable.

Cada evento de dominio ya viaja por `bocam.events` (topic exchange,
`packages/event-bus`) con un `context` que trae `tenant_id`, `proyecto_id`,
`user_id` y `correlation_id?` obligatorios — `EventBus.publish()` rechaza
cualquier evento sin `tenant_id`/`proyecto_id` (`packages/event-bus/src/
index.ts:152-156`). Eso es exactamente el actor+contexto que se necesita
para la bitácora, y ya se está publicando hoy sin que nadie lo persista.

`apps/auth` ya tiene RLS operativo (`apps/auth/prisma/rls-policies.sql`,
tablas `users`/`proyectos`/`tenants`/...) y `packages/tenant-idempotency`
ya provee el patrón `runInContext` para mutaciones/lecturas scoped a un
tenant bajo RLS — se reutiliza tal cual, no se inventa un mecanismo nuevo.

## Goals / Non-Goals

**Goals:**
- Persistir, en `apps/auth`, un subconjunto explícito de eventos de negocio
  ya publicados por `apps/compras` y `apps/finanzas`, sin tocar esos
  publishers.
- Exponer `GET /api/v1/auth/audit-log`, scoped por `tenant_id` vía RLS,
  accesible con rol `admin` de tenant (sin `MASTER_SECRET`).
- Que un admin de tenant pueda reconstruir "quién autorizó/pagó qué,
  cuándo, desde qué IP" sin depender de Master.

**Non-Goals:**
- No es un audit log genérico de *todas* las escrituras del sistema (eso
  requeriría instrumentar cada mutación en 12 servicios) — fase 1 cubre
  solo eventos ya publicados a `bocam.events` que representan una decisión
  de negocio (autorizar/pagar/desbloquear), no cada `PATCH`.
- No reemplaza las columnas de actor existentes (`firmado_por`,
  `desbloqueado_por`, etc.) — esas siguen siendo la fuente de verdad
  transaccional; la bitácora es una vista de solo lectura derivada.
- No introduce un servicio nuevo ni cambia el conteo de "12 microservicios"
  de `CLAUDE.md` (decisión ya tomada: vive en `apps/auth`).
- No garantiza entrega exactamente-una-vez de eventos previos a este
  cambio — solo audita eventos publicados después del deploy.

## Decisions

**1. Vive en `apps/auth`, no en un servicio nuevo ni en `apps/reportes`.**
`apps/auth` ya es dueño del concepto "audit log" (`MasterAuditLog`), ya
tiene RLS operativo y ya es el servicio que resuelve autenticación/rol de
`admin` — el mismo middleware de sesión que protege el resto de `apps/auth`
protege este endpoint sin duplicar lógica de "¿es admin de este tenant?"
en otro servicio.

**2. Consumidor por `EventBus.subscribe()`, tabla `TenantAuditLog` separada
de `MasterAuditLog`.**
Se usa el mismo exchange/patrón que ya usan compras y finanzas
(`subscribe('compras.*', handler)`, `subscribe('finanzas.*', handler)`),
con `queueName` dedicado (p. ej. `auth.tenant_audit_compras`,
`auth.tenant_audit_finanzas`) para no competir por mensajes con los
consumidores de negocio existentes (compras/finanzas se suscriben a
patrones para *actuar*; `apps/auth` se suscribe al mismo patrón solo para
*archivar* — RabbitMQ entrega el mensaje a ambas colas porque son
suscripciones independientes sobre el mismo exchange topic).

Se usa una tabla nueva (no se reutiliza `MasterAuditLog`) porque el shape
difiere: `TenantAuditLog` requiere `tenant_id` (RLS) y `proyecto_id`,
`MasterAuditLog` es intencionalmente cross-tenant y estos dos casos de uso
no deben compartir política de acceso.

**3. Filtro de eventos auditables por allowlist explícita en código, no por
patrón amplio (`#` o `compras.*` completo).**
Se suscribe a los `event_type` específicos del catálogo del proposal
(`compras.comparativa_aprobada_gt`, `compras.oc_creada`,
`compras.oc_cancelada`, eventos `finanzas.pago_*`), no a todo el tráfico de
cada módulo. Evita que ruido operativo (ej. eventos de reintento interno)
infle la bitácora que el admin va a leer.

**4. Best-effort, igual que `logMasterAction`.**
Un fallo al persistir un evento de auditoría (ej. Postgres caído) hace
`nack` sin bloquear el flujo de negocio original — el publisher (compras/
finanzas) ya completó su transacción antes de publicar el evento; la
bitácora es una proyección derivada, no la fuente de verdad.

**5. Acceso: rol `admin` de tenant, mismo patrón de middleware que el resto
de `apps/auth`, con RLS forzando `tenant_id` de la sesión — no un nuevo
secreto tipo `MASTER_SECRET`.**
Alternativa descartada: exponerlo bajo `requireMasterSecret` con un
`tenant_id` de query — se descarta porque el objetivo explícito del cambio
es que el admin de tenant *no* necesite la clave maestra.

## Risks / Trade-offs

- [Cobertura incompleta: solo eventos ya publicados hoy] →
  Mitigación: catálogo documentado en proposal.md y en el spec; ampliar el
  catálogo es agregar un `subscribe()` más, no una migración de esquema.
- [Dos colas duplicando el consumo del mismo mensaje (negocio + auditoría)
  aumenta tráfico en RabbitMQ] → Volumen esperado es bajo (eventos de
  decisión, no cada request); aceptable para el piloto.
- [Eventos anteriores al deploy de este cambio no aparecen en la bitácora]
  → Aceptado explícitamente (Non-Goal); comunicar al piloto que la
  bitácora arranca desde la fecha de deploy.
- [RLS mal configurado podría filtrar entre tenants] → Reutilizar
  literalmente el patrón ya probado en `rls-policies.sql` y
  `packages/tenant-idempotency`, no una implementación nueva de scoping.

## Migration Plan

1. Migración Prisma: nueva tabla `tenant_audit_logs` + políticas RLS
   (`ALTER TABLE ... ENABLE/FORCE ROW LEVEL SECURITY` + policy por
   `tenant_id`, calcada de la de `users`).
2. Deploy del consumidor (`subscribe`) detrás de un flag de arranque
   (`AUDIT_LOG_CONSUMER_ENABLED`, default `true` en prod tras verificar en
   staging) — permite desactivarlo sin rollback de código si genera ruido.
3. Deploy del endpoint `GET /api/v1/auth/audit-log`.
4. Verificación en producción (mismo patrón que otros changes de este
   repo): generar una acción real (ej. una OC), confirmar que aparece en
   la bitácora del tenant correspondiente y NO en la de otro tenant.
5. Rollback: desactivar el consumidor por flag y ocultar el endpoint en el
   frontend; no requiere revertir datos (tabla aditiva, no toca tablas de
   negocio existentes).

## Open Questions

- ¿Retención? (¿la bitácora se purga después de N meses, o vive
  indefinidamente como `MasterAuditLog`?) — a definir con el dueño de
  producto antes de fase 2; fase 1 no purga.
- ¿El catálogo de eventos auditables de fase 1 (proposal.md) es suficiente
  para el piloto, o el piloto necesita también acciones de `apps/personal`
  (nómina) desde el día uno? — a confirmar con quien opera el piloto.
