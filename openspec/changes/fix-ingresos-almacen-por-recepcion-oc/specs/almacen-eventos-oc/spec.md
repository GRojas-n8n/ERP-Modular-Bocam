## RENAMED Requirements

- FROM: `### Requirement: Subscriber de recepción total de OC`
- TO: `### Requirement: Subscriber de recepciones de OC registradas`

## MODIFIED Requirements

### Requirement: Subscriber de recepciones de OC registradas
El servicio Almacén SHALL suscribirse al evento `compras.recepcion_oc_registrada.v1` en el topic exchange `bocam.events`, mediante la cola `.v3` (sin TTL y con dead-letter a su cola de mensajes fallidos) y con reintentos y cola de mensajes fallidos activados, y SHALL crear un `MovimientoAlmacen` de tipo INGRESO por cada ítem recibido con `insumo_id`. El evento SHALL ser autosuficiente: Almacén NO SHALL consultar a otros servicios para procesarlo. Todo ítem con `insumo_id` SHALL traer `clave`, `descripcion`, `unidad` y `categoria`, exista o no el `ItemInventario`; cuando no exista, Almacén SHALL crearlo con ese snapshot.

#### Scenario: Recepción procesada exitosamente
- **WHEN** Compras publica `compras.recepcion_oc_registrada.v1` con un payload válido
- **THEN** Almacén crea un `MovimientoAlmacen` INGRESO por cada ítem con `insumo_id`, con `referencia = orden_compra_id`, `recepcion_id`, `recepcion_item_id` y `origen = "OC"`
- **THEN** el `stock_actual` de cada `ItemInventario` se incrementa en `cantidad_recibida`

#### Scenario: Ítem no existe en inventario al recibir
- **WHEN** el `insumo_id` del evento no tiene `ItemInventario`
- **THEN** el sistema lo crea con el snapshot del evento antes de registrar el INGRESO

#### Scenario: Snapshot incompleto aunque el inventario exista
- **WHEN** un ítem con `insumo_id` no trae alguno de `clave`, `descripcion`, `unidad` o `categoria`
- **THEN** el evento se rechaza como `SNAPSHOT_INCOMPLETO`, no reintentable y sin efectos, exista o no el ítem en el inventario

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

### Requirement: La cola de recepciones SHALL retener los mensajes sin expirarlos ni perderlos
Compras marca un evento como publicado cuando el broker confirma. Por eso la cola principal de `compras.recepcion_oc_registrada.v1` en Almacén NO SHALL tener `x-message-ttl`, y SHALL enviar a su cola de mensajes fallidos, por dead-letter de la propia cola, todo mensaje que deje de poder permanecer en ella. Un mensaje confirmado por el broker NO SHALL desaparecer sin quedar en la cola principal, en la de reintento o en la de mensajes fallidos. La cola `.v2` (TTL de 24 h sin dead-letter) SHALL dejar de consumirse y conservarse sin modificar.

#### Scenario: Almacén detenido más allá de la retención anterior
- **WHEN** Almacén permanece detenido más de 24 horas con eventos ya confirmados por el broker
- **THEN** los mensajes siguen en la cola `.v3` y se aplican una sola vez cuando Almacén arranca

#### Scenario: Mensaje que no puede permanecer en la cola
- **WHEN** un mensaje de la cola principal se rechaza sin reencolar o expira por una política futura
- **THEN** llega a la cola de mensajes fallidos con su payload original y el registro de su causa

#### Scenario: Rechazo reintentable
- **WHEN** el procesamiento falla por una causa transitoria
- **THEN** el mensaje pasa por la cola de reintento, vuelve a la cola `.v3` y se aplica sin duplicar el INGRESO

#### Scenario: Rechazo definitivo
- **WHEN** el evento no cumple el contrato
- **THEN** llega a la cola de mensajes fallidos en el primer intento, sin pasar por la cola de reintento

### Requirement: Solo una cola de Almacén SHALL recibir el evento cuando el publicador emita
Antes de que Compras publique `compras.recepcion_oc_registrada.v1`, la cola `.v2` SHALL estar vacía y desvinculada del exchange, y la cola `.v3` SHALL tener consumidor activo con su cola de reintento y su cola de mensajes fallidos. La desvinculación SHALL quitar únicamente el binding: NO SHALL borrar colas ni mensajes, y SHALL negarse si la `.v3` no está operativa o si la `.v2` tiene mensajes.

#### Scenario: Cola vieja con mensajes
- **WHEN** se pide desvincular la `.v2` y contiene mensajes
- **THEN** la operación se rechaza y el binding permanece

#### Scenario: Cola nueva no operativa
- **WHEN** la `.v3` no existe, no tiene consumidor activo o no tiene los argumentos esperados
- **THEN** la desvinculación se rechaza

#### Scenario: Desvinculación
- **WHEN** la `.v3` está operativa y la `.v2` está vacía
- **THEN** los eventos nuevos llegan solo a la `.v3`, cada uno se procesa una sola vez y la `.v2` sigue existiendo para un eventual rollback
