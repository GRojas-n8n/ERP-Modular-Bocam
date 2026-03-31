# Hito 42 - Compras: feedback loop completo sobre tenant-idempotency

Fecha: 2026-03-19

## Objetivo

Cerrar el feedback loop completo de `Compras` sobre el paquete compartido `tenant-idempotency`, migrando el handler gemelo restante del feedback con `Finanzas`.

## Caso migrado

Se migro `handleFondosLiberadosEvent(...)` en:

- `apps/compras/src/main.ts`

Evento consumido:

- `finanzas.fondos_liberados`

## Cambio realizado

El handler dejo de resolver inline:

1. carga de OC
2. chequeo `oc_not_found`
3. chequeo idempotente (`estado === CANCELADA`)
4. mutacion a `CANCELADA`
5. log final `applied`

Ahora usa `applyIdempotentMutationInContext(...)` con el mismo patron ya aplicado a:

- `handleFondosComprometidosEvent(...)`

Esto deja a `Compras` con ambos consumers del feedback financiero sobre la misma capa reusable.

## Garantias preservadas

- Se mantiene `createTenantContext(...)` como ejecutor del contexto RLS.
- No se altero el contrato del evento `finanzas.fondos_liberados`.
- No se introdujeron joins ni acoplamientos entre bases de datos.
- La logica de estados de OC (`EMITIDA` / `CANCELADA`) sigue igual.

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npm run test:integration:finanzas-feedback -w @bocam/compras`

Resultado:

- compilacion de `Compras`: OK
- integracion real `Compras -> Finanzas -> Compras`: OK

## Resultado arquitectonico

`Compras` ya reutiliza `tenant-idempotency` en ambos extremos del feedback loop con `Finanzas`:

- `finanzas.fondos_comprometidos`
- `finanzas.fondos_liberados`

Con esto la reutilizacion transversal del paquete compartido deja de ser puntual y pasa a cubrir un flujo operativo completo.

## Siguiente paso recomendado

El siguiente paso con mas valor es llevar el mismo paquete a `Control de Obra`, idealmente sobre:

- `handlePagoRegistradoEvent(...)`

Eso permitiria validar el paquete compartido tambien en un segundo modulo consumidor asincrono distinto de `Compras`.
