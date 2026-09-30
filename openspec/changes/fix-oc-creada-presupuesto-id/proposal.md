## Why

Lote **B2** del change `auditar-consumidores-eventbus-sin-perdida-silenciosa`. El publicador de `compras.oc_creada` (`apps/compras/src/main.ts`, paso 1.8 de `convertir-oc`) no incluye `presupuesto_id`, pero Contabilidad (`handleOrdenCompraCreadaEvent`) y Finanzas (`handleOrdenCompraCreadaEvent`) lo exigen y, al faltar, hacen `return` tras un log `invalid_payload`. Como el bus confirma el mensaje, todo `oc_creada` real se descarta en silencio: no se genera el asiento de pasivo proyectado en Contabilidad ni el compromiso presupuestal por evento en Finanzas. `compras.oc_cancelada` sí incluye `presupuesto_id`, por lo que el contrato hoy es asimétrico.

Revisión previa (solo lectura del repositorio):

- `convertir-oc` es la **única** ruta que crea una `OrdenCompra` (`prisma.ordenCompra.create`, `main.ts:3154`). No hay otra ruta manual, de texto libre ni de catálogo que la cree por separado: los renglones de catálogo, de texto libre e imprevistos pasan por el mismo flujo.
- Antes de crear la OC, la ruta responde 422 (`SIN_PRESUPUESTO_SINCRONIZADO`) o 400 si no logra resolver `presupuesto_id`. Por tanto, toda OC que llega a publicar `oc_creada` tiene `presupuesto_id` no nulo y lo persiste en la propia OC.
- La columna `OrdenCompra.presupuesto_id` es `String?` en el esquema (herencia), pero no existe una OC válida publicable con `presupuesto_id = null`. El campo es obligatorio en todo evento real.

## What Changes

- El payload de `compras.oc_creada` incluye `presupuesto_id` (adición compatible: no se renombra ni se quita ningún campo).
- Los payloads de `oc_creada` y `oc_cancelada` se construyen en funciones puras de `apps/compras/src/oc-eventos.ts`, que la ruta usa. El payload de `oc_cancelada` no cambia; la extracción solo permite probar la simetría de ambos contratos.
- Pruebas con el payload construido por el publicador real: Contabilidad y Finanzas lo aceptan y el reenvío es idempotente.

## Capabilities

### New Capabilities

- `evento-compras-oc-creada`: contrato del evento `compras.oc_creada` y su simetría con `compras.oc_cancelada`.

### Modified Capabilities

(ninguna)

## Impact

- `apps/compras/src/main.ts` (publicación en `convertir-oc` y las dos publicaciones de `oc_cancelada`), nuevo `apps/compras/src/oc-eventos.ts`, pruebas en Compras y cableado en el workflow `backend-e2e`.
- Sin cambios en Contabilidad ni Finanzas (ya esperan el campo), ni de versión del evento, routing key, retry, DLQ, colas, outbox o lógica contable.
- Efecto visible tras desplegar: Contabilidad y Finanzas empiezan a procesar `oc_creada` que hoy descartan. Finanzas podría duplicar un compromiso ya hecho por otra vía; su handler es idempotente por movimiento (`COMPROMISO` por `referencia_id`). Se revisa antes del despliegue, que este change no incluye.
