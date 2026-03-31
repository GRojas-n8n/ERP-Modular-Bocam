# Hito 49 - Helper hermano para respuestas HTTP terminales en Contabilidad

Fecha: 2026-03-19

## Objetivo

Implementar una primitiva hermana para respuestas terminales HTTP y probarla primero en 2 rutas reales de `Contabilidad`, antes de expandirla al resto.

## Cambio principal

Se extendio:

- `packages/tenant-idempotency/src/index.ts`

con:

- `buildTerminalHttpResponse(...)`

La nueva primitiva es deliberadamente minima. Solo resuelve:

- `terminalState`:
  - `applied`
  - `idempotent`
  - `accepted`
- mapeo base de status code:
  - `applied` -> `200`
  - `idempotent` -> `200`
  - `accepted` -> `202`
- construccion final del body via callback `buildBody(...)`

No absorbe:

- errores de dominio
- catalogos de codigos
- mensajes funcionales del modulo

## Rutas migradas

### 1. Conciliacion CFDI

Archivo:

- `apps/contabilidad/src/main.ts`

Ruta:

- `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi`

Ahora la respuesta exitosa final usa `buildTerminalHttpResponse(...)` para distinguir:

- `applied`
- `idempotent`

sin cambiar el contrato de negocio existente.

### 2. Conciliacion bancaria

Archivo:

- `apps/contabilidad/src/main.ts`

Ruta:

- `POST /api/v1/contabilidad/asientos/:id/conciliar-banco`

Tambien quedo alineada al mismo helper para las respuestas exitosas terminales.

## Resultado tecnico

Con este hito ya existen dos capas hermanas en el paquete compartido:

1. `logTerminalState(...)` para trazabilidad estructurada
2. `buildTerminalHttpResponse(...)` para respuestas exitosas terminales HTTP

Ambas se mantienen delgadas y agnosticas del dominio.

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-pago-cfdi -w @bocam/contabilidad`
- `npm run test:integration:finanzas-sat-banco -w @bocam/contabilidad`

Resultado:

- paquete compartido: OK
- `Contabilidad`: OK
- conciliacion CFDI: OK
- conciliacion bancaria / SAT: OK

## Resultado arquitectonico

La abstraccion HTTP ya demostro valor, pero todavia en un rango controlado.

Eso confirma que si conviene expandirla, siempre que se respete esta frontera:

- el paquete compartido resuelve estados terminales y forma de respuesta
- el modulo sigue resolviendo codigos de error, mensajes y reglas de negocio

## Siguiente paso recomendado

El siguiente paso con mas valor es extender `buildTerminalHttpResponse(...)` a otra ruta idempotente de `Contabilidad`, por ejemplo:

- `validar-sat`
- `callback SAT`
- `conciliacion bancaria por lote`

y luego evaluar si ya hay masa critica para mover tambien un helper de mapeo comun `error.message -> http error` sin romper soberania modular.
