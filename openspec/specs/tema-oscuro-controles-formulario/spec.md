# tema-oscuro-controles-formulario Specification

## Purpose
TBD - created by archiving change fix-selects-ilegibles-modo-oscuro. Update Purpose after archive.
## Requirements
### Requirement: Todo control de formulario nativo SHALL ser legible en modo oscuro
El sistema SHALL declarar `color-scheme` acorde al tema activo
(`light` por defecto, `dark` bajo `[data-theme="dark"]`), de forma que
cualquier control de formulario nativo del navegador (`<select>`,
scrollbars, checkboxes/radios sin estilo custom) se dibuje con la paleta
correcta sin depender de que cada instancia declare sus propios colores.

#### Scenario: Un `<select>` nativo en modo oscuro se ve con fondo oscuro y texto claro
- **WHEN** un usuario con el tema oscuro activo abre cualquier vista que
  contenga un `<select>` nativo
- **THEN** el control cerrado se muestra con fondo oscuro y texto claro,
  legible, sin importar en qué módulo o vista se encuentre

#### Scenario: El popup de opciones de un `<select>` en modo oscuro es legible
- **WHEN** un usuario con el tema oscuro activo abre el popup de opciones
  de un `<select>` nativo
- **THEN** cada fila del popup se muestra con fondo oscuro y texto claro,
  legible, incluso si el motor del navegador no propaga `color-scheme`
  heredado al popup de forma confiable

### Requirement: Todo `<select>` nativo del proyecto SHALL declarar su propio fondo y color de texto
Ningún `<select>` nativo SHALL depender únicamente del theming de
plataforma (`color-scheme`) para verse correctamente — SHALL declarar
explícitamente una clase de fondo (equivalente a `bg-muted/30` o
similar) y `text-foreground`, igual que el resto de selects del
proyecto, como defensa adicional ante inconsistencias de theming nativo
entre navegadores.

#### Scenario: Un `<select>` nuevo se agrega al proyecto
- **WHEN** un desarrollador agrega un `<select>` nativo a cualquier vista
- **THEN** el `<select>` incluye una clase de fondo propia y
  `text-foreground` en su `className`, no solo `border`

