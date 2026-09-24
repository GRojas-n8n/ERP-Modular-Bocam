## ADDED Requirements

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
