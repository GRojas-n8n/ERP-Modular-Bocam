# Hito 34 - Idempotencia concurrente del alta inicial contable desde `finanzas.pago_registrado`

Fecha: 2026-03-19

## Objetivo

Blindar el bootstrap contable inicial para que redeliveries concurrentes de `finanzas.pago_registrado` no provoquen errores por unicidad ni dejen duplicados parciales en:

- `AsientoContable`
- `ConciliacionFiscal`
- `ConciliacionBancaria`

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `AsientoContable`
   - `ConciliacionFiscal`
   - `ConciliacionBancaria`
3. Aislamiento multi-tenant: toda recuperacion idempotente se resuelve por `tenant_id + proyecto_id` y las llaves unicas propias del modulo.
4. Integracion: el contrato sigue entrando por evento `finanzas.pago_registrado`; no hay joins ni lecturas cruzadas de otras bases.
5. Persistencia defensiva: ante `P2002`, el consumer recupera el ganador y continua sin romper el flujo.

## Cambios realizados

### 1. Placeholder fiscal race-safe

Archivo:

- `apps/contabilidad/src/main.ts`

`ensureFiscalReconciliationPlaceholder(...)` ahora:

- intenta crear la conciliacion fiscal
- si encuentra `P2002`, recupera el registro por `tenant_id + asiento_id`
- registra `contabilidad.fiscal.placeholder.idempotent.race_recovered`

Con eso el consumer ya no cae si dos handlers alcanzan la creacion del placeholder casi al mismo tiempo.

### 2. Placeholder bancario race-safe

Archivo:

- `apps/contabilidad/src/main.ts`

`ensureBankReconciliationPlaceholder(...)` quedo con el mismo patron:

- `create`
- recovery por `P2002`
- busqueda soberana por `tenant_id + asiento_id`
- log `contabilidad.banco.placeholder.idempotent.race_recovered`

### 3. Prueba de redeliveries paralelos

Archivo:

- `apps/contabilidad/test/integration/finanzas.pago-registrado.integration.test.ts`

La integracion ahora cubre dos escenarios:

- duplicado despues del alta inicial
- multiples `finanzas.pago_registrado` publicados en paralelo para el mismo `pago_id`

La asercion final confirma que solo existe:

- 1 asiento contable
- 1 conciliacion fiscal
- 1 conciliacion bancaria
- 1 evento `contabilidad.asiento_contable_generado`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-pago -w @bocam/contabilidad`

## Resultado

El alta inicial contable desde `finanzas.pago_registrado` ya no depende solo de la idempotencia del asiento. Tambien quedaron blindadas las piezas derivadas que antes podian fallar por carreras concurrentes:

- apertura fiscal
- apertura bancaria

Eso reduce ruido operativo, evita fallos intermitentes del consumer y deja el modulo mas listo para cargas con redeliveries reales de RabbitMQ.

## Siguiente paso recomendado

El siguiente paso con mas valor es consolidar un helper transaccional reutilizable para alta idempotente en consumidores de `Contabilidad`, de modo que `pago_registrado`, `oc_creada` y futuros eventos compartan el mismo patron de recovery concurrente.
