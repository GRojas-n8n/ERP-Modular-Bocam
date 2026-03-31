# Hito 24 - Contabilidad concilia reversa contable con fondos liberados

Fecha: 2026-03-18

## Objetivo

Conciliar la reversa contable generada por `compras.oc_cancelada` con el evento financiero `finanzas.fondos_liberados`, de modo que el cierre contable y la liberacion presupuestal queden ligados por la misma referencia funcional de negocio.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas: `OrdenCompra` como referencia funcional externa; `AsientoContable` como registro soberano del modulo `Contabilidad`.
3. Aislamiento multi-tenant: toda lectura y mutacion se ejecuta con `createTenantContext(...)`.
4. Alcance multi-proyecto: la conciliacion se resuelve siempre dentro del mismo `tenant_id` y `proyecto_id` recibidos por evento.
5. Eventos: no se crean joins cruzados ni escrituras en `Finanzas`; `Contabilidad` consume el evento y actualiza exclusivamente su propio asiento.

## Cambios realizados

### 1. Persistencia de referencia funcional y conciliacion

Archivo:

- `apps/contabilidad/prisma/schema.prisma`

Se ampliaron los asientos contables con:

- `referencia_funcional`
- `evento_conciliacion_key`
- `conciliado_at`

Ademas se agregaron:

- `@@unique([tenant_id, evento_conciliacion_key])`
- `@@index([tenant_id, proyecto_id, referencia_funcional])`

Con esto `Contabilidad` puede relacionar distintos eventos del mismo ciclo de negocio sin depender de tablas de otros modulos.

### 2. Nuevo contrato de consumo

Archivo:

- `apps/contabilidad/src/types.ts`

Se agrego:

- `FondosLiberadosPayload`
- `ContabilidadConsumedEvents.FONDOS_LIBERADOS = 'finanzas.fondos_liberados'`

### 3. Correlacion por referencia funcional

Archivo:

- `apps/contabilidad/src/main.ts`

Se introdujo `buildFunctionalReference(...)` y ahora los asientos relevantes guardan:

- `OC:<oc_id>` para compras
- `TRF:<transferencia_id>` para transferencias

Esto permite que la reversa contable y la liberacion presupuestal se reconozcan como parte del mismo hecho economico.

### 4. Nuevo consumidor real de `finanzas.fondos_liberados`

Archivo:

- `apps/contabilidad/src/main.ts`

Se implemento `handleFondosLiberadosEvent(...)` con este flujo:

1. Valida el payload recibido desde `Finanzas`.
2. Busca el asiento de reversa contable usando:
   - `referencia_funcional = OC:<referencia_oc_id>`
   - `tipo_poliza = REVERSION_PASIVO_PROYECTADO`
3. Si ya esta conciliado con el mismo `movimiento_id`, responde en modo idempotente.
4. Si no, actualiza el mismo asiento con:
   - `evento_conciliacion_key = finanzas.fondos_liberados:<movimiento_id>`
   - `conciliado_at = now()`
   - nota de conciliacion financiera

No se crea un asiento nuevo para la liberacion, porque el objetivo aqui no es duplicar registro contable, sino cerrar la reversa existente contra el efecto presupuestal real.

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.fondos-liberados.conciliacion.integration.test.ts`

La prueba monta un escenario real con:

- RabbitMQ real
- PostgreSQL de `Finanzas`
- PostgreSQL de `Contabilidad`
- consumer real de `Finanzas` para `compras.oc_cancelada`
- consumer real de `Contabilidad` para `compras.oc_cancelada` y `finanzas.fondos_liberados`

Valida:

1. `compras.oc_creada` crea el pasivo proyectado
2. `compras.oc_cancelada` crea la reversa contable
3. `Finanzas` libera fondos y publica `finanzas.fondos_liberados`
4. `Contabilidad` concilia esa reversa con el `movimiento_id` financiero
5. el reenvio del mismo evento no duplica la conciliacion

## Scripts

Se agrego en:

- `apps/contabilidad/package.json`

el comando:

- `test:integration:finanzas-liberacion-conciliacion`

Y se sumo al runner raiz:

- `package.json`
- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx prisma generate --schema apps/contabilidad/prisma/schema.prisma`
- `npx prisma db push --accept-data-loss --schema apps/contabilidad/prisma/schema.prisma`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-liberacion-conciliacion -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

El ciclo de cancelacion de OC ya queda correlacionado extremo a extremo:

- `compras.oc_cancelada` -> reversa contable
- `finanzas.fondos_liberados` -> conciliacion financiera de esa reversa

La correlacion se resuelve por la misma referencia funcional `OC:<oc_id>`, sin joins cruzados, con idempotencia real y trazabilidad por `correlation_id`.

## Siguiente paso recomendado

El siguiente paso con mas valor es aplicar el mismo patron de conciliacion cruzada a:

- `finanzas.fondos_comprometidos` con `compras.oc_creada` y el pasivo proyectado inicial
- `finanzas.pago_registrado` con cierre fiscal y CFDI en `Contabilidad`
- `personal.pre_nomina_autorizada` para polizas de nomina
