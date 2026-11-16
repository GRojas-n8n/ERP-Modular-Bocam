## Context

El selector de proyecto vive en `apps/app-shell/src/components/Layout.tsx`. El botón trigger está
dentro del `<header>`, y ese header tiene la clase utilitaria `.glass-elevated`
(`apps/app-shell/src/index.css:176-181`), que aplica `backdrop-filter: blur(24px)` más un fondo
blanco semitransparente (~78% opacidad) para el efecto "glass" del diseño.

El panel de opciones del dropdown (`Layout.tsx:574-616`) se renderiza hoy como hijo directo del
mismo subárbol del header, posicionado con `top-full` (no usa portal). Aunque el panel declara su
propio `background: hsl(var(--card))` sólido, al extenderse visualmente más allá del borde
inferior del header, Chromium recompone esa porción con la capa de `backdrop-filter` del ancestro,
produciendo transparencia y superposición con el contenido de `<main>` detrás. El efecto es más
notorio en la primera pantalla post-login (Dashboard), que tiene contenido denso justo debajo del
header.

## Goals / Non-Goals

**Goals:**
- El panel del dropdown de proyecto se ve siempre con fondo 100% opaco, sin importar la pantalla o
  el contenido detrás.
- No se modifica el efecto visual `.glass-elevated` del header en sí (sigue aplicando al header).
- El fix no cambia el comportamiento funcional del cambio de proyecto (sigue usando
  `setCurrentProjectId` → `switchProjectApi`, ver spec `indicador-proyecto-activo`).

**Non-Goals:**
- No se rediseña el contenido ni la interacción del dropdown (orden de proyectos, búsqueda, etc.).
- No se resuelve aquí el punto de "resaltar el selector" (change separado
  `resaltar-selector-proyecto`) ni el del submenú lateral (change separado
  `submenu-sidebar-flyout`), aunque comparten el mismo archivo.

## Decisions

**Decisión: renderizar el panel vía `createPortal(document.body)` en vez de aislar la capa
in-place.**

Alternativas consideradas:
1. **Portal a `document.body`** (elegida) — saca completamente el panel del árbol de composición
   del header; se posiciona con `getBoundingClientRect()` del botón trigger + `position: fixed`.
   Ventaja: elimina de raíz cualquier herencia de `backdrop-filter`/stacking context del ancestro,
   y es el patrón estándar para overlays en este tipo de UI. Requiere manejar reposicionamiento en
   scroll/resize y el cierre por click-fuera (ya existe lógica similar en `Layout.tsx:234-242` que
   se puede reutilizar/adaptar).
2. **Aislar la capa in-place** (`isolation: isolate` + `backdrop-filter: none` forzado + z-index
   alto) — más simple de implementar (sin portal, sin recalcular posición), pero es un parche más
   frágil: no hay garantía de que futuros cambios de estilo del header no vuelvan a filtrar por
   otra propiedad de composición, y el panel sigue limitado por el `overflow`/tamaño del header si
   este lo recorta.
3. Se descarta usar una librería de portales/popover (Radix Popover, Headless UI) para no
   introducir una nueva dependencia solo para este fix puntual — el proyecto no usa hoy ninguna
   librería de menús (todo es React state + Tailwind a mano, según el propio `Layout.tsx`).

## Risks / Trade-offs

- [Riesgo] El portal requiere recalcular posición en scroll/resize de la ventana → Mitigación:
  usar el mismo patrón de `useEffect` + listener de resize/scroll ya usado en otros overlays del
  proyecto, o cerrar el dropdown en scroll si el reposicionamiento no es trivial.
- [Riesgo] Cambiar a portal puede afectar tests E2E/Playwright existentes que localicen el dropdown
  por su posición en el DOM (dentro del header) → Mitigación: verificar `apps/app-shell/test` y
  `playwright.config.ts` por selectores que asuman el DOM actual antes de mergear.
- [Trade-off] El portal es más código que la opción de aislar la capa in-place, pero es la
  solución más robusta a largo plazo — se acepta el costo adicional dado que este mismo patrón de
  header con `glass-elevated` puede repetirse en otros dropdowns futuros.

## Migration Plan

1. Escribir test que reproduzca el bug (estilo computado transparente o superposición visual del
   panel) — debe fallar contra el código actual.
2. Implementar el portal y el posicionamiento del panel.
3. Verificar visualmente en Chrome (vía `claude-in-chrome` o el flujo de `run` del proyecto) en la
   pantalla de Dashboard tras login y tras cambio de proyecto.
4. Verificar que el cierre por click-fuera y la navegación por teclado (si existe) sigan
   funcionando igual que antes.
5. Sin plan de rollback especial — es un cambio de frontend acotado a un componente, revertible
   con un revert de PR normal.

## Open Questions

- Ninguna bloqueante. Queda a criterio de implementación si el reposicionamiento en scroll cierra
  el dropdown o lo sigue (se recomienda cerrarlo, es el patrón más simple y común en este tipo de
  UI).
