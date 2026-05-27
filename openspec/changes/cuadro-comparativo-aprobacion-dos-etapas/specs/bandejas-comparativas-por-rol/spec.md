## ADDED Requirements

### Requirement: Bandeja de evaluación técnica para el Residente
El sistema SHALL exponer el endpoint `GET /api/v1/compras/comparativas/pendientes-evaluacion` accesible a usuarios con rol `resident`, `control_obra` o `superintendent`, que retorna los `CuadroComparativo` del proyecto activo con `estado = EN_EVALUACION_TECNICA`, incluyendo sus detalles y datos de la requisición asociada.

#### Scenario: Residente consulta su bandeja de pendientes
- **WHEN** un usuario con rol `resident` hace `GET /api/v1/compras/comparativas/pendientes-evaluacion`
- **THEN** el sistema retorna `{ success: true, data: [...] }` con todos los cuadros del proyecto con `estado = EN_EVALUACION_TECNICA`
- **AND** cada cuadro incluye sus `detalles` con `proveedor` y los campos `evaluacion_tecnica`, `comentario_tecnico`
- **AND** la respuesta incluye el código y fecha de la `requisicion` asociada

#### Scenario: Bandeja vacía cuando no hay cuadros pendientes
- **WHEN** no hay cuadros con `estado = EN_EVALUACION_TECNICA` en el proyecto activo
- **THEN** el sistema retorna `{ success: true, data: [] }`

#### Scenario: Residente no ve cuadros de otros proyectos
- **WHEN** un usuario con rol `resident` consulta la bandeja
- **THEN** el sistema retorna solo cuadros cuyo `proyecto_id` coincide con el `proyectoId` del JWT
- **AND** no retorna cuadros de otros proyectos del mismo tenant

#### Scenario: Rechazo por rol insuficiente
- **WHEN** un usuario con rol `procurement` hace `GET /api/v1/compras/comparativas/pendientes-evaluacion`
- **THEN** el sistema responde `403`

---

### Requirement: Bandeja de aprobación GT para el Gerente Técnico
El sistema SHALL exponer el endpoint `GET /api/v1/compras/comparativas/pendientes-gt` accesible a usuarios con rol `gerencia_tecnica` o `superintendent`, que retorna los `CuadroComparativo` del proyecto activo con `estado = IN_APROBACION_GT`, incluyendo sus detalles con la evaluación técnica del Residente visible.

#### Scenario: GT consulta su bandeja de pendientes
- **WHEN** un usuario con rol `gerencia_tecnica` hace `GET /api/v1/compras/comparativas/pendientes-gt`
- **THEN** el sistema retorna `{ success: true, data: [...] }` con todos los cuadros del proyecto con `estado = EN_APROBACION_GT`
- **AND** cada cuadro incluye sus `detalles` con `proveedor`, `evaluacion_tecnica`, `comentario_tecnico`, `aprobacion_gt`, `comentario_gt`
- **AND** cada cuadro incluye `evaluacion_residente_id` y `fecha_evaluacion_tecnica` para auditoría

#### Scenario: GT ve la evaluación técnica previa del Residente
- **WHEN** un usuario con rol `gerencia_tecnica` consulta la bandeja
- **AND** el cuadro tiene detalles con `evaluacion_tecnica = RECHAZADO` y `comentario_tecnico` con justificación
- **THEN** esos campos son visibles en la respuesta para que el GT pueda tomar decisiones informadas

#### Scenario: Bandeja vacía cuando no hay cuadros pendientes de GT
- **WHEN** no hay cuadros con `estado = EN_APROBACION_GT` en el proyecto activo
- **THEN** el sistema retorna `{ success: true, data: [] }`

#### Scenario: Rechazo por rol insuficiente
- **WHEN** un usuario con rol `resident` o `procurement` hace `GET /api/v1/compras/comparativas/pendientes-gt`
- **THEN** el sistema responde `403`

---

### Requirement: Indicador visual del estado del cuadro en el frontend
El sistema SHALL mostrar en la vista de Compras del frontend un indicador de estado claro para cada cuadro comparativo, con el texto y color correspondiente a cada fase del flujo de aprobación.

#### Scenario: Cuadro en fase de evaluación técnica muestra etiqueta correcta
- **WHEN** el frontend renderiza un cuadro con `estado = EN_EVALUACION_TECNICA`
- **THEN** muestra una etiqueta con texto "En Evaluación Técnica" en color amarillo/amber

#### Scenario: Cuadro aprobado por GT muestra etiqueta verde
- **WHEN** el frontend renderiza un cuadro con `estado = APROBADO_GT`
- **THEN** muestra una etiqueta con texto "Aprobado por GT" en color verde/emerald

#### Scenario: Cuadro rechazado por GT muestra etiqueta roja
- **WHEN** el frontend renderiza un cuadro con `estado = RECHAZADO_GT`
- **THEN** muestra una etiqueta con texto "Rechazado por GT" en color rojo/red
- **AND** no muestra el botón de "Convertir a OC"

#### Scenario: Botones de acción condicionados al rol y al estado
- **WHEN** un usuario con rol `procurement` visualiza un cuadro en `BORRADOR`
- **THEN** ve el botón "Enviar a Evaluación Técnica"
- **WHEN** un usuario con rol `resident` visualiza un cuadro en `EN_EVALUACION_TECNICA`
- **THEN** ve el botón "Registrar Evaluación Técnica"
- **WHEN** un usuario con rol `gerencia_tecnica` visualiza un cuadro en `EN_APROBACION_GT`
- **THEN** ve el botón "Revisar y Aprobar"
- **WHEN** un usuario con rol `procurement` visualiza un cuadro en `APROBADO_GT`
- **THEN** ve el botón "Generar Orden de Compra"
