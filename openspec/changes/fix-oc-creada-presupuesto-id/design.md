## Context

Contrato actual del publicador: `{oc_id, codigo, total, proveedor_id, proyecto_id, requisicion_id, concepto_id, items[]}`. Contabilidad exige `oc_id`, `codigo`, `total` (número), `proveedor_id` y `presupuesto_id`. Finanzas exige `oc_id`, `codigo`, `total` y `presupuesto_id`.

## Goals / Non-Goals

**Goals**

- `oc_creada` incluye `presupuesto_id`.
- Las pruebas usan el payload que arma el publicador real, no uno escrito a mano.

**Non-Goals**

- Cambiar versión, routing key, colas, retry, DLQ u outbox (lotes L1–L3 y change de publicadores).
- Cambiar la lógica contable o la política de fallo de los consumidores.
- Cambiar el payload de `oc_cancelada`.

## Decisions

### 1. Campo obligatorio, sin regla de DLQ

`presupuesto_id` es obligatorio en todo evento real (ver proposal). No se define comportamiento para `null`: no existe el caso.

### 2. Funciones puras para armar los payloads

`buildOcCreadaPayload` y `buildOcCanceladaPayload` en `oc-eventos.ts`. La ruta las invoca en los mismos puntos donde hoy arma el objeto. En `oc_creada` se pasa el `presupuesto_id` ya resuelto por la ruta (el mismo que se persistió en la OC); en `oc_cancelada` se conserva el valor de la OC. El payload de `oc_cancelada` es idéntico al actual.

### 3. Pruebas

- Unitaria (`src/oc-eventos.test.ts`, sin BD): el payload de `oc_creada` incluye `presupuesto_id` y los campos que exigen los consumidores; comparte con `oc_cancelada` los campos `oc_id`, `codigo`, `total` y `presupuesto_id`.
- Integración (`test/integration/oc-creada-contrato-consumidores.integration.test.ts`, requiere PostgreSQL): el payload construido con la OC real se entrega a los handlers de Contabilidad y Finanzas, ambos lo aceptan, y un segundo envío no duplica asiento ni compromiso.

## Risks / Trade-offs

- Al arreglar el contrato, dos consumidores empiezan a procesar eventos que antes descartaban: Contabilidad creará el pasivo proyectado y Finanzas el compromiso. Revisar antes del despliegue que Finanzas no duplique el compromiso que ya se hace por `gerencia_tecnica.partida_comprometida` (o por HTTP en el flujo sin partida).
- Extraer los constructores toca los tres puntos de publicación; el payload de `oc_cancelada` no cambia y lo cubre la prueba.
