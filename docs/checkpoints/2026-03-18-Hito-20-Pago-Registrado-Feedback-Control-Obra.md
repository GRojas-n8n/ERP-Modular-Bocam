# Hito 20 - Feedback loop `finanzas.pago_registrado` -> `control-obra`

Fecha: 2026-03-18

## Objetivo

Cerrar el feedback loop del tramo de pagos para que un pago real registrado en `Finanzas` publique el evento `finanzas.pago_registrado` y `Control de Obra` pueda reaccionar de forma asíncrona, idempotente y trazable, marcando la estimacion relacionada como cerrada financieramente.

## Decision arquitectonica

En esta iteracion el ciclo se cerró contra `Control de Obra` y no contra `Contabilidad`, porque en el monorepo actual no existe aun un modulo `apps/contabilidad` propietario de ese dominio. Se mantuvo la regla de soberania de datos: `Finanzas` no actualiza tablas de `Control de Obra` por acceso directo; publica un evento de dominio y el modulo consumidor resuelve su propio estado.

## Cambios realizados

### 1. `Finanzas` publica `finanzas.pago_registrado` en el pago real

Archivo principal:

- `apps/finanzas/src/main.ts`

Se ajustó el endpoint `PATCH /api/v1/finanzas/pagos/:id/pagar` para:

- generar/propagar `correlation_id` desde el request HTTP;
- publicar `finanzas.pago_registrado` despues de confirmar el pago en la base de datos;
- incluir en el payload los campos minimos para un cierre financiero aguas abajo:
  - `id_pago`
  - `presupuesto_id`
  - `monto_pagado`
  - `fecha_pago_real`
  - `referencia_modulo`
  - `referencia_entidad`
  - `referencia_id`
  - `concepto`
  - `beneficiario`
- devolver la respuesta API con `correlation_id` en `meta`.

Tambien se removió un residuo de parche incorrecto que estaba contaminando `GET /api/v1/finanzas/presupuestos` con un intento de publicacion de `PAGO_REGISTRADO`.

### 2. `Control de Obra` consume el evento y cierra la estimacion

Archivos:

- `apps/control-obra/src/main.ts`
- `apps/control-obra/src/db.ts`

Se agregó el handler `handlePagoRegistradoEvent(...)`, suscrito a `finanzas.pago_registrado`, con estas reglas:

- valida contrato minimo del payload;
- ignora eventos que no pertenezcan a `control-obra` / `Estimacion`;
- ejecuta la mutacion bajo `createTenantContext(...)` con `tenant_id` y `proyecto_id`;
- cambia la estimacion a `FACTURADA`;
- agrega traza en `notas` con el `id_pago`;
- resuelve idempotencia si la estimacion ya está `FACTURADA`;
- deja logs estructurados para `invalid_payload`, `ignored`, `estimacion_not_found`, `applied` e `idempotent`.

Adicionalmente, `control-obra` ya puede usar `CONTROL_OBRA_DATABASE_URL` para pruebas cruzadas de integracion, sin romper el aislamiento entre esquemas.

### 3. Prueba de integracion real con RabbitMQ y PostgreSQL

Archivo:

- `apps/control-obra/test/integration/finanzas.pago-registrado.integration.test.ts`

La prueba valida el ciclo real:

1. Se siembra una estimacion `APROBADA_FINANCIERA` en `Control de Obra`.
2. Se siembra un `programa_pagos` referenciando esa estimacion en `Finanzas`.
3. Se ejecuta `PATCH /api/v1/finanzas/pagos/:id/pagar`.
4. `Finanzas` publica `finanzas.pago_registrado`.
5. `Control de Obra` consume el evento y cambia la estimacion a `FACTURADA`.
6. Se reenvia el mismo evento y se verifica que no exista segunda mutacion.

Se estabilizó el teardown de la prueba con una espera corta despues del segundo evento, para evitar cerrar el canal AMQP antes del `ack` final del consumer.

## Validaciones ejecutadas

Se ejecutaron y pasaron:

- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npm run test:integration:finanzas-pago-feedback -w @bocam/control-obra`
- `npm run test:integration:intermodulo`

## Estado del sistema tras este hito

El sistema ahora ya tiene feedback loop asíncrono y real en el tramo:

`Finanzas -> Control de Obra`

Flujo cerrado:

- pago registrado en `Finanzas`
- evento de dominio emitido con `correlation_id`
- consumo aislado en `Control de Obra`
- cierre idempotente de la estimacion pagada

Con esto, los loops inter-modulo principales ya cubiertos son:

- `Compras -> Finanzas -> Compras`
- `Control de Obra -> Finanzas`
- `Finanzas -> Control de Obra`

## Siguiente paso recomendado

El siguiente paso con mas valor es crear el modulo `Contabilidad` o formalizar su ausencia en la arquitectura directiva. Una vez exista, conviene replicar el mismo patron para:

- `finanzas.pago_registrado -> contabilidad.asiento_contable_generado`
- `finanzas.transferencia_presupuestal -> contabilidad.poliza_generada`

Y acompañarlo con pruebas negativas de contrato e integraciones reales de cierre contable.
