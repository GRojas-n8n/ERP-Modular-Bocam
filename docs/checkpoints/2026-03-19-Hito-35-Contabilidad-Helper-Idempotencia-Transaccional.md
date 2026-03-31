# Hito 35 - Helper transaccional reutilizable de idempotencia en `Contabilidad`

Fecha: 2026-03-19

## Objetivo

Extraer el patron de alta idempotente/race-safe a un helper reusable para los consumers de `Contabilidad`, evitando duplicar logica de:

- busqueda previa
- alta
- recovery por colision unica
- recovery en transaccion fresca tras `P2002`

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `AsientoContable`
   - `ConciliacionFiscal`
   - `ConciliacionBancaria`
3. Aislamiento multi-tenant: el helper recibe `tenantId + proyectoId + userId` y siempre ejecuta dentro de `createTenantContext(...)`.
4. Integracion: el helper no cruza modulos ni cambia contratos; solo endurece persistencia interna del consumer soberano.
5. Operacion segura: el recovery ya no ocurre dentro de una transaccion abortada.

## Cambios realizados

### 1. Helper reusable

Archivo:

- `apps/contabilidad/src/idempotency.ts`

Se agrego `createOrRecoverInTenantContext(...)`, que:

- entra con contexto tenant/proyecto
- busca existente
- intenta crear
- si detecta `P2002`, abre una segunda transaccion limpia
- recupera el ganador por llaves soberanas del modulo

Eso evita el problema de `25P02` que aparecia cuando el recovery ocurria dentro de la misma transaccion abortada.

### 2. Refactor de consumers iniciales

Archivo:

- `apps/contabilidad/src/main.ts`

Quedaron usando el helper:

- `persistAsientoFromEvent(...)`
- `ensureFiscalReconciliationPlaceholder(...)`
- `ensureBankReconciliationPlaceholder(...)`

Con esto `finanzas.pago_registrado` ya comparte una sola semantica de:

- `created`
- `idempotent`
- `race_recovered`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-pago -w @bocam/contabilidad`

## Resultado

`Contabilidad` ya tiene una base reutilizable para consumers idempotentes bajo concurrencia real. El patron no se queda atado a `finanzas.pago_registrado`; ahora puede extenderse a otros eventos sin volver a copiar bloques de `try/catch + P2002 + recovery`.

## Siguiente paso recomendado

El siguiente paso con mas valor es migrar gradualmente otros consumers con semantica similar a este helper, y luego extraer una segunda capa reusable para conciliaciones por `referencia_funcional` y `evento_conciliacion_key`.
