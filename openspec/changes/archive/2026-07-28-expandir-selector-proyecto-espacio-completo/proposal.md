## Why

Tras eliminar el badge "Sistema sincronizado" (change `aprovechar-ancho-header-selector-proyecto`),
el selector de proyecto activo quedó acotado a `lg:max-w-[480px]` en pantallas grandes — un límite
arbitrario que no usa todo el espacio ya disponible entre el breadcrumb y los íconos de tema/
settings del lado derecho del header. El usuario pidió explícitamente que el selector se extienda
hasta justo antes del ícono de sol/luna, para mostrar el nombre completo del proyecto sin cortarlo
en la mayoría de los casos, manteniendo un aspecto minimalista y profesional (sin saturar el
header con elementos nuevos, solo usando mejor el espacio que ya existe).

## What Changes

- Se elimina el tope `lg:max-w-[480px]` del botón del selector de proyecto; el botón pasa a
  `max-w-full`, apoyado en el `flex-1` ya existente en sus contenedores ancestros, de modo que
  crece hasta el borde del grupo de íconos (tema + settings) del lado derecho del header.
- El `gap` y padding del header no cambian — el crecimiento del selector es puramente el `max-w`
  del botón, no un rediseño del layout general.
- `truncate` sigue como respaldo para nombres de proyecto excepcionalmente largos incluso con
  todo el espacio disponible.

## Capabilities

### Modified Capabilities
- `indicador-proyecto-activo`: el indicador debe poder extenderse hasta el límite real del
  espacio disponible en el header (hasta el grupo de íconos de la derecha), no solo hasta un
  ancho fijo arbitrario menor al espacio real disponible.

## Impact

- **Afectado:** `apps/app-shell/src/components/Layout.tsx` (clase `max-w` del botón del selector
  de proyecto, línea ~525 aprox.).
- **No afectado:** el resto del header, dropdown, `TenantContext.tsx`, backend.
