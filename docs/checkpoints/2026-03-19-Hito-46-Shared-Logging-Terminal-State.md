# Hito 46 - Helper compartido de logging terminal

Fecha: 2026-03-19

## Objetivo

Implementar un helper minimo compartido para logging estructurado por estado terminal y probarlo primero en:

- `Contabilidad`
- `Compras`

sin mezclar semantica de dominio dentro del paquete reusable.

## Cambio principal

Se extendio:

- `packages/tenant-idempotency/src/index.ts`

con:

- `logTerminalState(...)`

La primitiva nueva solo estandariza:

- `terminalState`: `not_found`, `idempotent`, `applied`
- envelope comun:
  - `event_type`
  - `correlation_id`
  - `tenant_id`
  - `proyecto_id`
- seleccion de severidad:
  - `not_found` -> `console.warn`
  - `idempotent` / `applied` -> `console.log`

El modulo consumidor sigue aportando:

- `action`
- extras de dominio

como por ejemplo:

- `referencia_oc_id`
- `oc_codigo`
- `referencia_funcional`
- `movimiento_id`
- `id_asiento`

## Modulos migrados

### Contabilidad

Archivo:

- `apps/contabilidad/src/main.ts`

Se actualizo `logFunctionalReconciliationTerminalState(...)` para delegar en `logTerminalState(...)`, manteniendo la semantica contable local de:

- `reverse_entry_not_found`
- `projected_liability_not_found`
- `idempotent`
- `conciliated`

### Compras

Archivo:

- `apps/compras/src/main.ts`

Se migraron los logs terminales de:

- `handleFondosComprometidosEvent(...)`
- `handleFondosLiberadosEvent(...)`

Ahora ambos usan `logTerminalState(...)` en:

- `not_found`
- `idempotent`
- `applied`

## Resultado arquitectonico

Con este hito ya existe una tercera capa compartida, pero deliberadamente minima.

Eso evita dos riesgos:

1. duplicar el envelope de observabilidad en varios modulos
2. contaminar el paquete compartido con nombres de accion o conceptos contables/financieros

La primitiva queda reusable para otros consumers asincronos, mientras la semantica de negocio sigue siendo soberana por modulo.

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-feedback -w @bocam/compras`
- `npm run test:integration:finanzas-compromiso-conciliacion -w @bocam/contabilidad`
- `npm run test:integration:finanzas-liberacion-conciliacion -w @bocam/contabilidad`

Resultado:

- paquete compartido: OK
- `Compras`: OK
- `Contabilidad`: OK
- feedback loop `Compras -> Finanzas -> Compras`: OK
- conciliacion `finanzas.fondos_comprometidos -> Contabilidad`: OK
- conciliacion `finanzas.fondos_liberados -> Contabilidad`: OK

## Siguiente paso recomendado

El siguiente paso con mas valor es extender `logTerminalState(...)` a:

- `Control de Obra`
- consumers adicionales de `Contabilidad`
- rutas operativas que hoy todavia construyen manualmente el mismo envelope terminal

y despues decidir si conviene un helper hermano para estados terminales HTTP, no solo asincronos.
