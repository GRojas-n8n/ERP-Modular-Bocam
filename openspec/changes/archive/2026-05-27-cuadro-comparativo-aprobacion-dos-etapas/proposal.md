## Why

El flujo actual de Compras convierte un cuadro comparativo directamente en Orden de Compra sin ninguna validación técnica ni gerencial, permitiendo que insumos o precios técnicamente inadecuados se comprometan financieramente. En la operación real de Bocam, el Residente de Obra y el Gerente Técnico son actores obligatorios antes de emitir cualquier OC.

## What Changes

- **BREAKING**: `CuadroComparativo.estado` pasa de 2 valores (`ABIERTO`/`CERRADO`) a una máquina de 7 estados con transiciones controladas.
- `PATCH /comparativas/:id/convertir-oc` ahora bloquea la generación de OC si el cuadro no está en estado `APROBADO_GT`.
- Se agregan 6 nuevos endpoints para gestionar las etapas de evaluación técnica y aprobación GT.
- `ComparativaDetalle` recibe dos capas de evaluación independientes por renglón: evaluación del Residente y aprobación del Gerente Técnico.
- Las Órdenes de Compra resultantes solo incluyen renglones con `aprobacion_gt = APROBADO`.
- El frontend expone bandejas de trabajo diferenciadas por rol: Residente ve cuadros `EN_EVALUACION_TECNICA`; Gerente Técnico ve cuadros `EN_APROBACION_GT`.

## Capabilities

### New Capabilities

- `evaluacion-tecnica-comparativa`: Flujo por el que el Residente de Obra evalúa técnicamente cada renglón del cuadro comparativo (APROBADO/RECHAZADO con comentario), y lo remite al Gerente Técnico.
- `aprobacion-gt-comparativa`: Flujo por el que el Gerente Técnico revisa la evaluación técnica del Residente y aprueba o rechaza cada renglón (la evaluación técnica negativa del Residente es vinculante), cerrando el cuadro como APROBADO_GT o RECHAZADO_GT.
- `bandejas-comparativas-por-rol`: Vistas de bandeja de entrada en el frontend que muestran al Residente los cuadros pendientes de evaluación técnica y al Gerente Técnico los cuadros pendientes de su aprobación.

### Modified Capabilities

- `cuadro-comparativo-a-oc`: El endpoint de conversión a OC ahora requiere que el cuadro esté en estado `APROBADO_GT` y genera ítems de OC solo a partir de los renglones con `aprobacion_gt = APROBADO`.

## Impact

- **Backend** — `apps/compras/src/main.ts`: 6 nuevos endpoints, validación adicional en `convertir-oc`, publicación de evento `compras.comparativa_aprobada_gt`.
- **Schema** — `apps/compras/prisma/schema.prisma`: migración con campos nuevos en `CuadroComparativo` y `ComparativaDetalle`; migración Prisma requerida en VPS.
- **Frontend** — `apps/app-shell/src/views/ComprasView.tsx` y `ComparativaDetail.tsx`: lógica de estado visible, botones condicionales por rol, tabla de evaluación y tabla de revisión GT.
- **Roles afectados**: `procurement`, `resident`, `control_obra`, `gerencia_tecnica`, `superintendent`.
- **Sin impacto en**: `finanzas`, `contabilidad`, `auth`, `seguridad`, `personal`, `control-obra` (módulo backend), `ventas`.
