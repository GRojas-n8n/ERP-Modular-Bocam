# Spec: Delta de Precio en Presupuesto

## CA-1 — Separación clara de precio histórico vs precio actual
- En `GET /presupuestos/:id`, cada concepto retorna:
  - `precio_presupuesto`: el `precio_unitario` guardado al crear el concepto (snapshot inmutable)
  - `precio_actual`: el `costo_base` vigente del `Insumo` referenciado
  - `delta_pct`: `((precio_actual - precio_presupuesto) / precio_presupuesto) × 100`, con 1 decimal

## CA-2 — Delta visual en frontend
- Columna "Δ%" en la tabla de conceptos:
  - `delta_pct > 0` → texto rojo (encarecimiento del insumo)
  - `delta_pct < 0` → texto verde (abaratamiento)
  - `delta_pct = 0` → gris sin cambio

## CA-3 — Si el insumo fue eliminado
- Si el `insumo_id` ya no existe en la BD, `precio_actual = null`, `delta_pct = null`.
- El concepto sigue siendo válido (el precio presupuestado está guardado).
