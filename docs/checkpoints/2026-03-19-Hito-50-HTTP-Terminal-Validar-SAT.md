# Hito 50 - Extension de HTTP terminal a validar SAT

Fecha: 2026-03-19

## Objetivo

Extender `buildTerminalHttpResponse(...)` a otra ruta idempotente real de `Contabilidad`, priorizando:

- `validar-sat`

antes de pensar en expandir la abstraccion a otros modulos.

## Cambio aplicado

Se actualizo:

- `apps/contabilidad/src/main.ts`

en:

- `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat`

La respuesta exitosa final ahora usa:

- `packages/tenant-idempotency/src/index.ts`
- `buildTerminalHttpResponse(...)`

para distinguir:

- `applied`
- `idempotent`

sin alterar:

- el contrato del body
- los eventos emitidos
- el manejo de errores `404` / `422` / `500`

## Resultado tecnico

Con este hito, la primitiva HTTP ya quedo probada en 3 rutas reales de `Contabilidad`:

1. `conciliar-cfdi`
2. `conciliar-banco`
3. `validar-sat`

Eso confirma que la abstraccion no solo sirve para conciliaciones directas, sino tambien para mutaciones fiscales idempotentes que cierran estados contables.

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-sat-banco -w @bocam/contabilidad`

Resultado:

- paquete compartido: OK
- `Contabilidad`: OK
- `validar-sat`: OK
- cierre SAT + banco: OK

## Resultado arquitectonico

La primitiva `buildTerminalHttpResponse(...)` ya dejo de ser un piloto aislado y paso a ser un patron probado dentro de `Contabilidad`.

Sigue respetando la frontera correcta:

- el paquete compartido maneja estado terminal y forma de respuesta
- `Contabilidad` conserva errores de dominio, mensajes y reglas fiscales

## Siguiente paso recomendado

El siguiente paso con mas valor es extender `buildTerminalHttpResponse(...)` a una ruta mas compleja de `Contabilidad`, por ejemplo:

- conciliacion bancaria por lote

porque ahi se mezclan:

- resumen de lote
- items exitosos / fallidos
- idempotencia por item

Si tambien encaja bien ahi, ya habra evidencia suficiente para valorar una expansion controlada a otros modulos.
