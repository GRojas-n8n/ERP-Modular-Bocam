## ADDED Requirements

### Requirement: El panel "Nueva Entrada" de bitácora permanece abierto tras un guardado exitoso
El sistema SHALL mantener visible el panel "Nueva Entrada" de bitácora en `ControlObraView` después de que una entrada se registra exitosamente, conservando el frente de trabajo seleccionado, limpiando los campos propios de la entrada (`actividades_realizadas`, `personal_en_sitio`, y demás campos de captura del día) y mostrando una confirmación inline de la entrada guardada, en lugar de cerrar el panel.

#### Scenario: El panel se mantiene abierto tras guardar una entrada de bitácora
- **WHEN** un usuario con rol `residencia`/`control_obra` guarda exitosamente una entrada desde el panel "Nueva Entrada"
- **THEN** el panel permanece abierto, el frente de trabajo seleccionado se conserva, los demás campos de la entrada quedan vacíos listos para una nueva captura, y se muestra una confirmación inline con el número de entrada recién creado

#### Scenario: El usuario captura una segunda entrada para el mismo frente sin reabrir el panel
- **WHEN** el usuario, con el panel abierto tras un guardado exitoso y el mismo frente de trabajo aún seleccionado, captura una nueva entrada de bitácora
- **THEN** el sistema permite confirmar y enviar esta segunda entrada sin que el usuario haya tenido que reabrir el panel "Nueva Entrada" ni volver a seleccionar el frente de trabajo

#### Scenario: El usuario cierra el panel explícitamente
- **WHEN** el usuario hace clic en la acción "Cerrar" del panel "Nueva Entrada", con o sin haber guardado entradas previamente
- **THEN** el sistema cierra el panel sin registrar ninguna entrada adicional
