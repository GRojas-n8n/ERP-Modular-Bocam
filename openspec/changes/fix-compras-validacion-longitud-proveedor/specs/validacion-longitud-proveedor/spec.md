## ADDED Requirements

### Requirement: El backend SHALL validar la longitud de los campos de texto de un Proveedor antes de escribir a la base de datos
`POST /api/v1/compras/proveedores` y `PUT /api/v1/compras/proveedores/:id` SHALL validar que cada campo de texto no exceda el límite de su columna (`rfc_tax_id` ≤ 20, `razon_social` ≤ 255, `email_contacto` ≤ 100, `telefono` ≤ 20, `ciudad` ≤ 100) antes de invocar `prisma.proveedor.create()`/`update()`. Un error de validación NO SHALL exponer el mensaje interno de Prisma/Postgres al cliente.

#### Scenario: RFC más largo que el límite de la columna (alta individual)
- **WHEN** un usuario con rol `procurement` o `admin` hace `POST /api/v1/compras/proveedores` con un `rfc_tax_id` de más de 20 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'` y un detalle que nombra el campo `rfc_tax_id` y su límite, y NO SHALL crearse ningún registro en la base de datos

#### Scenario: Razón social más larga que el límite de la columna (edición)
- **WHEN** un usuario con rol `procurement` o `admin` hace `PUT /api/v1/compras/proveedores/:id` con `razon_social` de más de 255 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'`, y el registro existente NO SHALL modificarse

#### Scenario: Un error inesperado del servidor no expone el mensaje interno de Prisma/Postgres
- **WHEN** `POST /api/v1/compras/proveedores` o `PUT /api/v1/compras/proveedores/:id` fallan por una causa no relacionada con la validación de longitud (p. ej. un error de conexión a la base de datos)
- **THEN** la respuesta `500` SHALL incluir un mensaje genérico del endpoint, sin el texto crudo de la excepción de Prisma/Postgres

### Requirement: El formulario de alta/edición de proveedor SHALL exponer los límites de longitud como `maxLength`
El formulario de alta y edición de proveedor en `ComprasView.tsx` SHALL limitar, mediante el atributo `maxLength` del campo, la entrada de `rfc_tax_id` (20), `razon_social` (255), `email_contacto` (100), `telefono` (20) y `ciudad` (100).

#### Scenario: El usuario intenta escribir más caracteres de los que la columna acepta
- **WHEN** el usuario escribe en el campo RFC del formulario de proveedor (límite de 20 caracteres)
- **THEN** el campo no acepta más de 20 caracteres, igual que el resto de los campos con límite de longitud
