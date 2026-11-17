## ADDED Requirements

### Requirement: La carga de Proyectos SHALL ser independiente de la carga de Usuarios
La pantalla de gestión de Proyectos SHALL mostrar el listado de proyectos aunque la petición de
Usuarios falle (por ejemplo, con 403 para un rol sin acceso a `/admin/users`). El sistema SHALL
mostrar el error genérico de carga únicamente cuando tanto la petición de Usuarios como la de
Proyectos fallen.

#### Scenario: Rol gerencia_tecnica ve Proyectos aunque no tenga acceso a Usuarios
- **WHEN** un usuario con rol `gerencia_tecnica` (sin rol `admin`) abre la pantalla de Proyectos
- **AND** la petición a `/admin/users` responde 403 por falta de rol `admin`
- **THEN** el listado de Proyectos se muestra normalmente, sin ningún mensaje de error
