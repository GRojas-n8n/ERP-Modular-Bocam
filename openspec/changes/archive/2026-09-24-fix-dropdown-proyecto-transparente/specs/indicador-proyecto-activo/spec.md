## ADDED Requirements

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
