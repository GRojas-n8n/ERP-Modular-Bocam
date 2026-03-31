# Hito 38 - Evaluacion de extraccion a paquete compartido para helpers de idempotencia

Fecha: 2026-03-19

## Objetivo

Evaluar si los helpers de idempotencia construidos en `Contabilidad` ya deben subir a un paquete compartido interno para reutilizarse en `Finanzas`, `Compras` o `Control de Obra`.

## Criterio de evaluacion

Se reviso si existe repeticion estructural real en otros modulos en estos patrones:

- `load -> idempotent -> apply`
- `create -> unique collision -> recover`
- transiciones soberanas de estado por evento

## Hallazgos

### 1. `Finanzas` si repite el patron base

Archivo:

- `apps/finanzas/src/main.ts`

`Finanzas` repite varias veces el patron de:

- buscar existente por referencia funcional de negocio
- devolver `idempotente: true` si ya existe
- crear movimiento o pago si no existe

Eso aparece, por ejemplo, en:

- compromiso de fondos
- liberacion de fondos
- programacion de pagos
- consumers de `compras.oc_creada` y `compras.oc_cancelada`

Conclusion: aqui si hay señal suficiente para compartir una base tecnica.

### 2. `Compras` y `Control de Obra` repiten una version mas simple

Archivos:

- `apps/compras/src/main.ts`
- `apps/control-obra/src/main.ts`

Ambos modulos tienen handlers que hacen:

- cargar entidad local
- validar si ya esta en el estado final
- aplicar update si no lo esta

Esto se parece al helper `apply-or-idempotent`, pero no necesita las piezas contables de `referencia_funcional` ni `evento_conciliacion_key`.

### 3. No conviene subir `idempotency.ts` completo tal como esta

Archivo:

- `apps/contabilidad/src/idempotency.ts`

Ese archivo mezcla dos niveles:

- primitivas genericamente reutilizables
- logica claramente contable

Partes que **si** son candidatas a shared package:

- `createOrRecoverInTenantContext(...)`
- `applyIdempotentMutation(...)`
- `applyIdempotentMutationInTenantContext(...)`

Partes que **no** deben salir de `Contabilidad`:

- `findAsientoByFunctionalReferenceWithRetry(...)`
- `reconcileAsientoByFunctionalReference(...)`

Porque dependen del modelo `AsientoContable` y del lenguaje contable del modulo.

## Recomendacion

### Decision recomendada

**Si, pero parcialmente.**

No recomiendo mover el archivo completo de `Contabilidad` a `packages/` tal como esta hoy.

Si recomiendo crear un paquete interno pequeno, por ejemplo:

- `packages/tenant-idempotency`

con solo las primitivas agnosticas:

- create-or-recover bajo contexto tenant/proyecto
- apply-or-idempotent bajo contexto tenant/proyecto

Y dejar en cada modulo sus adapters de dominio.

## Umbral arquitectonico alcanzado

La extraccion parcial ya se justifica porque:

1. Hay al menos dos modulos adicionales (`Finanzas` y `Compras`/`Control de Obra`) repitiendo el patron.
2. El patron ya fue probado en runtime bajo concurrencia e idempotencia real en `Contabilidad`.
3. La directiva SaaS exige consistencia fuerte de aislamiento y mutaciones soberanas, y estos helpers ayudan justo en eso.

## Riesgo de extraer demasiado pronto

Si se comparte el helper completo sin separar el nucleo generico del dominio contable:

- se acopla el paquete a `PrismaClient` y entidades de `Contabilidad`
- se contamina la soberania de otros modulos
- se vuelve mas dificil mantener contratos limpios

## Siguiente paso recomendado

El siguiente paso con mas valor es crear un paquete compartido minimo con las primitivas genericas y migrar primero un caso real de `Finanzas` antes de expandirlo al resto.
