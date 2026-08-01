## ADDED Requirements

### Requirement: El contacto de emergencia de un Empleado SHALL almacenarse en tres campos independientes
El sistema SHALL almacenar el contacto de emergencia de un Empleado como tres
campos independientes y opcionales: `contacto_emergencia_nombre`,
`contacto_emergencia_telefono` y `contacto_emergencia_parentesco`. Ninguno de
los tres SHALL ser obligatorio para el alta o edición de un empleado.

#### Scenario: Alta de empleado con contacto de emergencia completo
- **WHEN** RH da de alta un empleado indicando `contacto_emergencia_nombre`,
  `contacto_emergencia_telefono` y `contacto_emergencia_parentesco`
- **THEN** el sistema guarda los tres valores como campos independientes del
  empleado

#### Scenario: Alta de empleado sin contacto de emergencia
- **WHEN** RH da de alta un empleado sin indicar ninguno de los tres campos de
  contacto de emergencia
- **THEN** el sistema crea el empleado normalmente con los tres campos en
  `null`

### Requirement: El alta y la edición SHALL aceptar cada campo de contacto de emergencia de forma independiente
El alta (`POST /api/v1/personal/empleados`) y la edición (`PATCH /api/v1/personal/empleados/:id`) SHALL aceptar `contacto_emergencia_nombre`, `contacto_emergencia_telefono` y
`contacto_emergencia_parentesco` como campos independientes; el envío de uno
de ellos NO SHALL requerir ni afectar el valor de los otros dos.

#### Scenario: Editar solo el teléfono del contacto de emergencia
- **WHEN** RH envía un `PATCH` con únicamente `contacto_emergencia_telefono`
  para un empleado que ya tenía `contacto_emergencia_nombre` capturado
- **THEN** el sistema actualiza el teléfono y conserva el nombre y el
  parentesco existentes sin modificarlos

### Requirement: Los datos históricos del campo legacy SHALL quedar visibles tras la migración
El sistema SHALL copiar, para cada empleado con un valor no nulo en la
columna legacy `contacto_emergencia` (texto libre) al momento de esta
migración, ese valor a `contacto_emergencia_nombre`, dejando
`contacto_emergencia_telefono` y `contacto_emergencia_parentesco` en `null`.

#### Scenario: Empleado con contacto de emergencia capturado antes de este change
- **WHEN** un empleado tenía `contacto_emergencia = "Juan Pérez 5551234567"`
  antes de la migración
- **THEN** tras la migración ese empleado tiene
  `contacto_emergencia_nombre = "Juan Pérez 5551234567"` y
  `contacto_emergencia_telefono`/`contacto_emergencia_parentesco` en `null`

### Requirement: La credencial impresa SHALL mostrar nombre y teléfono del contacto de emergencia
La hoja de impresión de credenciales SHALL mostrar
`contacto_emergencia_nombre` y `contacto_emergencia_telefono` del empleado (no
el parentesco). Si alguno de los dos campos no está registrado, el sistema
SHALL mostrar el mismo indicador de "No registrado" que ya usa hoy para
contacto de emergencia ausente.

#### Scenario: Imprimir credencial con contacto de emergencia completo
- **WHEN** RH genera la hoja de impresión de un empleado con
  `contacto_emergencia_nombre` y `contacto_emergencia_telefono` capturados
- **THEN** el reverso de la credencial impresa muestra ambos valores

#### Scenario: Imprimir credencial sin contacto de emergencia registrado
- **WHEN** RH genera la hoja de impresión de un empleado sin
  `contacto_emergencia_nombre` ni `contacto_emergencia_telefono`
- **THEN** el reverso de la credencial impresa muestra "No registrado" en vez
  de dejar el espacio vacío o mostrar un error
