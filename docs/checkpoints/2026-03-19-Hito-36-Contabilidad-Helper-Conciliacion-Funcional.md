# Hito 36 - Helper reusable para conciliacion por `referencia_funcional` en `Contabilidad`

Fecha: 2026-03-19

## Objetivo

Unificar la segunda capa de idempotencia interna de `Contabilidad`: la conciliacion de asientos existentes por `referencia_funcional` y `evento_conciliacion_key`, que hasta ahora vivia inline en consumers como:

- `finanzas.fondos_comprometidos`
- `finanzas.fondos_liberados`

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `AsientoContable`
3. Aislamiento multi-tenant: el helper trabaja siempre con `tenant_id + proyecto_id + user_id` via `createTenantContext(...)`.
4. Soberania de datos: la conciliacion se resuelve solo sobre datos propios del modulo, usando `referencia_funcional` ya materializada en `AsientoContable`.
5. Flujo asyncrono: no cambia contratos con otros modulos; solo endurece y estandariza la persistencia del consumidor.

## Cambios realizados

### 1. Lookup reusable por referencia funcional

Archivo:

- `apps/contabilidad/src/idempotency.ts`

Se movio al helper:

- `findAsientoByFunctionalReferenceWithRetry(...)`

Con eso la logica de polling defensivo ya no queda enterrada en `main.ts`.

### 2. Conciliacion reusable por `evento_conciliacion_key`

Archivo:

- `apps/contabilidad/src/idempotency.ts`

Se agrego:

- `reconcileAsientoByFunctionalReference(...)`

Ese helper:

- busca el asiento por `referencia_funcional + tipo_poliza`
- devuelve `not_found` si aun no existe
- devuelve `idempotent` si ya esta conciliado con la misma clave
- aplica la conciliacion y actualiza notas si corresponde

### 3. Refactor de consumers reales

Archivo:

- `apps/contabilidad/src/main.ts`

Quedaron usando el helper:

- `handleFondosComprometidosEvent(...)`
- `handleFondosLiberadosEvent(...)`

Con eso la semantica de conciliacion ya no esta duplicada manualmente en ambos handlers.

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-compromiso-conciliacion -w @bocam/contabilidad`
- `npm run test:integration:finanzas-liberacion-conciliacion -w @bocam/contabilidad`

## Resultado

`Contabilidad` ya tiene dos piezas reutilizables internas claramente separadas:

- alta idempotente transaccional
- conciliacion idempotente por `referencia_funcional`

Eso reduce duplicacion, hace mas predecible el comportamiento de los consumers y deja una base mejor para futuros eventos contables derivados.

## Siguiente paso recomendado

El siguiente paso con mas valor es migrar al mismo helper los cierres o conciliaciones que hoy resuelven idempotencia directamente sobre `evento_conciliacion_key` en otras rutas operativas, para cerrar la unificacion completa de esa capa.
