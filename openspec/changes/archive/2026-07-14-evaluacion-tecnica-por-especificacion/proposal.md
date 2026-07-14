## Why

Hoy el veredicto técnico C/NC/DA/? del Residente se captura como UN valor
único por renglón completo (`ComparativaDetalle.evaluacion_tecnica`, insumo ×
proveedor). El negocio necesita evaluar cada característica individual
(cada especificación capturada al crear la requisición) por separado, con su
propio veredicto — un renglón puede cumplir en 3 de 4 características y
fallar en la cuarta, y hoy eso no se puede expresar. Además, cuando el
Residente tiene una duda ("?"), la pregunta debe quedar amarrada a la
característica y proveedor exactos, no a todo el renglón, para que Compras
sepa exactamente qué aclarar. Y al firmar/bloquear el cuadro, la Requisición
no queda registrada con la revisión (letra) del cuadro comparativo que la
cerró, perdiendo trazabilidad de folio+revisión.

## What Changes

- Nuevo modelo `EvaluacionEspecificacion` (cuadro × especificación ×
  proveedor) con su propio veredicto `C/NC/DA/?/PENDIENTE`, `comentario_tecnico`,
  `pregunta_residente` y `respuesta_compras` — mismo patrón ya probado que
  `ComparativaDetalle`, pero a nivel característica. Incluye relación real
  (`@relation`) hacia `EspecificacionDetalleReq`, que hoy no existe (el
  `especificacion_id` de `AnotacionEspecificacion` es un UUID suelto sin FK).
- El veredicto de renglón (`ComparativaDetalle.evaluacion_tecnica`) **deja de
  capturarse a mano** cuando el renglón tiene especificaciones: se calcula
  automáticamente (peor caso) a partir de sus evaluaciones por
  característica. Si el renglón no tiene ninguna especificación capturada
  (caso legacy), se mantiene editable directamente vía el endpoint existente
  (fallback).
- Nuevo endpoint `PATCH /api/v1/compras/comparativas/:id/evaluar-especificaciones`
  para que el Residente evalúe característica por característica.
- `POST .../revision-con-preguntas` se extiende: la validación de "hay al
  menos un '?' con pregunta" pasa a evaluarse a nivel característica, y las
  filas de `EvaluacionEspecificacion` se clonan hacia el cuadro de la
  revisión siguiente (hoy las anotaciones equivalentes NO se clonan y quedan
  huérfanas — se corrige de paso).
- `PUT .../responder-preguntas` se extiende para que Compras responda
  `respuesta_compras` a nivel característica.
- `Requisicion` gana dos campos: referencia al `CuadroComparativo` y a la
  `revision` con la que se cerró/bloqueó definitivamente. Se completan
  automáticamente al ejecutar `POST .../firmar` cuando el cuadro pasa a
  `FIRMADO_BLOQUEADO`.
- Rediseño de la tabla de evaluación en `ComparativaDetail.tsx`: cada
  renglón se expande en sub-filas por característica, con sus propios
  botones C/NC/DA/? por proveedor y campo de duda cuando se marca "?"; vista
  de Compras equivalente para responder.

## Capabilities

### New Capabilities
- `evaluacion-tecnica-por-especificacion`: veredicto C/NC/DA/? por
  característica individual (no por renglón completo), con su propio ciclo
  de pregunta del Residente → respuesta de Compras, cálculo automático del
  veredicto de renglón como peor-caso de sus características, y registro en
  la Requisición del folio + revisión con la que se cerró el cuadro.

### Modified Capabilities
(ninguna en `openspec/specs/` — el comportamiento previo de evaluación por
renglón y del ciclo de revisión por letra nunca llegó a documentarse ahí,
solo existe código y specs archivados sin consolidar
`2026-06-08-comparativa-evaluacion-v2`; no se tocan como parte de este
change, se reemplaza su comportamiento directamente con la nueva capability)

## Impact

- **Backend (`apps/compras`)**: nuevo modelo + migración Prisma, nuevo
  endpoint `evaluar-especificaciones`, ajustes en `revision-con-preguntas`,
  `responder-preguntas` y `firmar` (solo el registro final en Requisicion —
  su lógica de bloqueo no cambia). El endpoint legacy `evaluar` se restringe:
  rechaza (400) editar directo el veredicto de un renglón que sí tiene
  especificaciones capturadas.
- **Frontend (`apps/app-shell`)**: rediseño de la sección de evaluación
  técnica en `ComparativaDetail.tsx` (ambos modos: Residente y Compras).
- **Fuera de alcance explícito**: no se toca `nueva-revision` (camino manual
  de Compras), ni `AnotacionEspecificacion`/`AclaracionComparativa` (sistemas
  de texto libre ya desacoplados del flujo formal — quedan como deuda técnica
  aparte, no se migran ni se eliminan).
- **Datos existentes**: producción tiene muy pocos cuadros comparativos
  reales hoy (a confirmar el conteo exacto antes de implementar) — se decide
  en `design.md` si hace falta backfill o si los cuadros existentes
  simplemente no tienen especificaciones capturadas y siguen el camino
  legacy sin fricción.
