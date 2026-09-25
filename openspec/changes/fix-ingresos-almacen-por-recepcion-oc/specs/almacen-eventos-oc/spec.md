## MODIFIED Requirements

### Requirement: Subscriber de recepción total de OC
El servicio Almacén SHALL suscribirse al evento `compras.oc_recibida_total` en el topic exchange `bocam.events` y crear un `MovimientoAlmacen` de tipo INGRESO por cada ítem recibido con `insumo_id`. El payload SHALL incluir `recepcion_id`, `orden_compra_id` e `items[]`, donde cada ítem tiene `orden_item_id`, `insumo_id` y `cantidad_recibida`, con los datos descriptivos del insumo (`clave`, `descripcion`, `unidad`, `categoria`) para crear el `ItemInventario` cuando no exista. Los ítems representan solo lo recibido en esa recepción, no el acumulado de la OC.

#### Scenario: Recepción total procesada exitosamente
- **WHEN** Compras publica `compras.oc_recibida_total` con un payload válido
- **THEN** Almacén crea un `MovimientoAlmacen` de tipo INGRESO por cada ítem, con `referencia = orden_compra_id`, `recepcion_id`, `oc_item_id = orden_item_id` y `origen = "OC"`
- **THEN** el `stock_actual` de cada `ItemInventario` se incrementa en `cantidad_recibida`

#### Scenario: Item no existe en inventario al recibir
- **WHEN** el `insumo_id` del evento no tiene `ItemInventario` en la BD de Almacén
- **THEN** el sistema crea el `ItemInventario` con `clave`, `descripcion`, `unidad` y `categoria` del payload antes de registrar el INGRESO

#### Scenario: Evento reentregado no duplica stock
- **WHEN** el mismo evento se recibe dos veces
- **THEN** el sistema detecta que ya existe un INGRESO para esa `recepcion_id` y `oc_item_id`, no modifica el stock y confirma el mensaje

#### Scenario: Dos recepciones parciales del mismo insumo en la misma OC
- **WHEN** una OC recibe dos recepciones distintas del mismo insumo, cada una con su propia `recepcion_id`
- **THEN** ambas se aplican y el `stock_actual` refleja la suma de las dos

#### Scenario: Ítem sin insumo de catálogo
- **WHEN** un ítem del evento tiene `insumo_id` nulo
- **THEN** el sistema no crea movimiento para ese ítem, lo registra como no inventariable en el log y no lo considera un error

#### Scenario: Un ítem falla y el evento se revierte completo
- **WHEN** el procesamiento de un ítem del evento lanza un error
- **THEN** se revierten todos los ítems de ese evento en una sola transacción y el error se propaga al bus para reintento

### Requirement: Subscriber de recepción parcial de OC
El servicio Almacén SHALL suscribirse al evento `compras.oc_recibida_parcial` y procesarlo exactamente igual que `compras.oc_recibida_total`, con el mismo payload y el mismo campo `cantidad_recibida`.

#### Scenario: Recepción parcial registrada
- **WHEN** Compras publica `compras.oc_recibida_parcial` con un payload válido
- **THEN** Almacén crea el INGRESO de las cantidades recibidas en esa recepción y actualiza `stock_actual`

### Requirement: Healthcheck del microservicio
El servicio SHALL exponer `GET /health` como prueba de vida: retorna `200` con `{ status: "ok", service: "almacen" }` mientras el proceso responda, sin consultar dependencias. Docker Compose usa este endpoint como healthcheck, por lo que NO SHALL responder `503` por la indisponibilidad de la base de datos o de RabbitMQ.

#### Scenario: Proceso vivo con una dependencia caída
- **WHEN** el proceso responde pero RabbitMQ no está conectado
- **THEN** `GET /health` retorna `200`

## ADDED Requirements

### Requirement: Un fallo de procesamiento no SHALL confirmarse en silencio
El consumidor SHALL propagar cualquier error de procesamiento al bus y NO SHALL confirmar (ack) un mensaje cuyos ítems no se aplicaron. El bus SHALL reintentar con espera hasta un máximo configurable de intentos y, agotados, SHALL enviar el mensaje con su payload original a la cola de mensajes fallidos `<cola>.dlq`, con el motivo del último error. Un mensaje que no pueda interpretarse (JSON o contexto inválidos) SHALL enviarse directamente a la cola de mensajes fallidos, sin reintentos.

#### Scenario: Error transitorio que se recupera
- **WHEN** el procesamiento falla en el primer intento por un error transitorio y el segundo intento tiene éxito
- **THEN** el mensaje se confirma tras el segundo intento y el INGRESO se aplica una sola vez

#### Scenario: Intentos agotados
- **WHEN** el procesamiento falla en todos los intentos permitidos
- **THEN** el mensaje queda en `<cola>.dlq` con su payload original y el motivo del error, y se registra un log de error con `recepcion_id`, `orden_compra_id` y `tenant_id`

#### Scenario: Mensaje ininterpretable
- **WHEN** llega un mensaje cuyo contenido no es JSON válido o no trae contexto de tenant
- **THEN** el mensaje va directamente a `<cola>.dlq` sin reintentos

#### Scenario: Evento con formato antiguo
- **WHEN** llega un evento sin `recepcion_id` ni `items`
- **THEN** el sistema lo envía a `<cola>.dlq` como formato no soportado y registra un log de error, en vez de descartarlo con un aviso

### Requirement: Disponibilidad de dependencias en /ready
El servicio SHALL exponer `GET /ready`, que retorna `200` solo cuando la base de datos responde y el bus está conectado con sus suscripciones activas, y `503` con el detalle de la dependencia que falla en cualquier otro caso. `/ready` NO SHALL usarse como healthcheck de reinicio.

#### Scenario: Servicio listo
- **WHEN** la base responde y las suscripciones están activas
- **THEN** `GET /ready` retorna `200`

#### Scenario: Servicio arrancando
- **WHEN** el servicio aún no conectó a la base o al bus
- **THEN** `GET /ready` retorna `503` indicando qué dependencia falta
