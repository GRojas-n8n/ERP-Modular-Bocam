# Hito 51 - HTTP terminal en conciliacion bancaria por lote

Fecha: 2026-03-19

## Objetivo

Probar `buildTerminalHttpResponse(...)` en una ruta mas compleja de `Contabilidad`, especialmente:

- `POST /api/v1/contabilidad/conciliaciones-bancarias/lote`

para validar si la primitiva sigue encajando cuando la respuesta ya no es una mutacion simple, sino un resumen agregado con resultados por item.

## Cambio aplicado

Se actualizo:

- `apps/contabilidad/src/main.ts`

La ruta de conciliacion bancaria por lote ahora usa:

- `packages/tenant-idempotency/src/index.ts`
- `buildTerminalHttpResponse(...)`

con esta regla terminal:

- `idempotent` si todos los items exitosos ya eran idempotentes y no hubo fallos
- `applied` en cualquier otro procesamiento exitoso del lote

El contrato de negocio no cambio:

- se conserva `lote_id`
- se conserva `total_items`
- se conserva `success_count`
- se conserva `failure_count`
- se conserva `results[]`

## Resultado tecnico

La primitiva HTTP ya quedo probada en 4 rutas reales de `Contabilidad`:

1. `conciliar-cfdi`
2. `conciliar-banco`
3. `validar-sat`
4. `conciliaciones-bancarias/lote`

Eso demuestra que el helper no solo sirve para mutaciones directas uno-a-uno, sino tambien para respuestas agregadas con exito parcial.

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-banco-lote -w @bocam/contabilidad`

Resultado:

- paquete compartido: OK
- `Contabilidad`: OK
- conciliacion bancaria por lote: OK
- exito parcial del lote: OK

## Conclusión arquitectonica

Si, ya hay evidencia suficiente para empezar a llevar `buildTerminalHttpResponse(...)` a otros modulos.

La prueba clave era esta ruta por lote porque introduce:

- resumen agregado
- errores por item
- items idempotentes y aplicados mezclados

y aun asi la abstraccion se mantuvo util y no invadio la logica de negocio.

## Siguiente paso recomendado

El siguiente paso con mas valor es llevar esta primitiva HTTP a otro modulo con mutaciones idempotentes reales, empezando por:

- `Compras`
- `Control de Obra`

preferentemente en rutas de reconciliacion o reaplicacion donde ya exista:

- respuesta `200`
- bandera `idempotente`
- misma forma de `createApiResponse(...)`
