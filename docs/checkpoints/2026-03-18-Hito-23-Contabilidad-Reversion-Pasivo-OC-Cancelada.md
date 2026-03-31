# Hito 23 - Contabilidad revierte pasivo proyectado por cancelacion de OC

Fecha: 2026-03-18

## Objetivo

Extender `Contabilidad` para consumir `compras.oc_cancelada` y revertir el pasivo proyectado creado previamente por `compras.oc_creada`, manteniendo:

- soberania de datos entre modulos
- aislamiento por `tenant_id` + `proyecto_id`
- idempotencia por evento
- trazabilidad con `correlation_id`

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades del MDM tocadas: `OrdenCompra` como referencia externa del modulo `Compras`; `AsientoContable` como entidad soberana de `Contabilidad`.
3. Aislamiento de tenant: toda persistencia se ejecuta mediante `createTenantContext(...)`.
4. Alcance de proyecto: el evento exige `tenant_id` y `proyecto_id` en `context`, y el asiento se registra en ese mismo contexto.
5. Eventos emitidos: al crear la reversa se publica `contabilidad.asiento_contable_generado`.

## Cambios realizados

### 1. Nuevo contrato de consumo

Archivo:

- `apps/contabilidad/src/types.ts`

Se agrego:

- `OrdenCompraCanceladaPayload`
- `ContabilidadConsumedEvents.ORDEN_COMPRA_CANCELADA = 'compras.oc_cancelada'`

El payload minimo requerido para ejecutar la reversa es:

- `oc_id`
- `codigo`
- `total`

`presupuesto_id` queda como dato opcional de trazabilidad en notas.

### 2. Nuevo consumidor real en `Contabilidad`

Archivo:

- `apps/contabilidad/src/main.ts`

Se implemento:

- `handleOrdenCompraCanceladaEvent(...)`

La logica sigue este orden:

1. Valida contrato de entrada.
2. Busca el asiento original generado por `compras.oc_creada` usando:
   - `external_event_key = compras.oc_creada:<oc_id>`
3. Si el pasivo original existe y no esta revertido:
   - actualiza su `estatus` a `REVERTIDO`
   - agrega una nota de reversa
4. Crea un nuevo asiento idempotente de reversa con:
   - `external_event_key = compras.oc_cancelada:<oc_id>`
   - `tipo_poliza = REVERSION_PASIVO_PROYECTADO`
   - `folio_poliza = POL-REV-*`
   - `estatus = REVERTIDO`
   - `cfdi_status = NO_APLICA`
5. Publica `contabilidad.asiento_contable_generado` solo si la reversa fue creada por primera vez.

Con esto la cancelacion de la OC ya no deja un pasivo proyectado vivo en contabilidad.

### 3. Suscripcion al evento

Archivo:

- `apps/contabilidad/src/main.ts`

`Contabilidad` ahora queda suscrito a:

- `finanzas.pago_registrado`
- `compras.oc_creada`
- `compras.oc_cancelada`
- `finanzas.transferencia_presupuestal`

## Prueba de integracion real

Archivo:

- `apps/contabilidad/test/integration/compras.oc-cancelada.integration.test.ts`

La prueba usa:

- RabbitMQ real
- PostgreSQL real del modulo `Contabilidad`
- publisher real del lado `Compras`

Valida el flujo:

1. Publicar `compras.oc_creada`
2. Confirmar creacion del asiento `PASIVO_PROYECTADO`
3. Publicar `compras.oc_cancelada`
4. Confirmar que el asiento original cambia a `REVERTIDO`
5. Confirmar que existe un asiento nuevo:
   - `REVERSION_PASIVO_PROYECTADO`
   - `external_event_key = compras.oc_cancelada:<oc_id>`
6. Reenviar el mismo evento
7. Confirmar que no se duplica la reversa ni el evento contable saliente

## Scripts

Se agrego en:

- `apps/contabilidad/package.json`

el comando:

- `test:integration:compras-oc-cancelada`

Y el runner raiz en:

- `package.json`

ahora lo incluye dentro de:

- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:compras-oc-cancelada -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` ya cubre el ciclo contable basico de una OC:

- `compras.oc_creada` -> registra `PASIVO_PROYECTADO`
- `compras.oc_cancelada` -> registra `REVERSION_PASIVO_PROYECTADO`

El sistema conserva soberania modular, evita duplicados por reenvio y deja trazabilidad completa del cambio contable por evento.

## Siguiente paso recomendado

El siguiente paso con mas valor es extender `Contabilidad` para:

- conciliar `compras.oc_cancelada` con `finanzas.fondos_liberados` por referencia funcional
- `personal.pre_nomina_autorizada` para polizas de nomina
- cierre fiscal mensual con eventos de CFDI y conciliacion
