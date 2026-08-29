## Why

Reportado en producción probando `sidebar-submenu-flyout-lateral` (PR #136): en escritorio, el
submenú de un módulo activo (ej. Gerencia Técnica) quedaba recortado dentro del ancho de la
columna del sidebar en vez de flotar sobre el contenido de la pantalla, aunque estaba posicionado
con `position: absolute; left: 100%`. Causa: `<nav>` tiene `overflow-y-auto` y el `<aside>`
desktop tiene `overflow-hidden` — cualquier descendiente posicionado que se extienda más allá de
esos límites se recorta visualmente, sin importar que use `position: absolute`.

## What Changes

- El panel de submenú en escritorio se renderiza vía `createPortal(..., document.body)`, con
  `position: fixed` y coordenadas calculadas desde `getBoundingClientRect()` del botón trigger —
  mismo patrón ya usado para el dropdown de proyecto (`fix-dropdown-proyecto-transparente`).
- La diferenciación mobile/escritorio deja de ser puramente CSS (`md:hidden` condicional) y pasa a
  ser una decisión de render en JS (`isDesktop`, derivado de `window.innerWidth >= 768` con listener
  de `resize`), porque el portal necesita saber si debe existir en absoluto, no solo si debe verse.
- El acordeón mobile se separa en su propio bloque de render (sin cambios de comportamiento ni
  estilos), completamente independiente del portal.

## Capabilities

### Modified Capabilities
- `sidebar-submenu-flyout`: el panel flotante deja de depender de que ningún ancestro tenga
  `overflow` distinto de `visible`.

## Impact

- `apps/app-shell/src/components/Layout.tsx` únicamente.
- Se reescribió `Layout.sidebar-submenu-flyout.test.tsx` (las aserciones anteriores sobre clases
  `md:absolute`/`md:hidden` ya no aplican) y se ajustó `Layout.acceso-proyectos-gt-control-obra.test.tsx`
  para forzar viewport mobile (esos tests cubren navegación cross-grupo, no posicionamiento).
