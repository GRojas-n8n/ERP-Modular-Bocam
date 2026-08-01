# edicion-datos-empleado Specification

## Purpose
TBD - created by archiving change editar-datos-empleado. Update Purpose after archive.
## Requirements
### Requirement: El botón "Editar" SHALL abrir un panel de edición precargado
En la pestaña Empleados del módulo Personal, cada fila de la tabla SHALL mostrar
un botón "Editar" junto a los botones existentes "Jornada" y "Deducciones". Al
hacer clic, el sistema SHALL abrir un panel (`SlidePanel`) con un formulario
precargado con los datos actuales del empleado: `nombre`, `apellido_paterno`,
`apellido_materno`, `rfc`, `curp`, `nss`, `puesto`, `salario_diario`, `telefono`,
`email`, `contacto_emergencia_nombre`, `contacto_emergencia_telefono`,
`contacto_emergencia_parentesco`.

#### Scenario: Clic en "Editar" abre el panel con los datos actuales
- **WHEN** el usuario está en la pestaña Empleados y hace clic en "Editar" sobre
  la fila de un empleado
- **THEN** el sistema muestra un panel con el formulario de edición, con cada
  campo precargado con el valor actual de ese empleado

### Requirement: El sistema SHALL validar los campos obligatorios antes de enviar la edición
El formulario SHALL validar que `nombre`, `apellido_paterno`, `rfc`, `puesto` y
`salario_diario` tengan valor antes de llamar al backend (los mismos campos
obligatorios que en el alta). Si falta alguno, el sistema SHALL mostrar un error
y no SHALL enviar la petición.

#### Scenario: Intento de guardar con un campo obligatorio vacío
- **WHEN** el usuario borra el valor de `rfc` (o cualquier otro campo
  obligatorio) en el panel de edición y hace clic en "Guardar"
- **THEN** el sistema muestra un mensaje de error indicando los campos
  faltantes y no realiza ninguna petición al backend

### Requirement: La edición exitosa SHALL actualizar el empleado y refrescar su fila
El sistema SHALL cerrar el panel, actualizar los datos del empleado en la lista
mostrada (sin recargar toda la tabla) y mostrar confirmación al usuario, cuando
todos los campos obligatorios son válidos y
`PATCH /api/v1/personal/empleados/:id` responde 200.

#### Scenario: Edición exitosa de datos generales
- **WHEN** el usuario corrige el `puesto` de un empleado y hace clic en
  "Guardar"
- **THEN** el sistema llama a `PATCH /api/v1/personal/empleados/:id` con los
  campos del formulario, y al recibir 200 cierra el panel y la fila del
  empleado en la tabla de Empleados muestra el `puesto` actualizado

#### Scenario: El backend rechaza la edición por RFC duplicado
- **WHEN** el usuario cambia el `rfc` a uno que ya pertenece a otro empleado
  del mismo tenant y hace clic en "Guardar"
- **THEN** el sistema mantiene el panel abierto con los datos ingresados y
  muestra el mensaje de error devuelto por el backend (`PER_RFC_DUPLICADO`),
  sin cerrar el panel ni modificar la lista de empleados

#### Scenario: El backend rechaza la edición por otro error
- **WHEN** el backend responde con error (4xx/5xx distinto de RFC duplicado)
  al intentar actualizar el empleado
- **THEN** el sistema mantiene el panel abierto con los datos ingresados y
  muestra el mensaje de error devuelto por el backend, sin cerrar el panel ni
  modificar la lista de empleados

### Requirement: El endpoint de actualización SHALL requerir rol de RH o admin
`PATCH /api/v1/personal/empleados/:id` SHALL seguir protegido con
`requireRoles('personal_rh', 'admin')` al aceptar los campos generales nuevos,
igual que ya lo está para los campos de jornada que acepta hoy.

#### Scenario: Usuario sin rol autorizado intenta editar datos generales
- **WHEN** un usuario sin rol `personal_rh` ni `admin` llama a
  `PATCH /api/v1/personal/empleados/:id` con campos generales en el body
- **THEN** el sistema responde 403 y no modifica el empleado

### Requirement: El backend SHALL validar unicidad de RFC al editar
El sistema SHALL verificar, cuando el body del PATCH incluye `rfc` y su valor es
distinto al `rfc` actual del empleado, que ningún otro empleado del mismo tenant
tenga ese `rfc` antes de aplicar el update, y SHALL responder 400 con código
`PER_RFC_DUPLICADO` sin modificar el registro si existe otro empleado con ese
`rfc`.

#### Scenario: RFC editado no choca con ningún otro empleado
- **WHEN** se envía un PATCH con un `rfc` distinto al actual y ningún otro
  empleado del tenant tiene ese `rfc`
- **THEN** el sistema actualiza el empleado con el nuevo `rfc` y responde 200

#### Scenario: RFC editado choca con otro empleado del mismo tenant
- **WHEN** se envía un PATCH con un `rfc` que ya pertenece a otro empleado del
  mismo tenant
- **THEN** el sistema responde 400 con `PER_RFC_DUPLICADO` y el empleado no se
  modifica

#### Scenario: RFC no incluido en el body no dispara el chequeo de unicidad
- **WHEN** se envía un PATCH sin el campo `rfc` (por ejemplo, solo se edita
  `puesto`)
- **THEN** el sistema no ejecuta el chequeo de unicidad de RFC y actualiza los
  demás campos enviados normalmente

