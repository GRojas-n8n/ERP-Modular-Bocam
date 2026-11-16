## Why

Las recepciones de una Orden de Compra pueden no estar generando los INGRESOS de Almacén, y los fallos no dejan rastro recuperable. Por análisis estático, respaldado por la evidencia de `evidence-2026-09-25.md`:

- Compras publica `compras.oc_recibida_total` solo al cerrar la OC y sin `orden_compra_id` ni `items[]`, que Almacén exige; sin ellos lo ignora y lo confirma. `compras.oc_recibida_parcial` no se publica.
- El handler de Almacén traga los errores y el `EventBus` descarta el mensaje ante cualquier excepción (sin cola de mensajes fallidos).
- La publicación de Compras no es fiable: sin outbox, sin confirmación del broker y con el resultado ignorado.
- La idempotencia por OC e insumo ignoraría una segunda recepción parcial legítima.

En producción, Almacén nunca creó un movimiento desde el 2026-07-21, con como máximo 2 recepciones (ya purgadas). No hay datos vivos afectados; el riesgo es prospectivo.

## What Changes

- Un contrato de evento versionado y único por recepción, `compras.recepcion_oc_registrada.v1`, con `event_id`, ítems recibidos con `recepcion_item_id` y un snapshot autosuficiente.
- Outbox transaccional en Compras: la recepción y el evento se guardan en la misma transacción y un despachador los publica con reintentos, marcándolos publicados solo tras la confirmación del broker y recuperándose tras reinicios.
- Publicación confirmada en `@bocam/event-bus`, además de reintentos con espera y cola de mensajes fallidos, activables por suscripción.
- Almacén procesa cada evento de forma atómica, con idempotencia por `event_id` y por `recepcion_id` más `recepcion_item_id`, sin confirmar mensajes cuyos ítems fallaron. Los ítems sin `insumo_id` no son inventariables y solo generan un registro informativo.
- Colas nuevas solo para las suscripciones nuevas (`.v2`, corregida después por la `.v3` sin TTL); las colas durables actuales no se tocan.
- `/health` sigue siendo prueba de vida; nuevo `/ready` para dependencias.
- Conciliación histórica: cuantificada y **bloqueada** hasta una autorización expresa; se construye un reporte de solo lectura para el futuro.
- Pruebas primero, en PR separados por servicio.

## Capabilities

### New Capabilities

- `evento-recepcion-oc-registrada`: contrato versionado del evento de recepción de OC y sus reglas de publicación.
- `outbox-eventos-compras`: garantías de publicación transaccional, reintentable y recuperable desde Compras.
- `event-bus-reintentos-dlq`: publicación confirmada, reintentos con espera y cola de mensajes fallidos por suscripción.

### Modified Capabilities

- `almacen-eventos-oc`: consumo del contrato nuevo, procesamiento atómico, idempotencia, política de fallo, `/health` y `/ready`.

## Impact

- `apps/compras`: tabla y despachador del outbox, publicación del contrato nuevo, resolución del snapshot de insumos.
- `apps/almacen`: handler nuevo, columnas e índices de idempotencia, `/ready`, colas `.v2` y `.v3`.
- `packages/event-bus`: `event_id` y versión en el envoltorio, publicación confirmada, reintentos y DLQ opcionales; excepción a la regla de un spec por servicio porque el bus es transversal.
- Producción: fusionar a `main` despliega. Los PR de código quedan abiertos hasta contar con autorización expresa de despliegue. Las migraciones se aplican en el despliegue. La conciliación histórica está bloqueada.
- Fuera de alcance: los demás consumidores del bus, tratados en el change independiente `auditar-consumidores-eventbus-sin-perdida-silenciosa`.
