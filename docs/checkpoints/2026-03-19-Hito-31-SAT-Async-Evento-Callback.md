# Hito 31 - SAT asincrono por evento y callback externo

Fecha: 2026-03-19

## Objetivo

Mover la validacion SAT fuera de la ruta HTTP interactiva del ERP y reemplazarla por un flujo asincrono, trazable y desacoplado, alineado con la directiva de integraciones lentas/especializadas via worker o n8n.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `ConciliacionFiscal`
   - `AsientoContable`
3. Aislamiento multi-tenant: toda lectura y mutacion sigue ejecutandose dentro de `createTenantContext(...)`.
4. Alcance multi-proyecto: el evento y el callback transportan `tenant_id + proyecto_id + user_id` como contexto obligatorio.
5. Integracion externa: el core ERP ya no consulta SAT en el request del usuario; ahora emite un evento de solicitud y espera un callback autenticado del worker/n8n.

## Cambios realizados

### 1. La ruta externa ya no bloquea al usuario

Archivo:

- `apps/contabilidad/src/main.ts`

La ruta:

- `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat-externo`

dejo de ejecutar una llamada HTTP directa al adaptador SAT. Ahora:

- valida JWT y `requireRoles('admin', 'finance')`
- resuelve la conciliacion dentro del tenant/proyecto activo
- marca la conciliacion como `VALIDACION_EN_PROCESO`
- registra `fuente = 'SAT_ASYNC_REQUEST'`
- responde `202 Accepted`
- publica un evento de dominio para que un worker externo haga la consulta real

### 2. Nuevo evento de solicitud SAT

Archivos:

- `apps/contabilidad/src/types.ts`
- `apps/contabilidad/src/main.ts`

Se agrego el evento:

- `contabilidad.cfdi_sat_validacion_solicitada`

El payload soberano incluye:

- `tenant_id`
- `proyecto_id`
- `user_id`
- `correlation_id`
- `id_conciliacion`
- `id_asiento`
- `pago_id`
- `uuid_fiscal`
- `serie`
- `folio`
- `rfc_emisor`
- `rfc_receptor`
- `monto_total`
- `moneda`
- `fecha_emision`
- `callback_path`
- `callback_method`

Con esto n8n o un worker dedicado puede consultar al SAT/adaptador sin leer BD ajena ni depender de memoria compartida.

### 3. Nuevo callback autenticado para aplicar el resultado

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/integraciones/sat/callback`

La ruta:

- valida `X-Bocam-Secret`
- exige `tenant_id`, `proyecto_id`, `user_id`, `id_conciliacion` y `estatus_sat`
- aplica el resultado usando la misma logica central `applySatValidationResult(...)`
- emite `contabilidad.cfdi_sat_validado` cuando el callback no es idempotente
- conserva `correlation_id` extremo a extremo

El secreto del callback se resuelve con:

- `SAT_CALLBACK_SHARED_SECRET`
- fallback controlado: `SAT_ADAPTER_API_KEY`

### 4. Ajuste de middleware global para integraciones

Archivo:

- `apps/contabilidad/src/main.ts`

Como el callback no entra con JWT de usuario sino con secreto compartido de integracion, se excluyo:

- `/api/v1/contabilidad/integraciones/sat/callback`

de la aplicacion global de auth JWT y `requireProjectAccess()`, dejando la seguridad en el header `X-Bocam-Secret` y en la validacion explicita del contexto SaaS del payload.

### 5. Limpieza del adaptador sin uso

Archivo eliminado:

- `apps/contabilidad/src/sat-adapter.ts`

Ese cliente ya no era parte del camino real despues del cambio a evento/callback. Se elimino para evitar deuda muerta y ambiguedad operativa.

## Flujo resultante

1. `Finanzas` registra pago.
2. `Contabilidad` crea placeholder fiscal.
3. Un usuario o proceso concilia el CFDI base.
4. El usuario solicita validacion SAT externa.
5. `Contabilidad` responde `202` y publica `contabilidad.cfdi_sat_validacion_solicitada`.
6. n8n o worker consulta al proveedor SAT.
7. n8n o worker llama `POST /api/v1/contabilidad/integraciones/sat/callback`.
8. `Contabilidad` aplica `SAT_VIGENTE` o `SAT_CANCELADO`.
9. Si corresponde, el asiento avanza hacia cierre fiscal/bancario.

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.pago-sat-externo.integration.test.ts`

La prueba valida el ciclo completo:

1. `Finanzas` registra un pago real.
2. `Contabilidad` materializa asiento y conciliacion fiscal.
3. Se solicita validacion SAT externa.
4. Se consume `contabilidad.cfdi_sat_validacion_solicitada` desde RabbitMQ real.
5. Un worker simulado invoca el callback autenticado.
6. `Contabilidad` actualiza `ConciliacionFiscal` y `AsientoContable`.
7. Se emite `contabilidad.cfdi_sat_validado`.
8. El `correlation_id` se preserva en evento y callback.

La prueba cubre:

- CFDI `VIGENTE`
- CFDI `CANCELADO`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-sat-externo -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

El cierre fiscal ya no depende de una llamada HTTP sincrona desde la UX hacia un proveedor SAT. El ERP ahora opera con un patron mas robusto:

- request corto para solicitar validacion
- evento de dominio desacoplado
- worker/n8n externo
- callback autenticado
- trazabilidad por `tenant_id`, `proyecto_id` y `correlation_id`

## Siguiente paso recomendado

El siguiente paso con mas valor es endurecer la operacion del worker SAT con:

- reintentos controlados
- DLQ para callbacks/eventos fallidos
- dashboard operativo de conciliaciones en `VALIDACION_EN_PROCESO`
- webhooks firmados o rotacion administrada del secreto de callback
