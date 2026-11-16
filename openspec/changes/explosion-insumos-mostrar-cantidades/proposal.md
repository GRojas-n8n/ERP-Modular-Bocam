## Why

La vista de Explosión de Insumos en Gerencia Técnica no muestra la cantidad de cada insumo, solo su costo unitario. Esto impide al usuario verificar de un vistazo cuánto material/mano de obra/equipo está presupuestado, y lo obliga a ir concepto por concepto en el APU para reconstruir esa información manualmente.

## What Changes

- `GET /api/v1/gerencia-tecnica/insumos` y `GET /api/v1/gerencia-tecnica/insumos/explosion` SHALL incluir, por cada insumo, su cantidad agregada dentro del proyecto/presupuesto activo, calculada a partir de las composiciones (`ConceptoInsumo`) que lo referencian.
- La cantidad SHALL calcularse como `Σ (ConceptoInsumo.cantidad × Concepto.cantidad)` para todos los conceptos del presupuesto activo que usan ese insumo — no se agrega ninguna columna nueva de captura manual ni se modifica el parser de importación.
- El frontend (`InsumosView.tsx`, tabla/preview de Explosión de Insumos) SHALL mostrar esa cantidad agregada en una columna nueva, con su unidad de medida.
- Un insumo sin ninguna composición vinculada (no usado en ningún concepto del presupuesto activo) SHALL mostrar cantidad `0`, no vacío ni error.

## Capabilities

### New Capabilities
- `explosion-insumos-cantidad`: cálculo y exposición de la cantidad agregada por insumo (derivada de sus composiciones APU) en los endpoints y la vista de Explosión de Insumos.

### Modified Capabilities
(ninguna — no se cambian los requisitos de aislamiento por proyecto ya cubiertos en `aislamiento-insumos-por-proyecto-gt`, solo se agrega un campo a la respuesta)

## Impact

- Backend: `apps/gerencia-tecnica/src/main.ts` — handlers de `GET /insumos` y `GET /insumos/explosion`, agregar cálculo agregado (probablemente vía `groupBy`/`sum` sobre `ConceptoInsumo` filtrado por presupuesto activo del proyecto).
- Frontend: `apps/app-shell/src/views/InsumosView.tsx` — agregar columna "Cantidad" a la tabla de Explosión de Insumos.
- No requiere migración de Prisma (no se agrega columna a `Insumo`; el dato se deriva en query, no se persiste).
- Fuera de alcance: el bug de mapeo de columna costo-unitario-vs-importe en la importación (punto 7 de la lista original) se cubre en un change separado (`explosion-insumos-fix-costo-vs-importe`).
