# Spec: estimaciones-avance-fisico-residente

## Propósito

Conecta la pestaña "Estimaciones" de `ResidenciaView` en el frontend con los
endpoints reales de avance físico y estimaciones de `control-proyectos`,
permitiendo al Residente ver sus estimaciones y avances propios, registrar
avances seleccionando el concepto de un catálogo (no como texto libre), y
crear estimaciones agrupando sus avances validados, eliminando la captura
de "Nueva Estimación" que no correspondía a ningún endpoint real.

## Requirements

### Requirement: Carga real de avances y estimaciones en la pestaña Estimaciones del Residente
El sistema SHALL cargar, al activar la pestaña "Estimaciones" de `ResidenciaView`, la lista real de estimaciones (`GET /api/v1/control-proyectos/estimaciones`) y de avances físicos propios (`GET /api/v1/control-proyectos/avances`) del proyecto activo, en vez de mostrar una lista vacía fija.

#### Scenario: Residente abre la pestaña Estimaciones
- **WHEN** un usuario con rol `residencia` activa la pestaña "Estimaciones"
- **THEN** el sistema consulta `GET /api/v1/control-proyectos/estimaciones` y `GET /api/v1/control-proyectos/avances` y muestra los datos devueltos por el backend

#### Scenario: Falla la carga de datos
- **WHEN** la petición a `GET /api/v1/control-proyectos/estimaciones` o `GET /api/v1/control-proyectos/avances` falla por red
- **THEN** la pestaña muestra un estado de error distinguible de "sin datos", con opción de reintentar

### Requirement: Registro de avance físico desde la pestaña Estimaciones del Residente
El sistema SHALL permitir al Residente registrar un avance físico de periodo para un concepto de su presupuesto activo desde la pestaña "Estimaciones", seleccionando el concepto de un catálogo (no como texto libre) y enviando `POST /api/v1/control-proyectos/avances`.

#### Scenario: Residente selecciona un concepto del catálogo
- **WHEN** el Residente abre el formulario de registro de avance
- **THEN** el sistema le presenta un selector de conceptos poblado desde el presupuesto activo del proyecto (clave y descripción), no un campo de texto libre

#### Scenario: Residente registra un avance válido
- **WHEN** el Residente elige un concepto, captura la cantidad del periodo y confirma
- **THEN** el sistema envía `POST /api/v1/control-proyectos/avances` con `concepto_id`, `cantidad_periodo`, `periodo_inicio` y `periodo_fin` (sin `precio_unitario` ni `cantidad_presupuestada`, que el backend resuelve del catálogo), y añade el avance creado a la lista sin recargar toda la pestaña

#### Scenario: El Residente no captura precio ni cantidad presupuestada a mano
- **WHEN** el Residente completa el formulario de registro de avance
- **THEN** el formulario no incluye ningún campo editable de precio unitario ni de cantidad presupuestada — ambos se muestran de solo lectura, tomados del concepto seleccionado del catálogo

#### Scenario: Falla el registro por red
- **WHEN** `POST /api/v1/control-proyectos/avances` falla por conectividad
- **THEN** el sistema conserva los datos capturados por el Residente en el formulario y permite reintentar el envío sin volver a teclearlos

### Requirement: Creación de estimación agrupando avances propios validados
El sistema SHALL permitir al Residente crear una estimación seleccionando uno o más de sus avances físicos en estado `VALIDADO` y enviando `POST /api/v1/control-proyectos/estimaciones` con los `avance_ids` elegidos.

#### Scenario: Residente agrupa avances validados en una estimación
- **WHEN** el Residente selecciona uno o más avances propios en estado `VALIDADO` y confirma "Crear estimación"
- **THEN** el sistema envía `POST /api/v1/control-proyectos/estimaciones` con `avance_ids` y agrega la estimación creada (estado `BORRADOR`) a la lista

#### Scenario: No hay avances validados disponibles
- **WHEN** el Residente no tiene ningún avance propio en estado `VALIDADO`
- **THEN** el sistema no permite iniciar la creación de una estimación y explica que debe esperar a que un superintendente valide sus avances pendientes

### Requirement: Eliminación de la captura no funcional de estimaciones
El sistema SHALL eliminar de la pestaña "Estimaciones" del Residente el formulario "Nueva Estimación" (campos frente/periodo/descripción) y el botón "Enviar a revisión", que no correspondían a ningún endpoint real.

#### Scenario: El formulario y botón anteriores ya no existen
- **WHEN** el Residente abre la pestaña "Estimaciones"
- **THEN** no se muestra ningún formulario "Nueva Estimación" con campos frente/periodo/descripción ni ningún botón "Enviar a revisión"
