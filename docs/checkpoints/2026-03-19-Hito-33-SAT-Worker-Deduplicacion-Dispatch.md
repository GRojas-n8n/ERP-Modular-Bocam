# Hito 33 - Deduplicacion fina del worker SAT por dispatch

Fecha: 2026-03-19

## Objetivo

Blindar el worker SAT frente a redeliveries repetidos y mensajes rezagados de RabbitMQ, para que cada intento logico se procese una sola vez aun bajo operacion intensiva.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `ConciliacionFiscal`
3. Aislamiento multi-tenant: la deduplicacion vive dentro del modulo y se valida por `tenant_id + proyecto_id + id_conciliacion`.
4. Flujo asyncrono: el worker no toca datos de otros modulos y reclama cada despacho por callback autenticado antes de hablar con SAT.
5. Integridad operacional: retry y DLQ quedan aislados por worker para que corridas viejas no contaminen colas nuevas.

## Cambios realizados

### 1. Dispatch id soberano por solicitud SAT

Archivos:

- `apps/contabilidad/src/types.ts`
- `apps/contabilidad/src/main.ts`

Cada solicitud `contabilidad.cfdi_sat_validacion_solicitada` ahora viaja con:

- `dispatch_id`

Ese identificador representa un despacho logico de validacion SAT. Cada retry crea un nuevo `dispatch_id`, de modo que:

- los redeliveries del mismo intento se detectan
- los intents nuevos no se bloquean por intents viejos

### 2. Estado de deduplicacion en `ConciliacionFiscal`

Archivos:

- `apps/contabilidad/prisma/schema.prisma`
- `apps/contabilidad/src/main.ts`

Se agregaron los campos:

- `sat_dispatch_id`
- `sat_last_completed_dispatch_id`
- `sat_processing_started_at`

Con eso `Contabilidad` puede distinguir:

- dispatch activo
- dispatch ya completado
- dispatch ya reclamado por un worker

### 3. Claim explicito antes de consultar al proveedor

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/integraciones/sat/claim-dispatch`

El worker llama esta ruta antes de consultar SAT. La respuesta puede ser:

- `CLAIMED`
- `ALREADY_COMPLETED`
- `ALREADY_CLAIMED`
- `STALE_DISPATCH`
- `NOT_PENDING`

Si no obtiene `CLAIMED`, el worker omite el mensaje y no vuelve a consultar al proveedor.

### 4. Worker aislado por nombre propio

Archivo:

- `apps/contabilidad/src/sat-worker.ts`

Se cambió la topologia del worker para que `retry` y `dlq` usen routing keys derivadas de `WORKER_NAME`:

- `${WORKER_NAME}.retry`
- `${WORKER_NAME}.dlq`

Eso evita que mensajes diferidos de pruebas o corridas anteriores caigan en un worker nuevo.

### 5. Callbacks enriquecidos

Archivos:

- `apps/contabilidad/src/types.ts`
- `apps/contabilidad/src/main.ts`
- `apps/contabilidad/src/sat-worker.ts`

Los callbacks SAT ahora propagan:

- `dispatch_id`
- `next_dispatch_id` en fallos reintentables

Asi `Contabilidad` puede cerrar el dispatch actual y preparar el siguiente sin mezclar estados.

## Validaciones ejecutadas

Pasaron:

- `npx prisma generate --schema apps/contabilidad/prisma/schema.prisma`
- `npx prisma db push --accept-data-loss --schema apps/contabilidad/prisma/schema.prisma`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-sat-worker -w @bocam/contabilidad`
- `npm run test:integration:finanzas-sat-externo -w @bocam/contabilidad`

## Integracion real validada

Archivo:

- `apps/contabilidad/test/integration/finanzas.pago-sat-worker.integration.test.ts`

La prueba valida:

- retry automatico hasta exito
- paso a DLQ
- reintento manual desde monitor
- aislamiento de colas por worker
- deduplicacion por `dispatch_id`

La asercion fina confirmo que el proveedor SAT se invoca una sola vez por intento logico del flujo validado.

## Resultado

El worker SAT ya no depende solo de idempotencia final del callback. Ahora tiene una capa previa de exclusividad por despacho:

- reclama el intento
- procesa una sola vez
- descarta redeliveries viejos
- evita contaminarse con retry/DLQ de otras corridas

## Siguiente paso recomendado

El siguiente paso con mas valor es exponer el monitor SAT y la DLQ en el App Shell con accion operativa para reintento, filtro por tenant/proyecto y alertas sobre antiguedad de conciliaciones.
