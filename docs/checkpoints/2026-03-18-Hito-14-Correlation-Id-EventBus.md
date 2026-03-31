# Hito 14 - Propagacion de Correlation ID por EventBus

Fecha: 2026-03-18

## Objetivo

Evitar que la trazabilidad se corte cuando un flujo del SaaS cambie de HTTP sincronico a evento asincrono sobre RabbitMQ.

## Cambios implementados

### 1. Contrato de evento extendido

Se extendio `BocamEvent` para aceptar:

- `context.correlation_id?: string`

Archivos:

- `packages/event-bus/src/index.ts`
- `apps/finanzas/src/types.ts`
- `apps/control-obra/src/types.ts`

Con esto, el `correlation_id` pasa a formar parte del contexto operativo del evento, junto con:

- `tenant_id`
- `proyecto_id`
- `user_id`

### 2. Helper compartido para contexto de evento

Se agrego en:

- `packages/observability/src/index.ts`

el helper:

- `buildEventContext(req)`

Este helper construye un contexto canónico para eventos a partir del request autenticado:

- `tenant_id`
- `proyecto_id`
- `user_id`
- `correlation_id`

### 3. Publishers criticos actualizados

Se actualizaron los publishers de los flujos mas sensibles para no perder trazabilidad:

#### Compras

Archivo:

- `apps/compras/src/main.ts`

Eventos actualizados:

- `compras.oc_creada`
- `compras.oc_cancelada`

#### Control de Obra

Archivo:

- `apps/control-obra/src/main.ts`

Eventos actualizados:

- `control_obra.avance_fisico_registrado`
- `control_obra.avance_fisico_validado`
- `control_obra.estimacion_aprobada`

### 4. EventBus propaga correlation_id por headers RabbitMQ

En `packages/event-bus/src/index.ts` ahora el bus:

- publica `x-correlation-id` en headers AMQP
- registra `correlation` en el log de publish
- al consumir, recupera `correlation_id` desde:
  - `event.context.correlation_id`
  - o como fallback desde `msg.properties.headers['x-correlation-id']`

Esto protege la trazabilidad incluso si un publisher legado no hubiera serializado todavia el campo dentro del body del evento.

## Resultado

Ahora un flujo puede seguirse asi:

1. Request HTTP entra con `x-correlation-id` o se genera uno.
2. El backend lo usa en logs HTTP.
3. Si el flujo emite evento, el mismo `correlation_id` viaja en:
   - `event.context.correlation_id`
   - header AMQP `x-correlation-id`
4. El consumer del EventBus lo recupera y lo conserva en su log de recepcion.

Con esto ya no se rompe la cadena de trazabilidad entre:

- `Compras -> Finanzas`
- `Control de Obra -> Finanzas`
- y cualquier consumer futuro que use el contrato del bus

## Validacion

Se validaron por typecheck:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`

Tambien se verifico que `packages/event-bus/src/index.ts` ya contiene:

- `context.correlation_id`
- header `x-correlation-id`

## Siguiente paso recomendado

Completar observabilidad asincrona de segundo nivel:

1. Estandarizar logs estructurados JSON dentro de los handlers de eventos, no solo en el EventBus.
2. Añadir pruebas E2E o de integracion con RabbitMQ para verificar que `correlation_id` llega intacto al consumer.
3. Llevar el mismo patron a `auth`, `seguridad`, `personal` y `gerencia-tecnica` cuando emitan eventos de negocio.
