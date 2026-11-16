## Context

`apps/auth` gestiona el catálogo de usuarios por tenant vía `User` (Prisma, `@@unique([tenant_id, email])`). El endpoint `PATCH /api/v1/auth/admin/users/:id` ya construye un `updateData` parcial campo por campo (`if (campo !== undefined)`); agregar `email` sigue ese mismo patrón. El login (línea ~247 de `main.ts`) ya rechaza `!user.activo`, así que "Archivar" (poner `activo: false`) ya corta el acceso sin cambios adicionales en el login.

No existe hoy manejo de la colisión de unicidad de `email` en ningún endpoint de usuarios: `POST /admin/users` no captura `P2002` (Prisma) para dar un mensaje claro, solo cae al catch genérico `500 ADMIN_ERROR`. Al permitir editar `email`, esta misma colisión se vuelve alcanzable con más frecuencia (dos administradores editando en paralelo, o un typo que coincide con otro usuario), así que el `PATCH` sí debe manejarla explícitamente.

## Goals / Non-Goals

**Goals:**
- Permitir cambiar el `email` de un usuario existente, con el mismo nivel de validación de formato que ya usa el resto del sistema (no solo longitud).
- Dar un mensaje de error claro (409, no 500) si el nuevo email ya está en uso dentro del tenant.
- Exponer Archivar/Reactivar como acciones de un clic en la tabla, con confirmación, sin exigir abrir el modal de edición.

**Non-Goals:**
- No se agrega `DELETE` real ni se toca ninguna tabla relacionada (`UserProjectAccess`, aprobaciones, auditoría, sesiones).
- No se cambia el comportamiento de login ni de tokens — ya rechazan `activo: false`.
- No se resuelve el gap de validación de formato de email en el flujo de **creación** (`POST`) ni en `apps/personal` — solo en la edición desde Administración, que es lo que toca este change. Ver memoria "Auth email format gap": el gap general queda igual de abierto salvo en esta ruta.
- No se agrega paginación/filtro de "mostrar archivados" en la tabla — los usuarios inactivos ya se listan siempre (atenuados, con badge "Inactivo"); solo se agrega la acción para llegar a ese estado y para revertirlo.

## Decisions

- **Reutilizar `activo` en vez de un nuevo campo `estado`/enum.** A diferencia de Proveedores (que ya tenía `estatus` como string libre) o Empleados (`estado` con `BAJA`), `User.activo` ya es booleano y ya es lo que el login verifica. Introducir un enum paralelo duplicaría la fuente de verdad. Costo: el término "Archivado" en la UI es una etiqueta, no un estado nuevo en BD — se mantiene consistente con el badge "Inactivo" que ya existe en el listado.
- **Validación de formato de email: regla mínima de Zod (`.email()`), no verificación de dominio/MX.** Suficiente para atrapar typos obvios sin agregar una dependencia de verificación externa; consistente con el nivel de validación ya usado en el resto del proyecto (ver `validacion-entrada-zod`).
- **Unicidad de email: capturar `PrismaClientKnownRequestError` con `code: 'P2002'` en el handler del `PATCH`** y responder `409 ADMIN_EMAIL_DUPLICADO` con mensaje claro, en vez de confiar en una verificación previa (`findFirst` + chequeo) que sería una condición de carrera. Se apoya en la restricción `@@unique([tenant_id, email])` ya existente en el schema — no se necesita migración.
- **Un solo endpoint para Archivar y Reactivar** (reutilizar el `PATCH` existente con `{ activo: false }` / `{ activo: true }`), no dos endpoints nuevos tipo `/archivar` + `/activar` como en Proveedores/Empleados. Se decide así porque, a diferencia de esos dos módulos, el `PATCH` de Usuarios ya soporta `activo` como campo parcial y ya se usa así desde el modal de edición — agregar endpoints paralelos duplicaría el camino para el mismo efecto. El frontend simplemente llama `PATCH { activo: false }` / `PATCH { activo: true }` con su propio botón y diálogo de confirmación.
- **Dos `ConfirmCriticalActionDialog` separados** (uno para Archivar, variante `destructive`; uno para Reactivar, variante default) en vez de un solo diálogo genérico, siguiendo el patrón ya usado en `wire-baja-reactivar-empleado` para "Dar de baja"/"Reactivar" empleado.

## Risks / Trade-offs

- [Un admin archiva su propia cuenta y queda sin acceso] → Mitigado en el frontend: el botón "Archivar" se deshabilita cuando `u.id === user?.id` (comparando contra el usuario de sesión de `useTenant()`). El backend no bloquea el caso (sigue siendo posible vía el checkbox "Activo" del modal o llamando al `PATCH` directamente) — se acepta como defensa de UI, no de API, consistente con el resto de validaciones de este endpoint.
- [Cambiar el email de un usuario no invalida sus sesiones/tokens existentes] → No es un riesgo nuevo introducido por este change: ya pasa igual hoy al cambiar `password` vía el modal (no hay invalidación de sesión activa). Queda fuera de alcance.
- [Mensaje de error de duplicado de email expone si un correo ya está registrado en el tenant] → Aceptable: quien edita usuarios ya es `admin` del tenant (ve el listado completo de emails en la misma pantalla), no hay fuga de información nueva.

## Migration Plan

- Sin migración Prisma (reutiliza columnas existentes `email`, `activo`).
- Deploy de un solo servicio (`apps/auth`) + `apps/app-shell`; no requiere coordinación con otros microservicios ni cambios de evento en `bocam.events`.
- Rollback: revertir el commit; no hay estado persistente nuevo que limpiar.
