## Context

El selector hoy es una lista de `<button>` renderizada a partir de `conceptosAvance` filtrado por `avanceConceptoSearch` (`ControlObraView.tsx:1474-1530`). No hay concepto de "opción resaltada" — cada botón se selecciona con `onClick`. `useArrowKeyNav` (de `navegacion-teclado-catalogos`) requiere un `currentId` ya no-nulo para navegar (ver `apps/app-shell/src/hooks/useArrowKeyNav.ts:17-31`, `if (currentCurrentId === null) return;`), por lo que no aplica directamente a este caso: aquí todavía no hay ninguna selección cuando el usuario empieza a navegar con flechas.

## Goals / Non-Goals

**Goals:**
- El usuario puede resaltar y confirmar un concepto sin tocar el mouse, una vez que el campo de búsqueda tiene el foco o la lista está visible.
- El usuario ve sus conceptos recientes de la sesión de captura al abrir el panel, sin re-buscar.

**Non-Goals:**
- No se persiste la lista de recientes entre recargas de página ni entre proyectos — es un atajo de sesión, no una preferencia de usuario guardada.
- No se modifica `useArrowKeyNav` ni su contrato — se mantiene exclusivo para navegación de detalle ya abierto (fichas, take-off, saldo de partida).
- No se aplica este mismo patrón a otros selectores del módulo en este cambio (por ejemplo el selector de frente de trabajo en Bitácora) — si se valida que aporta valor ahí también, se propone como cambio aparte.

## Decisions

- **Estado de índice resaltado local al selector:** un `useState<number>` (`highlightedIndex`) sobre la lista `filtrados` ya calculada. `ArrowDown`/`ArrowUp` mueven el índice sin wrap-around (se detiene en los extremos, igual que el patrón ya establecido en `navegacion-teclado-catalogos` para consistencia de comportamiento, aunque la implementación es independiente). `Enter` selecciona `filtrados[highlightedIndex]` si existe. El índice se reinicia a `0` cada vez que cambia el texto de búsqueda o la lista de "recientes" se muestra/oculta.
- **Recientes como estado de sesión del panel:** un `useState<ConceptoAvance[]>` (`conceptosRecientes`, máx. 5, más reciente primero) que se actualiza cada vez que se confirma un avance (se agrega el concepto usado al frente, sin duplicados). Se reinicia junto con el resto del formulario solo al cerrar el panel explícitamente (consistente con el cambio `captura-continua-avances-bitacora`, que mantiene el panel abierto entre capturas — los recientes tienen sentido precisamente en ese flujo de varias capturas seguidas).
- **Recientes se muestran solo con búsqueda vacía:** en cuanto el usuario escribe algo, la lista vuelve a ser el filtrado normal por texto — evita ambigüedad entre "esto es reciente" y "esto coincide con mi búsqueda".

## Risks / Trade-offs

- [Riesgo] Confundir al usuario si la lista de recientes y la lista filtrada se ven visualmente idénticas → Mitigación: la lista de recientes lleva un encabezado breve ("Recientes") que la distingue de la lista completa.
- [Trade-off] Este cambio depende de que el panel permanezca abierto entre capturas (`captura-continua-avances-bitacora`) para que "recientes" tenga utilidad real dentro de una sesión; si ese cambio no se implementa primero, "recientes" sigue funcionando pero con menos valor práctico (el panel se cerraría y perdería el estado de recientes en cada guardado).
