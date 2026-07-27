## ADDED Requirements

### Requirement: El indicador de proyecto activo SHALL ser visualmente inconfundible entre proyectos
El sistema SHALL mostrar en todo momento, en el header de `app-shell`, un indicador del
proyecto activo que incluya un color determinístico y estable asociado a ese proyecto (el mismo
proyecto SHALL mostrar siempre el mismo color, en cualquier vista y en cualquier sesión) además
del código/nombre del proyecto en texto. El sistema NO SHALL depender únicamente de texto para
distinguir el proyecto activo.

#### Scenario: Usuario con varios proyectos asignados ve el indicador
- **WHEN** un usuario autenticado con acceso a 2 o más proyectos tiene un proyecto activo
- **THEN** el header muestra el código/nombre del proyecto activo junto con un color asociado a
  ese proyecto, visible sin necesidad de abrir ningún menú o dropdown

#### Scenario: El mismo proyecto muestra siempre el mismo color
- **WHEN** un usuario cambia al Proyecto A, navega a otra vista, y vuelve a activar el Proyecto A
  más tarde (misma sesión o sesión distinta)
- **THEN** el color mostrado para el Proyecto A es idéntico en todos los casos

#### Scenario: Dos proyectos del mismo usuario muestran colores distintos siempre que la paleta lo permita
- **WHEN** un usuario tiene 2 proyectos asignados con IDs distintos
- **THEN** el color derivado para cada proyecto es determinístico por proyecto (no aleatorio en
  cada carga de página)

### Requirement: El cambio de proyecto activo SHALL seguir usando el mecanismo de sesión existente
El sistema SHALL mantener sin cambios el flujo de cambio de proyecto ya implementado
(`setCurrentProjectId` → `switchProjectApi` → reemisión de JWT con el scope del proyecto nuevo).
El indicador visual nuevo es una capa de presentación sobre ese mecanismo, no un reemplazo.

#### Scenario: Cambiar de proyecto sigue emitiendo un JWT con el scope correcto
- **WHEN** un usuario selecciona un proyecto distinto desde el selector del header
- **THEN** el sistema solicita un nuevo access token con el scope del proyecto seleccionado antes
  de actualizar el indicador visual y el estado de la aplicación
