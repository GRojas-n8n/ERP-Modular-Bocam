## ADDED Requirements

### Requirement: Submenú del sidebar se despliega como panel lateral en escritorio
En el sidebar de escritorio (breakpoint `md:` y superior), al activar un módulo con subItems, el sistema SHALL desplegar el submenú como un panel flotante lateral posicionado a la derecha del botón del módulo, sin desplazar verticalmente al resto de los ítems del menú.

#### Scenario: Activar un módulo con subItems en escritorio
- **WHEN** un usuario en una pantalla `md:` o más ancha hace click en un módulo del sidebar que tiene subItems (ej. "Gerencia Técnica")
- **THEN** el submenú aparece como panel flotante a la derecha del botón, y los demás módulos del sidebar permanecen en su posición vertical original

### Requirement: El submenú lateral se cierra por click-fuera o Escape
El panel de submenú lateral SHALL cerrarse cuando el usuario hace click fuera de él o presiona la tecla Escape, siguiendo el mismo comportamiento ya implementado para el dropdown de selección de proyecto.

#### Scenario: Cerrar el submenú haciendo click fuera
- **WHEN** el submenú lateral de un módulo está abierto y el usuario hace click en cualquier punto fuera del panel
- **THEN** el submenú se cierra

#### Scenario: Cerrar el submenú con Escape
- **WHEN** el submenú lateral está abierto y el usuario presiona la tecla Escape
- **THEN** el submenú se cierra

### Requirement: El sidebar mobile mantiene el acordeón vertical
Dentro del drawer de navegación mobile, el submenú de un módulo activo SHALL seguir desplegándose como acordeón vertical debajo del botón del módulo, sin usar el panel lateral flotante.

#### Scenario: Activar un módulo con subItems en el drawer mobile
- **WHEN** un usuario con el sidebar mobile abierto (`isMobileNavOpen`) hace click en un módulo con subItems
- **THEN** el submenú se expande verticalmente debajo del botón, dentro del mismo drawer, sin desbordar su ancho
