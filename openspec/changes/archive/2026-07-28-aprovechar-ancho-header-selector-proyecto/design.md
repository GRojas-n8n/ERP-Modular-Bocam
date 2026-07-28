## Context

El header (`Layout.tsx`) es un `flex justify-between`: lado izquierdo (hamburguesa + breadcrumb +
selector de proyecto) y lado derecho (badge + toggle de tema + botón de settings). El selector de
proyecto hoy está acotado a `max-w-[180px] sm:max-w-[260px]` (agregado en el change
`mostrar-nombre-proyecto-header`), un límite fijo que no aprovecha el ancho real disponible.

## Goals / Non-Goals

**Goals:**
- Eliminar el badge decorativo sin romper otras vistas que usan `SectionBadge` en otros archivos.
- Que el selector de proyecto crezca para ocupar el espacio horizontal disponible en el cintillo,
  no un ancho fijo arbitrario.
- Mantener `truncate` como respaldo para nombres de proyecto excepcionalmente largos en pantallas
  angostas.

**Non-Goals:**
- No se rediseña el resto del header (toggle de tema, botón de settings).
- No se agrega un indicador real de estado de sincronización en su lugar — el usuario pidió
  quitarlo, no reemplazarlo.

## Decisions

- **Eliminar el bloque completo del badge y su import**, en vez de solo ocultarlo con CSS —
  el usuario confirmó que no tiene ninguna utilidad; dejarlo en el código muerto invitaría a que
  reaparezca el mismo bug de visibilidad ya detectado.
- **`flex-1` en la cadena de contenedores del lado izquierdo** (el div raíz del lado izquierdo, el
  div del breadcrumb, y el wrapper `relative` del botón) para que el espacio que el badge dejó
  libre se redistribuya hacia el selector, no hacia un hueco vacío en el header.
- **Reemplazar el `max-w` fijo del botón por `max-w-full`**, dejando que el `flex-1` de sus
  ancestros determine el ancho real disponible; `truncate` en los spans internos (ya presente)
  sigue actuando como respaldo si el nombre es más largo que el espacio disponible.

## Risks / Trade-offs

- [El botón podría verse desproporcionadamente ancho en pantallas muy grandes si no hay tope
  superior] → Mitigación: verificar visualmente en desktop ancho; si se ve mal, se puede acotar
  con un `max-w` grande (p. ej. `lg:max-w-[480px]`) en vez de `max-w-full` sin límite.
- [Quitar el badge podría sorprender a alguien que asumía que reflejaba estado real] → Mitigación:
  ya se confirmó con el usuario que no tiene utilidad ni lógica real detrás; no es una regresión
  de una feature funcional.
