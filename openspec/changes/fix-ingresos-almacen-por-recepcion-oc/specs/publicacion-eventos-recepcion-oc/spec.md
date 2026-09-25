## ADDED Requirements

### Requirement: Compras SHALL publicar un evento por cada recepción de OC
Al registrar una recepción con `POST /api/v1/compras/ordenes-compra/:id/recepciones`, Compras SHALL publicar `compras.oc_recibida_total` cuando la OC queda `RECIBIDA` y `compras.oc_recibida_parcial` cuando queda `PARCIALMENTE_RECIBIDA`. El payload SHALL incluir `recepcion_id`, `orden_compra_id`, `codigo`, `proveedor_id` e `items[]` con solo lo recibido en esa recepción: `orden_item_id`, `insumo_id`, `cantidad_recibida` y, para ítems con insumo de catálogo, `clave`, `descripcion`, `unidad` y `categoria`. El contexto del evento SHALL incluir `tenant_id` y `proyecto_id`.

#### Scenario: Recepción que completa la OC
- **WHEN** una recepción deja la OC en estado `RECIBIDA`
- **THEN** Compras publica `compras.oc_recibida_total` con los ítems de esa recepción

#### Scenario: Recepción parcial
- **WHEN** una recepción deja la OC en estado `PARCIALMENTE_RECIBIDA`
- **THEN** Compras publica `compras.oc_recibida_parcial` con los ítems de esa recepción y no con el acumulado de la OC

#### Scenario: Segunda recepción de la misma OC
- **WHEN** la OC recibe una segunda recepción
- **THEN** el evento lleva una `recepcion_id` distinta y solo las cantidades de la segunda recepción

#### Scenario: Ítem sin insumo de catálogo
- **WHEN** un ítem recibido es de texto libre
- **THEN** el evento lo incluye con `insumo_id` nulo

### Requirement: Un fallo al publicar SHALL quedar registrado y ser reemitible
Si la publicación falla porque el bus no está disponible, Compras NO SHALL revertir la recepción ya registrada, SHALL registrar un error con `recepcion_id` y `orden_id`, y SHALL permitir reemitir el evento de una recepción existente mediante un endpoint restringido a `admin` y `procurement`.

#### Scenario: Bus caído al publicar
- **WHEN** el bus no está disponible al terminar de registrar la recepción
- **THEN** la recepción permanece registrada, la respuesta al usuario no cambia y se registra un log de error con la recepción afectada

#### Scenario: Reemisión de una recepción
- **WHEN** un usuario autorizado solicita reemitir el evento de una recepción existente
- **THEN** Compras publica de nuevo el evento con la misma `recepcion_id`, de modo que Almacén lo trata como reentrega idempotente
