# Hito 22 - Contabilidad consume OCs y transferencias presupuestales

Fecha: 2026-03-18

## Objetivo

Extender `Contabilidad` para cerrar dos frentes contables adicionales del SaaS:

- `compras.oc_creada` -> pasivo proyectado
- `finanzas.transferencia_presupuestal` -> poliza interna

manteniendo soberania de datos, idempotencia por evento y trazabilidad con `correlation_id`.

## Cambios realizados

### 1. Modelo contable ampliado

Archivo:

- `apps/contabilidad/prisma/schema.prisma`

Se ajustó `AsientoContable` para soportar no solo pagos reales sino tambien asientos derivados de eventos no monetizados en caja:

- `pago_id` ahora es opcional
- se agregó `external_event_key`
- la idempotencia se asegura con `@@unique([tenant_id, external_event_key])`

Con esto `Contabilidad` ya puede registrar distintos tipos de asiento sin depender siempre de un `id_pago`.

### 2. Nuevos contratos contables

Archivo:

- `apps/contabilidad/src/types.ts`

Se agregaron los payloads:

- `OrdenCompraCreadaPayload`
- `TransferenciaPresupuestalPayload`

y se extendió:

- `ContabilidadConsumedEvents`

para incluir:

- `compras.oc_creada`
- `finanzas.transferencia_presupuestal`

### 3. Nuevos consumidores reales en `Contabilidad`

Archivo:

- `apps/contabilidad/src/main.ts`

Se implementaron:

- `handleOrdenCompraCreadaEvent(...)`
- `handleTransferenciaPresupuestalEvent(...)`

Ambos usan una rutina comun `persistAsientoFromEvent(...)` que:

- ejecuta bajo `createTenantContext(...)`
- busca por `external_event_key`
- evita duplicados por reenvio
- crea el asiento solo una vez
- publica `contabilidad.asiento_contable_generado` solo cuando hay efecto nuevo

#### 3.1 `compras.oc_creada`

Se traduce a:

- `tipo_poliza = PASIVO_PROYECTADO`
- `estatus = PROYECTADO`
- `folio_poliza = POL-PAS-*`

La referencia externa queda ligada a `OrdenCompra`.

#### 3.2 `finanzas.transferencia_presupuestal`

Se traduce a:

- `tipo_poliza = TRANSFERENCIA_INTERNA`
- `estatus = REGISTRADO`
- `folio_poliza = POL-TRF-*`

La referencia externa queda ligada a `TransferenciaPresupuestal`.

### 4. Emision real desde `Finanzas`

Archivo:

- `apps/finanzas/src/main.ts`

Se agregó el endpoint:

- `POST /api/v1/finanzas/transferencias-presupuestales`

que:

- valida RBAC
- verifica suficiencia del presupuesto origen
- crea dos movimientos `TRANSFERENCIA` (salida y entrada)
- actualiza los saldos de origen y destino
- publica `finanzas.transferencia_presupuestal`
- soporta idempotencia por `transferencia_id`

Tambien se extendió el contrato de eventos en:

- `apps/finanzas/src/types.ts`

con `TransferenciaPresupuestalPayload`.

## Integraciones agregadas

### 1. `compras.oc_creada` -> `contabilidad`

Archivo:

- `apps/contabilidad/test/integration/compras.oc-creada.integration.test.ts`

Valida:

- creacion de pasivo proyectado
- emision de `contabilidad.asiento_contable_generado`
- no duplicacion ante reenvio del mismo evento

### 2. `finanzas.transferencia_presupuestal` -> `contabilidad`

Archivo:

- `apps/contabilidad/test/integration/finanzas.transferencia.integration.test.ts`

Valida:

- transferencia presupuestal real via HTTP en `Finanzas`
- publicacion del evento financiero
- generacion de poliza interna en `Contabilidad`
- emision de `contabilidad.asiento_contable_generado`
- idempotencia extremo a extremo usando el mismo `transferencia_id`

## Scripts y pipeline

Se agregaron scripts en:

- `apps/contabilidad/package.json`
- `package.json`

para ejecutar:

- `test:integration:compras-oc`
- `test:integration:finanzas-transferencia`

El workflow CI no requirio cambios adicionales porque `test:integration:intermodulo` ya orquesta toda la suite.

## Validaciones ejecutadas

Pasaron:

- `npx prisma generate --schema apps/contabilidad/prisma/schema.prisma`
- `npx prisma db push --accept-data-loss --schema apps/contabilidad/prisma/schema.prisma`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npm run test:integration:compras-oc -w @bocam/contabilidad`
- `npm run test:integration:finanzas-transferencia -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` deja de consumir solo pagos y pasa a cubrir tres momentos clave del ciclo economico:

- pasivo proyectado de compra
- egreso pagado
- transferencia interna de presupuesto

Con esto el ecosistema ya tiene una base real para cierre contable multi-modulo sin joins cruzados.

## Siguiente paso recomendado

El siguiente paso con mas valor es extender `Contabilidad` a:

- `compras.oc_cancelada` para reversa contable del pasivo proyectado
- `personal.pre_nomina_autorizada` para polizas de nomina
- eventos fiscales/CFDI para conciliacion y cierre mensual
