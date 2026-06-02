## Why

El flujo de Compras tenía dos brechas operativas críticas:

1. **Sin aprobación de Procurement**: Las tarjetas de requisición en estado `PENDIENTE` eran meramente informativas. No existía ningún mecanismo para que el rol `procurement` las aprobara antes de iniciar un cuadro comparativo. El botón "Iniciar comparativa" aparecía directamente sin que nadie validara si la solicitud era procedente.

2. **Sin soporte para imprevistos de obra**: El Residente solo podía requisitar materiales existentes en el catálogo APU. Los materiales que surgen de imprevistos de obra (sin código de catálogo) no tenían flujo. Esto obligaba a crear insumos ficticios en el catálogo o a manejar el imprevisto fuera del sistema.

Adicionalmente, el frontend de `ComprasView` consumía campos que no existían en la respuesta real de la API (`id`, `folio`, `fecha`, `solicitante` vs. `id_requisicion`, `codigo`, `fecha_solicitud`, `solicitante_id`), haciendo que las tarjetas de requisición mostraran datos vacíos en producción.

## What Changes

- `PATCH /api/v1/compras/requisiciones/:id/aprobar` — nuevo endpoint exclusivo para roles `procurement`, `admin`, `superintendent`; idempotente si ya está `APROBADA`
- `POST /api/v1/compras/requisiciones` — extendido para aceptar `tipo` (`NORMAL`/`IMPREVISTO`) e ítems sin `insumo_id` (`descripcion_libre`, `unidad_libre`, `es_imprevisto`)
- Schema `requisiciones`: nuevo campo `tipo VARCHAR(20) DEFAULT 'NORMAL'` + índice parcial
- Schema `requisiciones_items`: `insumo_id` pasa a nullable; nuevos campos `descripcion_libre`, `unidad_libre`, `es_imprevisto`
- `ComprasView.tsx`: normalización de campos API, botón "Aprobar" condicional por rol, badge "Imprevisto", selector NORMAL/IMPREVISTO en form de nueva requisición

## Capabilities

### New Capabilities

- `aprobacion-requisicion`: Procurement puede aprobar requisiciones PENDIENTE/BORRADOR antes de iniciar cotización. El botón "Iniciar comparativa" sigue apareciendo solo en estado APROBADA.
- `requisicion-imprevisto`: El Residente (o cualquier usuario con acceso a Compras) puede crear requisiciones de tipo IMPREVISTO con texto libre, sin necesidad de que el material exista en el catálogo de insumos.

### Modified Capabilities

- `crear-requisicion`: Ahora acepta `tipo` y soporta ítems mixtos (con y sin `insumo_id`). El estado inicial siempre es `PENDIENTE` (antes podía ser `BORRADOR` según la lógica del cliente).
- `visualizar-requisiciones`: Las tarjetas en `ComprasView` ahora muestran datos reales gracias a la normalización de campos API.

## Impact

- **Backend** — `apps/compras/src/main.ts`: 1 endpoint nuevo, 1 endpoint modificado
- **Schema** — `apps/compras/prisma/schema.prisma`: 4 campos nuevos, 1 campo modificado (nullable), 1 índice parcial
- **Migración** — `20260527140000_add_req_imprevisto_y_aprobacion` aplicada manualmente en VPS
- **Frontend** — `apps/app-shell/src/views/ComprasView.tsx`: normalización de campos, lógica de rol, UI condicional
- **Roles afectados**: `procurement`, `admin`, `superintendent` (aprobación); todos los roles con acceso a Compras (creación IMPREVISTO)
- **Sin impacto en**: `finanzas`, `gerencia-tecnica`, `contabilidad`, `auth`, `personal`, `seguridad`, `ventas`
- **Sin breaking changes**: los ítems NORMAL con `insumo_id` funcionan igual que antes
