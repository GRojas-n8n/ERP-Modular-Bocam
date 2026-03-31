# Hito 16 - Integracion Inter-Modulo Real Control de Obra -> Finanzas

Fecha: 2026-03-18

## Objetivo

Validar el contrato inter-modulo completo entre `Control de Obra` y `Finanzas`, usando RabbitMQ real y persistencia real en la base de `Finanzas`, para comprobar:

1. publicacion del evento real
2. consumo real por el handler de `Finanzas`
3. efecto de negocio real en BD
4. trazabilidad por `correlation_id`
5. idempotencia del contrato

## Cambios implementados

### 1. Contrato del evento enriquecido

Se actualizo el payload publicado por `Control de Obra` en:

- `apps/control-obra/src/main.ts`

Evento:

- `control_obra.estimacion_aprobada`

Nuevos campos en el payload:

- `presupuesto_id`
- `total_conceptos`

Con esto `Finanzas` ya tiene la informacion minima correcta para programar un pago sin joins cruzados ni consultas a otra BD.

### 2. Handler real en Finanzas

Se implemento el handler real:

- `handleEstimacionAprobadaEvent(...)`

en:

- `apps/finanzas/src/main.ts`

Este handler:

- valida payload minimo
- entra con `createTenantContext(...)`
- busca idempotencia por:
  - `referencia_modulo = 'control-obra'`
  - `referencia_entidad = 'Estimacion'`
  - `referencia_id = estimacion_id`
- si no existe, crea `programa_pagos`
- si ya existe, registra el caso como idempotente

Logs estructurados del handler:

- `finanzas.event.estimacion_aprobada.created`
- `finanzas.event.estimacion_aprobada.idempotent`
- `finanzas.event.estimacion_aprobada.invalid_payload`

Todos incluyen:

- `tenant_id`
- `proyecto_id`
- `correlation_id`

### 3. Prueba de integracion inter-modulo real

Se agrego:

- `apps/finanzas/test/integration/control-obra.event.integration.test.ts`

La prueba usa:

- RabbitMQ real
- `createEventBus('control-obra')` como publisher real
- un consumer aislado con cola unica
- el handler real exportado desde `Finanzas`
- Prisma real contra la BD de `Finanzas`

La validacion cubre:

1. primer publish crea un pago real en `programa_pagos`
2. segundo publish del mismo evento no duplica el pago
3. el log `created` incluye el `correlation_id`
4. el log `idempotent` incluye el mismo `correlation_id`

### 4. Scripts y pipeline

Se agregaron scripts:

- `apps/finanzas/package.json`
  - `test:integration:control-obra-event`
- `package.json`
  - `test:integration:intermodulo`

Se actualizo:

- `.github/workflows/backend-e2e.yml`

para ejecutar:

- `npm run test:integration:event-bus`
- `npm run test:integration:intermodulo`

antes de la suite E2E critica.

## Validacion ejecutada

Typecheck:

- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`

Integracion real:

- `npm run test:integration:intermodulo`

## Resultado

La prueba paso correctamente.

Evidencia funcional observada:

- publish real de `control_obra.estimacion_aprobada`
- receive real en consumer RabbitMQ
- log handler `created` con `correlation_id`
- insercion real en `programa_pagos`
- segundo publish resuelto como `idempotent`
- log handler `idempotent` con el mismo `correlation_id`

## Estado despues del hito

El sistema ya no solo valida el EventBus como infraestructura, sino un contrato inter-modulo real con efecto de negocio:

- `Control de Obra` publica
- `Finanzas` consume
- `Finanzas` persiste
- la trazabilidad se conserva
- la duplicacion no rompe la consistencia

## Siguiente paso recomendado

Replicar el mismo patron para `Compras -> Finanzas`, idealmente sobre:

- `compras.oc_creada`
- `compras.oc_cancelada`

para cerrar tambien la automatizacion event-driven de compromisos y liberaciones presupuestales.
