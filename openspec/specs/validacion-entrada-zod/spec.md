# validacion-entrada-zod Specification

## Purpose

Todo endpoint de escritura de `apps/auth` valida su entrada con un schema
Zod dedicado antes de tocar Prisma, reemplazando los chequeos manuales `if`
previos, con una respuesta de error en el formato estándar del proyecto.

## Requirements

### Requirement: Todo endpoint de escritura de auth SHALL validar su entrada con un schema Zod antes de tocar Prisma
Cada endpoint `POST`/`PATCH`/`DELETE` de `apps/auth/src/main.ts` que reciba datos del cliente SHALL validar `req.body` (y `req.params` cuando el identificador venga de la ruta) contra un schema Zod dedicado antes de ejecutar cualquier operación de Prisma, reemplazando los chequeos manuales `if` existentes.

#### Scenario: Payload válido
- **WHEN** un cliente envía un payload que cumple el schema Zod del endpoint (mismos campos y tipos que hoy se consideran válidos)
- **THEN** el endpoint SHALL procesar la petición exactamente igual que antes de este cambio, sin diferencia observable en la respuesta de éxito

#### Scenario: Payload inválido o con forma inesperada
- **WHEN** un cliente envía un payload que no cumple el schema (campo faltante, tipo incorrecto, o un campo con una forma inesperada como un objeto donde se espera un string)
- **THEN** el endpoint SHALL responder 400 con `success: false`, `error.code: 'VALIDATION_ERROR'` y un detalle por campo que falló, sin ejecutar ninguna operación de Prisma

### Requirement: Un fallo de validación Zod SHALL responder en el formato de error estándar del proyecto
La respuesta de un fallo de validación SHALL seguir la misma forma de error usada por el resto del ERP (`success: false`, objeto `error` con `code` y `message`), agregando un array `error.details` con `{ field, message }` por cada issue reportado por Zod.

#### Scenario: Múltiples campos inválidos en un solo request
- **WHEN** un payload falla la validación en más de un campo a la vez (ej. `email` con formato inválido y `tenant_id` vacío)
- **THEN** la respuesta 400 SHALL incluir todos los issues encontrados en `error.details`, no solo el primero

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
