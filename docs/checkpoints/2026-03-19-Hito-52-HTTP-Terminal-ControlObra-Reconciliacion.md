# Hito 52 - HTTP terminal fuera de Contabilidad en Control de Obra

Fecha: 2026-03-19

## Objetivo

Probar `buildTerminalHttpResponse(...)` en una mutacion HTTP real fuera de `Contabilidad`, en un modulo donde ya existiera `createApiResponse(...)` y donde la operacion pudiera endurecerse como idempotente legitima.

## Ruta elegida

Se actualizo:

- `apps/control-obra/src/main.ts`

Ruta:

- `POST /api/v1/control-obra/estimaciones/:id/reconciliar-finanzas`

## Cambio funcional

La ruta ahora distingue dos casos exitosos:

1. Primera reconciliacion efectiva:
   - mueve la estimacion a `APROBADA_FINANCIERA`
   - dispara la llamada a `Finanzas`
   - responde con `idempotente: false`
   - usa `buildTerminalHttpResponse(...)` en estado `applied`

2. Reintento sobre una estimacion ya reconciliada:
   - no vuelve a llamar a `Finanzas`
   - no vuelve a mutar la BD
   - responde `200`
   - devuelve `idempotente: true`
   - usa `buildTerminalHttpResponse(...)` en estado `idempotent`

Los demas estados invalidos conservan su comportamiento:

- `404` si la estimacion no existe
- `409` si el estado no admite reconciliacion y tampoco es un caso de idempotencia legitima

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npm run test:e2e:reconciliacion -w @bocam/control-obra`

Resultado:

- paquete compartido: OK
- `Control de Obra`: OK
- reconciliacion `ERROR_FINANZAS -> APROBADA_FINANCIERA`: OK
- reintento `APROBADA_FINANCIERA -> idempotent`: OK
- sin duplicar llamada downstream a `Finanzas`: OK

## Resultado arquitectonico

Con este hito, `buildTerminalHttpResponse(...)` ya quedo validado en:

- `Contabilidad`
- `Control de Obra`

Eso ya es evidencia suficiente para una expansion controlada a otros modulos.

La senal mas importante no es solo tecnica, sino semantica:

- la abstraccion funciono tambien cuando la ruta HTTP tuvo que endurecerse como operacion idempotente real de negocio

## Siguiente paso recomendado

El siguiente paso con mas valor es llevar `buildTerminalHttpResponse(...)` a `Compras`, idealmente en:

- `POST /api/v1/compras/ordenes-compra/:id/reconciliar-finanzas`

para cerrar la validacion transversal en un tercer modulo operativo.
