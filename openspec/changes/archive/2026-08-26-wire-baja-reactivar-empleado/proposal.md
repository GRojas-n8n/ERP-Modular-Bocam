## Why

El backend de Personal ya tiene `PATCH /api/v1/personal/empleados/:id/baja` (marca `estado: 'BAJA'`), pero el frontend (`PersonalView.tsx`) nunca lo llama — no existe ningún botón "Dar de baja" en la tabla de empleados, así que la funcionalidad es inalcanzable desde la UI. Además, no existe ningún endpoint para revertir una baja: un empleado marcado `BAJA` no tiene forma de volver a `ACTIVO` ni por API ni por UI. Esto se detectó auditando el ciclo de vida de alta/baja/edición de Empleados, Usuarios y Proveedores — Usuarios (Auth) y Proveedores (Compras, tras `archivar-proveedores`) ya tienen su ciclo completo; Empleados es el único con este hueco.

## What Changes

- Agregar `PATCH /api/v1/personal/empleados/:id/reactivar`, simétrico a `/baja`: `estado: 'ACTIVO'`, `fecha_baja: null`.
- Conectar el botón "Dar de baja" en la tabla de Empleados (`PersonalView.tsx`) para empleados con `estado: 'ACTIVO'`, con confirmación crítica (`ConfirmCriticalActionDialog`, variante destructiva) — mismo patrón ya usado para "Revocar credencial".
- Conectar el botón "Reactivar" para empleados con `estado: 'BAJA'`, con confirmación (no destructiva).
- Ninguna de las dos acciones borra ni altera el historial del empleado (asignaciones, documentos, credencial, nómina) — solo cambia `estado`/`fecha_baja`, igual que el endpoint `/baja` ya existente.

## Capabilities

### New Capabilities
- `baja-reactivar-empleado`: define el ciclo `ACTIVO ⇄ BAJA` de un Empleado, los dos endpoints que lo controlan, y su exposición en la UI de Personal.

### Modified Capabilities
(ninguno — los endpoints de alta/edición de empleado no cambian)

## Impact

- `apps/personal/src/main.ts`: nuevo endpoint `PATCH /empleados/:id/reactivar` (junto al `/baja` existente, línea ~381).
- `apps/app-shell/src/views/PersonalView.tsx`: botones "Dar de baja"/"Reactivar" en la columna Config. de la tabla de empleados, dos nuevos `ConfirmCriticalActionDialog`, dos handlers (`handleDarDeBaja`, `handleReactivarEmpleado`).
- Sin migración Prisma — reutiliza la columna `estado`/`fecha_baja` ya existente.
