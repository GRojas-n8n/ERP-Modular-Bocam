## ADDED Requirements

### Requirement: El botón "+ Nuevo Empleado" SHALL abrir un panel de alta individual
En la pestaña Empleados del módulo Personal, el botón "+ Nuevo Empleado"
SHALL abrir un panel (`SlidePanel`) con un formulario de alta individual
de empleado. El panel SHALL exponer los campos que acepta
`POST /api/v1/personal/empleados`: obligatorios (`nombre`,
`apellido_paterno`, `rfc`, `puesto`, `salario_diario`) y opcionales
(`apellido_materno`, `curp`, `nss`, `categoria`, `tipo_contrato`,
`fecha_ingreso`, `telefono`, `email`, `contacto_emergencia`).

#### Scenario: Clic en "+ Nuevo Empleado" abre el panel
- **WHEN** el usuario está en la pestaña Empleados y hace clic en el
  botón "+ Nuevo Empleado"
- **THEN** el sistema muestra un panel con el formulario de alta de
  empleado, vacío

### Requirement: El sistema SHALL validar los campos obligatorios antes de enviar el alta
Antes de llamar al backend, el formulario SHALL validar que
`nombre`, `apellido_paterno`, `rfc`, `puesto` y `salario_diario` tengan
valor. Si falta alguno, el sistema SHALL mostrar un error y NO SHALL
enviar la petición.

#### Scenario: Intento de guardar sin un campo obligatorio
- **WHEN** el usuario deja vacío `rfc` (o cualquier otro campo
  obligatorio) y hace clic en "Guardar"
- **THEN** el sistema muestra un mensaje de error indicando los campos
  faltantes y no realiza ninguna petición al backend

### Requirement: El alta exitosa SHALL crear el empleado y refrescar la lista
Cuando todos los campos obligatorios son válidos y el backend responde
201, el sistema SHALL cerrar el panel, refrescar la lista de empleados
mostrada, y mostrar confirmación al usuario.

#### Scenario: Alta exitosa con solo los campos obligatorios
- **WHEN** el usuario completa `nombre`, `apellido_paterno`, `rfc`,
  `puesto` y `salario_diario`, y hace clic en "Guardar"
- **THEN** el sistema llama a `POST /api/v1/personal/empleados`, y al
  recibir 201 cierra el panel y el nuevo empleado aparece en la lista de
  Empleados

#### Scenario: El backend rechaza el alta (p. ej. RFC duplicado)
- **WHEN** el backend responde con error (4xx/5xx) al intentar crear el
  empleado
- **THEN** el sistema mantiene el panel abierto con los datos ingresados
  y muestra el mensaje de error devuelto por el backend, sin cerrar el
  panel ni modificar la lista de empleados
