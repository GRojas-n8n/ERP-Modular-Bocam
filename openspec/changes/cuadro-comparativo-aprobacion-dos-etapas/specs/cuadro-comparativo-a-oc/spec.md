## MODIFIED Requirements

### Requirement: Conversión de cuadro comparativo a Orden de Compra
El endpoint `POST /api/v1/compras/comparativas/:id/convertir-oc` SHALL requerir que el `CuadroComparativo` esté en estado `APROBADO_GT` antes de generar la OC. Solo los `ComparativaDetalle` con `aprobacion_gt = APROBADO` y `es_ganador = true` son incluidos como ítems de la OC. El flujo de validación de suficiencia financiera con Finanzas se mantiene sin cambios.

#### Scenario: Conversión exitosa desde cuadro APROBADO_GT
- **WHEN** un usuario con rol `procurement` o `admin` hace `POST /api/v1/compras/comparativas/:id/convertir-oc`
- **AND** el body contiene `presupuesto_id` válido
- **AND** el cuadro tiene `estado = APROBADO_GT`
- **AND** existen detalles con `aprobacion_gt = APROBADO` y `es_ganador = true`
- **AND** Finanzas confirma suficiencia presupuestal
- **THEN** el sistema genera una OC solo con ítems provenientes de detalles `aprobacion_gt = APROBADO` y `es_ganador = true`
- **AND** cambia el estado del cuadro a `CERRADO`
- **AND** responde `200` con la OC generada

#### Scenario: Rechazo si el cuadro no está en APROBADO_GT
- **WHEN** un usuario con rol `procurement` hace `POST /api/v1/compras/comparativas/:id/convertir-oc`
- **AND** el cuadro tiene `estado` distinto de `APROBADO_GT` (por ejemplo `BORRADOR`, `EN_EVALUACION_TECNICA`, `EN_APROBACION_GT`, `RECHAZADO_GT`, `CERRADO`)
- **THEN** el sistema responde `400` con mensaje "La OC solo puede generarse de un cuadro aprobado por Gerencia Técnica. Estado actual: [estado]"
- **AND** no crea ninguna OC ni modifica ningún registro

#### Scenario: Renglones rechazados por GT no generan ítems de OC
- **WHEN** el cuadro tiene 3 renglones: 2 con `aprobacion_gt = APROBADO` y `es_ganador = true`, y 1 con `aprobacion_gt = RECHAZADO`
- **AND** se invoca exitosamente `convertir-oc`
- **THEN** la OC generada contiene solo 2 ítems (los aprobados por GT)
- **AND** el renglón rechazado no aparece en la OC

#### Scenario: Falla de Finanzas en cuadro APROBADO_GT (saga existente sin cambios)
- **WHEN** el cuadro está en `APROBADO_GT` y Finanzas no confirma el compromiso
- **THEN** la OC queda en `ERROR_FINANZAS` y se crea una `AlertaOcError` (comportamiento existente sin cambios)
- **AND** el cuadro permanece en `APROBADO_GT` (no pasa a `CERRADO`) hasta que la OC sea reconciliada
