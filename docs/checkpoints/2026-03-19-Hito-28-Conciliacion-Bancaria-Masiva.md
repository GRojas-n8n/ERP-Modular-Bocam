# Hito 28 - Conciliacion bancaria masiva por lote

Fecha: 2026-03-19

## Objetivo

Llevar la conciliacion bancaria de `Contabilidad` del modo unitario al modo operativo real por lote de estado de cuenta, permitiendo procesar multiples movimientos en una sola llamada sin romper el aislamiento SaaS ni volver el flujo todo-o-nada.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `AsientoContable`
   - `ConciliacionBancaria`
3. Aislamiento multi-tenant: todo el lote corre bajo `createTenantContext(...)`.
4. Alcance multi-proyecto: cada item sigue limitado al `tenant_id + proyecto_id` del token.
5. Interoperabilidad: no hay consultas cruzadas a `Finanzas`; el lote trabaja solo con referencias soberanas ya materializadas en `Contabilidad`.

## Cambios realizados

### 1. Nuevo contrato de lote bancario

Archivo:

- `apps/contabilidad/src/types.ts`

Se agregaron:

- `ConciliarBancoLoteItemRequest`
- `ConciliarBancoLoteRequest`

Cada item del lote puede resolver un movimiento por:

- `id_asiento`
- o `referencia_bancaria`

Con eso tesoreria puede trabajar tanto con referencias funcionales del banco como con identificadores internos del asiento.

### 2. Reconciliacion bancaria unificada

Archivo:

- `apps/contabilidad/src/main.ts`

Se extrajo la logica bancaria a:

- `reconcileBankMovement(...)`

Ese helper concentra:

- busqueda por `id_asiento` o `referencia_bancaria`
- validacion de monto
- validacion de referencia bancaria
- idempotencia
- actualizacion de `ConciliacionBancaria`
- actualizacion de `AsientoContable.bancario_status`
- cierre del asiento mediante `syncPagoAccountingCloseStatus(...)`

Con esto el endpoint unitario y el masivo comparten exactamente las mismas reglas.

### 3. Endpoint masivo de conciliacion bancaria

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/conciliaciones-bancarias/lote`

La ruta:

- exige JWT y `requireRoles('admin', 'finance')`
- recibe `items[]`
- procesa cada item de forma independiente
- devuelve resultado parcial por item
- no aborta el lote completo si una referencia falla
- publica `contabilidad.conciliacion_bancaria_actualizada` para cada item exitoso

El response ahora reporta:

- `total_items`
- `success_count`
- `failure_count`
- `results[]`

### 4. Observabilidad del lote

Archivo:

- `apps/contabilidad/src/main.ts`

Se agregaron logs estructurados para:

- item conciliado en lote
- item fallido
- cierre completo del lote

Todos conservan:

- `tenant_id`
- `proyecto_id`
- `correlation_id`
- `lote_id`

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.banco-lote.conciliacion.integration.test.ts`

La prueba cubre este flujo:

1. `Finanzas` registra dos pagos reales
2. `Contabilidad` crea asiento + placeholder fiscal + placeholder bancario
3. se concilian ambos CFDI
4. SAT valida ambos pagos como `VIGENTE`
5. se procesa un lote bancario con:
   - un item por `referencia_bancaria`
   - un item por `id_asiento`
   - un item invalido
6. el lote termina con exito parcial
7. los dos asientos validos quedan `CERRADO`
8. el item invalido regresa `ASIENTO_NOT_FOUND`

## Scripts

Archivos:

- `apps/contabilidad/package.json`
- `package.json`

Se agrego:

- `test:integration:finanzas-banco-lote`

Y se sumo al runner:

- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-banco-lote -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` ya puede conciliar pagos bancarios de forma masiva y segura:

- por lote
- con exito parcial
- con idempotencia
- con cierre automatico del asiento cuando SAT ya esta `VIGENTE`

Eso deja resuelto el caso operativo de tesoreria donde llegan estados de cuenta con decenas o cientos de movimientos.

## Siguiente paso recomendado

El siguiente paso con mas valor es uno de estos dos:

- carga masiva por archivo de estado de cuenta (`CSV` / `XLSX`) con parser y validacion previa
- integracion formal con proveedor SAT externo para reemplazar la validacion controlada/manual
