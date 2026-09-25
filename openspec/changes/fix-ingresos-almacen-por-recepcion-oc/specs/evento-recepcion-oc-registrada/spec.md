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

### Requirement: El evento SHALL ser autosuficiente
El snapshot del evento SHALL bastar para que Almacén cree o actualice su inventario sin consultar a Compras ni a Gerencia Técnica al procesarlo. El snapshot SHALL congelarse al armar el evento y NO SHALL cambiar en los reintentos de publicación.

#### Scenario: Consumidor sin acceso a otros servicios
- **WHEN** Almacén procesa el evento y Compras y Gerencia Técnica no están disponibles
- **THEN** el procesamiento se completa con los datos del evento

### Requirement: El contrato SHALL versionarse sin romper a los consumidores
Un cambio incompatible del contrato SHALL publicarse con una versión nueva y una routing key distinta, y NO SHALL modificar la versión vigente. El consumidor SHALL rechazar hacia la cola de mensajes fallidos un evento con una versión que no soporta.

#### Scenario: Versión no soportada
- **WHEN** llega un evento con `event_version` distinta de las soportadas
- **THEN** el consumidor lo envía a la cola de mensajes fallidos sin aplicar efectos
