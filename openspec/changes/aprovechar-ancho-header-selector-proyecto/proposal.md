## Why

El header de `app-shell` (`Layout.tsx`) tiene, del lado derecho, un badge decorativo
"Sistema sincronizado" (punto verde animado + texto estático) que no está conectado a ningún
dato real de sincronización — es texto fijo, siempre el mismo, sin lógica detrás. Ya se detectó
además (ver memoria `hallazgo-badge-sistema-sincronizado-siempre-visible`) que ni siquiera
respeta su propia clase `hidden md:inline-flex` por un bug de `cn()` sin `tailwind-merge`, así
que se muestra siempre, en cualquier ancho de pantalla, ocupando espacio sin aportar información
útil. El usuario pidió explícitamente eliminarlo y usar ese espacio para que el selector de
proyecto (que hoy está limitado a un `max-w` fijo en píxeles) pueda mostrar nombres de proyecto
más largos sin truncarse tan pronto.

## What Changes

- Se elimina el `<SectionBadge>` "Sistema sincronizado" del header (`Layout.tsx`, líneas
  ~597-601) — no vuelve a renderizarse en ningún ancho de pantalla.
- El selector de proyecto activo (botón colapsado) deja de tener un `max-w` fijo en píxeles y
  pasa a crecer (`flex-1`) para ocupar el espacio horizontal que el badge dejó libre en el
  cintillo superior, manteniendo `truncate` como respaldo para nombres extremadamente largos.
- No se modifica el mecanismo de cambio de proyecto, colores determinísticos, ni el dropdown de
  selección — solo el espacio disponible para el botón colapsado.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `indicador-proyecto-activo`: el indicador persistente del proyecto activo debe poder usar el
  espacio horizontal disponible en el header (ya no limitado a un ancho fijo pequeño), en vez de
  competir por espacio con un badge decorativo sin utilidad.

## Impact

- **Afectado:** `apps/app-shell/src/components/Layout.tsx` (badge "Sistema sincronizado" y
  contenedor del selector de proyecto).
- **No afectado:** `TenantContext.tsx`, dropdown de selección, backend de ningún microservicio.
- **Dependencias:** ninguna nueva; se elimina el import de `SectionBadge` en este archivo (sigue
  usándose en otras vistas, no se toca el componente compartido).
