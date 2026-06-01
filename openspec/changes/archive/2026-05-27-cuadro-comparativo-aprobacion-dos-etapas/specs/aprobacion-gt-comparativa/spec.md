## ADDED Requirements

### Requirement: Gerente Técnico aprueba o rechaza renglones del cuadro comparativo
El sistema SHALL permitir a un usuario con rol `gerencia_tecnica`, `superintendent` o `admin` revisar un `CuadroComparativo` en estado `EN_APROBACION_GT` y registrar su decisión por renglón (`APROBADO` o `RECHAZADO`). El GT NO puede aprobar renglones que el Residente rechazó técnicamente (`evaluacion_tecnica = RECHAZADO`). Al finalizar la revisión:
- Si al menos un renglón queda con `aprobacion_gt = APROBADO`, el cuadro pasa a `APROBADO_GT`.
- Si todos los renglones quedan con `aprobacion_gt = RECHAZADO`, el cuadro pasa a `RECHAZADO_GT`.
Se registra `gerente_tecnico_id` con el `userId` del revisor y `fecha_aprobacion_gt` con el timestamp.

#### Scenario: Revisión GT exitosa con al menos un renglón aprobado
- **WHEN** un usuario con rol `gerencia_tecnica` hace `PATCH /api/v1/compras/comparativas/:id/revisar-gt`
- **AND** el body contiene `aprobaciones: [{ detalle_id, aprobacion_gt: "APROBADO"|"RECHAZADO", comentario_gt? }]` y opcionalmente `comentario_gt_general`
- **AND** el cuadro tiene `estado = EN_APROBACION_GT`
- **AND** ningún detalle con `evaluacion_tecnica = RECHAZADO` recibe `aprobacion_gt = APROBADO`
- **AND** al menos un detalle recibe `aprobacion_gt = APROBADO`
- **THEN** el sistema actualiza `aprobacion_gt` y `comentario_gt` en cada detalle indicado
- **AND** establece `gerente_tecnico_id = userId`, `fecha_aprobacion_gt = now()`, `comentario_gt_general` en el cuadro
- **AND** cambia el estado del cuadro a `APROBADO_GT`
- **AND** responde `200` con el cuadro completo incluyendo detalles actualizados

#### Scenario: Revisión GT con todos los renglones rechazados
- **WHEN** un usuario con rol `gerencia_tecnica` hace `PATCH /api/v1/compras/comparativas/:id/revisar-gt`
- **AND** todos los detalles reciben `aprobacion_gt = RECHAZADO`
- **THEN** el sistema actualiza todos los detalles
- **AND** establece `gerente_tecnico_id = userId` y `fecha_aprobacion_gt = now()` en el cuadro
- **AND** cambia el estado del cuadro a `RECHAZADO_GT`
- **AND** responde `200` con el cuadro actualizado en estado `RECHAZADO_GT`

#### Scenario: Intento de aprobar renglón rechazado por el Residente
- **WHEN** un usuario con rol `gerencia_tecnica` hace `PATCH /api/v1/compras/comparativas/:id/revisar-gt`
- **AND** el body incluye `aprobacion_gt = APROBADO` para un `detalle_id` cuyo `evaluacion_tecnica = RECHAZADO`
- **THEN** el sistema responde `400` con mensaje "No es posible aprobar el renglón [descripción]: fue rechazado en la evaluación técnica del Residente"
- **AND** no modifica ningún registro

#### Scenario: Rechazo si el cuadro no está en EN_APROBACION_GT
- **WHEN** un usuario con rol `gerencia_tecnica` hace `PATCH /api/v1/compras/comparativas/:id/revisar-gt`
- **AND** el cuadro tiene `estado` distinto de `EN_APROBACION_GT`
- **THEN** el sistema responde `400` con mensaje que indica el estado actual

#### Scenario: Rechazo por rol insuficiente
- **WHEN** un usuario con rol `resident` o `procurement` hace `PATCH /api/v1/compras/comparativas/:id/revisar-gt`
- **THEN** el sistema responde `403`

---

### Requirement: Cuadro en RECHAZADO_GT es terminal y no puede reabrirse
El sistema SHALL rechazar cualquier intento de transición de estado sobre un `CuadroComparativo` con `estado = RECHAZADO_GT`. El equipo de Compras debe crear un nuevo cuadro comparativo para reiniciar el proceso.

#### Scenario: Intento de reenviar a evaluación un cuadro rechazado
- **WHEN** cualquier usuario intenta `PATCH /api/v1/compras/comparativas/:id/enviar-evaluacion`
- **AND** el cuadro tiene `estado = RECHAZADO_GT`
- **THEN** el sistema responde `400` con mensaje "El cuadro fue rechazado por Gerencia Técnica y no puede reabrirse. Genere un nuevo cuadro comparativo."

#### Scenario: Intento de convertir a OC un cuadro rechazado
- **WHEN** cualquier usuario intenta `POST /api/v1/compras/comparativas/:id/convertir-oc`
- **AND** el cuadro tiene `estado = RECHAZADO_GT`
- **THEN** el sistema responde `400` con mensaje "El cuadro fue rechazado por Gerencia Técnica. No se puede generar OC."

---

### Requirement: Publicación de evento al aprobar cuadro como GT
El sistema SHALL publicar el evento `compras.comparativa_aprobada_gt` al EventBus cuando un cuadro comparativo pasa a estado `APROBADO_GT`. La publicación es best-effort (no bloquea la respuesta HTTP si el bus no está disponible).

#### Scenario: Evento publicado al aprobar cuadro
- **WHEN** la revisión del GT resulta en `estado = APROBADO_GT`
- **THEN** el sistema publica `{ event_type: "compras.comparativa_aprobada_gt", context: buildEventContext(req), payload: { cuadro_id, codigo, requisicion_id, renglones_aprobados: number } }`

#### Scenario: Degradación elegante si EventBus no está disponible
- **WHEN** la publicación del evento falla (RabbitMQ no disponible)
- **THEN** el sistema loguea el error con `logWarn` y devuelve igualmente `200` al cliente
- **AND** el cuadro ya fue actualizado a `APROBADO_GT` en la BD
