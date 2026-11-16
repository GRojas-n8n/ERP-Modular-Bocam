## ADDED Requirements

### Requirement: Acceso a Proyectos desde Gerencia Técnica
El sidebar SHALL mostrar un subItem "Proyectos" dentro del grupo de menú "Gerencia Técnica" para los roles que ya tienen acceso a Proyectos (`admin`, `gerencia_tecnica`, `control_proyectos`). Al seleccionarlo, el sistema SHALL navegar a la misma pantalla de gestión de Proyectos que usa el subItem "Proyectos" de Administración, sin duplicar datos ni llamar a un endpoint distinto.

#### Scenario: Usuario de Gerencia Técnica navega a Proyectos desde su propio menú
- **WHEN** un usuario con rol `gerencia_tecnica` hace click en el subItem "Proyectos" dentro del grupo "Gerencia Técnica"
- **THEN** el sistema muestra la pantalla de gestión de Proyectos con el mismo listado y acciones disponibles que al entrar desde Administración

### Requirement: Acceso a Proyectos desde Control de Obra
El sidebar SHALL mostrar un subItem "Proyectos" dentro del grupo de menú "Control de Obra" para los roles `admin`, `control_obra`, `control_proyectos` y `director`. Al seleccionarlo, el sistema SHALL navegar a la misma pantalla de gestión de Proyectos.

#### Scenario: Usuario de Control de Obra navega a Proyectos desde su propio menú
- **WHEN** un usuario con rol `control_obra` hace click en el subItem "Proyectos" dentro del grupo "Control de Obra"
- **THEN** el sistema muestra la pantalla de gestión de Proyectos

### Requirement: Rol control_obra visible en Proyectos de Administración
El subItem "Proyectos" del grupo "Administración" SHALL incluir `control_obra` en sus roles permitidos, de modo que ese rol tenga acceso a Proyectos también desde Administración, no solo desde Control de Obra.

#### Scenario: Usuario con rol control_obra ve Proyectos en Administración
- **WHEN** un usuario con rol `control_obra` (y sin otros roles adicionales) abre el menú "Administración"
- **THEN** el subItem "Proyectos" es visible y navegable

### Requirement: Navegación cross-grupo mantiene estado de sidebar consistente
Cuando el usuario navega a Proyectos desde un subItem fuera del grupo "Administración" (Gerencia Técnica o Control de Obra), el sidebar SHALL reflejar un único estado de "sección activa" consistente, sin marcar dos grupos como activos simultáneamente.

#### Scenario: Solo un grupo queda marcado como activo tras navegar desde Control de Obra
- **WHEN** un usuario hace click en "Proyectos" dentro del grupo "Control de Obra"
- **THEN** el sidebar no muestra simultáneamente "Control de Obra" y "Administración" como grupos activos
