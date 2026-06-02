# Proposal — GT: Congelación de Versiones de Presupuesto

## Why

`ConceptoPresupuesto.precio_unitario` ya almacena el precio en el momento de creación del
presupuesto (snapshot correcto). El problema es de protección y trazabilidad:

1. No existe un estado "aprobado" o "congelado" en el presupuesto — cualquier usuario
   con acceso puede editar `Insumo.costo_base` después de que se emitieron OCs, y aunque
   el `precio_unitario` guardado no cambie, el endpoint que devuelve el presupuesto incluye
   el `costo_base` actual del insumo junto al precio histórico, generando confusión en los
   reportes de desviación presupuestal.

2. No hay nada que impida editar los `precio_unitario` de un presupuesto ya aprobado,
   lo que sí corrompe el baseline para comparar contra costos reales.

## What Changes

- **MODIFICADO** modelo `Presupuesto` — nuevo campo `estado` (`BORRADOR` | `APROBADO`),
  y `aprobado_por` / `fecha_aprobacion`.
- **NUEVO** endpoint `PATCH /presupuestos/:id/aprobar` — transiciona a `APROBADO` y
  congela edición de conceptos.
- **MODIFICADOS** endpoints de edición de `ConceptoPresupuesto` — retornan `409` si el
  presupuesto padre está `APROBADO`.
- **MODIFICADA** respuesta de detalle del presupuesto — separa explícitamente `precio_presupuesto`
  (snapshot histórico) vs `precio_actual_insumo` (costo_base vigente), con delta calculado.
- **MODIFICADA** UI en InsumosView — muestra estado del presupuesto, botón "Aprobar",
  columna de delta precio en la vista de detalle.

## Capabilities

### New Capabilities

- `congelacion-presupuesto`: Estado `APROBADO` en presupuesto que bloquea edición de
  conceptos. Endpoint de aprobación con auditoría (quién aprobó, cuándo). UI con botón
  de aprobación y badge de estado.
- `delta-precio-presupuesto`: En la respuesta de detalle, cada concepto incluye
  `precio_presupuesto` (snapshot), `precio_actual` (costo_base vigente) y `delta_pct`
  (variación porcentual) para análisis de desviación.

### Modified Capabilities

*(Ninguna spec existente cambia)*

## Impact

- **Backend:** `apps/gerencia-tecnica/` — schema Prisma (2 campos en `Presupuesto`),
  1 endpoint nuevo, 2 endpoints modificados (guardar bloqueo), 1 endpoint de detalle modificado.
- **Frontend:** `InsumosView.tsx` — badge de estado, botón "Aprobar Presupuesto", columna delta.
- **Sin cambios en:** otros módulos, infraestructura.
