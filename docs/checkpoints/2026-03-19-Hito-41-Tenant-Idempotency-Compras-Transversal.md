# Hito 41 - Reutilizacion transversal del paquete de idempotencia en Compras

Fecha: 2026-03-19

## Objetivo

Probar que `packages/tenant-idempotency` ya es reutilizable fuera de `Finanzas`, aplicandolo a un caso real de consumo asincrono en `Compras`.

## Caso migrado

Se migro `handleFondosComprometidosEvent(...)` en `Compras`, consumidor de:

- `finanzas.fondos_comprometidos`

Archivo principal:

- `apps/compras/src/main.ts`

## Cambio funcional

Antes, el handler resolvia inline:

1. carga de la OC
2. chequeo de no encontrada
3. chequeo idempotente (`estado === EMITIDA`)
4. mutacion a `EMITIDA`
5. logging de salida

Ahora usa `applyIdempotentMutationInContext(...)` del paquete compartido, con el mismo patron:

- `load`
- `idempotentResult`
- `apply`

## Garantias preservadas

- El contexto sigue entrando por `tenant_id + proyecto_id + user_id` desde el evento.
- La ejecucion sigue pasando por `createTenantContext(...)`, por lo que no se pierde RLS.
- No se introducen joins entre modulos ni dependencia de datos de otro modulo.
- El contrato del evento `finanzas.fondos_comprometidos` no cambia.

## Ajustes de compilacion

Se agrego el paquete compartido al `tsconfig` de `Compras`.

Archivo:

- `apps/compras/tsconfig.json`

## Validacion ejecutada

Se validaron estos comandos:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npm run test:integration:finanzas-feedback -w @bocam/compras`

Resultado:

- compilacion de `Compras`: OK
- integracion real `Compras -> Finanzas -> Compras`: OK

## Resultado arquitectonico

Con este hito, `tenant-idempotency` deja de ser un helper probado solo dentro de `Finanzas` y pasa a ser una primitiva transversal validada tambien en un consumidor event-driven de `Compras`.

## Siguiente paso recomendado

Migrar el segundo handler gemelo en `Compras`:

- `handleFondosLiberadosEvent(...)`

Con eso se cerraria el feedback loop completo de `Compras` sobre el mismo paquete reusable.
