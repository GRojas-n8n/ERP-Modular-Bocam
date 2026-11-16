## Why

`POST /api/v1/compras/proveedores` y `PUT /api/v1/compras/proveedores/:id` no validan la longitud de los campos de texto antes de escribir a Postgres. Cuando un campo excede el límite de su columna (`rfc_tax_id` VarChar(20), `razon_social` VarChar(255), `email_contacto` VarChar(100), `telefono` VarChar(20), `ciudad` VarChar(100)), Prisma lanza un error de Postgres y ambos endpoints responden `500` exponiendo `error.message` crudo del motor de base de datos al cliente — el mismo bug que ya se corrigió en Personal con `fix-personal-validacion-longitud-empleado` (archivado 2026-08-26), pero sin corregir aquí. El formulario de alta/edición de proveedor en `ComprasView.tsx` tampoco tiene `maxLength`, así que el usuario no recibe ninguna advertencia hasta que el backend truena.

## What Changes

- Agregar un schema de validación de longitud (zod) para los campos de texto de `Proveedor`, reutilizando el patrón `parseOrRespond` ya usado en `apps/auth` y `apps/personal`.
- Aplicar ese schema en `POST /proveedores`, `PUT /proveedores/:id` y `POST /proveedores/importar-lote`, sin romper los checks existentes de obligatorios (`rfc_tax_id`, `razon_social`) ni el de RFC duplicado (`P2002`).
- Los tres endpoints dejan de exponer `error.message` crudo del motor de base de datos en errores inesperados; responden un mensaje genérico por endpoint.
- Agregar `maxLength` a los inputs de RFC, razón social, email de contacto, teléfono y ciudad en el formulario de alta/edición de proveedor (`ComprasView.tsx`).

## Capabilities

### New Capabilities
- `validacion-longitud-proveedor`: define los límites de longitud por campo para el alta y edición individual de un proveedor, y que un fallo de longitud responde `400` con `VALIDATION_ERROR` en vez de un `500` crudo de Prisma.

### Modified Capabilities
- `carga-masiva-proveedores`: cada fila de la importación en lote SHALL validarse con los mismos límites de longitud que la alta individual, reportando la fila con motivo en `errores` sin abortar el lote completo (igual que ya hace el fix análogo de Personal).

## Impact

- `apps/compras/src/main.ts`: endpoints `POST /proveedores` (~L1882), `PUT /proveedores/:id` (~L2056), `POST /proveedores/importar-lote` (~L1942).
- `apps/compras/src/validation/` (nuevo): `parse-or-respond.ts` + `schemas/proveedor.schema.ts`.
- `apps/compras/package.json`: agregar dependencia `zod` (si no está ya).
- `apps/app-shell/src/views/ComprasView.tsx`: formulario de alta/edición de proveedor.
- Sin migración Prisma — los límites ya existen en `apps/compras/prisma/schema.prisma`, solo se valida antes de escribir.
