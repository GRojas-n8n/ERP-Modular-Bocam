## 1. Reproducir (TDD)

- [x] 1.1 Reescrito `Layout.sidebar-submenu-flyout.test.tsx`: en escritorio, el panel debe ser hijo directo de `document.body`, no descendiente de `<nav>`. Confirmado en rojo contra el código anterior (4/5 tests fallando — no existía ningún portal).

## 2. Fix

- [x] 2.1 `isDesktop` (estado, vía `window.innerWidth >= 768` + listener `resize`) reemplaza la diferenciación puramente CSS.
- [x] 2.2 `submenuTriggerRefs` (mapa de refs por `item.id`) + `submenuPos` (estado), calculado con `getBoundingClientRect()` cuando `openSubmenuId`/`isDesktop` cambian.
- [x] 2.3 Panel desktop renderizado vía `createPortal(..., document.body)`, `position: fixed`, con las clases de tarjeta (borde/sombra/fondo) que antes eran `md:`-condicionales.
- [x] 2.4 Acordeón mobile separado en su propio bloque, sin cambios de comportamiento (gated por `!isDesktop`, no por `openSubmenuId`).
- [x] 2.5 `renderSubItemButtons()` extraído para no duplicar el markup de cada subItem entre las dos variantes.
- [x] 2.6 Cierre por clic-fuera/Escape/scroll/resize reutilizado del mismo patrón ya usado por el dropdown de proyecto.

## 3. Verificación

- [x] 3.1 Test de 1.1 en verde tras el fix.
- [x] 3.2 `Layout.acceso-proyectos-gt-control-obra.test.tsx` ajustado (viewport forzado a mobile — esos tests cubren navegación cross-grupo, no posicionamiento) y sigue en verde.
- [x] 3.3 Suite completa de `Layout.*.test.tsx` + guard de ayuda contextual sin regresiones (9 archivos / 20 tests).
- [x] 3.4 `tsc -b` limpio.
- [ ] 3.5 Verificación visual manual en escritorio real (Chrome) — pendiente, queda para QA/revisión humana.
