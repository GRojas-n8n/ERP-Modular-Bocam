# indicador-proyecto-activo Specification

## Purpose
TBD - created by archiving change mostrar-nombre-proyecto-header. Update Purpose after archive.

## Requirements

### Requirement: El indicador de proyecto activo SHALL mostrar el nombre del proyecto en todo momento
El sistema SHALL mostrar en todo momento, en el header de `app-shell`, un indicador del
proyecto activo que incluya un color determinístico y estable asociado a ese proyecto (el mismo
proyecto SHALL mostrar siempre el mismo color, en cualquier vista y en cualquier sesión) además
del **nombre completo** del proyecto en texto, visible sin necesidad de abrir el dropdown de
selección. El sistema PUEDE mostrar adicionalmente el código corto del proyecto como referencia
secundaria, pero NO SHALL mostrar únicamente el código como único identificador textual del
indicador colapsado. El indicador SHALL poder extenderse hasta ocupar todo el espacio horizontal
disponible en el header, hasta el límite del grupo de íconos (tema/settings) del lado derecho —
sin un ancho máximo fijo arbitrario menor al espacio real disponible.

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

#### Scenario: El indicador se extiende hasta el grupo de íconos de la derecha en pantallas grandes
- **WHEN** un usuario ve el header en una pantalla `lg` o más ancha, sin otros elementos
  compitiendo por espacio del lado del indicador
- **THEN** el botón del selector de proyecto crece hasta casi tocar el grupo de íconos de
  tema/settings del lado derecho, sin un tope de ancho fijo arbitrario que lo detenga antes de
  ese límite

### Requirement: El cambio de proyecto activo SHALL seguir usando el mecanismo de sesión existente
El sistema SHALL mantener sin cambios el flujo de cambio de proyecto ya implementado
(`setCurrentProjectId` → `switchProjectApi` → reemisión de JWT con el scope del proyecto nuevo).
El indicador visual es una capa de presentación sobre ese mecanismo, no un reemplazo.

#### Scenario: Cambiar de proyecto sigue emitiendo un JWT con el scope correcto
- **WHEN** un usuario selecciona un proyecto distinto desde el selector del header
- **THEN** el sistema solicita un nuevo access token con el scope del proyecto seleccionado antes
  de actualizar el indicador visual y el estado de la aplicación

### Requirement: El panel desplegable del selector de proyecto SHALL renderizarse siempre con fondo opaco
El sistema SHALL renderizar el panel de opciones del selector de proyecto (desplegable del
indicador de proyecto activo) con un fondo 100% opaco y sólido, sin transparencia ni recomposición
visual heredada de elementos ancestros con efectos de `backdrop-filter` u opacidad reducida (como
el header con la clase `glass-elevated`). El panel NO SHALL mostrarse transparente ni superpuesto
de forma que el contenido de la pantalla detrás sea visible a través de él, en ninguna vista de la
aplicación, incluyendo la primera pantalla que se muestra tras iniciar sesión o tras cambiar de
proyecto activo.

#### Scenario: El dropdown se abre en la pantalla inicial post-login con fondo opaco
- **WHEN** un usuario recién autenticado abre el selector de proyecto en la primera pantalla que
  carga (Dashboard)
- **THEN** el panel de opciones se muestra con fondo sólido y opaco, sin que el contenido de la
  pantalla detrás sea visible a través de él

#### Scenario: El dropdown se abre tras cambiar de proyecto con fondo opaco
- **WHEN** un usuario cambia de proyecto activo y vuelve a abrir el selector de proyecto
- **THEN** el panel de opciones se muestra con fondo sólido y opaco, consistente con el
  comportamiento esperado en cualquier otra pantalla

#### Scenario: El dropdown no hereda la transparencia del header contenedor
- **WHEN** el selector de proyecto se abre dentro de un header con efecto visual de
  `backdrop-filter` (clase `glass-elevated`)
- **THEN** el panel de opciones no recompone ni hereda visualmente el blur/transparencia de ese
  header, independientemente de si el panel se extiende más allá del borde del header

### Requirement: El indicador de proyecto activo SHALL tener énfasis visual suficiente para ser fácilmente localizable
El sistema SHALL aplicar al botón selector de proyecto activo, en el header de `app-shell`, un
tratamiento visual de énfasis (ej. resplandor/`glow`, mayor contraste respecto al fondo del header)
adicional al color determinístico y nombre ya requeridos por este spec, de modo que un usuario
pueda localizarlo de un vistazo sin tener que buscarlo entre el resto de los controles del header.
El énfasis visual SHALL ser perceptible tanto en tema claro como en tema oscuro.

#### Scenario: El selector de proyecto se distingue del resto del header
- **WHEN** un usuario autenticado ve cualquier vista de la aplicación
- **THEN** el botón selector de proyecto activo se percibe visualmente más prominente que los
  demás controles del header (ej. mediante resplandor o mayor contraste), sin necesidad de hacer
  hover o abrir el dropdown

#### Scenario: El énfasis visual es legible en ambos temas
- **WHEN** un usuario cambia entre tema claro y tema oscuro
- **THEN** el tratamiento de énfasis del selector de proyecto permanece perceptible y legible en
  ambos temas
