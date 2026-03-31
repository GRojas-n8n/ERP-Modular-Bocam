# Hito 32 - Worker SAT con retry, DLQ y monitoreo operativo

Fecha: 2026-03-19

## Objetivo

Endurecer la operacion del flujo SAT asincrono para que no dependa de ejecucion perfecta a la primera: reintentos controlados, DLQ explicita y visibilidad de conciliaciones atascadas en `VALIDACION_EN_PROCESO`.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `ConciliacionFiscal`
   - `AsientoContable`
3. Aislamiento multi-tenant: todo seguimiento operacional persiste dentro del mismo modulo y bajo `createTenantContext(...)`.
4. Alcance multi-proyecto: el worker y los callbacks transportan `tenant_id + proyecto_id + user_id` en cada salto.
5. Integracion externa: la consulta SAT sigue fuera del request del usuario y ahora queda operada por un worker dedicado con RabbitMQ.

## Cambios realizados

### 1. Estado operativo persistente para SAT

Archivos:

- `apps/contabilidad/prisma/schema.prisma`
- `apps/contabilidad/src/main.ts`

Se ampliaron las conciliaciones fiscales con campos para operacion real:

- `sat_requested_at`
- `sat_next_retry_at`
- `sat_dlq_at`
- `sat_retry_count`
- `sat_last_error`

Con esto `Contabilidad` ya no solo sabe si SAT termino en `VIGENTE` o `CANCELADO`; tambien sabe:

- cuando se solicito
- cuantos intentos llevo
- cual fue el ultimo error
- si quedo programado para reintento
- si ya fue enviado a DLQ

### 2. Worker SAT dedicado

Archivo:

- `apps/contabilidad/src/sat-worker.ts`

Se agrego un worker desacoplado que:

- consume `contabilidad.cfdi_sat_validacion_solicitada`
- consulta al proveedor SAT externo via `SAT_ADAPTER_BASE_URL`
- aplica el resultado a `Contabilidad` via callback autenticado
- clasifica errores retryables
- reprocesa automaticamente con backoff RabbitMQ
- envia a DLQ cuando agota intentos

Variables principales:

- `CONTABILIDAD_BASE_URL`
- `SAT_ADAPTER_BASE_URL`
- `SAT_CALLBACK_SHARED_SECRET`
- `SAT_WORKER_MAX_ATTEMPTS`
- `SAT_WORKER_RETRY_DELAY_MS`
- `CONTABILIDAD_SAT_WORKER_QUEUE`
- `CONTABILIDAD_SAT_WORKER_RETRY_QUEUE`
- `CONTABILIDAD_SAT_WORKER_DLQ_QUEUE`

### 3. Topologia RabbitMQ para retry y DLQ

Archivo:

- `packages/event-bus/src/index.ts`

Se extendio el EventBus compartido para soportar:

- `publish(..., { routingKey })`
- `subscribe(..., options)`
- `ensureQueue(...)`
- `queueArguments` custom por suscripcion

Eso habilito una topologia limpia para el worker:

- cola principal de consumo
- cola de retry con TTL
- cola DLQ dedicada

El worker publica el mismo evento al routing key de retry y RabbitMQ lo devuelve a la cola principal cuando vence el TTL. Si el ultimo intento falla, el mensaje cae a DLQ y `Contabilidad` registra `sat_dlq_at`.

### 4. Nuevos callbacks operativos

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/integraciones/sat/failure-callback`

Ese callback:

- usa `X-Bocam-Secret`
- no requiere JWT de usuario
- registra intento, error, siguiente retry y estado DLQ

Tambien se mantuvo:

- `POST /api/v1/contabilidad/integraciones/sat/callback`

para resultados `VIGENTE` o `CANCELADO`.

Ambas rutas quedaron excluidas del middleware global JWT/proyecto y protegidas por secreto compartido de integracion.

### 5. Monitoreo y reintento manual

Archivo:

- `apps/contabilidad/src/main.ts`

Se agregaron:

- `GET /api/v1/contabilidad/conciliaciones-fiscales/monitoreo/sat-pendientes`
- `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/reintentar-sat`

El monitor devuelve:

- pendientes envejecidos en `VALIDACION_EN_PROCESO`
- cuantos estan reintentando
- cuantos cayeron a DLQ
- intentos, error y timestamps por item

El reintento manual:

- resetea el estado operativo SAT
- republlica el evento de solicitud
- deja otra vez la conciliacion en `VALIDACION_EN_PROCESO`

## Validaciones ejecutadas

Pasaron:

- `npx prisma generate --schema apps/contabilidad/prisma/schema.prisma`
- `npx prisma db push --accept-data-loss --schema apps/contabilidad/prisma/schema.prisma`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-sat-worker -w @bocam/contabilidad`
- `npm run test:integration:finanzas-sat-externo -w @bocam/contabilidad`

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.pago-sat-worker.integration.test.ts`

La prueba cubre dos escenarios:

1. fallo temporal del proveedor SAT, reintentos automaticos y resolucion final a `VIGENTE`
2. fallo persistente, envio a DLQ, aparicion en monitor y recuperacion via `reintentar-sat`

Tambien se validan:

- `sat_retry_count`
- `sat_last_error`
- `sat_dlq_at`
- consulta del monitor
- callback de exito
- callback de fallo

## Scripts

Archivo:

- `apps/contabilidad/package.json`

Se agregaron:

- `dev:worker-sat`
- `test:integration:finanzas-sat-worker`

Y el runner raiz quedo actualizado para incluir la nueva integracion SAT endurecida.

## Resultado

El flujo SAT asincrono ya es operable de forma mas realista:

- si el proveedor falla una vez, reintenta
- si sigue fallando, queda trazado en monitor
- si agota intentos, cae a DLQ
- si el operador decide, puede reinyectarlo sin tocar base de datos

## Siguiente paso recomendado

El siguiente paso con mas valor es endurecer la deduplicacion fina del worker frente a redeliveries o callbacks repetidos y exponer estos indicadores en el App Shell para operacion diaria.
