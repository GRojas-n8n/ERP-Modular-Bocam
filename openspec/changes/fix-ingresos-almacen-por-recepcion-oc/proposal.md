## Why

Las recepciones de una Orden de Compra pueden no estar generando los INGRESOS de Almacén, y los fallos no dejan rastro recuperable. Por análisis estático (2026-09-25):

- Compras publica `compras.oc_recibida_total` solo al cerrar la OC y con `{ id_orden, codigo, proveedor_id, total, proyecto_id }`; Almacén exige `orden_compra_id` e `items[]`, y sin ellos ignora el evento con un aviso y hace ack. `compras.oc_recibida_parcial` no se publica en ningún servicio.
- Si el handler falla, captura la excepción por ítem y confirma el mensaje; el `EventBus` además usa `nack` sin reencolar y sin cola de mensajes fallidos, así que un error descarta el evento.
- La idempotencia por OC e insumo trataría como duplicada una segunda recepción parcial legítima.

Se detectó al migrar `almacen-eventos-oc` (`migrar-catalogo-openspec-vigente`).

## What Changes

- Definir un contrato de evento único para las recepciones de OC (total y parcial), con identificador de recepción e ítems recibidos, y publicarlo desde Compras en cada recepción.
- Hacer que Almacén procese cada evento de forma atómica, con idempotencia por recepción e ítem, sin confirmar mensajes cuyos ítems fallaron.
- Añadir al `EventBus` reintentos con espera y cola de mensajes fallidos, activables por suscripción y sin alterar a los demás consumidores.
- Separar en Almacén `/health` (prueba de vida, sin cambios de semántica) de un nuevo `/ready` (dependencias, `503` si no está listo).
- Definir la conciliación de recepciones históricas sin ingreso, con alcance exacto presentado antes de tocar datos de producción.
- Pruebas primero: contrato con el payload real de Compras, fallo sin ack, doble recepción parcial, reintentos y DLQ.

## Capabilities

### New Capabilities

- `publicacion-eventos-recepcion-oc`: Compras publica un evento por cada recepción de OC, parcial o total, con su identificador e ítems.
- `event-bus-reintentos-dlq`: una suscripción puede activar reintentos con espera y cola de mensajes fallidos; sin activarlos, el comportamiento actual no cambia.

### Modified Capabilities

- `almacen-eventos-oc`: contrato de payload, procesamiento atómico, idempotencia por recepción e ítem, política de fallo y separación `/health` / `/ready`.

## Impact

- `apps/compras`: publicación del evento tras registrar la recepción.
- `apps/almacen`: handler, esquema (columna de recepción y clave única de idempotencia), `/ready` y colas.
- `packages/event-bus`: opciones opcionales de reintento y DLQ; excepción a la regla de un spec por servicio, porque el bus es transversal.
- Producción: el despliegue exige orden (consumidor antes que publicador) y una decisión del titular sobre la conciliación histórica y el cambio de colas. Nada se modifica en producción durante la especificación.
- Fuera de alcance: cambiar el comportamiento de los demás consumidores del bus (se registra como hallazgo aparte) y un outbox transaccional en Compras (queda como decisión abierta del diseño).
