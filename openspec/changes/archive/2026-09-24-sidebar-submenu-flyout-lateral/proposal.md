## Why

Hoy, al seleccionar un módulo con subItems en el sidebar, el submenú se expande hacia abajo dentro de la misma columna angosta (`w-60`), empujando visualmente los demás módulos del menú y obligando a hacer scroll para ver el resto de la navegación cuando el módulo activo tiene varios subItems. El usuario pidió que el submenú se abra hacia un costado (flyout lateral) en vez de hacia abajo, para no desplazar el resto del menú.

## What Changes

- En el sidebar de escritorio (`apps/app-shell/src/components/Layout.tsx`, dentro de `renderSidebarContent`), el bloque de subItems de un módulo activo deja de renderizarse como acordeón vertical (`relative mt-0.5 mb-1 ml-4`, debajo del botón) y pasa a renderizarse como panel flotante lateral (`absolute left-full top-0`, a la derecha del botón del módulo), reutilizando el patrón de cierre por click-fuera y tecla Escape ya existente para el dropdown de proyecto (líneas ~234-242).
- El trigger del flyout sigue siendo click sobre el botón del módulo (igual que hoy), no hover — para no complicar la interacción en touch/mobile ni introducir un delay de apertura/cierre.
- En el sidebar mobile (overlay `isMobileNavOpen`, ancho `w-72 max-w-[85vw]`), el submenú **mantiene el comportamiento actual de acordeón vertical** — un flyout lateral no cabe en un drawer angosto de pantalla completa. `renderSidebarContent()` es compartido entre desktop y mobile hoy; esta lógica debe diferenciar el modo de despliegue según el contexto (breakpoint `md:`).
- **BREAKING**: ninguno — es un cambio puramente visual/interactivo, no cambia rutas ni IDs de navegación.

## Capabilities

### New Capabilities
- `sidebar-submenu-flyout`: define que el submenú de un módulo del sidebar se despliega como panel lateral flotante en escritorio (`md:` y superior), y como acordeón vertical en el drawer mobile, con cierre por click-fuera/Escape.

### Modified Capabilities
(ninguna — no existe spec previo de navegación del sidebar en `openspec/specs/`)

## Impact

- Frontend: `apps/app-shell/src/components/Layout.tsx` (bloque de subItems ~líneas 396-431, y el hook de cierre por click-fuera ~líneas 234-242, generalizado o replicado para el nuevo estado de flyout abierto/cerrado).
- Sin impacto backend.
- Afecta a todos los módulos con subItems (Administración, Gerencia Técnica, Control de Obra, y los que se agreguen en el futuro).
