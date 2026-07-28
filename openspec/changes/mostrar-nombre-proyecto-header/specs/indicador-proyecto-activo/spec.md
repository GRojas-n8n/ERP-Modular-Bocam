## ADDED Requirements

### Requirement: El indicador de proyecto activo SHALL mostrar el nombre del proyecto en todo momento
El sistema SHALL mostrar en todo momento, en el header de `app-shell`, un indicador del
proyecto activo que incluya un color determinístico y estable asociado a ese proyecto (el mismo
proyecto SHALL mostrar siempre el mismo color, en cualquier vista y en cualquier sesión) además
del **nombre completo** del proyecto en texto, visible sin necesidad de abrir el dropdown de
selección. El sistema PUEDE mostrar adicionalmente el código corto del proyecto como referencia
secundaria, pero NO SHALL mostrar únicamente el código como único identificador textual del
indicador colapsado.

#### Scenario: Usuario con varios proyectos asignados ve el nombre del proyecto activo
- **WHEN** un usuario autenticado con acceso a 2 o más proyectos tiene un proyecto activo
- **THEN** el header muestra el nombre completo del proyecto activo junto con un color asociado a
  ese proyecto, visible sin necesidad de abrir ningún menú o dropdown

#### Scenario: El mismo proyecto muestra siempre el mismo color
- **WHEN** un usuario cambia al Proyecto A, navega a otra vista, y vuelve a activar el Proyecto A
  más tarde (misma sesión o sesión distinta)
- **THEN** el color mostrado para el Proyecto A es idéntico en todos los casos

#### Scenario: Dos proyectos del mismo usuario muestran colores distintos siempre que la paleta lo permita
- **WHEN** un usuario tiene 2 proyectos asignados con IDs distintos
- **THEN** el color derivado para cada proyecto es determinístico por proyecto (no aleatorio en
  cada carga de página)

#### Scenario: Nombre de proyecto largo se trunca sin ocultar el indicador
- **WHEN** el nombre del proyecto activo es demasiado largo para el ancho disponible del header
- **THEN** el texto se trunca visualmente (p. ej. con ellipsis) pero el indicador de color y el
  nombre truncado siguen siendo visibles, sin desaparecer ni desbordar el layout del header

### Requirement: El cambio de proyecto activo SHALL seguir usando el mecanismo de sesión existente
El sistema SHALL mantener sin cambios el flujo de cambio de proyecto ya implementado
(`setCurrentProjectId` → `switchProjectApi` → reemisión de JWT con el scope del proyecto nuevo).
El indicador visual es una capa de presentación sobre ese mecanismo, no un reemplazo.

#### Scenario: Cambiar de proyecto sigue emitiendo un JWT con el scope correcto
- **WHEN** un usuario selecciona un proyecto distinto desde el selector del header
- **THEN** el sistema solicita un nuevo access token con el scope del proyecto seleccionado antes
  de actualizar el indicador visual y el estado de la aplicación
