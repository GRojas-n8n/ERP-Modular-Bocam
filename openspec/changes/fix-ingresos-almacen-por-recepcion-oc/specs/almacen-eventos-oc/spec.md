## RENAMED Requirements

- FROM: `### Requirement: Subscriber de recepción total de OC`
- TO: `### Requirement: Subscriber de recepciones de OC registradas`

## MODIFIED Requirements

### Requirement: Subscriber de recepciones de OC registradas
El servicio Almacén SHALL suscribirse al evento `compras.recepcion_oc_registrada.v1` en el topic exchange `bocam.events`, mediante una cola nueva con sufijo `.v2` y con reintentos y cola de mensajes fallidos activados, y SHALL crear un `MovimientoAlmacen` de tipo INGRESO por cada ítem recibido con `insumo_id`. El evento SHALL ser autosuficiente: Almacén NO SHALL consultar a otros servicios para procesarlo. Cuando el `ItemInventario` no exista, Almacén SHALL crearlo con `clave`, `descripcion`, `unidad` y `categoria` del snapshot del evento.

#### Scenario: Recepción procesada exitosamente
- **WHEN** Compras publica `compras.recepcion_oc_registrada.v1` con un payload válido
- **THEN** Almacén crea un `MovimientoAlmacen` INGRESO por cada ítem con `insumo_id`, con `referencia = orden_compra_id`, `recepcion_id`, `recepcion_item_id` y `origen = "OC"`
- **THEN** el `stock_actual` de cada `ItemInventario` se incrementa en `cantidad_recibida`

#### Scenario: Ítem no existe en inventario al recibir
- **WHEN** el `insumo_id` del evento no tiene `ItemInventario`
- **THEN** el sistema lo crea con el snapshot del evento antes de registrar el INGRESO

#### Scenario: Ítem sin insumo de catálogo
- **WHEN** un ítem del evento tiene `insumo_id` nulo
- **THEN** el sistema no crea movimiento ni inventario para ese ítem, registra un evento informativo con `recepcion_id` y `recepcion_item_id`, y no lo considera un error ni provoca reintento

#### Scenario: Un ítem falla y el evento se revierte completo
- **WHEN** el procesamiento de un ítem del evento lanza un error
- **THEN** se revierten todos los ítems de ese evento en una sola transacción y el error se propaga al bus para reintento

### Requirement: Healthcheck del microservicio
El servicio SHALL exponer `GET /health` como prueba de vida: retorna `200` con `{ status: "ok", service: "almacen" }` mientras el proceso responda, sin consultar dependencias. Docker Compose usa este endpoint como healthcheck, por lo que NO SHALL responder `503` por la indisponibilidad de la base de datos o de RabbitMQ.

#### Scenario: Proceso vivo con una dependencia caída
- **WHEN** el proceso responde pero RabbitMQ no está conectado
- **THEN** `GET /health` retorna `200`

## REMOVED Requirements

### Requirement: Subscriber de recepción parcial de OC
**Reason**: El contrato nuevo representa toda recepción con un único evento, `compras.recepcion_oc_registrada.v1`; el evento `compras.oc_recibida_parcial` nunca se publicó y su campo `cantidad_recibida_parcial` desaparece.
**Migration**: Publicar y consumir `compras.recepcion_oc_registrada.v1`, cuyo `estado_oc_resultante` distingue recepciones parciales y totales.

## ADDED Requirements

### Requirement: La idempotencia SHALL basarse en el evento y en el renglón recibido
Almacén SHALL registrar cada `event_id` procesado y SHALL garantizar la unicidad de cada INGRESO por `recepcion_id` y `recepcion_item_id`, en la misma transacción que los movimientos. NO SHALL usar únicamente la OC y el insumo como clave de idempotencia.

#### Scenario: Evento reentregado no duplica stock
- **WHEN** el mismo evento se recibe dos veces
- **THEN** no se modifica el stock y el mensaje se confirma

#### Scenario: Misma recepción con otro event_id
- **WHEN** llega un evento con distinto `event_id` pero la misma `recepcion_id` y `recepcion_item_id`
- **THEN** no se duplica el INGRESO

#### Scenario: Dos recepciones parciales del mismo insumo en la misma OC
- **WHEN** una OC recibe dos recepciones distintas del mismo insumo
- **THEN** ambas se aplican y el `stock_actual` refleja la suma

### Requirement: Un fallo de procesamiento no SHALL confirmarse en silencio
El consumidor SHALL propagar cualquier error de procesamiento al bus y NO SHALL confirmar un mensaje cuyos ítems no se aplicaron. El bus SHALL reintentar con espera hasta un máximo configurable y, agotados los intentos, enviar el mensaje con su payload original a `<cola>.dlq` con el motivo. Un mensaje ininterpretable, de versión no soportada o con el formato antiguo SHALL enviarse directamente a la cola de mensajes fallidos, sin reintentos y con un log de error.

#### Scenario: Error transitorio que se recupera
- **WHEN** el procesamiento falla en el primer intento y tiene éxito en el segundo
- **THEN** el mensaje se confirma tras el segundo intento y el INGRESO se aplica una sola vez

#### Scenario: Intentos agotados
- **WHEN** el procesamiento falla en todos los intentos
- **THEN** el mensaje queda en `<cola>.dlq` con su payload y el motivo, y se registra un log de error con `event_id`, `recepcion_id` y `tenant_id`

#### Scenario: Evento con formato antiguo
- **WHEN** llega un evento sin `event_id`, `recepcion_id` ni `items`
- **THEN** va a `<cola>.dlq` como formato no soportado y no se descarta con un aviso

### Requirement: Disponibilidad de dependencias en /ready
El servicio SHALL exponer `GET /ready`, que retorna `200` solo cuando la base de datos responde y el bus está conectado con sus suscripciones activas, y `503` con el detalle de la dependencia que falla en cualquier otro caso. `/ready` NO SHALL usarse como healthcheck de reinicio.

#### Scenario: Servicio listo
- **WHEN** la base responde y las suscripciones están activas
- **THEN** `GET /ready` retorna `200`

#### Scenario: Servicio arrancando
- **WHEN** el servicio aún no conectó a la base o al bus
- **THEN** `GET /ready` retorna `503` indicando qué dependencia falta
