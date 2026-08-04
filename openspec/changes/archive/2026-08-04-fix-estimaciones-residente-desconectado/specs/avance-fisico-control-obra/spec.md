## ADDED Requirements

### Requirement: Registro de avance físico desde Control de Obra usando el catálogo de conceptos
El sistema SHALL permitir a los roles `control_obra`, `control_proyectos`, `director` y `admin` registrar un avance físico desde la pestaña "Avances Físicos" de `ControlObraView` seleccionando el concepto de un catálogo (no como texto libre), sin capturar `precio_unitario` ni `cantidad_presupuestada` manualmente.

#### Scenario: Selector de concepto reemplaza el campo de texto libre
- **WHEN** un usuario con rol `control_obra`, `control_proyectos`, `director` o `admin` abre el formulario "Registrar Avance" en `ControlObraView`
- **THEN** el sistema le presenta un selector de conceptos poblado desde el presupuesto activo del proyecto (clave y descripción), no un campo de texto libre para `concepto_presupuesto`

#### Scenario: Precio y cantidad presupuestada ya no son campos editables
- **WHEN** el usuario selecciona un concepto en el formulario "Registrar Avance"
- **THEN** el formulario muestra el precio unitario y la cantidad presupuestada del concepto de solo lectura, sin ningún campo donde puedan editarse manualmente

#### Scenario: Se registra un avance válido desde Control de Obra
- **WHEN** el usuario elige un concepto, captura la cantidad del periodo, el periodo y confirma
- **THEN** el sistema envía `POST /api/v1/control-proyectos/avances` con `concepto_id`, `cantidad_periodo`, `periodo_inicio` y `periodo_fin`, y agrega el avance creado a la lista sin recargar toda la pestaña
