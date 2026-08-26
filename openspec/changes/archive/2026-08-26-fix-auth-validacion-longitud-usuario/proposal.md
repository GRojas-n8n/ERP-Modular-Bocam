## Why

`POST /api/v1/auth/admin/users` y `PATCH /api/v1/auth/admin/users/:id` ya validan su entrada con `crearUsuarioSchema`/`actualizarUsuarioSchema` (zod), pero ninguno de los dos limita la longitud de `email` (columna `VarChar(255)`) ni `nombre` (`VarChar(150)`) — solo exigen que no estén vacíos. Un valor más largo que la columna hace que Prisma lance un error de Postgres, y ambos endpoints lo exponen tal cual al cliente (`message: String(err)`). Es el mismo bug ya corregido en Personal (`fix-personal-validacion-longitud-empleado`) y Compras (`fix-compras-validacion-longitud-proveedor`), encontrado auditando el ciclo de vida de alta/baja/edición de Empleados, Usuarios y Proveedores — sin corregir en Usuarios.

## What Changes

- Agregar límites de longitud (`email` ≤255, `nombre` ≤150) a `crearUsuarioSchema` y `actualizarUsuarioSchema` (`apps/auth/src/validation/schemas/admin-users.schema.ts`).
- Los catch de `POST`/`PATCH /admin/users` dejan de responder `message: String(err)` para errores inesperados — mensaje genérico por endpoint, siguiendo el formato de error estándar ya definido por `validacion-entrada-zod`.
- Agregar `maxLength` a los inputs de nombre y email en el formulario de usuario (`AdminView.tsx`).

## Capabilities

### Modified Capabilities
- `validacion-entrada-zod`: los schemas de escritura de `apps/auth` que tengan un campo de texto respaldado por una columna `VarChar(n)` SHALL limitar su longitud a `n`, no solo validar que el campo tenga el tipo/forma correcta.

## Impact

- `apps/auth/src/validation/schemas/admin-users.schema.ts`: `crearUsuarioSchema`, `actualizarUsuarioSchema`.
- `apps/auth/src/main.ts`: catch de `POST`/`PATCH /admin/users` (~línea 930-995).
- `apps/app-shell/src/views/AdminView.tsx`: formulario de alta/edición de usuario.
- Sin migración Prisma — reutiliza los límites de columna ya existentes en `apps/auth/prisma/schema.prisma`.
