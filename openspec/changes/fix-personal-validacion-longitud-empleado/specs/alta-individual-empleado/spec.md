## MODIFIED Requirements

### Requirement: El sistema SHALL validar los campos obligatorios antes de enviar el alta
Antes de llamar al backend, el formulario SHALL validar que
`nombre`, `apellido_paterno`, `rfc`, `puesto` y `salario_diario` tengan
valor. Si falta alguno, el sistema SHALL mostrar un error y NO SHALL
enviar la petición. Los campos de texto con límite de longitud en la base de
datos (`rfc`, `curp`, `nss`, `telefono`, `puesto`, `contacto_emergencia_nombre`,
`contacto_emergencia_telefono`, `contacto_emergencia_parentesco`) SHALL
exponer ese límite como `maxLength` en el campo del formulario.

#### Scenario: Intento de guardar sin un campo obligatorio
- **WHEN** el usuario deja vacío `rfc` (o cualquier otro campo
  obligatorio) y hace clic en "Guardar"
- **THEN** el sistema muestra un mensaje de error indicando los campos
  faltantes y no realiza ninguna petición al backend

#### Scenario: El usuario intenta escribir más caracteres de los que la columna acepta
- **WHEN** el usuario escribe en el campo `rfc` (límite de 13 caracteres)
- **THEN** el campo no acepta más de 13 caracteres, igual que el resto de los
  campos con límite de longitud

### Requirement: El backend SHALL validar la longitud de los campos de texto antes de escribir a la base de datos
`POST /api/v1/personal/empleados`, `PATCH /api/v1/personal/empleados/:id` y `POST /api/v1/personal/empleados/importar-lote` SHALL validar que cada campo
de texto no exceda el límite de su columna (`rfc` ≤ 13, `curp` ≤ 18, `nss` ≤
11, `telefono` ≤ 20, `puesto` ≤ 100, `contacto_emergencia_nombre` ≤ 200,
`contacto_emergencia_telefono` ≤ 30, `contacto_emergencia_parentesco` ≤ 50)
antes de invocar `prisma.empleado.create()`/`update()`. Un error de
validación NO SHALL exponer el mensaje interno de Prisma/Postgres al
cliente.

#### Scenario: RFC más largo que el límite de la columna (alta individual)
- **WHEN** un usuario con rol `personal_rh` hace
  `POST /api/v1/personal/empleados` con un `rfc` de más de 13 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'`
  y un detalle que nombra el campo `rfc` y su límite, y NO SHALL crearse
  ningún registro en la base de datos

#### Scenario: Campo de texto más largo que el límite de la columna (edición)
- **WHEN** un usuario con rol `personal_rh` hace
  `PATCH /api/v1/personal/empleados/:id` con `contacto_emergencia_telefono`
  de más de 30 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'`,
  y el registro existente NO SHALL modificarse

#### Scenario: Fila con un campo demasiado largo dentro de una importación masiva
- **WHEN** `POST /api/v1/personal/empleados/importar-lote` recibe un lote
  donde una fila tiene `rfc` de más de 13 caracteres y el resto de las filas
  son válidas
- **THEN** esa fila SHALL reportarse en `errores` con el motivo del campo
  excedido, y las demás filas válidas SHALL crearse normalmente — la
  importación no SHALL abortar el lote completo por una fila inválida
