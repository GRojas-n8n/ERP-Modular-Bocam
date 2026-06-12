## ADDED Requirements

### Requirement: Estado PARCIALMENTE_RECIBIDA en la OC
El sistema SHALL soportar el estado `PARCIALMENTE_RECIBIDA` en `OrdenCompra`, ubicado entre `EMITIDA` y `RECIBIDA` en el ciclo de vida. La UI SHALL mostrar este estado con etiqueta naranja/ámbar y descripción "Recepción en curso".

#### Scenario: Transición a PARCIALMENTE_RECIBIDA
- **WHEN** se registra una recepción y Σ `cantidad_recibida` < `cantidad` en al menos una línea de la OC
- **THEN** la OC transiciona de `EMITIDA` → `PARCIALMENTE_RECIBIDA` (o permanece en `PARCIALMENTE_RECIBIDA`)

#### Scenario: Transición a RECIBIDA (cierre total)
- **WHEN** se registra una recepción y Σ `cantidad_recibida` >= `cantidad` para TODAS las líneas de la OC
- **THEN** la OC transiciona a `RECIBIDA` independientemente del estado anterior (`EMITIDA` o `PARCIALMENTE_RECIBIDA`)

#### Scenario: OC ya RECIBIDA no acepta nuevas recepciones
- **WHEN** la OC está en estado `RECIBIDA` y se intenta registrar otra recepción
- **THEN** el sistema responde 400 con mensaje apropiado (ver spec recepcion-oc)

### Requirement: Evento compras.oc_recibida_total al cerrar la OC
El sistema SHALL publicar el evento `compras.oc_recibida_total` en el bus RabbitMQ cuando una OC transite al estado `RECIBIDA`. El evento SHALL incluir `id_orden`, `codigo`, `proveedor_id`, `total`, `proyecto_id`, y `tenant_id` en el payload.

#### Scenario: Publicación del evento al completar recepción
- **WHEN** una recepción cierra completamente la OC (todas las líneas cubiertas)
- **THEN** se publica `compras.oc_recibida_total` con el contexto estándar (`buildEventContext`) y el payload de la OC

#### Scenario: Degradación elegante si el bus no está disponible
- **WHEN** RabbitMQ no está disponible al momento de publicar
- **THEN** la recepción se registra exitosamente y el estado de la OC se actualiza; el evento se pierde de forma silenciosa (best-effort)

### Requirement: Indicadores visuales de estado de recepción en la lista de OC
La lista de OC en ComprasView SHALL mostrar un badge de estado diferenciado para `PARCIALMENTE_RECIBIDA` y `RECIBIDA`. Las OC `RECIBIDA` SHALL ser visualmente distinguibles como "completadas" (texto tachado o ícono de check).

#### Scenario: Badge de estado en lista de OC
- **WHEN** el usuario ve la tabla de órdenes de compra
- **THEN** las OC en estado `PARCIALMENTE_RECIBIDA` muestran badge ámbar con texto "En recepción"; las OC en estado `RECIBIDA` muestran badge verde con texto "Recibida"

#### Scenario: Filtro por estado incluye nuevos estados
- **WHEN** el usuario filtra la lista de OC por estado
- **THEN** los estados `PARCIALMENTE_RECIBIDA` y `RECIBIDA` están disponibles como opciones de filtro
