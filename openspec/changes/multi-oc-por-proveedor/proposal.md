## Why

El flujo de compras culmina cuando el GT firma la evaluación económica (estado `APROBADO_GT`), pero la conversión a OC tiene tres brechas que impiden que el ciclo cierre en producción: solo se genera una OC parcial ignorando el reparto multi-proveedor que el GT eligió, el tiempo de entrega no se muestra en el cuadro aunque está en BD, y el endpoint de conversión requiere `presupuesto_id` que el frontend nunca envía.

## What Changes

- **Backend `convertir-oc`**: refactorizar para agrupar los renglones `es_ganador=true, aprobacion_gt=APROBADO` por `proveedor_id` y crear **una OC por proveedor** con todos sus renglones agrupados como items. Publicar `compras.oc_creada` por cada OC generada (best-effort).
- **Backend GET `/comparativas/:id`**: incluir `tiempo_entrega` en cada línea del cuadro (ya está en BD, falta proyectarlo al response).
- **Frontend `ComparativaDetail`**: mostrar columna **"Tiempo"** en la tabla del cuadro en modo GT (`modo === 'compras'`).
- **Frontend `handleAutorizar`**: resolver `presupuesto_id` antes de llamar `convertir-oc` — leerlo de la requisición vinculada; si no existe, bloquear con mensaje claro.

## Capabilities

### New Capabilities

- `multi-oc-generacion`: Conversión de cuadro APROBADO_GT en N OCs agrupadas por proveedor ganador, una OC por proveedor con todos sus renglones como items, verificación de suficiencia financiera sobre el total agregado, y publicación de evento por cada OC.
- `tiempo-entrega-comparativa`: Columna "Tiempo de entrega" visible en la tabla del cuadro comparativo para el GT, alimentada desde `comparativas_detalles.tiempo_entrega`.
- `presupuesto-resolucion-oc`: Mecanismo para obtener el `presupuesto_id` de la requisición vinculada al cuadro antes de ejecutar `convertir-oc`, con validación en frontend que bloquea la autorización si no hay presupuesto disponible.

### Modified Capabilities

_(ninguna — los cambios son de implementación, no de requisitos de specs existentes)_

## Impact

- `apps/compras/src/main.ts`: endpoint `POST /comparativas/:id/convertir-oc` (refactor completo de lógica de agrupación), endpoint `GET /comparativas/:id` (agregar `tiempo_entrega` por línea).
- `apps/app-shell/src/components/ComparativaDetail.tsx`: tabla del cuadro (columna Tiempo), `handleAutorizar` (resolución de presupuesto_id).
- No hay cambios de schema Prisma (todos los campos ya existen en BD).
- Módulo `finanzas`: llamada existente a `/suficiencia` se hace una sola vez sobre el total de todas las OCs a generar.
