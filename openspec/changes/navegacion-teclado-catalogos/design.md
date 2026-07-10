## Context

Confirmado en código: los 3 paneles viven en `InsumosView.tsx` y ya usan un
patrón consistente de "id abierto + `.find()` en un array filtrado en
memoria":
- Fichas técnicas: `insumoFichasId` (línea 890) sobre `insumosFiltrados`
  (línea 957).
- Take-off/APU: `conceptoTakeoff: Concepto | null` (línea 760) sobre
  `conceptosFiltrados` (línea 940).
- Saldo de partida: `saldoPanelConcepto: SaldoResumen | null` (línea 704),
  también derivado de la lista de conceptos.

No existe hoy ningún `addEventListener('keydown')` en este archivo. El
patrón de teclado más cercano en el proyecto es `Escape` manejado inline
vía `onKeyDown` en el contenedor (`ComparativaDetail.tsx:1539`), y
`window.addEventListener('keydown', ...)` a nivel global en `Layout.tsx` y
`ResidenciaView.tsx` para cerrar modales/dropdowns.

## Goals / Non-Goals

**Goals:**
- Un hook genérico y reutilizable, no 3 implementaciones copiadas.
- No romper la edición de texto en buscadores/inputs dentro de los paneles.

**Non-Goals:**
- No se implementa wrap-around (de última fila a primera) — se descarta por
  simplicidad; es un detalle de UX menor que se puede agregar después si se
  pide.
- No se extiende a otros catálogos del sistema fuera de los 3 paneles de
  `InsumosView.tsx` mencionados por el usuario — otros módulos quedan fuera
  de este change.

## Decisions

### 1. Hook genérico sobre índice de lista, no sobre IDs específicos por panel
```ts
function useArrowKeyNav<T>(params: {
  enabled: boolean;
  items: T[];
  currentId: string | null;
  getId: (item: T) => string;
  onNavigate: (item: T) => void;
}): void
```
Internamente: `window.addEventListener('keydown', ...)` solo cuando
`enabled` es `true` (panel abierto); en `ArrowUp`/`ArrowDown` calcula el
índice actual en `items` vía `getId`, y llama `onNavigate(items[index-1|+1])`
si existe (clamp en los bordes, sin wrap). Ignora el evento si
`document.activeElement` es `INPUT`, `TEXTAREA` o `SELECT` (preserva edición
de texto en buscadores).
- **Alternativa descartada**: un hook por panel (`useFichasNav`,
  `useTakeoffNav`, etc.). Se descarta por duplicar la misma lógica 3 veces
  sin necesidad — los 3 casos son estructuralmente idénticos (id + lista +
  callback).
- **Alternativa descartada**: `onKeyDown` inline en el contenedor del
  SideSheet en vez de `window.addEventListener`. Se descarta porque el
  contenedor del panel no siempre tiene el foco (el usuario pudo hacer clic
  en cualquier parte de la página desde que se abrió), y requerir foco
  explícito sobre el panel sería una fricción adicional no pedida.

### 2. `saldoPanelConcepto` es `SaldoResumen`, no `Concepto` — mapeo en el call site
El hook opera sobre `items: T[]` genérico; en el panel de saldo, `T` es
`SaldoResumen`, pero la lista navegable sigue siendo la de conceptos
filtrados. El call site en `InsumosView.tsx` es responsable de construir el
`SaldoResumen` correspondiente a cada concepto al navegar (misma lógica que
ya usa el `onClick` que abre el panel hoy), no el hook.

## Risks / Trade-offs

- **[Riesgo]** Si el usuario cambia el filtro/búsqueda mientras el panel
  está abierto, `items` cambia y el índice "actual" podría no encontrarse.
  → **Mitigación**: `getId` siempre re-busca el índice por id en el array
    actual en cada pulsación — si el id ya no está en la lista filtrada
    (ej. el usuario cambió el filtro), el hook simplemente no navega (no
    hay índice base), sin lanzar error.
