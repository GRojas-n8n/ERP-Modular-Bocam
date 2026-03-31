# Hito 27 - Contabilidad valida SAT y enlaza conciliacion bancaria

Fecha: 2026-03-19

## Objetivo

Extender el cierre del pago para que `Contabilidad` ya no se quede solo en CFDI conciliado, sino que pueda:

1. distinguir CFDI `VIGENTE` vs `CANCELADO` con estado SAT persistido
2. abrir y cerrar conciliacion bancaria propia a partir de `finanzas.pago_registrado`
3. cerrar el asiento solo cuando existan vigencia SAT y conciliacion bancaria compatibles

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`, con un ajuste minimo de contrato en `Finanzas`.
2. Entidades tocadas:
   - `AsientoContable`
   - `ConciliacionFiscal`
   - nueva entidad soberana `ConciliacionBancaria`
3. Aislamiento multi-tenant: toda operacion corre bajo `createTenantContext(...)`.
4. Alcance multi-proyecto: toda mutacion sigue ligada a `tenant_id + proyecto_id`.
5. Integracion: `Finanzas` solo publica datos del pago; `Contabilidad` resuelve SAT y banco sin consultas cruzadas.

## Cambios realizados

### 1. Modelo contable ampliado

Archivo:

- `apps/contabilidad/prisma/schema.prisma`

Se agrego:

- `AsientoContable.bancario_status`
- `ConciliacionFiscal.estatus_sat`
- `ConciliacionFiscal.fecha_validacion_sat`
- `ConciliacionFiscal.fecha_cancelacion_sat`
- `ConciliacionFiscal.ultima_verificacion_sat_at`
- `ConciliacionFiscal.mensaje_sat`
- nueva tabla `ConciliacionBancaria`

Con esto el modulo ahora separa claramente:

- conciliacion CFDI
- validacion SAT
- conciliacion bancaria

### 2. Contrato de pago enriquecido desde Finanzas

Archivos:

- `apps/finanzas/src/types.ts`
- `apps/finanzas/src/main.ts`

`finanzas.pago_registrado` ahora publica tambien:

- `moneda`
- `referencia_bancaria`
- `metodo_pago`
- `banco`

Eso evita cualquier anti-patron de consulta cruzada desde `Contabilidad`.

### 3. Placeholders fiscal y bancario al recibir el pago

Archivo:

- `apps/contabilidad/src/main.ts`

`handlePagoRegistradoEvent(...)` ahora:

1. crea el asiento `EGRESO`
2. abre `ConciliacionFiscal` en `PENDIENTE_CFDI`
3. abre `ConciliacionBancaria` en `PENDIENTE_MOVIMIENTO`

Ademas, el asiento de pago ahora arranca con:

- `cfdi_status = PENDIENTE`
- `bancario_status = PENDIENTE`

Mientras que las polizas no bancarias quedan en:

- `bancario_status = NO_APLICA`

### 4. Validacion SAT real dentro de Contabilidad

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat`

La ruta:

- exige JWT y `requireRoles('admin', 'finance')`
- valida `estatus_sat = VIGENTE | CANCELADO`
- exige que ya exista UUID fiscal
- persiste metadata SAT
- cambia `AsientoContable.cfdi_status` a:
  - `SAT_VIGENTE`
  - `SAT_CANCELADO`
- deja el asiento en:
  - `REGISTRADO` si SAT esta vigente pero aun no hay banco
  - `OBSERVADO` si SAT reporta cancelacion

Tambien se agrego el evento:

- `contabilidad.cfdi_sat_validado`

### 5. Conciliacion bancaria soberana

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/asientos/:id/conciliar-banco`

La ruta:

- exige JWT y `requireRoles('admin', 'finance')`
- valida monto del movimiento bancario contra el asiento
- obliga a respetar la referencia bancaria funcional
- trabaja en modo idempotente
- cambia `AsientoContable.bancario_status` a `CONCILIADO`

Tambien se agrego el evento:

- `contabilidad.conciliacion_bancaria_actualizada`

### 6. Cierre real del asiento

Archivo:

- `apps/contabilidad/src/main.ts`

Se incorporo `syncPagoAccountingCloseStatus(...)` con esta regla:

- `SAT_VIGENTE` + banco `CONCILIADO` -> asiento `CERRADO`
- `SAT_CANCELADO` -> asiento `OBSERVADO`

Con eso el cierre ya no depende de un solo paso parcial.

### 7. Hardening de concurrencia

Archivo:

- `apps/contabilidad/src/main.ts`

`persistAsientoFromEvent(...)` ahora recupera conflictos `P2002` como idempotencia concurrente si dos entregas del mismo evento compiten por el mismo folio o `external_event_key`.

## Integraciones reales agregadas

Archivo:

- `apps/contabilidad/test/integration/finanzas.pago-sat-banco.conciliacion.integration.test.ts`

La prueba cubre:

1. `Finanzas` paga y publica `finanzas.pago_registrado`
2. `Contabilidad` crea asiento + placeholder fiscal + placeholder bancario
3. se concilia CFDI
4. SAT valida como `VIGENTE`
5. banco concilia el pago y el asiento queda `CERRADO`
6. un segundo intento bancario responde idempotente
7. otro escenario valida SAT como `CANCELADO` y el asiento queda `OBSERVADO`

Tambien se ajusto:

- `apps/contabilidad/test/integration/finanzas.pago-cfdi.conciliacion.integration.test.ts`

para filtrar eventos por `tenant_id` y no por conteo global.

## Scripts

Archivos:

- `apps/contabilidad/package.json`
- `package.json`

Se agrego:

- `test:integration:finanzas-sat-banco`

Y se integro al runner:

- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx prisma generate --schema apps/contabilidad/prisma/schema.prisma`
- `npx prisma db push --accept-data-loss --schema apps/contabilidad/prisma/schema.prisma`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npm run test:integration:finanzas-pago-cfdi -w @bocam/contabilidad`
- `npm run test:integration:finanzas-sat-banco -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` ahora distingue tres capas del cierre del pago:

- contable
- fiscal SAT
- bancario

Y el asiento ya queda trazado asi:

`finanzas.pago_registrado -> CFDI conciliado -> SAT validado -> banco conciliado -> asiento CERRADO`

o bien:

`finanzas.pago_registrado -> CFDI conciliado -> SAT cancelado -> asiento OBSERVADO`

## Siguiente paso recomendado

El siguiente paso con mas valor es profundizar el cierre financiero-fiscal operativo:

- conciliacion bancaria masiva por lote/estado de cuenta
- ingestion de CFDI/SAT desde proveedor externo real o adaptador formal
- polizas e impuestos derivados de nomina y retenciones
