## Why

El Residente pidió explícitamente reducir clics en la evaluación técnica (2026-07-13,
prueba real en producción): hoy, para renglones sin especificaciones estructuradas
capturadas, calificar C/NC/DA/? por proveedor requiere abrir un modal
("Registrar Evaluación Técnica →") separado de la "TABLA DE COTIZACIONES" donde ya está
viendo precios y proveedores. Los renglones con especificaciones capturadas ya resuelven
esto sin modal, usando sub-filas expandibles directamente en la tabla — ese patrón ya
probado se extiende ahora al caso simple.

## What Changes

- Los renglones sin especificaciones estructuradas capturadas (los que hoy usan el panel
  modal `showEvalPanel`) ganan una sub-fila expandible en "TABLA DE COTIZACIONES", igual
  patrón visual que ya usan los renglones con especificaciones — un bloque C/NC/DA/? por
  proveedor, con su comentario técnico (obligatorio para NC/DA) o pregunta (obligatoria
  para "?"), sin salir de la tabla principal.
- El modal `showEvalPanel` se elimina — la sub-fila cubre el 100% de los casos que hoy
  cubre el modal, no se mantienen dos rutas de UI para lo mismo.
- `handleGuardarEvaluacion` pasa de guardar todo el cuadro de una vez (al cerrar el modal)
  a guardar por renglón (al colapsar/confirmar la sub-fila expandida) — o se mantiene un
  guardado agregado con un botón visible mientras haya sub-filas expandidas, a definir en
  el diseño.
- Sin cambios de backend — `PATCH /comparativas/:id/evaluar` ya soporta esto (confirmado
  en PR #59, `fix-evaluacion-tecnica-por-proveedor`).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: el requirement sobre cómo el Residente registra la evaluación
  técnica por proveedor (agregado en `fix-evaluacion-tecnica-por-proveedor`) se amplía
  para exigir que la interacción sea inline en la tabla principal, no un modal separado.

## Impact

- **Frontend únicamente**: `apps/app-shell/src/components/ComparativaDetail.tsx`
  (`showEvalPanel` y su modal se eliminan; se extiende el patrón de sub-filas expandibles
  ya usado por `especsMap` a los renglones sin specs; `handleGuardarEvaluacion`,
  `evalForm`, `preguntasEval` se adaptan a la interacción inline).
- Reutiliza el modelo de datos ya expuesto por `fix-evaluacion-tecnica-por-proveedor`
  (`CotizacionLinea.evaluacionesPorProveedor`) — no requiere cambios en `normalizeComp`
  ni en el backend.
- Riesgo de UX: la tabla principal ya tiene varias columnas (marca, specs, precios por
  proveedor, ganador, resumen de evaluación) — la sub-fila expandida debe evitar saturar
  la vista en cuadros con muchos proveedores o renglones.
