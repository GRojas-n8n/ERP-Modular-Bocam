## Why

El change ya archivado `selector-proyecto-confirmacion-critica` estableció que el indicador de
proyecto activo en el header de `app-shell` debe ser "persistente y visualmente inconfundible,
visible en todo momento". En la implementación (`Layout.tsx`), el botón colapsado del selector
solo renderiza `currentProject?.code` (ej. "TCN"); el nombre completo del proyecto
(`currentProject?.name`, ej. "Torre Corporativa Norte") solo aparece dentro de las filas del
dropdown, es decir, solo quien abre el menú lo ve. Un usuario que opera varios proyectos a la vez
identificando solo por código de 3-4 letras sigue expuesto al mismo riesgo de confusión de
contexto que el change original buscaba mitigar — el código por sí solo no es suficientemente
inequívoco para una confirmación visual "en todo momento".

Nota: la capability `indicador-proyecto-activo` fue definida en el change archivado pero nunca
se fusionó a `openspec/specs/` (no existe hoy en ese directorio) — este change la crea ahí por
primera vez, incorporando el requisito de nombre visible.

## What Changes

- El botón colapsado del selector de proyecto en el header (`Layout.tsx`, línea ~519-539) muestra
  ahora el **nombre** del proyecto (`currentProject?.name`), no solo el `code`, de forma visible
  en todo momento sin necesidad de abrir el dropdown.
- Se mantiene el indicador de color determinístico por proyecto y el punto de color ya existentes.
- En pantallas angostas, si el nombre completo no cabe, se trunca con `truncate` (ya usado en el
  resto del componente) en vez de ocultarse; el `code` puede mostrarse como texto secundario más
  pequeño junto al nombre para no perder la referencia corta ya usada en otras partes de la UI.
- No se modifica el mecanismo de cambio de proyecto, `TenantContext.tsx`, ni ningún endpoint de
  backend — cambio puramente visual en `app-shell`.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `indicador-proyecto-activo`: el indicador persistente del proyecto activo en el header debe
  mostrar el **nombre** del proyecto (no solo su código corto) visible en todo momento, sin
  requerir interacción del usuario (sin necesidad de abrir el dropdown).

## Impact

- **Afectado:** `apps/app-shell/src/components/Layout.tsx` (botón colapsado del selector de
  proyecto, líneas ~519-539).
- **No afectado:** `TenantContext.tsx`, dropdown de selección (ya muestra nombre + código),
  backend de `auth` ni de ningún otro microservicio.
- **Dependencias:** ninguna nueva; `currentProject.name` ya existe en el tipo de proyecto
  consumido por `Layout.tsx`.
