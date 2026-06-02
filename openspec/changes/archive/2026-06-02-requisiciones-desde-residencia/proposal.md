## Why

El botón "Generar Requisición" que cierra el ciclo APU → Compras vivía en `InsumosView.tsx`, que pertenece al módulo de Gerencia Técnica (puerto 3001). Cuando se configure el RBAC real de producción, el rol `resident` no tendrá acceso a la vista de Gerencia Técnica — su scope es exclusivamente su frente de obra.

Esto significaba que **el flujo diseñado era inalcanzable para el usuario que más lo necesita**: el Residente es quien ejecuta el take-off, calcula los materiales necesarios y los requisi­ta. Sin acceso a InsumosView, el Residente no podía generar requisiciones desde el sistema.

Adicionalmente, el flujo de take-off en InsumosView estaba diseñado para Gerencia Técnica (acceso a insumos individuales del catálogo, importación de OPUS, etc.). El Residente necesita un flujo diferente: seleccionar un **concepto APU completo** del presupuesto activo e ingresar una cantidad a ejecutar — más cercano a su forma de trabajar en campo.

## What Changes

- `ResidenciaView.tsx`: nuevo tab "Requisiciones" con badge de contador de pendientes
- Flujo NORMAL (desde APU): búsqueda de conceptos del presupuesto activo → selección → cantidad → composición calculada (solo MATERIAL) → botón "Generar Requisición"
- Flujo IMPREVISTO: formulario de texto libre idéntico al de ComprasView pero adaptado al contexto del Residente
- Lista de requisiciones propias con estado visible
- KPIs: total, pendientes, aprobadas, imprevistos

## Capabilities

### New Capabilities

- `requisicion-desde-apu-residente`: El Residente puede crear una requisición de compra seleccionando un concepto APU del presupuesto activo e ingresando la cantidad a ejecutar. El sistema calcula automáticamente los MATERIALES de la composición × cantidad y genera la requisición en Compras.
- `requisicion-imprevisto-residente`: El Residente puede crear una requisición de tipo IMPREVISTO (texto libre) desde su propia vista, sin acceder al módulo de Gerencia Técnica.

### Modified Capabilities

- `take-off-gt` (InsumosView): Conserva su funcionalidad intacta para uso de Gerencia Técnica. No se modifica.

## Impact

- **Frontend exclusivamente** — `apps/app-shell/src/views/ResidenciaView.tsx`: +637 líneas, nuevo tab, nuevos tipos, nuevos handlers
- **Sin cambios de backend**: usa los endpoints existentes de `gerencia-tecnica` y `compras`
  - `GET /api/v1/gerencia-tecnica/presupuesto/activo` — para obtener los conceptos APU
  - `GET /api/v1/gerencia-tecnica/conceptos/:id/composicion` — composición del concepto seleccionado
  - `POST /api/v1/compras/requisiciones` — crear la requisición (ya existente)
  - `GET /api/v1/compras/requisiciones` — listar las reqs propias
- **Roles afectados**: `resident`, `residencia` (vistas afectadas), `control_obra`
- **Sin breaking changes**: ningún endpoint modificado, ningún schema modificado
- **Nota RBAC**: `ResidenciaView` no verifica roles explícitamente para este tab — el acceso a la vista ya está controlado por el routing de `App.tsx` que solo muestra `ResidenciaView` al rol `residencia`
