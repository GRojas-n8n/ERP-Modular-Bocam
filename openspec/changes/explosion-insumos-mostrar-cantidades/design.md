## Context

`Insumo` es un catálogo plano por proyecto (clave, descripción, unidad, `costo_base`) — no tiene columna de cantidad. La cantidad real de cada insumo dentro de un proyecto vive en `ConceptoInsumo`, la tabla de composición APU que vincula un `Concepto` con sus insumos, con `cantidad` (rendimiento del insumo por unidad de concepto). El presupuesto activo (`PresupuestoBase`) agrupa los `Concepto` de un proyecto, cada uno con su propia `cantidad` presupuestada.

Existe ya un patrón similar de agregación en `apps/gerencia-tecnica/src/main.ts` (líneas ~119-156) que suma valores derivados de `ConceptoInsumo` a través de conceptos — se puede reutilizar ese enfoque de query.

## Goals / Non-Goals

**Goals:**
- Mostrar, para cada insumo en la vista/API de Explosión de Insumos, la cantidad total que representa dentro del presupuesto activo del proyecto.
- No romper el modelo de catálogo de Insumo como entidad por-unidad (costo_base), que es usado también por Catálogo de Conceptos y APU.

**Non-Goals:**
- No se agrega captura manual de "cantidad total" al importar un insumo suelto (un insumo sin composiciones no tiene cantidad presupuestada per se).
- No se resuelve en este change el bug de mapeo costo-unitario-vs-importe en la importación (change separado `explosion-insumos-fix-costo-vs-importe`).
- No se persiste la cantidad calculada — se deriva en cada consulta.

## Decisions

**Decisión: calcular la cantidad como agregado derivado (opción B), no como columna capturada del archivo (opción A).**

Se evaluaron dos caminos:
- **(A) Capturar cantidad del archivo de Explosión al importar** y persistirla en una nueva columna `Insumo.cantidad`/`cantidad_total`. Requiere migración de Prisma, y es ambiguo: el archivo OPUS de Explosión de Insumos no siempre trae una "cantidad total" única y confiable por insumo (varía según el formato de export), y un insumo puede reutilizarse en múltiples conceptos con cantidades distintas — una sola columna en `Insumo` no representa bien eso, y quedaría desactualizada si luego se edita un concepto.
- **(B) Calcular la cantidad agregada en query, sumando `ConceptoInsumo.cantidad × Concepto.cantidad`** de todos los conceptos del presupuesto activo que referencian ese insumo. Siempre refleja el estado actual del presupuesto (si se edita un concepto, la cantidad mostrada se actualiza sola), no requiere migración, y es consistente con cómo GT ya deriva otros KPIs.

Se elige **(B)**. Trade-off aceptado: un insumo recién importado que todavía no fue vinculado a ningún concepto en el APU mostrará cantidad `0` hasta que se le asocie una composición — esto es correcto conceptualmente (no hay "cantidad presupuestada" sin composición), pero debe comunicarse en la UI para no leerse como un error.

## Risks / Trade-offs

- [Riesgo] La query de agregación (`groupBy`/`sum` sobre `ConceptoInsumo` filtrado por presupuesto activo) puede ser costosa en catálogos grandes → Mitigación: un solo `groupBy` por proyecto en el mismo request que ya arma la respuesta de `/insumos/explosion`, no N+1 por insumo.
- [Riesgo] Insumos sin presupuesto activo (proyecto en `BORRADOR`, ver change `control-presupuestal-visibilidad-borrador`) mostrarán cantidad 0 aunque tengan composiciones cargadas en un presupuesto no aprobado → Mitigación: documentar explícitamente que la cantidad se calcula sobre el presupuesto activo/aprobado, igual criterio que usa Control Presupuestal.
