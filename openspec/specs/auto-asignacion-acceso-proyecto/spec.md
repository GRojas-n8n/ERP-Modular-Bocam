# auto-asignacion-acceso-proyecto Specification

## Purpose
TBD - created by archiving change fix-auto-asignacion-acceso-proyecto-gt. Update Purpose after archive.
## Requirements
### Requirement: Auto-asignación de acceso a proyecto nuevo por rol
Al crear un proyecto/centro de costos nuevo, el sistema SHALL auto-asignar
acceso (`UserProjectAccess`) a todo usuario activo del tenant cuyo rol global
esté en la lista de roles con acceso automático: `admin`, `superintendent`,
`gerencia_tecnica`. Usuarios con otros roles NO SHALL recibir acceso
automático — requieren asignación manual.

#### Scenario: Usuario con rol gerencia_tecnica al crearse un proyecto nuevo
- **WHEN** un admin crea un proyecto nuevo en un tenant que tiene un usuario
  activo con rol `gerencia_tecnica`
- **THEN** ese usuario recibe una fila en `UserProjectAccess` para el proyecto
  nuevo, sin necesidad de asignación manual

#### Scenario: Usuario con rol admin o superintendent al crearse un proyecto nuevo
- **WHEN** un admin crea un proyecto nuevo en un tenant que tiene usuarios
  activos con rol `admin` o `superintendent`
- **THEN** esos usuarios reciben acceso automático al proyecto nuevo (comportamiento
  ya existente, no debe romperse)

#### Scenario: Usuario con un rol fuera de la lista blanca
- **WHEN** un admin crea un proyecto nuevo en un tenant que tiene un usuario
  activo con un rol distinto a `admin`, `superintendent` o `gerencia_tecnica`
  (ej. `compras`, `residente`)
- **THEN** ese usuario NO recibe acceso automático — sigue requiriendo
  asignación manual vía el editor de usuario

#### Scenario: Usuario inactivo con rol elegible
- **WHEN** un admin crea un proyecto nuevo en un tenant que tiene un usuario
  con rol `gerencia_tecnica` marcado como inactivo (`activo: false`)
- **THEN** ese usuario NO recibe acceso automático

