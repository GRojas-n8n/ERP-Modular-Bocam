## ADDED Requirements

### Requirement: Compras SHALL publicar un evento versionado por cada recepción de OC
Cada recepción registrada con `POST /api/v1/compras/ordenes-compra/:id/recepciones` SHALL producir exactamente un evento `compras.recepcion_oc_registrada.v1`, sin distinguir "parcial" y "total" como tipos distintos. El evento SHALL incluir `event_id`, `event_version`, `occurred_at`, `tenant_id`, `proyecto_id`, `orden_compra_id`, `recepcion_id`, `estado_oc_resultante` e `items[]`. Cada ítem SHALL incluir un identificador estable `recepcion_item_id`, `orden_item_id`, `insumo_id` (nulo si no hay catálogo), `cantidad_recibida` y un snapshot con `descripcion` y `unidad`, más `clave` y `categoria` cuando exista `insumo_id`. Los ítems SHALL representar solo lo recibido en esa recepción, no el acumulado de la OC.

#### Scenario: Recepción que deja la OC parcialmente recibida
- **WHEN** una recepción deja la OC en `PARCIALMENTE_RECIBIDA`
- **THEN** se publica un evento con `estado_oc_resultante = PARCIALMENTE_RECIBIDA` y solo los ítems de esa recepción

#### Scenario: Recepción que completa la OC
- **WHEN** una recepción deja la OC en `RECIBIDA`
- **THEN** se publica un evento del mismo tipo con `estado_oc_resultante = RECIBIDA`

#### Scenario: Dos recepciones de la misma OC
- **WHEN** la OC recibe dos recepciones
- **THEN** cada una produce su propio evento con `event_id` y `recepcion_id` distintos, y los ítems de cada uno no se acumulan

#### Scenario: Ítem sin insumo de catálogo
- **WHEN** un ítem recibido es de texto libre o imprevisto
- **THEN** el evento lo incluye con `insumo_id` nulo y el snapshot tomado de su descripción y unidad libres

### Requirement: El evento SHALL ser autosuficiente y salir de datos persistidos en Compras
Todo ítem con `insumo_id` SHALL incluir `clave`, `descripcion`, `unidad` y `categoria`, tomados del snapshot conservado en el renglón de la OC, de modo que Almacén cree o actualice su inventario sin consultar a Compras ni a Gerencia Técnica y sin depender de que el inventario ya exista. El evento SHALL armarse dentro de la transacción de la recepción y NO SHALL consultar a Gerencia Técnica en el despacho del outbox.

#### Scenario: Gerencia Técnica no disponible con snapshot persistido
- **WHEN** la OC ya conserva el snapshot de sus renglones y Gerencia Técnica no responde al registrar la recepción
- **THEN** la recepción se registra y el evento sale completo, sin consultar a Gerencia Técnica

#### Scenario: Inventario inexistente
- **WHEN** Almacén procesa un evento cuyo insumo no existe en su inventario
- **THEN** crea el ítem solo con el snapshot del evento y aplica el INGRESO

#### Scenario: Evento completo después de un reinicio
- **WHEN** Compras se reinicia y Gerencia Técnica sigue caída
- **THEN** el despachador publica el mismo evento completo desde los datos persistidos

### Requirement: La OC SHALL conservar el snapshot de sus renglones de catálogo
Al crear una OC, cada renglón de catálogo SHALL guardar `clave`, `descripcion`, `unidad` y `categoria` del insumo. Si el catálogo no responde en ese momento, la OC SHALL crearse igualmente con el snapshot pendiente.

#### Scenario: Creación de la OC con el catálogo disponible
- **WHEN** se genera una OC con renglones de catálogo y Gerencia Técnica responde
- **THEN** cada renglón conserva el snapshot del insumo

#### Scenario: Creación de la OC con el catálogo caído
- **WHEN** Gerencia Técnica no responde al generar la OC
- **THEN** la OC se crea con snapshot pendiente y sin error

### Requirement: Una recepción SHALL rechazarse antes del commit si no puede construirse el snapshot
Cuando un renglón de catálogo recibido no tenga snapshot persistido, Compras SHALL completarlo dentro de la petición, fuera de la transacción, y persistirlo en la OC. Si no puede obtenerlo, SHALL rechazar la recepción con `503 SNAPSHOT_INSUMO_NO_DISPONIBLE` antes de escribir nada, sin recepción, sin evento y sin cambios en la OC; el reintento posterior SHALL funcionar cuando el catálogo responda.

#### Scenario: Sin snapshot y sin Gerencia Técnica
- **WHEN** se recibe un renglón sin snapshot persistido y Gerencia Técnica no responde
- **THEN** la respuesta es `503 SNAPSHOT_INSUMO_NO_DISPONIBLE` y no queda ninguna recepción, evento ni cambio en la OC

#### Scenario: Snapshot faltante que se puede resolver
- **WHEN** el renglón no tiene snapshot y Gerencia Técnica responde
- **THEN** el snapshot se persiste en la OC, la recepción se registra y las siguientes recepciones no consultan al catálogo

### Requirement: Un evento incompleto NO SHALL publicarse como procesable
Ningún evento con un ítem de `insumo_id` sin snapshot completo SHALL enviarse al broker ni marcarse `PUBLICADO`. Si por un defecto llegara a existir, SHALL retenerse en `ERROR` con la causa `PAYLOAD_INCOMPLETO`, sin pasar por la cola de mensajes fallidos. La reemisión SHALL reconstruirlo solo con datos persistidos y, si aún faltan, responder `409 SNAPSHOT_INCOMPLETO` sin republicar.

#### Scenario: Payload incompleto en el outbox
- **WHEN** el despachador encuentra un evento sin el snapshot de un insumo
- **THEN** no lo publica, la fila queda en `ERROR` con `PAYLOAD_INCOMPLETO` y se registra un log de error

#### Scenario: Reemisión reparable
- **WHEN** el snapshot ya está completo en la OC y se reemite el evento
- **THEN** el payload se reconstruye con el mismo `event_id` y se publica completo

#### Scenario: Reemisión no reparable
- **WHEN** aún faltan datos persistidos
- **THEN** la respuesta es `409 SNAPSHOT_INCOMPLETO` y la fila permanece retenida

### Requirement: El contrato SHALL versionarse sin romper a los consumidores
Un cambio incompatible del contrato SHALL publicarse con una versión nueva y una routing key distinta, y NO SHALL modificar la versión vigente. El consumidor SHALL rechazar hacia la cola de mensajes fallidos un evento con una versión que no soporta.

#### Scenario: Versión no soportada
- **WHEN** llega un evento con `event_version` distinta de las soportadas
- **THEN** el consumidor lo envía a la cola de mensajes fallidos sin aplicar efectos
