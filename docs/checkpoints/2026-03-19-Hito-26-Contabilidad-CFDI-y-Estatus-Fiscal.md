# Hito 26 - Contabilidad concilia CFDI y cierra estatus fiscal del pago

Fecha: 2026-03-19

## Objetivo

Cerrar el tramo fiscal real del pago para que `finanzas.pago_registrado` no solo genere el asiento contable, sino que tambien abra y cierre su conciliacion fiscal dentro de `Contabilidad`, con soporte para CFDI, estatus fiscal e idempotencia.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas: `AsientoContable` y la nueva entidad soberana `ConciliacionFiscal`.
3. Aislamiento multi-tenant: todo se ejecuta bajo `createTenantContext(...)`.
4. Alcance multi-proyecto: el asiento y la conciliacion fiscal quedan ligados a `tenant_id` + `proyecto_id`.
5. Interoperabilidad: `Finanzas` sigue publicando `finanzas.pago_registrado`; `Contabilidad` resuelve la conciliacion CFDI sin tocar tablas ajenas.

## Cambios realizados

### 1. Nuevo modelo fiscal soberano

Archivo:

- `apps/contabilidad/prisma/schema.prisma`

Se agrego `ConciliacionFiscal` con:

- `tenant_id`
- `proyecto_id`
- `asiento_id`
- `pago_id`
- `uuid_fiscal`
- `rfc_emisor`
- `rfc_receptor`
- `monto_pagado`
- `monto_cfdi`
- `estatus_fiscal`
- `fecha_conciliacion`

Se blindaron estas reglas:

- una sola conciliacion por asiento: `@@unique([tenant_id, asiento_id])`
- un solo CFDI por tenant: `@@unique([tenant_id, uuid_fiscal])`

### 2. Placeholder fiscal al recibir el pago

Archivo:

- `apps/contabilidad/src/main.ts`

`handlePagoRegistradoEvent(...)` ahora hace dos cosas:

1. crea el asiento `EGRESO` como ya lo hacia
2. abre una `ConciliacionFiscal` en estado `PENDIENTE_CFDI`

Con eso el pago queda listo para cierre fiscal, no solo para registro contable.

### 3. Nueva conciliacion CFDI via API

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi`

La ruta:

- exige JWT real y `requireRoles('admin', 'finance')`
- valida datos minimos del CFDI
- verifica que el monto del CFDI coincida con el monto del asiento
- actualiza `ConciliacionFiscal` a `CONCILIADO`
- actualiza `AsientoContable.cfdi_status` a `CONCILIADO`
- responde en modo idempotente si el mismo CFDI ya fue conciliado

### 4. Nuevo evento de salida

Archivo:

- `apps/contabilidad/src/types.ts`
- `apps/contabilidad/src/main.ts`

Se agrego:

- `contabilidad.cfdi_conciliado`

Payload:

- `id_asiento`
- `pago_id`
- `id_conciliacion`
- `uuid_fiscal`
- `estatus_fiscal`
- `cfdi_status`

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.pago-cfdi.conciliacion.integration.test.ts`

La prueba valida este flujo real:

1. `Finanzas` procesa un pago y publica `finanzas.pago_registrado`
2. `Contabilidad` crea el asiento
3. `Contabilidad` abre la conciliacion fiscal pendiente
4. se registra el CFDI por API propia del modulo
5. `Contabilidad` cambia a `cfdi_status = CONCILIADO`
6. se publica `contabilidad.cfdi_conciliado`
7. el reenvio del mismo CFDI no duplica la conciliacion

## Hardening adicional aplicado

Durante la validacion se detecto un riesgo real de orden de llegada entre:

- `compras.oc_creada`
- `finanzas.fondos_comprometidos`

porque usan colas distintas del bus. Se blindaron los consumidores de conciliacion en:

- `apps/contabilidad/src/main.ts`

con busqueda por referencia funcional y reintentos cortos antes de declarar ausencia del asiento.

## Scripts

Se agrego en:

- `apps/contabilidad/package.json`

el comando:

- `test:integration:finanzas-pago-cfdi`

Y se incorporo al runner raiz:

- `package.json`
- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx prisma generate --schema apps/contabilidad/prisma/schema.prisma`
- `npx prisma db push --accept-data-loss --schema apps/contabilidad/prisma/schema.prisma`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-pago-cfdi -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` ya no solo registra el pago; ahora tambien:

- abre conciliacion fiscal pendiente
- recibe el CFDI
- valida monto contra el asiento
- cierra `cfdi_status`
- emite `contabilidad.cfdi_conciliado`

Con esto el ciclo de pago queda cerrado en tres niveles:

- financiero
- contable
- fiscal

## Siguiente paso recomendado

El siguiente paso con mas valor es profundizar el cierre fiscal y tributario:

- validacion de estatus SAT (`VIGENTE`, `CANCELADO`) dentro de `Contabilidad`
- conciliacion bancaria por referencia de pago
- polizas de nomina desde `personal.pre_nomina_autorizada`
