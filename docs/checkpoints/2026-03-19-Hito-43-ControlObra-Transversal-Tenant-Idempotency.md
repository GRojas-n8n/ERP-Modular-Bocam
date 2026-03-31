# Hito 43 - Control de Obra: reutilizacion transversal de tenant-idempotency

Fecha: 2026-03-19

## Objetivo

Validar que `packages/tenant-idempotency` tambien funciona en un segundo consumidor asincrono distinto de `Compras`, usando un caso real de `Control de Obra`.

## Caso migrado

Se migro `handlePagoRegistradoEvent(...)` en:

- `apps/control-obra/src/main.ts`

Evento consumido:

- `finanzas.pago_registrado`

## Cambio realizado

El handler ahora usa `applyIdempotentMutationInContext(...)` para resolver:

1. carga de la estimacion
2. caso `estimacion_not_found`
3. caso idempotente (`estado === FACTURADA`)
4. aplicacion de mutacion a `FACTURADA`
5. log final `applied`

Esto reemplaza la resolucion inline anterior y deja el mismo patron reusable ya validado en:

- `Finanzas`
- `Compras`

## Garantias preservadas

- El contexto `tenant_id + proyecto_id + user_id` sigue entrando desde el evento.
- La ejecucion se mantiene sobre `createTenantContext(...)`, por lo que RLS no se pierde.
- No cambia el contrato del evento `finanzas.pago_registrado`.
- No hay joins inter-modulo ni dependencia de datos ajenos.

## Ajustes de compilacion

Se agrego el paquete compartido al `tsconfig` de `Control de Obra`.

Archivo:

- `apps/control-obra/tsconfig.json`

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npm run test:integration:finanzas-pago-feedback -w @bocam/control-obra`

Resultado:

- compilacion de `Control de Obra`: OK
- integracion real `finanzas.pago_registrado -> control-obra`: OK

## Resultado arquitectonico

Con este hito, `tenant-idempotency` ya queda validado transversalmente en tres modulos:

1. `Finanzas`
2. `Compras`
3. `Control de Obra`

Eso confirma que el paquete compartido ya no es una abstraccion local, sino una primitiva reusable real para mutaciones idempotentes bajo contexto SaaS multi-tenant y multi-proyecto.

## Siguiente paso recomendado

El siguiente paso con mas valor es consolidar esta adopcion transversal con una segunda primitiva compartida de nivel superior, por ejemplo para:

- mutaciones idempotentes por referencia funcional
- handlers asincronos con estados terminales (`idempotent`, `not_found`, `applied`)

asi se reduce todavia mas codigo repetido en `Compras` y `Control de Obra`.
