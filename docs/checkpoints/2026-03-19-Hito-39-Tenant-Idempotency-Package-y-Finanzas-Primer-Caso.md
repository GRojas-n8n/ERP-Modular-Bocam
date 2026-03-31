# Hito 39 - Paquete compartido de idempotencia y primer caso migrado en Finanzas

Fecha: 2026-03-19

## Objetivo

Extraer un paquete interno minimo y reusable para patrones de idempotencia con contexto `tenant_id + proyecto_id`, y migrar un caso real en `Finanzas` para reducir duplicacion sin romper contratos existentes.

## Cambios realizados

### 1. Nuevo paquete interno `packages/tenant-idempotency`

Se creo un paquete compartido orientado a primitivas genericas, no acopladas a ningun modelo de dominio:

- `applyIdempotentMutation(...)`
- `applyIdempotentMutationInContext(...)`
- `createOrRecoverInContext(...)`

El paquete recibe:

- un `context`
- un `runInContext(...)` del modulo consumidor
- callbacks `load`, `idempotentResult`, `apply`

Con esto se conserva la soberania del modulo y el enforcement local de RLS, porque el paquete no conoce ni Prisma schemas ajenos ni tablas de otro modulo.

Archivos:

- `packages/tenant-idempotency/package.json`
- `packages/tenant-idempotency/tsconfig.json`
- `packages/tenant-idempotency/src/index.ts`

### 2. Primer caso migrado en `Finanzas`

Se migro `POST /api/v1/finanzas/comprometer-fondos` para usar `applyIdempotentMutationInContext(...)`.

Antes, el endpoint mezclaba inline:

- carga del estado
- chequeo idempotente
- mutacion
- retorno del resultado

Ahora el flujo queda separado en tres fases explicitas:

1. `load`
2. `idempotentResult`
3. `apply`

Esto deja el endpoint mas legible y prepara la migracion gradual de otros casos de `Finanzas`.

Archivo principal:

- `apps/finanzas/src/main.ts`

### 3. Ajuste de compilacion del modulo

Se actualizo el `tsconfig` de `Finanzas` para incluir el nuevo paquete compartido en la compilacion local del modulo.

Archivo:

- `apps/finanzas/tsconfig.json`

## Garantias arquitectonicas preservadas

- No se introdujeron joins entre modulos.
- El paquete compartido no accede a bases de datos por si solo.
- El contexto `tenant_id + proyecto_id + user_id` sigue siendo inyectado por `Finanzas` via `createTenantContext(...)`.
- El contrato HTTP y los eventos salientes de `comprometer-fondos` no cambiaron.

## Validacion realizada

Se validaron estos comandos:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npm run test:e2e:idempotencia -w @bocam/finanzas`

Resultado:

- Compilacion del paquete compartido: OK
- Compilacion de `Finanzas`: OK
- E2E de idempotencia en `Finanzas`: OK

## Siguiente paso recomendado

Migrar el siguiente caso duplicado de `Finanzas` al mismo paquete, empezando por:

1. `POST /api/v1/finanzas/liberar-fondos`
2. `POST /api/v1/finanzas/pagos`

Con eso `Finanzas` quedaria con una primera capa homogena de mutaciones idempotentes reusable y lista para extender luego a `Compras` o `Control de Obra`.
