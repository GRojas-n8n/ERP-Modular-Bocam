## Why

En Administración → Usuarios, el modal de edición no permite cambiar el correo de un usuario existente (el campo `email` solo se renderiza cuando se está creando un usuario nuevo, y el backend tampoco lo acepta en el `PATCH`), y la tabla de usuarios no tiene ninguna acción directa para archivar (dar de baja) o reactivar un usuario — la única forma hoy es abrir "Editar" y desmarcar un checkbox "Activo" enterrado en el modal, sin confirmación. Esto ya se identificó como un hueco pendiente al construir `archivar-proveedores` (que estableció el patrón Archivar/Activar) y al cerrar `wire-baja-reactivar-empleado` (mismo tipo de gap en Personal): Usuarios es el módulo que faltaba por parejar.

## What Changes

- El backend (`apps/auth/src/main.ts`, `actualizarUsuarioSchema`) acepta `email` en el `PATCH /api/v1/auth/admin/users/:id`, con validación de formato (no solo longitud — cierra el gap conocido de "Auth email format gap" para el flujo de edición) y de unicidad dentro del tenant.
- El modal `UserModal` (`AdminView.tsx`) muestra y permite editar el campo Email también en modo edición, no solo al crear.
- La tabla de usuarios gana un botón "Archivar" (para usuarios `activo: true`) y "Reactivar" (para `activo: false`) junto al botón "Editar" existente, cada uno con `ConfirmCriticalActionDialog` — variante destructiva para Archivar, no destructiva para Reactivar — mismo patrón usado en `wire-baja-reactivar-empleado`.
- "Archivar" reutiliza el campo `activo` ya existente en el modelo `User` y el soporte ya existente en el `PATCH` (`activo: false`); no se agrega columna ni migración nueva.
- **Sin borrado físico.** No se agrega ningún `DELETE` real de la fila de usuario — mismo criterio ya aplicado en `archivar-proveedores`, para no romper referencias históricas (aprobaciones, asignaciones a proyectos, auditoría).
- Un usuario archivado (`activo: false`) no debe poder iniciar sesión (verificar que el login ya rechaza `activo: false`; si no lo hace, es parte de este change).

## Capabilities

### New Capabilities
- `gestion-ciclo-vida-usuarios-admin`: cubre la edición completa de un usuario existente desde Administración (incluyendo email) y su ciclo archivar/reactivar (`activo: true ⇄ false`) expuesto como acciones directas en la tabla, sin borrado físico.

### Modified Capabilities
(ninguna — no existe spec previo que documente el CRUD de usuarios desde Administración; los specs existentes de auth cubren verificación/sesión/passwords, no la gestión administrativa del catálogo de usuarios)

## Impact

- **Backend:** `apps/auth/src/main.ts` (handler `PATCH /api/v1/auth/admin/users/:id`, línea ~961) y `apps/auth/src/validation/schemas/admin-users.schema.ts` (`actualizarUsuarioSchema`) — agregar `email` con validación de formato + unicidad. Revisar el flujo de login para confirmar que ya rechaza usuarios con `activo: false`.
- **Frontend:** `apps/app-shell/src/views/AdminView.tsx` — `UserModal` (mostrar Email en modo edición) y la tabla de usuarios (botones Archivar/Reactivar + dos `ConfirmCriticalActionDialog` + handlers).
- **Sin impacto** en otros microservicios ni en el event bus — es estado interno de `auth`.
- Password y demás campos (nombre, roles, límite de aprobación, proyectos asignados) ya son editables hoy; no requieren cambios de contrato, solo quedan documentados en el spec nuevo.
