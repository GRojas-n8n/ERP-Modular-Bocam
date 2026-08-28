## Why

Al dar de alta un proyecto y subir Catálogo de Obra, Explosión de Insumos y APU, el presupuesto queda creado en estado `BORRADOR` por defecto. `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` solo considera presupuestos `APROBADO/LIBERADO/CONGELADO`, así que responde 404 y la pestaña "Control Presupuestal" se ve vacía sin ninguna explicación — el usuario no sabe que existe un paso manual de aprobación pendiente (`PATCH /api/v1/gerencia-tecnica/presupuestos/:id/aprobar`). Esto se percibe como un bug ("no muestra información") cuando en realidad es un estado intermedio no comunicado.

## What Changes

- El endpoint `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` distingue, en su respuesta 404, entre "no existe ningún presupuesto para el proyecto" y "existe un presupuesto en `BORRADOR`/`EN_REVISION` pendiente de aprobación" (nuevo código de error `GT_PRESUPUESTO_PENDIENTE_APROBACION` junto con `presupuesto_id` y `estado` actual).
- La pestaña "Control Presupuestal" (`InsumosView.tsx`) muestra, cuando reciba ese nuevo código, un estado explícito ("Presupuesto pendiente de aprobación") con botón/CTA que dispara la aprobación (`handleAprobarPresupuesto`, ya existente) directamente desde ahí, en vez de una tabla vacía.
- El widget resumen en `ComprasView.tsx` recibe el mismo tratamiento: en vez de "Sin presupuesto activo para este proyecto" para todos los 404, distingue el caso "pendiente de aprobación" con mensaje acorde (sin botón de aprobar ahí, solo informativo, ya que Compras no tiene permiso de aprobar presupuestos de GT).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `control-presupuestal-endpoint`: el escenario "Sin presupuesto activo" se desdobla en dos: sin ningún presupuesto, y presupuesto existente pero no aprobado (con nuevo código de error y datos del presupuesto pendiente).
- `frontend-control-presupuestal`: nuevo escenario de estado "pendiente de aprobación" con CTA en la pestaña de GT, y mensaje diferenciado en el widget de Compras.

## Impact

- Backend: `apps/gerencia-tecnica/src/main.ts` — función `buildControlPresupuestal()` (~línea 2043-2086) y el handler HTTP (~línea 2196-2207).
- Frontend: `apps/app-shell/src/views/InsumosView.tsx` (pestaña Control Presupuestal, ~línea 840 y `handleAprobarPresupuesto` ~línea 1153) y `apps/app-shell/src/views/ComprasView.tsx` (widget resumen).
- Sin cambios de schema ni de datos existentes — es un cambio de contrato de respuesta (nuevo código de error) y de UI.
