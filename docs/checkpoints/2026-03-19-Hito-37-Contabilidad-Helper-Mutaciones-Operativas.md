# Hito 37 - Helper reusable para mutaciones operativas de conciliacion y cierre en `Contabilidad`

Fecha: 2026-03-19

## Objetivo

Cerrar la unificacion de la capa de idempotencia en `Contabilidad`, aplicando el mismo criterio reusable a las rutas operativas que todavia resolvian su comportamiento `apply-or-idempotent` directamente dentro de `main.ts`.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `ConciliacionFiscal`
   - `ConciliacionBancaria`
   - `AsientoContable`
3. Aislamiento multi-tenant: toda mutacion reusable se ejecuta bajo `createTenantContext(...)`.
4. Soberania de datos: la logica se mantiene dentro del modulo y no introduce joins ni dependencias cruzadas.
5. Reutilizacion real: el helper no se limita a eventos; ahora tambien cubre rutas HTTP operativas de conciliacion/cierre.

## Cambios realizados

### 1. Helper generico `apply-or-idempotent`

Archivo:

- `apps/contabilidad/src/idempotency.ts`

Se agregaron:

- `applyIdempotentMutation(...)`
- `applyIdempotentMutationInTenantContext(...)`

Ese patron permite:

- cargar el estado actual
- decidir si la operacion ya es idempotente
- aplicar la mutacion solo cuando realmente hay cambio

### 2. Conciliacion CFDI unificada

Archivo:

- `apps/contabilidad/src/main.ts`

La ruta:

- `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi`

ya no resuelve inline toda la semantica de idempotencia; ahora usa el helper reusable.

### 3. Validacion SAT unificada

Archivo:

- `apps/contabilidad/src/main.ts`

`applySatValidationResult(...)` quedo reescrito con el helper, manteniendo:

- `idempotente`
- actualizacion de `cfdi_status`
- cierre contable derivado

### 4. Conciliacion bancaria unificada

Archivo:

- `apps/contabilidad/src/main.ts`

`reconcileBankMovement(...)` tambien quedo alineado al helper reusable, sin cambiar el contrato existente ni romper las rutas por lote/archivo.

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-pago-cfdi -w @bocam/contabilidad`
- `npm run test:integration:finanzas-sat-banco -w @bocam/contabilidad`

## Resultado

La unificacion de la capa de idempotencia en `Contabilidad` ya quedo cerrada en tres niveles:

- alta transaccional race-safe
- conciliacion por `referencia_funcional`
- mutaciones operativas `apply-or-idempotent`

Con eso el modulo queda mas consistente, mas predecible bajo redeliveries y mas facil de extender sin duplicar bloques de validacion/actualizacion.

## Siguiente paso recomendado

El siguiente paso con mas valor es mover estos helpers a un paquete compartido interno si se confirma que `Finanzas`, `Compras` o `Control de Obra` ya empiezan a repetir el mismo patron de mutacion idempotente soberana.
