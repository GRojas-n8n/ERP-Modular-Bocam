# confirmacion-proyecto-en-altas Specification

## Purpose
TBD - created by archiving change confirmacion-proyecto-en-altas. Update Purpose after archive.
## Requirements
### Requirement: El sistema SHALL confirmar el proyecto activo antes de crear un registro nuevo
El sistema SHALL mostrar un diálogo de confirmación con el nombre del proyecto activo antes de
enviar la petición de creación (alta) de un registro nuevo en cualquiera de los formularios de
alta cubiertos — Requisición, Empleado, Activo, Avance Físico, Estimación —, dándole al usuario la
opción explícita de cancelar antes de que la petición se envíe al backend. El sistema NO SHALL
enviar la petición de creación directamente desde el clic inicial en "Guardar"/"Crear" sin pasar
por este diálogo.

#### Scenario: Usuario da de alta una Requisición en el proyecto activo
- **WHEN** un usuario llena el formulario de nueva Requisición y hace clic en "Guardar", estando
  el proyecto activo en "Torre Corporativa Norte"
- **THEN** el sistema muestra un diálogo de confirmación que incluye el texto "Torre Corporativa
  Norte" antes de enviar la petición de creación al backend

#### Scenario: Usuario cancela la confirmación de alta
- **WHEN** el diálogo de confirmación de alta está abierto
- **AND** el usuario hace clic en "Cancelar" o cierra el diálogo sin confirmar
- **THEN** el sistema NO SHALL enviar la petición de creación, y el formulario permanece abierto
  con los datos capturados intactos para que el usuario pueda corregir el proyecto activo o los
  datos antes de reintentar

#### Scenario: Usuario da de alta un Activo en Almacén
- **WHEN** un usuario llena el formulario de nuevo Activo y hace clic en "Guardar"
- **THEN** el sistema muestra el diálogo de confirmación con el nombre del proyecto activo antes
  de enviar la petición de creación del activo

#### Scenario: Usuario da de alta un Empleado
- **WHEN** un usuario llena el formulario de alta individual de Empleado y hace clic en "Guardar"
- **THEN** el sistema muestra el diálogo de confirmación con el nombre del proyecto activo antes
  de enviar la petición de creación del empleado

#### Scenario: Usuario registra un Avance Físico o crea una Estimación en Control de Obra
- **WHEN** un usuario en Residencia hace clic en "Guardar"/"Crear" sobre un nuevo registro de
  avance físico o una nueva estimación
- **THEN** el sistema muestra el diálogo de confirmación con el nombre del proyecto activo antes
  de enviar la petición de creación al backend

### Requirement: El diálogo de confirmación de alta SHALL bloquear la pantalla y SHALL requerir una decisión explícita
El diálogo SHALL aparecer centrado sobre toda la pantalla, con un overlay que bloquee la
interacción con el resto de la interfaz mientras está abierto, y SHALL requerir que el usuario
haga clic explícitamente en "Confirmar" o "Cancelar" para resolverlo. El sistema NO SHALL cerrar
el diálogo ni interpretarlo como cancelado por un clic fuera del diálogo (en el overlay) ni por la
tecla Escape.

#### Scenario: Usuario hace clic fuera del diálogo de confirmación de alta
- **WHEN** el diálogo de confirmación de alta está abierto
- **AND** el usuario hace clic en el overlay, fuera del cuadro de diálogo
- **THEN** el diálogo permanece abierto y el sistema NO SHALL enviar ni descartar la petición de
  creación

#### Scenario: Usuario presiona Escape con el diálogo de confirmación de alta abierto
- **WHEN** el diálogo de confirmación de alta está abierto
- **AND** el usuario presiona la tecla Escape
- **THEN** el diálogo permanece abierto y el sistema NO SHALL enviar ni descartar la petición de
  creación

### Requirement: La confirmación de alta SHALL reutilizar el componente compartido de confirmación de proyecto
El sistema SHALL implementar la confirmación de alta usando el mismo componente compartido de
`packages/ui-core` que ya usa `confirmacion-accion-critica-proyecto` (con una variante no
destructiva), en vez de crear un segundo componente de diálogo con el mismo propósito.

#### Scenario: Dos módulos distintos requieren confirmación de alta
- **WHEN** tanto Compras (alta de Requisición) como Almacén (alta de Activo) necesitan confirmar
  el proyecto activo antes de crear el registro
- **THEN** ambos módulos usan la misma implementación de componente de diálogo compartido, con
  distintos textos/props, no dos componentes de modal separados

### Requirement: El panel de alta SHALL mostrar el proyecto activo de forma visible mientras se captura el formulario
El panel de alta (`SlidePanel`) de cada formulario cubierto SHALL mostrar el nombre del proyecto
activo en su subtítulo mientras el usuario captura los datos, como refuerzo visual pasivo además
de la confirmación explícita al momento de guardar.

#### Scenario: Usuario abre el panel de alta de un nuevo registro
- **WHEN** un usuario abre el panel de alta de Requisición, Activo, Empleado, Avance Físico o
  Estimación
- **THEN** el subtítulo del panel muestra el nombre del proyecto activo vigente en ese momento

### Requirement: Esta confirmación de alta NO SHALL aplicar a ediciones de registros existentes
El sistema NO SHALL mostrar el diálogo de confirmación de proyecto al editar o actualizar un
registro ya existente — únicamente al crear un registro nuevo.

#### Scenario: Usuario edita un registro existente
- **WHEN** un usuario modifica y guarda cambios sobre un registro que ya existía (no un alta)
- **THEN** el sistema NO SHALL mostrar el diálogo de confirmación de proyecto de este requirement
