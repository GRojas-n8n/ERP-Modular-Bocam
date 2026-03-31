# Hito 40 - Finanzas: capa homogenea de idempotencia

Fecha: 2026-03-19

## Objetivo

Extender el paquete interno `tenant-idempotency` a las rutas operativas restantes de `Finanzas` que todavia resolvian idempotencia inline, para cerrar una primera capa uniforme dentro del modulo.

## Alcance realizado

Se migraron estas rutas de `Finanzas`:

1. `POST /api/v1/finanzas/comprometer-fondos`
2. `POST /api/v1/finanzas/liberar-fondos`
3. `POST /api/v1/finanzas/pagos`

Las tres rutas ahora usan `applyIdempotentMutationInContext(...)` desde `packages/tenant-idempotency`.

## Cambios tecnicos

### 1. `comprometer-fondos`

Se mantuvo el mismo comportamiento funcional, pero el endpoint ahora separa:

- `load`
- `idempotentResult`
- `apply`

Esto preserva:

- chequeo de suficiencia
- emision de `finanzas.fondos_comprometidos`
- emision de `finanzas.presupuesto_insuficiente`
- respuesta `201` o `422` sin cambiar contrato

### 2. `liberar-fondos`

Se migraron los checks inline al helper compartido, manteniendo:

- busqueda de liberacion existente
- validacion de comprometido suficiente
- mutacion presupuestal
- emision de `finanzas.fondos_liberados`

### 3. `pagos`

Se homogeneizo la ruta de programacion de pagos para resolver la idempotencia por referencia funcional (`referencia_modulo`, `referencia_entidad`, `referencia_id`) dentro del mismo patron reusable.

## Nota de estabilidad

Durante la migracion hubo que reconstruir de forma integra la franja de endpoints entre:

- `transferencias-presupuestales`
- `comprometer-fondos`
- `liberar-fondos`

La reconstruccion se dejo consistente y validada por compilacion y E2E del modulo.

## Validacion ejecutada

Se validaron estos comandos:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npm run test:e2e:idempotencia -w @bocam/finanzas`

Resultado:

- compilacion del paquete compartido: OK
- compilacion de `Finanzas`: OK
- E2E de idempotencia sobre comprometer, liberar y pagos: OK

## Resultado arquitectonico

`Finanzas` ya cuenta con una primera capa homogenea de mutaciones idempotentes bajo contexto:

- `tenant_id`
- `proyecto_id`
- `user_id`

sin romper RLS ni contratos de dominio.

## Siguiente paso recomendado

El siguiente paso con mas valor es extraer ahora un segundo caso real fuera de `Finanzas`, idealmente en `Compras` o `Control de Obra`, para probar que el paquete compartido ya es realmente transversal y no solo util dentro de un solo modulo.
