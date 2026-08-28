## Why

El componente `ControlPresupuestalTabla` (usado en la pestaña "Presupuesto por Partida" de `ControlObraView` y en la pestaña "Control Presupuestal" de `InsumosView`) es la única tabla grande del módulo de Gerencia Técnica sin campo de búsqueda. En proyectos con muchas partidas, ubicar una clave específica hoy requiere scroll manual por toda la tabla, mientras que el Catálogo de Obra y el Catálogo de Insumos del mismo módulo ya tienen buscador. Esto es inconsistente y agrega fricción a una tarea frecuente (ubicar el estado presupuestal de una partida concreta).

## What Changes

- Se agrega un campo de búsqueda por clave o descripción de partida en `ControlPresupuestalTabla`, que filtra las filas visibles en tiempo real (sin llamada adicional al backend — filtra sobre los datos ya cargados por el reporte).
- La búsqueda se combina con el filtro de categoría existente (ambos filtros aplican en conjunto, no son excluyentes).
- La fila "[Sin partida]" (montos sin `concepto_id`) se mantiene visible solo si coincide con el término de búsqueda o si no hay término de búsqueda activo.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `frontend-control-presupuestal`: se agrega búsqueda por clave/descripción en la tabla de partidas de Control Presupuestal.

## Impact

- Código afectado: `apps/app-shell/src/components/ControlPresupuestalTabla.tsx` (componente compartido).
- Se usa desde `ControlObraView.tsx` (pestaña "Presupuesto por Partida") e `InsumosView.tsx` (pestaña "Control Presupuestal") — ambos heredan el cambio automáticamente al ser el mismo componente.
- No afecta al widget resumen de `ComprasView.tsx` (no usa este componente).
- No requiere cambios de backend (filtro es client-side sobre datos ya cargados).
