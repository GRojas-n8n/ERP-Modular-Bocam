# Hito 25 - Contabilidad concilia pasivo proyectado con fondos comprometidos

Fecha: 2026-03-18

## Objetivo

Conciliar el pasivo proyectado creado por `compras.oc_creada` con el evento `finanzas.fondos_comprometidos`, para que la OC quede trazada contablemente desde el compromiso presupuestal inicial hasta su liberacion o pago.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas: `OrdenCompra` como referencia funcional externa; `AsientoContable` como entidad soberana de `Contabilidad`.
3. Aislamiento multi-tenant: la conciliacion se resuelve solo dentro de `createTenantContext(...)`.
4. Alcance multi-proyecto: el asiento y el movimiento financiero se correlacionan solo si comparten `tenant_id` y `proyecto_id`.
5. Interoperabilidad: no se crean joins ni escrituras cruzadas; `Contabilidad` consume el evento de `Finanzas` y actualiza exclusivamente su propio asiento.

## Cambios realizados

### 1. Nuevo contrato de consumo

Archivo:

- `apps/contabilidad/src/types.ts`

Se agrego:

- `FondosComprometidosPayload`
- `ContabilidadConsumedEvents.FONDOS_COMPROMETIDOS = 'finanzas.fondos_comprometidos'`

### 2. Nuevo consumidor real en `Contabilidad`

Archivo:

- `apps/contabilidad/src/main.ts`

Se implemento `handleFondosComprometidosEvent(...)` con este flujo:

1. Valida el payload emitido por `Finanzas`.
2. Busca el asiento `PASIVO_PROYECTADO` usando la misma referencia funcional:
   - `referencia_funcional = OC:<referencia_oc_id>`
3. Si ya esta conciliado con ese `movimiento_id`, resuelve en modo idempotente.
4. Si no, actualiza el mismo asiento con:
   - `evento_conciliacion_key = finanzas.fondos_comprometidos:<movimiento_id>`
   - `conciliado_at = now()`
   - notas de conciliacion presupuestal

Con esto el pasivo proyectado deja de ser solo una proyeccion contable suelta y pasa a quedar enlazado al congelamiento real del presupuesto.

### 3. Suscripcion activa

Archivo:

- `apps/contabilidad/src/main.ts`

`Contabilidad` ahora escucha tambien:

- `finanzas.fondos_comprometidos`

junto con:

- `compras.oc_creada`
- `compras.oc_cancelada`
- `finanzas.fondos_liberados`
- `finanzas.pago_registrado`
- `finanzas.transferencia_presupuestal`

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.fondos-comprometidos.conciliacion.integration.test.ts`

La prueba ejecuta un escenario real con:

- RabbitMQ real
- PostgreSQL de `Finanzas`
- PostgreSQL de `Contabilidad`
- consumer real de `Finanzas` para `compras.oc_creada`
- consumer real de `Contabilidad` para `compras.oc_creada` y `finanzas.fondos_comprometidos`

Valida:

1. `compras.oc_creada` genera el pasivo proyectado
2. `Finanzas` crea el movimiento de compromiso y publica `finanzas.fondos_comprometidos`
3. `Contabilidad` concilia el pasivo proyectado con ese `movimiento_id`
4. el reenvio del mismo evento mantiene idempotencia en ambos modulos

## Scripts

Se agrego en:

- `apps/contabilidad/package.json`

el comando:

- `test:integration:finanzas-compromiso-conciliacion`

Y se incorporo al runner raiz:

- `package.json`
- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-compromiso-conciliacion -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

La OC ya queda trazada contablemente desde su nacimiento:

- `compras.oc_creada` -> `PASIVO_PROYECTADO`
- `finanzas.fondos_comprometidos` -> conciliacion del pasivo proyectado
- `compras.oc_cancelada` -> `REVERSION_PASIVO_PROYECTADO`
- `finanzas.fondos_liberados` -> conciliacion de la reversa

Con esto el circuito de la OC ya tiene correlacion contable y presupuestal completa por referencia funcional `OC:<oc_id>`.

## Siguiente paso recomendado

El siguiente paso con mas valor es extender el mismo patron a cierre fiscal:

- conciliar `finanzas.pago_registrado` con CFDI y estatus fiscal en `Contabilidad`
- preparar polizas de nomina desde `personal.pre_nomina_autorizada`
- incorporar conciliacion bancaria y cierre mensual
