## ADDED Requirements

### Requirement: Subscriber de recepción total de OC
El servicio Almacén SHALL suscribirse al evento `compras.oc_recibida_total` en el topic exchange `bocam.events` y crear automáticamente un `MovimientoAlmacen` de tipo INGRESO por cada línea recibida.

El payload esperado del evento incluye: `orden_compra_id`, `proyecto_id`, `tenant_id`, `items[]` donde cada item tiene `insumo_id`, `clave`, `descripcion`, `unidad`, `categoria`, `cantidad_recibida`.

#### Scenario: Recepción total procesada exitosamente
- **WHEN** Compras publica `compras.oc_recibida_total` con items válidos
- **THEN** Almacén crea un `MovimientoAlmacen` de tipo INGRESO por cada item, con `referencia = orden_compra_id` y `origen = "OC"`
- **THEN** el `stock_actual` de cada `ItemInventario` correspondiente se incrementa en `cantidad_recibida`

#### Scenario: Item no existe en inventario al recibir
- **WHEN** el `insumo_id` del evento no tiene `ItemInventario` en la BD de Almacén
- **THEN** el sistema auto-crea el `ItemInventario` usando `clave`, `descripcion`, `unidad`, `categoria` del payload antes de registrar el INGRESO

#### Scenario: Evento procesado idempotente
- **WHEN** el mismo evento `compras.oc_recibida_total` se recibe dos veces (redelivery)
- **THEN** el sistema verifica si ya existe un `MovimientoAlmacen` con `referencia = orden_compra_id` y tipo INGRESO; si existe, lo ignora (no duplica stock)

### Requirement: Subscriber de recepción parcial de OC
El servicio Almacén SHALL suscribirse al evento `compras.oc_recibida_parcial` con el mismo comportamiento que `oc_recibida_total` pero usando `cantidad_recibida_parcial` del payload.

#### Scenario: Recepción parcial registrada
- **WHEN** Compras publica `compras.oc_recibida_parcial`
- **THEN** Almacén crea INGRESO con la cantidad parcial recibida y actualiza `stock_actual`

#### Scenario: Fallo en procesamiento del evento
- **WHEN** el handler del subscriber lanza una excepción al procesar el evento
- **THEN** el mensaje NO se hace ack — RabbitMQ lo reencola para reintento automático
- **THEN** el error se registra en el log del servicio con el payload completo para diagnóstico

### Requirement: Healthcheck del microservicio
El servicio SHALL exponer `GET /health` que retorna 200 con `{ status: "ok", service: "almacen" }` cuando el servicio está listo para recibir tráfico. Docker Compose usa este endpoint como healthcheck.

#### Scenario: Servicio sano
- **WHEN** el servicio está corriendo con conexión a BD y RabbitMQ establecidas
- **THEN** `GET /health` retorna 200 con `{ status: "ok" }`

#### Scenario: Servicio en inicio
- **WHEN** el servicio está arrancando y aún no conectó a la BD
- **THEN** `GET /health` retorna 503 hasta que la conexión esté lista
