## Why

En `InsumosView.tsx` hay 3 paneles de detalle que se abren sobre un renglón
de un listado (fichas técnicas de un insumo, take-off/APU de un concepto,
saldo de partida de un concepto). Hoy, para revisar el renglón siguiente,
el usuario tiene que cerrar el panel, ubicar la siguiente fila en la tabla
y volver a abrirlo — repetitivo cuando se están revisando muchos renglones
seguidos (ej. auditar specs de insumos uno por uno).

## What Changes

- Se agrega navegación con `ArrowUp`/`ArrowDown` mientras cualquiera de los
  3 paneles de detalle esté abierto: `ArrowDown` avanza al siguiente renglón
  del listado actualmente filtrado, `ArrowUp` retrocede al anterior. La
  navegación respeta el filtro/búsqueda activo en ese momento (navega sobre
  la lista visible, no sobre el catálogo completo sin filtrar).
- En los límites de la lista (primer/último renglón) las flechas no hacen
  nada — no hay wrap-around.
- Si el foco está en un campo de texto dentro del panel (buscador, input),
  las flechas NO se interceptan — se preserva el comportamiento nativo del
  input (mover el cursor), evitando romper la edición de texto.
- Aplica a los 3 paneles ya identificados en `InsumosView.tsx`: fichas
  técnicas de insumo, take-off/composición APU, saldo de partida.

## Capabilities

### New Capabilities
- `navegacion-teclado-catalogos`: hook reutilizable de navegación
  anterior/siguiente por teclado sobre un listado filtrado, aplicado a los
  paneles de detalle de `InsumosView.tsx`.

### Modified Capabilities
(ninguna — no existe spec previo sobre navegación por teclado en catálogos)

## Impact

- **Frontend `apps/app-shell`**: nuevo hook `useArrowKeyNav` (o nombre
  similar) en `src/hooks/`, consumido desde `src/views/InsumosView.tsx` en
  los 3 paneles: fichas técnicas (`insumoFichasId` sobre `insumosFiltrados`),
  take-off (`conceptoTakeoff` sobre `conceptosFiltrados`), saldo de partida
  (`saldoPanelConcepto` sobre la misma lista de conceptos).
- Sin cambios de backend — es un comportamiento puramente de UI sobre datos
  ya cargados en memoria.
