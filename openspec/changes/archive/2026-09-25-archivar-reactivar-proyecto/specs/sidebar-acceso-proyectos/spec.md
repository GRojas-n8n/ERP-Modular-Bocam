## ADDED Requirements

### Requirement: Un proyecto existente SHALL poder archivarse y reactivarse
La pantalla de gestión de Proyectos SHALL mostrar una acción "Archivar" para cada proyecto activo,
y "Reactivar" para cada proyecto archivado, visible solo para los roles que ya pueden editar
proyectos (`admin`, `gerencia_tecnica`, `control_proyectos`). Ambas acciones SHALL requerir
confirmación explícita antes de ejecutarse.

#### Scenario: Archivar un proyecto activo
- **WHEN** un usuario con permiso de edición hace clic en "Archivar" sobre un proyecto activo y
  confirma el diálogo
- **THEN** el sistema envía `PATCH /admin/proyectos/:id` con `{ activo: false }` y refresca el
  listado

#### Scenario: Reactivar un proyecto archivado
- **WHEN** un usuario con permiso de edición hace clic en "Reactivar" sobre un proyecto archivado y
  confirma el diálogo
- **THEN** el sistema envía `PATCH /admin/proyectos/:id` con `{ activo: true }` y refresca el
  listado

#### Scenario: Cancelar el diálogo no ejecuta ningún cambio
- **WHEN** el diálogo de confirmación de archivar/reactivar está abierto
- **AND** el usuario hace clic en "Cancelar"
- **THEN** el sistema NO SHALL enviar ninguna petición al backend
