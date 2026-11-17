## ADDED Requirements

### Requirement: Los schemas de escritura de auth SHALL limitar la longitud de los campos de texto respaldados por una columna VarChar
Todo schema Zod usado para validar la entrada de un endpoint de escritura de `apps/auth` SHALL limitar cada campo de texto a la longitud de su columna (`@db.VarChar(n)`) correspondiente en `prisma/schema.prisma`, no solo validar su tipo o que no esté vacío. Un error de longitud NO SHALL exponer el mensaje interno de Prisma/Postgres al cliente.

#### Scenario: Email más largo que el límite de la columna (alta de usuario)
- **WHEN** un usuario con rol `admin` hace `POST /api/v1/auth/admin/users` con un `email` de más de 255 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'` y un detalle que nombra el campo `email` y su límite, y NO SHALL crearse ningún registro en la base de datos

#### Scenario: Nombre más largo que el límite de la columna (edición de usuario)
- **WHEN** un usuario con rol `admin` hace `PATCH /api/v1/auth/admin/users/:id` con un `nombre` de más de 150 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'`, y el registro existente NO SHALL modificarse

#### Scenario: Un error inesperado del servidor no expone el mensaje interno de Prisma/Postgres
- **WHEN** `POST /api/v1/auth/admin/users` o `PATCH /api/v1/auth/admin/users/:id` fallan por una causa no relacionada con la validación de longitud
- **THEN** la respuesta `500` SHALL incluir un mensaje genérico del endpoint, sin el texto crudo de la excepción de Prisma/Postgres

### Requirement: El formulario de usuario SHALL exponer los límites de longitud como maxLength
El formulario de alta/edición de usuario en `AdminView.tsx` SHALL limitar, mediante el atributo `maxLength` del campo, la entrada de `nombre` (150) y `email` (255).

#### Scenario: El usuario intenta escribir más caracteres de los que la columna acepta
- **WHEN** el usuario escribe en el campo Email del formulario de usuario (límite de 255 caracteres)
- **THEN** el campo no acepta más de 255 caracteres, igual que el campo Nombre con su propio límite
