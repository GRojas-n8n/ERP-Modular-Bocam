## ADDED Requirements

### Requirement: El panel "Registrar Avance" permanece abierto tras un guardado exitoso
El sistema SHALL mantener visible el panel "Registrar Avance" de `ControlObraView` después de que un avance se registra exitosamente, limpiando únicamente los campos de captura (concepto seleccionado, cantidad del periodo, periodo) y mostrando una confirmación inline del avance guardado, en lugar de cerrar el panel.

#### Scenario: El panel se mantiene abierto tras guardar un avance
- **WHEN** un usuario con rol `control_obra`, `control_proyectos`, `director` o `admin` guarda exitosamente un avance desde el panel "Registrar Avance"
- **THEN** el panel permanece abierto, el selector de concepto y los campos de cantidad/periodo quedan vacíos listos para una nueva captura, y se muestra una confirmación inline identificando el concepto y periodo recién guardados

#### Scenario: El usuario captura un segundo avance sin reabrir el panel
- **WHEN** el usuario, con el panel abierto tras un guardado exitoso, selecciona un nuevo concepto y captura una nueva cantidad de periodo
- **THEN** el sistema permite confirmar y enviar este segundo avance sin que el usuario haya tenido que reabrir el panel "Registrar Avance"

#### Scenario: El usuario cierra el panel explícitamente
- **WHEN** el usuario hace clic en la acción "Cerrar" del panel "Registrar Avance", con o sin haber guardado avances previamente
- **THEN** el sistema cierra el panel sin registrar ningún avance adicional
