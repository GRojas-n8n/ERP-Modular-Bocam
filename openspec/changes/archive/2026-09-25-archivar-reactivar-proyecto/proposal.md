## Why

Pedido directo del usuario: en Administración → Proyectos, los proyectos existentes deben poder
archivarse (y reactivarse), igual que ya existe para Usuarios. Hoy solo se pueden editar — no hay
forma de marcar un Centro de Costos como inactivo desde la UI, aunque el campo `activo` ya existe
en el modelo y el backend ya lo acepta en `PATCH /admin/proyectos/:id`.

## What Changes

- Botón "Archivar"/"Reactivar" por fila en la tabla de Proyectos, con el mismo patrón de
  confirmación (`ConfirmCriticalActionDialog`) ya usado para archivar/reactivar Usuarios.
- Gated por el mismo `puedeEditarProyectos` (admin/gerencia_tecnica/control_proyectos) que ya
  protege "Nuevo Proyecto"/"Editar".

## Capabilities

### Modified Capabilities
- `sidebar-acceso-proyectos`: la pantalla de gestión de Proyectos gana la acción de
  archivar/reactivar, disponible para los mismos roles que ya pueden editar.

## Impact

- `apps/app-shell/src/views/AdminView.tsx` únicamente. Sin cambios de backend: `activo` ya era
  aceptado por `actualizarProyectoSchema` (Zod) y por el handler `PATCH /admin/proyectos/:id`.
