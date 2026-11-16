## Why

El selector de concepto del panel "Registrar Avance" en `ControlObraView` (`ControlObraView.tsx:1497-1527`) es una lista de botones filtrable solo con mouse: no se puede resaltar ni confirmar una opción con teclado. Esto es inconsistente con los paneles equivalentes de `InsumosView` (fichas técnicas, take-off/APU, saldo de partida), que sí navegan con `ArrowUp`/`ArrowDown` vía `useArrowKeyNav` (ver `navegacion-teclado-catalogos`). Además, cada vez que se abre el panel el campo de búsqueda empieza vacío y sin ninguna sugerencia, obligando a retipear la búsqueda aunque el usuario acabe de capturar un avance de un concepto del mismo frente de trabajo.

## What Changes

- El selector de concepto del panel "Registrar Avance" gana navegación de teclado tipo combobox: `ArrowDown`/`ArrowUp` resaltan la opción siguiente/anterior de la lista filtrada visible, y `Enter` selecciona la opción resaltada. Este es un patrón distinto al de `navegacion-teclado-catalogos` (que navega entre renglones de un panel de detalle ya abierto): aquí se navega una lista de candidatos *antes* de tener una selección.
- Al abrir el panel con el campo de búsqueda vacío, se muestran hasta 5 conceptos seleccionados recientemente en esta sesión del panel (más recientes primero), antes de la lista completa — así el usuario no tiene que re-buscar un concepto que acaba de usar.
- La lista de "recientes" es un estado local de la sesión de captura (en memoria, del componente), no se persiste entre recargas de página ni se guarda en backend.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `avance-fisico-control-obra`: se agrega navegación de teclado y lista de conceptos recientes al selector de concepto del panel "Registrar Avance".

## Impact

- Código afectado: `apps/app-shell/src/views/ControlObraView.tsx` (selector de concepto en el panel "Registrar Avance").
- No afecta el backend ni el contrato de `POST /api/v1/control-proyectos/avances`.
- No modifica `useArrowKeyNav` (hook de `navegacion-teclado-catalogos`) — se implementa un manejo de teclado propio para este selector, por tratarse de un patrón distinto (lista de candidatos, no navegación de detalle ya abierto).
