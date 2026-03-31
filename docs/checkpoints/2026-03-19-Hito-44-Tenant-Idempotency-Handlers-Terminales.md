# Hito 44 - Segunda primitiva compartida para handlers terminales

Fecha: 2026-03-19

## Objetivo

Extraer una segunda primitiva compartida de mas alto nivel para handlers asincronos con estados terminales repetidos:

- `not_found`
- `idempotent`
- `applied`

## Cambios en el paquete compartido

Se extendio:

- `packages/tenant-idempotency/src/index.ts`

con la nueva primitiva:

- `applyTerminalMutationInContext(...)`

Esta primitiva resuelve el flujo comun:

1. `load`
2. `notFoundResult`
3. `idempotentResult`
4. `apply`

sin forzar a que todos esos estados compartan el mismo tipo de retorno interno de `applyIdempotentMutationInContext(...)`.

## Modulos migrados

### Compras

Se migraron ambos handlers de feedback con `Finanzas`:

- `handleFondosComprometidosEvent(...)`
- `handleFondosLiberadosEvent(...)`

Archivo:

- `apps/compras/src/main.ts`

### Control de Obra

Se migro:

- `handlePagoRegistradoEvent(...)`

Archivo:

- `apps/control-obra/src/main.ts`

## Resultado tecnico

Ahora el paquete compartido cubre dos niveles:

1. primitivas genericas de mutacion idempotente
2. primitivas de mas alto nivel para handlers asincronos terminales

Eso reduce repeticion real en consumidores event-driven y deja mas uniforme la forma de manejar:

- carga en contexto RLS
- not found
- idempotencia
- aplicacion efectiva

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npm run test:integration:finanzas-feedback -w @bocam/compras`
- `npm run test:integration:finanzas-pago-feedback -w @bocam/control-obra`

Resultado:

- paquete compartido: OK
- `Compras`: OK
- `Control de Obra`: OK
- integracion `Compras -> Finanzas -> Compras`: OK
- integracion `finanzas.pago_registrado -> Control de Obra`: OK

## Resultado arquitectonico

Con este hito, `tenant-idempotency` ya no solo abstrae mutaciones idempotentes aisladas; tambien abstrae el patron operativo de consumidores asincronos con estados terminales, validado en mas de un modulo.

## Siguiente paso recomendado

El siguiente paso con mas valor es aplicar esta segunda primitiva a mas consumers ya existentes, especialmente:

- `handleFondosLiberadosEvent(...)` y `handlePresupuestoInsuficienteEvent(...)` donde todavia haya ramas repetidas
- consumers equivalentes futuros en `Contabilidad`

y despues evaluar si conviene una tercera capa para logging estructurado estandarizado por estado terminal.
