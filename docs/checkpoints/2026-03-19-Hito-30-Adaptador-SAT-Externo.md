# Hito 30 - Adaptador SAT externo para cierre fiscal end-to-end

Fecha: 2026-03-19

> Estado: supersedido como camino operativo principal por el flujo asincrono documentado en `docs/checkpoints/2026-03-19-Hito-31-SAT-Async-Evento-Callback.md`. Este checkpoint queda como antecedente del desacople posterior.

## Objetivo

Sustituir la validacion SAT controlada/manual como camino principal por una integracion con un adaptador externo configurable, de forma que `Contabilidad` complete el cierre fiscal end-to-end sin acoplarse directamente al SAT ni romper el aislamiento SaaS.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `ConciliacionFiscal`
   - `AsientoContable`
3. Aislamiento multi-tenant: toda consulta y mutacion sigue corriendo bajo `createTenantContext(...)`.
4. Alcance multi-proyecto: la validacion externa siempre opera con `tenant_id + proyecto_id + user_id` del JWT.
5. Integracion externa: `Contabilidad` no habla directo con SAT; consume un adaptador HTTP externo configurable por `.env`, alineado con la directiva de delegar integraciones lentas/especializadas fuera del core.

## Cambios realizados

### 1. Adaptador SAT externo aislado

Archivo:

- `apps/contabilidad/src/sat-adapter.ts`

Se agrego un cliente de integracion con proveedor externo que:

- toma `SAT_ADAPTER_BASE_URL` desde `.env`
- soporta `SAT_ADAPTER_API_KEY`
- propaga `X-Correlation-Id`
- aplica timeout con `SAT_ADAPTER_TIMEOUT_MS`
- valida contrato de respuesta
- nunca embebe secretos en codigo

El endpoint esperado del adaptador es:

- `POST {SAT_ADAPTER_BASE_URL}/validate-cfdi`

El payload incluye solo el contexto y los datos soberanos necesarios para validar el CFDI:

- `tenant_id`
- `proyecto_id`
- `user_id`
- `id_conciliacion`
- `id_asiento`
- `pago_id`
- `uuid_fiscal`
- `rfc_emisor`
- `rfc_receptor`
- `monto_total`
- `moneda`
- `fecha_emision`

### 2. Unificacion de reglas SAT internas

Archivo:

- `apps/contabilidad/src/main.ts`

Se extrajo `applySatValidationResult(...)` para que la aplicacion del resultado SAT sea identica en ambos caminos:

- validacion manual existente
- validacion por adaptador externo

Ese helper concentra:

- resolucion de `ConciliacionFiscal`
- validacion de existencia del asiento
- mapeo `estatus_sat -> cfdi_status`
- actualizacion de `ConciliacionFiscal`
- actualizacion de `AsientoContable`
- reevaluacion de cierre con `syncPagoAccountingCloseStatus(...)`
- idempotencia

Con eso se evita duplicidad y deriva de reglas entre flujos manuales y externos.

### 3. Nuevo endpoint oficial de validacion externa

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat-externo`

La ruta:

- exige JWT y `requireRoles('admin', 'finance')`
- resuelve la conciliacion fiscal dentro del tenant
- toma el CFDI ya conciliado
- invoca al adaptador SAT externo
- aplica el resultado usando las mismas reglas del cierre fiscal
- publica `contabilidad.cfdi_sat_validado`

Tambien maneja errores tipados para:

- adaptador no configurado
- timeout
- respuesta invalida del proveedor
- rechazo de credenciales
- errores aguas abajo del adaptador

### 4. Se mantiene la ruta manual como override controlado

Archivo:

- `apps/contabilidad/src/main.ts`

La ruta manual:

- `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat`

no se elimino, pero ahora reutiliza la misma logica central de aplicacion. Queda como override operativo o fallback, mientras que el camino recomendado ya es el adaptador externo.

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.pago-sat-externo.integration.test.ts`

La prueba levanta un proveedor SAT mock local por HTTP y valida:

1. `Finanzas` registra un pago real
2. `Contabilidad` materializa asiento y conciliacion fiscal
3. se concilia el CFDI
4. `Contabilidad` consulta el adaptador externo
5. el proveedor responde `VIGENTE` o `CANCELADO`
6. `Contabilidad` actualiza estatus fiscal y asiento
7. se emite `contabilidad.cfdi_sat_validado`
8. el `correlation_id` llega intacto al adaptador

La prueba cubre ambos caminos:

- CFDI `VIGENTE`
- CFDI `CANCELADO`

## Scripts

Archivos:

- `apps/contabilidad/package.json`
- `package.json`

Se agrego:

- `test:integration:finanzas-sat-externo`

Y se sumo al runner:

- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-sat-externo -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` ya completa el cierre fiscal con un proveedor externo configurable, sin depender del input manual del estatus SAT como camino principal y sin hablar directo con SAT desde el core.

El flujo ahora queda asi:

1. `Finanzas` registra pago
2. `Contabilidad` abre placeholder fiscal
3. usuario o proceso concilia CFDI
4. `Contabilidad` consulta al adaptador SAT externo
5. se aplica `SAT_VIGENTE` o `SAT_CANCELADO`
6. el asiento puede cerrarse junto con conciliacion bancaria

## Siguiente paso recomendado

El siguiente paso con mas valor es desacoplar esta consulta a un proceso asincrono por evento/webhook hacia n8n o un worker de integracion, para que la llamada al adaptador SAT no viva en la ruta HTTP interactiva del usuario.
