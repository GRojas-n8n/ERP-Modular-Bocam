# Spec: avance-fisico-control-obra

## Purpose

Alinea el formulario "Registrar Avance" de la pestaña "Avances Físicos" en
`ControlObraView` con el backend de `control-proyectos`, reemplazando la
captura de `concepto_presupuesto` como texto libre y de `precio_unitario`/
`cantidad_presupuestada` editables a mano por un selector de conceptos del
catálogo del presupuesto activo, para los roles de Control de Obra,
Control de Proyectos, Director y Admin.
## Requirements
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

### Requirement: Navegación de teclado en el selector de concepto de Registrar Avance
El sistema SHALL permitir resaltar y confirmar un concepto en el selector del panel "Registrar Avance" usando teclado: `ArrowDown`/`ArrowUp` mueven el resaltado entre las opciones de la lista actualmente filtrada (sin wrap-around), y `Enter` confirma la opción resaltada.

#### Scenario: Resaltar la siguiente opción
- **WHEN** el usuario tiene el selector de concepto abierto y presiona `ArrowDown`
- **THEN** el sistema resalta la siguiente opción de la lista filtrada visible

#### Scenario: Confirmar la opción resaltada
- **WHEN** el usuario tiene una opción resaltada en el selector y presiona `Enter`
- **THEN** el sistema selecciona ese concepto, igual que si el usuario hubiera hecho clic en él

#### Scenario: Sin wrap-around en los límites
- **WHEN** la primera opción está resaltada y el usuario presiona `ArrowUp`, o la última opción está resaltada y presiona `ArrowDown`
- **THEN** el resaltado no cambia

#### Scenario: La navegación respeta el filtro de búsqueda activo
- **WHEN** el usuario tiene un término de búsqueda que reduce la lista a un subconjunto, y navega con las flechas
- **THEN** el resaltado se mueve solo dentro del subconjunto filtrado visible

### Requirement: Conceptos recientes en el selector de Registrar Avance
El sistema SHALL mostrar, cuando el campo de búsqueda del selector de concepto está vacío, hasta 5 conceptos seleccionados recientemente durante la sesión actual del panel "Registrar Avance" (más reciente primero), antes de mostrar la lista completa del catálogo.

#### Scenario: Concepto recién usado aparece en recientes
- **WHEN** el usuario confirma un avance para un concepto y el panel permanece abierto para capturar otro avance
- **THEN** al abrir el selector de concepto de nuevo con el campo de búsqueda vacío, ese concepto aparece en la sección "Recientes"

#### Scenario: Escribir en la búsqueda oculta los recientes
- **WHEN** el usuario escribe un texto en el campo de búsqueda del selector
- **THEN** el sistema muestra el filtrado normal por texto, sin la sección "Recientes"

#### Scenario: Sin recientes al abrir el panel por primera vez en la sesión
- **WHEN** el usuario abre el panel "Registrar Avance" y no ha confirmado ningún avance todavía en esta sesión del panel
- **THEN** el selector muestra la lista completa del catálogo filtrada, sin sección "Recientes"
