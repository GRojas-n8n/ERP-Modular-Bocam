## Why

iRetum no tiene, dentro de la aplicación, ninguna forma de que un usuario entienda cómo funciona el módulo en el que está trabajando ni cómo se conecta con el resto de los procesos de la constructora. El único material existente (`docs/manual-de-usuario.md`) vive fuera de la app, nadie lo consulta en el momento de uso, y ya está desactualizado respecto a las pestañas reales del sidebar (ej. Gerencia Técnica describe "Insumos / Presupuesto / APU / Comparativa / Saldos" cuando el nav real tiene "Catálogo de Obra / Insumos / Control de Costos / Control Presupuestal / Transferencias / Trazabilidad"). Ya existe un precedente puntual y valorado del patrón — el panel "Cómo exportar desde OPUS" en Gerencia Técnica — pero es único, hardcodeado a una sola pestaña, y no existe para ningún otro módulo.

## What Changes

- Se agrega un botón de ayuda (`?`) en el encabezado de cada una de las 13 vistas de módulo del sidebar (Dashboard, Gerencia Técnica, Compras, Almacén, Finanzas, Contabilidad, Control de Obra, Residencia, Recursos Humanos, Seguridad HSE, Ventas, Calidad, Administración).
- El botón abre un panel lateral (`SlidePanel`) con la guía de ese módulo: qué hace, roles típicos que lo usan, el flujo end-to-end del proceso de negocio, con qué otros módulos se conecta (y por qué vía: evento RabbitMQ, llamada backend-to-backend, etc.), una sección de ayuda por cada pestaña visible en el sidebar de ese módulo, y una lista de errores comunes con su causa y solución.
- El panel abre con la sección de la pestaña activa (`activeSubView`) ya expandida; el resto queda colapsado y navegable.
- El contenido de ayuda se modela como datos TypeScript tipados en `apps/app-shell/src/help/`, no como markdown ni como endpoint de backend — no hay microservicio nuevo, ni tabla, ni migración.
- Se agrega un test de "registro" que falla si el sidebar (`ALL_NAV_ITEMS` en `Layout.tsx`, hoy no exportado) tiene un módulo o pestaña sin su contenido de ayuda correspondiente, o si sobra contenido de ayuda para una pestaña que ya no existe en el sidebar — así el contenido no puede desactualizarse en silencio como pasó con `docs/manual-de-usuario.md`.

## Capabilities

### New Capabilities
- `ayuda-contextual-modulo`: panel de ayuda in-app por módulo (botón `?`, contenido estructurado por pestaña, flujo del proceso, conexiones entre módulos, errores comunes) y el guard de cobertura contra el sidebar real.

### Modified Capabilities
(ninguna — este change es puramente aditivo sobre el frontend; no modifica el comportamiento ni los requirements de ningún módulo existente)

## Impact

- **Solo frontend** (`apps/app-shell`). Sin cambios de backend, sin migraciones, sin eventos nuevos en `bocam.events`.
- Archivos nuevos: `apps/app-shell/src/help/types.ts`, `apps/app-shell/src/help/index.ts`, `apps/app-shell/src/help/content/*.ts` (13 archivos), `apps/app-shell/src/components/HelpPanel.tsx`, `apps/app-shell/src/components/HelpButton.tsx`.
- Archivos modificados: `apps/app-shell/src/components/Layout.tsx` (exportar `ALL_NAV_ITEMS`), `apps/app-shell/src/components/Icons.tsx` (nuevo `IconHelpCircle`), y las 13 vistas en `apps/app-shell/src/views/*.tsx` (3 líneas cada una: estado, botón, panel).
- Sin impacto en RBAC/permisos de backend — el contenido de ayuda no expone datos, solo texto estático.
- Deja como recomendación fuera de alcance: actualizar o retirar `docs/manual-de-usuario.md` una vez que la ayuda in-app sea la fuente de verdad para el usuario final.
