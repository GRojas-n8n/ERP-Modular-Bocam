# Hito 19 - Finanzas eventos salientes reales y feedback loop con Compras

Fecha: 2026-03-18
Estado: Completado y validado

## Objetivo

Cerrar el ciclo inter-modulo de `Compras <-> Finanzas` haciendo que `Finanzas` publique eventos dominio reales y que `Compras` los consuma para resolver estados de OCs por la via asincrona.

Eventos cubiertos:

- `finanzas.fondos_comprometidos`
- `finanzas.fondos_liberados`
- `finanzas.presupuesto_insuficiente`

## Decision arquitectonica

Se aplicaron estas reglas:

1. `Finanzas` publica los eventos solo despues de confirmar el efecto en su propia BD.
2. No se emiten eventos dentro de la transaccion Prisma/RLS.
3. `Compras` consume esos eventos y actualiza exclusivamente su propia entidad `OrdenCompra`.
4. La sincronizacion HTTP sigue existiendo, pero el sistema ya no depende solo de ella para cerrar estados.

## Cambios realizados

### 1. Publicacion real de eventos en Finanzas

Archivo:

- `apps/finanzas/src/main.ts`

Cambio principal:

- Se agrego `publishFinanceDomainEvent(...)` para publicar eventos dominio con `tenant_id`, `proyecto_id`, `user_id` y `correlation_id`.

Ahora `Finanzas` publica realmente:

- `finanzas.fondos_comprometidos`
  - desde `POST /comprometer-fondos`
  - desde `handleOrdenCompraCreadaEvent(...)`

- `finanzas.presupuesto_insuficiente`
  - desde `POST /comprometer-fondos`
  - desde `handleOrdenCompraCreadaEvent(...)`

- `finanzas.fondos_liberados`
  - desde `POST /liberar-fondos`
  - desde `handleOrdenCompraCanceladaEvent(...)`

Adicionalmente:

- Se expuso `initEventBus()` para pruebas e integraciones sin levantar el servidor HTTP completo.

### 2. Contratos de payload mas completos

Archivo:

- `apps/finanzas/src/types.ts`

Cambios:

- `FondosComprometidosPayload` ahora admite `idempotente`.
- `PresupuestoInsuficientePayload` ahora admite `idempotente`.
- Se agrego `FondosLiberadosPayload`.

Esto permite que los consumidores conozcan si el evento representa una resolucion nueva o un replay idempotente.

### 3. Consumers aguas abajo en Compras

Archivo:

- `apps/compras/src/main.ts`

Nuevos handlers:

- `handleFondosComprometidosEvent(...)`
- `handleFondosLiberadosEvent(...)`
- `handlePresupuestoInsuficienteEvent(...)`

Comportamiento:

- validan payload
- operan bajo `createTenantContext(...)`
- resuelven idempotencia por estado actual de la OC
- actualizan solo `OrdenCompra` en el modulo `Compras`

Transiciones resultantes:

- `PENDIENTE_CONFIRMACION_FINANZAS -> EMITIDA`
- `CANCELACION_PENDIENTE -> CANCELADA`
- `PENDIENTE_CONFIRMACION_FINANZAS -> ERROR_FINANZAS`

`Compras` ya se suscribe a:

- `finanzas.fondos_comprometidos`
- `finanzas.fondos_liberados`
- `finanzas.presupuesto_insuficiente`

### 4. Aislamiento por modulo tambien en la capa de datos

Archivos:

- `apps/compras/src/db.ts`
- `apps/finanzas/src/db.ts`

Se agrego soporte a:

- `COMPRAS_DATABASE_URL`
- `FINANZAS_DATABASE_URL`

con fallback a `DATABASE_URL`.

Esto permite ejecutar pruebas cruzadas donde ambos modulos coexisten en el mismo proceso sin perder soberania de schema.

### 5. Prueba de ciclo completo

Archivo:

- `apps/compras/test/integration/finanzas.feedback.integration.test.ts`

Cobertura:

1. `compras.oc_creada`
2. `Finanzas` compromete fondos
3. `Finanzas` publica `finanzas.fondos_comprometidos`
4. `Compras` actualiza la OC a `EMITIDA`
5. `compras.oc_cancelada`
6. `Finanzas` libera fondos
7. `Finanzas` publica `finanzas.fondos_liberados`
8. `Compras` actualiza la OC a `CANCELADA`
9. `compras.oc_creada` sin suficiencia
10. `Finanzas` publica `finanzas.presupuesto_insuficiente`
11. `Compras` actualiza la OC a `ERROR_FINANZAS`

### 6. Scripts y pipeline

Archivos:

- `apps/compras/package.json`
- `package.json`
- `.github/workflows/backend-e2e.yml`

Cambios:

- Nuevo script:
  - `test:integration:finanzas-feedback`
- `test:integration:intermodulo` ahora incluye el feedback loop completo
- CI ya ejecuta:
  - integraciones inter-modulo
  - contratos invalidos de eventos

## Validaciones ejecutadas

Typecheck:

- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npx tsc --noEmit -p apps/compras/tsconfig.json`

Integracion RabbitMQ:

- `npm run test:integration:intermodulo`

Contratos invalidos:

- `npm run test:integration:event-contracts`

Resultado:

- Todo paso correctamente.

## Estado resultante

Con este hito, el sistema ya tiene un loop event-driven real en el flujo mas sensible de abastecimiento y presupuesto:

- `Compras` emite la intencion
- `Finanzas` resuelve el efecto financiero
- `Finanzas` publica el resultado de negocio
- `Compras` consume la resolucion y consolida el estado local

Esto reduce dependencia del camino HTTP sin romper:

- soberania de datos
- multi-tenant
- multi-proyecto
- idempotencia
- trazabilidad distribuida por `correlation_id`

## Siguiente paso recomendado

Replicar este mismo patron de salida y feedback en otros flujos de `Finanzas`, por ejemplo:

- `finanzas.pago_registrado` hacia `Control de Obra` o `Contabilidad`
- consumidores reales para devengos, conciliacion y cierre
- pruebas de replay y reordenamiento de eventos en escenarios de recuperacion operativa
