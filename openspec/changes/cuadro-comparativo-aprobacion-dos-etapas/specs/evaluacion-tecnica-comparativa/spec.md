## ADDED Requirements

### Requirement: Compras envía cuadro a evaluación técnica
El sistema SHALL permitir a un usuario con rol `procurement` o `admin` enviar un `CuadroComparativo` en estado `BORRADOR` al Residente para evaluación técnica. La transición cambia el estado del cuadro a `EN_EVALUACION_TECNICA` y establece `evaluacion_tecnica = PENDIENTE` en todos sus `ComparativaDetalle`.

#### Scenario: Envío exitoso a evaluación técnica
- **WHEN** un usuario con rol `procurement` hace `PATCH /api/v1/compras/comparativas/:id/enviar-evaluacion`
- **AND** el cuadro existe y tiene `estado = BORRADOR`
- **AND** el cuadro tiene al menos un `ComparativaDetalle`
- **THEN** el sistema actualiza el cuadro a `estado = EN_EVALUACION_TECNICA`
- **AND** establece `evaluacion_tecnica = PENDIENTE` en todos los detalles del cuadro
- **AND** responde `200` con el cuadro actualizado

#### Scenario: Rechazo si el cuadro no está en BORRADOR
- **WHEN** un usuario con rol `procurement` hace `PATCH /api/v1/compras/comparativas/:id/enviar-evaluacion`
- **AND** el cuadro tiene `estado` distinto de `BORRADOR`
- **THEN** el sistema responde `400` con mensaje que indica el estado actual y que solo se pueden enviar cuadros en `BORRADOR`

#### Scenario: Rechazo si el cuadro no tiene renglones
- **WHEN** un usuario con rol `procurement` hace `PATCH /api/v1/compras/comparativas/:id/enviar-evaluacion`
- **AND** el cuadro está en `BORRADOR` pero no tiene ningún `ComparativaDetalle`
- **THEN** el sistema responde `400` con mensaje "El cuadro no tiene renglones para evaluar"

#### Scenario: Rechazo por rol insuficiente
- **WHEN** un usuario con rol `resident` hace `PATCH /api/v1/compras/comparativas/:id/enviar-evaluacion`
- **THEN** el sistema responde `403`

---

### Requirement: Residente registra evaluación técnica por renglón
El sistema SHALL permitir a un usuario con rol `resident`, `control_obra` o `superintendent` registrar su evaluación técnica en cada `ComparativaDetalle` de un cuadro en estado `EN_EVALUACION_TECNICA`. Cada renglón recibe un valor `APROBADO` o `RECHAZADO` con comentario opcional. Al finalizar, el cuadro pasa a `EVALUADO_TECNICAMENTE` y se registra `evaluacion_residente_id` con el `userId` del evaluador y `fecha_evaluacion_tecnica` con el timestamp actual.

#### Scenario: Evaluación técnica completa con al menos un aprobado
- **WHEN** un usuario con rol `resident` hace `PATCH /api/v1/compras/comparativas/:id/evaluar`
- **AND** el body contiene `evaluaciones: [{ detalle_id, evaluacion_tecnica: "APROBADO"|"RECHAZADO", comentario_tecnico? }]` para todos los detalles
- **AND** el cuadro tiene `estado = EN_EVALUACION_TECNICA`
- **AND** al menos un detalle recibe `evaluacion_tecnica = APROBADO`
- **THEN** el sistema actualiza `evaluacion_tecnica` y `comentario_tecnico` en cada detalle indicado
- **AND** establece `evaluacion_residente_id = userId` y `fecha_evaluacion_tecnica = now()` en el cuadro
- **AND** cambia el estado del cuadro a `EVALUADO_TECNICAMENTE`
- **AND** responde `200` con el cuadro completo incluyendo detalles actualizados

#### Scenario: Evaluación técnica con todos los renglones rechazados
- **WHEN** un usuario con rol `resident` hace `PATCH /api/v1/compras/comparativas/:id/evaluar`
- **AND** todos los detalles reciben `evaluacion_tecnica = RECHAZADO`
- **THEN** el sistema actualiza todos los detalles y establece el estado del cuadro a `EVALUADO_TECNICAMENTE`
- **AND** responde `200` con el cuadro actualizado (el cuadro NO pasa automáticamente a RECHAZADO_GT — el rechazo total se detecta al intentar enviar al GT)

#### Scenario: Rechazo si el cuadro no está en EN_EVALUACION_TECNICA
- **WHEN** un usuario con rol `resident` hace `PATCH /api/v1/compras/comparativas/:id/evaluar`
- **AND** el cuadro tiene `estado` distinto de `EN_EVALUACION_TECNICA`
- **THEN** el sistema responde `400` con mensaje que indica el estado actual

#### Scenario: Rechazo si se intenta aprobar un detalle de otro cuadro
- **WHEN** el body de evaluación contiene un `detalle_id` que no pertenece al cuadro indicado en el path
- **THEN** el sistema responde `400` con mensaje "Renglón no pertenece a este cuadro comparativo"

#### Scenario: Rechazo por rol insuficiente
- **WHEN** un usuario con rol `procurement` hace `PATCH /api/v1/compras/comparativas/:id/evaluar`
- **THEN** el sistema responde `403`

---

### Requirement: Residente envía cuadro evaluado al Gerente Técnico
El sistema SHALL permitir a un usuario con rol `resident`, `control_obra`, `procurement` o `superintendent` enviar al GT un cuadro en estado `EVALUADO_TECNICAMENTE` que tenga al menos un `ComparativaDetalle` con `evaluacion_tecnica = APROBADO`. El cuadro pasa a `EN_APROBACION_GT`.

#### Scenario: Envío exitoso al GT
- **WHEN** un usuario con rol `resident` hace `PATCH /api/v1/compras/comparativas/:id/enviar-gt`
- **AND** el cuadro tiene `estado = EVALUADO_TECNICAMENTE`
- **AND** al menos un detalle tiene `evaluacion_tecnica = APROBADO`
- **THEN** el sistema cambia el estado del cuadro a `EN_APROBACION_GT`
- **AND** responde `200` con el cuadro actualizado

#### Scenario: Rechazo si todos los renglones están rechazados técnicamente
- **WHEN** un usuario con rol `resident` hace `PATCH /api/v1/compras/comparativas/:id/enviar-gt`
- **AND** el cuadro tiene `estado = EVALUADO_TECNICAMENTE`
- **AND** ningún detalle tiene `evaluacion_tecnica = APROBADO`
- **THEN** el sistema responde `400` con mensaje "Sin renglones aprobados técnicamente — no es posible remitir al Gerente Técnico"

#### Scenario: Rechazo si el cuadro no está en EVALUADO_TECNICAMENTE
- **WHEN** un usuario hace `PATCH /api/v1/compras/comparativas/:id/enviar-gt`
- **AND** el cuadro tiene `estado` distinto de `EVALUADO_TECNICAMENTE`
- **THEN** el sistema responde `400` indicando el estado actual
