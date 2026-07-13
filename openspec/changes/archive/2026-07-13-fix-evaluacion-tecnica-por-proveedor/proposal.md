## Why

El panel "Registrar Evaluación Técnica →" (para renglones sin especificaciones
estructuradas capturadas — la matriz por especificación ya evalúa correctamente por
proveedor) solo permite capturar **una** decisión C/NC/DA/? por renglón, sin distinguir
entre proveedores. Confirmado en producción (2026-07-13, usuario con rol `residencia`,
cuadro con 3 proveedores): al guardar, el frontend solo envía un `detalle_id` por
renglón — el primero que se agrupó al normalizar la respuesta del backend — y
`PATCH /comparativas/:id/evaluar` actualiza únicamente ese `ComparativaDetalle`. Los otros
2 proveedores de ese mismo renglón **nunca reciben evaluación_tecnica**, quedan
`PENDIENTE` para siempre, sin ningún aviso.

Esto es más grave que un problema de interfaz: el gate `todasEvaluadas` (que habilita
"🔒 Firmar y Bloquear →") lee `comp.lineas` — la vista agrupada por renglón, que solo
refleja el proveedor evaluado — así que el Residente puede firmar el cuadro creyendo que
evaluó a los 3 proveedores, cuando en realidad 2 de cada 3 nunca se evaluaron.

El backend (`PATCH /comparativas/:id/evaluar`, `apps/compras/src/main.ts:3375-3389`) **ya
soporta evaluar cada `ComparativaDetalle` de forma independiente** — el arreglo
`evaluaciones` se aplica por `id_detalle`, uno por uno. El bug es enteramente del frontend,
que nunca construye ni envía más de una evaluación por renglón.

## What Changes

- El panel de evaluación técnica simple muestra, por cada renglón, un bloque de
  evaluación C/NC/DA/? **por cada proveedor** del cuadro (no uno solo) — igual de granular
  que ya lo hace la matriz por especificación para renglones con specs capturadas.
- `handleGuardarEvaluacion` envía una evaluación por cada combinación (renglón,
  proveedor), no una por renglón.
- El gate `todasEvaluadas` (habilita "Firmar y Bloquear") exige que **todos** los
  proveedores de **todos** los renglones tengan una decisión distinta de `PENDIENTE`.
- La columna de resumen en la tabla principal refleja cuántos proveedores de un renglón ya
  fueron evaluados (ej. "2/3 evaluados"), no un solo badge que puede ocultar evaluaciones
  faltantes.
- Sin cambios de backend — el endpoint ya soporta esto correctamente.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: el requirement sobre el rol `residencia`/`admin` registrando la
  evaluación técnica se amplía para exigir explícitamente que la evaluación sea por
  proveedor, no por renglón agregado.

## Impact

- **Frontend únicamente**: `apps/app-shell/src/components/ComparativaDetail.tsx`
  (`showEvalPanel`, `evalForm`, `handleGuardarEvaluacion`, `todasEvaluadas`, columna de
  resumen en la tabla principal), `apps/app-shell/src/views/ComprasView.tsx`
  (`normalizeComp`, para exponer las evaluaciones por proveedor de cada línea).
- Riesgo de datos ya persistidos: cuadros donde ya se "evaluó" un renglón bajo el bug
  actual tienen 1 de N proveedores evaluado y el resto en `PENDIENTE` — no se corrige
  retroactivamente (el Residente puede volver a abrir el panel y completar los
  proveedores faltantes una vez desplegado el fix, ya que el cuadro sigue en
  `EN_EVALUACION_TECNICA`).
