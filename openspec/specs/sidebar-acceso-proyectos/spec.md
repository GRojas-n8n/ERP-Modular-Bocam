# sidebar-acceso-proyectos Specification

## Purpose
Define el acceso a la gestión de Proyectos desde Administración para roles distintos de admin: carga independiente de Usuarios y archivado/reactivación de proyectos con confirmación.
## Requirements
### Requirement: La carga de Proyectos SHALL ser independiente de la carga de Usuarios
La pantalla de gestión de Proyectos SHALL mostrar el listado de proyectos aunque la petición de
Usuarios falle (por ejemplo, con 403 para un rol sin acceso a `/admin/users`). El sistema SHALL
mostrar el error genérico de carga únicamente cuando tanto la petición de Usuarios como la de
Proyectos fallen.

#### Scenario: Rol gerencia_tecnica ve Proyectos aunque no tenga acceso a Usuarios
- **WHEN** un usuario con rol `gerencia_tecnica` (sin rol `admin`) abre la pantalla de Proyectos
- **AND** la petición a `/admin/users` responde 403 por falta de rol `admin`
- **THEN** el listado de Proyectos se muestra normalmente, sin ningún mensaje de error

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
