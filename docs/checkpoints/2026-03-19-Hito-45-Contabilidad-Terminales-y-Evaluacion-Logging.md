# Hito 45 - Contabilidad terminal y evaluacion de tercera capa de logging

Fecha: 2026-03-19

## Objetivo

Aplicar la segunda primitiva compartida de handlers terminales a mas consumers repetitivos, especialmente en `Contabilidad`, y evaluar si ya conviene extraer una tercera capa compartida para estandarizar tambien el logging estructurado por estado terminal.

## Cambios aplicados

### 1. Contabilidad ya usa la primitiva terminal compartida en conciliacion funcional

Se actualizo:

- `apps/contabilidad/src/idempotency.ts`

para que `reconcileAsientoByFunctionalReference(...)` ya no resuelva el flujo terminal de forma artesanal, sino montado sobre:

- `packages/tenant-idempotency/src/index.ts`
- `applyTerminalMutationInContext(...)`

Con esto, la conciliacion funcional de `Contabilidad` ya sigue el mismo flujo comun:

1. `load`
2. `not_found`
3. `idempotent`
4. `applied`

sin acoplar al paquete compartido los detalles contables de `AsientoContable`.

### 2. Consumers repetitivos migrados en Contabilidad

Se alinearon estos handlers:

- `handleFondosComprometidosEvent(...)`
- `handleFondosLiberadosEvent(...)`

Archivo:

- `apps/contabilidad/src/main.ts`

Ambos consumen ahora resultados terminales homogeneos (`not_found`, `idempotent`, `applied`) desde el helper de conciliacion funcional.

### 3. Logging terminal local consolidado

Tambien en:

- `apps/contabilidad/src/main.ts`

se introdujo `logFunctionalReconciliationTerminalState(...)` para evitar repetir el mismo bloque de logging estructurado en:

- `not_found`
- `idempotent`
- `applied`

manteniendo todavia en `Contabilidad` el detalle semantico de acciones como:

- `reverse_entry_not_found`
- `projected_liability_not_found`
- `idempotent`
- `conciliated`

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-compromiso-conciliacion -w @bocam/contabilidad`
- `npm run test:integration:finanzas-liberacion-conciliacion -w @bocam/contabilidad`

Resultado:

- `Contabilidad`: OK
- conciliacion `finanzas.fondos_comprometidos -> pasivo proyectado`: OK
- conciliacion `finanzas.fondos_liberados -> reversa contable`: OK

## Evaluacion de tercera capa compartida para logging terminal

### Conclusion

Si conviene extraerla, pero todavia como una capa delgada y no como un logger de negocio completo.

### Lo que ya se comprobo

Con este hito ya existe suficiente repeticion real en mas de un modulo:

- `Compras`
- `Control de Obra`
- `Contabilidad`

y ahora tambien dentro de `Contabilidad` se ve claramente que el patron no es solo de mutacion, sino tambien de logging por estado terminal.

### Lo que si conviene compartir

Una tercera capa minima en `packages/tenant-idempotency` o un paquete hermano podria estandarizar solo:

- el envelope del log
- el estado terminal (`not_found`, `idempotent`, `applied`)
- campos comunes (`event_type`, `correlation_id`, `tenant_id`, `proyecto_id`)

### Lo que no conviene compartir todavia

No conviene subir aun:

- nombres de accion de dominio
- mensajes humanos de negocio
- campos semanticos propios como `movimiento_id`, `referencia_funcional`, `id_asiento`

Eso debe seguir en cada modulo para no contaminar el paquete compartido con conceptos contables o financieros.

### Recomendacion

El siguiente paso recomendable ya no es otra evaluacion, sino un primer helper delgado de logging terminal compartido, por ejemplo:

- `logTerminalState(...)`

que reciba:

- `module`
- `action`
- `terminal_state`
- `context`
- `extras`

y deje que cada modulo siga aportando sus `extras` de dominio.
