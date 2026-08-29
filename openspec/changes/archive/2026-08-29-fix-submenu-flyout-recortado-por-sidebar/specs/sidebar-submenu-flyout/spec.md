## ADDED Requirements

### Requirement: El panel flotante SHALL flotar sobre todo el contenido de la pantalla, sin recortarse
El panel de submenú en escritorio SHALL renderizarse fuera del árbol de cualquier ancestro con
`overflow` distinto de `visible` (el `<nav>` del sidebar, el `<aside>` que lo contiene), de modo
que se vea completo sin importar el ancho o alto disponible dentro del sidebar.

#### Scenario: El panel no es descendiente de un contenedor con overflow
- **WHEN** un usuario en escritorio abre un módulo con subItems
- **THEN** el panel de submenú no es descendiente del `<nav>` ni del `<aside>` del sidebar en el
  árbol DOM real

#### Scenario: El acordeón mobile no cambia
- **WHEN** un usuario en un viewport angosto (menor a 768px) abre un módulo con subItems
- **THEN** el submenú se muestra como acordeón vertical dentro del propio sidebar, igual que antes
  de este fix
