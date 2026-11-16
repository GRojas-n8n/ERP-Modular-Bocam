## Why

En la pestaña "Control de Costos" de `InsumosView` (Gerencia Técnica), el selector "Todas las categorías" es un control no funcional: `costosCategoriasDisp` se fija en `[]` en cada carga (`InsumosView.tsx:868`) y cada fila también fija `categorias: []` (`InsumosView.tsx:864`), porque el endpoint `GET /api/v1/gerencia-tecnica/proyectos/:id/costos-wbs` nunca calculó ni devolvió un desglose de comprometido/pagado por categoría de gasto. El resultado es un control interactivo que el usuario puede abrir pero que jamás ofrece ninguna opción distinta de "Todas las categorías", y cuya lógica de filtrado (`InsumosView.tsx:2193`) nunca puede coincidir con ninguna fila. Es un bug de UI: un control que aparenta funcionalidad que no existe.

## What Changes

- Se elimina el selector "Todas las categorías" y su estado asociado (`costosFiltroCategoria`, `costosCategoriasDisp`) de la pestaña "Control de Costos" en `InsumosView.tsx`, junto con la condición de filtrado que dependía de `categorias` por fila.
- El campo `categorias` del tipo `CostosWbsRow` y su asignación fija a `[]` se eliminan, ya que no tiene ningún dato real detrás ni ningún consumidor una vez removido el filtro.
- El filtro "Solo con desviación" (checkbox, `costosFiltroDes`) permanece sin cambios — es el único filtro funcional de esta tabla.
- **BREAKING**: ninguno — el control eliminado nunca tuvo opciones seleccionables distintas de "Todas las categorías", por lo que no existe ningún flujo de usuario funcional que dependa de él hoy.

## Capabilities

### New Capabilities
- `control-costos-wbs-filtros`: documenta los filtros válidos y funcionales de la tabla "Control de Costos" (Gerencia Técnica / InsumosView), hoy sin spec propio, dejando registrado explícitamente que no incluye filtro por categoría hasta que exista un cálculo real de desglose por categoría en el backend.

### Modified Capabilities
(ninguna — no hay spec previo que cubra esta pestaña)

## Impact

- Código afectado: `apps/app-shell/src/views/InsumosView.tsx` (pestaña "Control de Costos": estado `costosFiltroCategoria`/`costosCategoriasDisp`, el `<select>` de categoría, el campo `categorias` de `CostosWbsRow` y su asignación en `loadCostosWbs`, y la condición de filtrado en el `.filter()` de la tabla).
- No afecta el backend ni ningún endpoint — es una eliminación de UI muerta en el frontend.
- No afecta otras pestañas ni otros módulos.
