## MODIFIED Requirements

### Requirement: El sistema SHALL confirmar el proyecto activo antes de crear un registro nuevo
El sistema SHALL mostrar un diálogo de confirmación con el nombre del proyecto activo antes de
enviar la petición de creación (alta) de un registro nuevo en cualquiera de los formularios de
alta cubiertos — Requisición, Empleado, Activo, Avance Físico, Estimación —, o antes de procesar
cualquiera de las cargas de archivo cubiertas — Catálogo de Obra, Explosión de Insumos, Análisis
de Precios Unitarios, Fichas Técnicas, Usuarios, Empleados (individual o masiva), Proveedores
(masiva) —, dándole al usuario la opción explícita de cancelar antes de que la petición se envíe
al backend o el archivo se procese. El sistema NO SHALL enviar la petición de creación
directamente desde el clic inicial en "Guardar"/"Crear", ni procesar un archivo directamente
desde su selección, sin pasar por este diálogo.

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

#### Scenario: Usuario selecciona un archivo de Catálogo de Obra, Explosión de Insumos o APU
- **WHEN** un usuario selecciona un archivo en el input de carga de Catálogo de Obra, Explosión de
  Insumos o Análisis de Precios Unitarios, en Gerencia Técnica, estando el proyecto activo en
  "Torre Corporativa Norte"
- **THEN** el sistema muestra el diálogo de confirmación con el nombre del proyecto activo antes
  de parsear el archivo o abrir el panel de revisión (`SlidePanel`) de su contenido

#### Scenario: Usuario selecciona un archivo de Ficha Técnica, o hace carga masiva de Usuarios, Empleados o Proveedores
- **WHEN** un usuario selecciona un archivo para subir una Ficha Técnica, o un archivo de carga
  masiva de Usuarios, Empleados o Proveedores
- **THEN** el sistema muestra el diálogo de confirmación con el nombre del proyecto activo antes
  de enviar el archivo al backend

### Requirement: Esta confirmación de alta NO SHALL aplicar a ediciones de registros existentes
El sistema NO SHALL mostrar el diálogo de confirmación de proyecto al editar o actualizar un
registro ya existente, ni al reemplazar un archivo previamente cargado en un flujo que ya tuvo su
propia confirmación explícita de reemplazo — únicamente al crear un registro nuevo o al
seleccionar un archivo para una carga nueva.

#### Scenario: Usuario edita un registro existente
- **WHEN** un usuario modifica y guarda cambios sobre un registro que ya existía (no un alta)
- **THEN** el sistema NO SHALL mostrar el diálogo de confirmación de proyecto de este requirement

## ADDED Requirements

### Requirement: El diálogo de confirmación de alta SHALL mostrar el nombre del archivo y el destino cuando la acción sea una carga de archivo
El diálogo SHALL incluir, cuando la confirmación corresponda a una carga de archivo (no a un alta
de formulario), además del proyecto activo: el nombre del archivo seleccionado, y el destino
dentro de iRetum expresado como módulo + tipo de carga (ej. "Gerencia Técnica → Catálogo de Obra").

#### Scenario: Usuario selecciona un archivo de Explosión de Insumos
- **WHEN** un usuario selecciona el archivo "explosion_torre_norte.xlsx" para Explosión de
  Insumos, estando el proyecto activo en "Torre Corporativa Norte"
- **THEN** el diálogo de confirmación muestra el texto "explosion_torre_norte.xlsx", el destino
  "Gerencia Técnica → Explosión de Insumos" y el proyecto "Torre Corporativa Norte"

#### Scenario: Usuario cancela la confirmación de una carga de archivo
- **WHEN** el diálogo de confirmación de una carga de archivo está abierto
- **AND** el usuario hace clic en "Cancelar"
- **THEN** el sistema NO SHALL parsear ni enviar el archivo, y el campo de selección de archivo
  queda vacío para que el usuario pueda elegir un archivo distinto o corregir el proyecto activo
