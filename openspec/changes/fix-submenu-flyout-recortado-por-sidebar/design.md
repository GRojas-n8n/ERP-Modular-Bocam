## Context

El primer intento de `sidebar-submenu-flyout-lateral` posicionaba el panel con clases Tailwind
puras (`md:absolute md:left-full`), asumiendo que `position: absolute` es suficiente para "salir"
del flujo visual del sidebar. No lo es: el `<nav>` (`overflow-y-auto`) y el `<aside>` desktop
(`overflow-hidden`) recortan a CUALQUIER descendiente que se pinte fuera de su caja, sin importar
su `position`. Es el mismo problema de fondo que ya se había resuelto para el dropdown de proyecto
en `fix-dropdown-proyecto-transparente`, con una causa distinta (`backdrop-filter` del header en
vez de `overflow` del sidebar) pero la misma solución.

## Decisions

- **Portal a `document.body` + `position: fixed`**, reutilizando exactamente el patrón ya
  establecido por el dropdown de proyecto. Se descarta intentar "arreglar" el `overflow` de `<nav>`
  o `<aside>` (quitarles `overflow-hidden`/`overflow-y-auto` rompería el scroll del propio sidebar
  cuando tiene muchos módulos).
- **`isDesktop` vía `window.innerWidth` + listener de `resize`, no `matchMedia`**: jsdom no
  implementa `window.matchMedia` (lanzaría en cada test que monte `Layout`), y el proyecto no tenía
  ningún polyfill global para eso. `window.innerWidth` sí existe en jsdom (default de entorno,
  ajustable en tests con `Object.defineProperty`), así que evita tener que tocar la configuración
  compartida de tests para un fix acotado a un componente.
- **El acordeón mobile y el portal desktop son dos bloques de JSX separados** (antes eran uno solo
  con clases condicionales) — se acepta la pequeña duplicación de "dónde" se renderiza
  `renderSubItemButtons(...)` a cambio de que cada uno sea simple de razonar por separado.

## Risks / Trade-offs

- [Riesgo] Un resize que cruce el breakpoint de 768px mientras el panel está abierto podría dejar
  una posición desactualizada por un instante → Mitigación: el mismo listener de `resize` que ya
  cierra el panel (heredado del dropdown de proyecto) lo cierra también en este caso, evitando un
  panel mal posicionado en vez de intentar reposicionarlo en vivo.

## Migration Plan

Cambio de frontend puro, un solo archivo (más sus dos tests asociados). Sin backend, sin
migración de datos.
