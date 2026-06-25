## Why

El sistema no tiene forma de saber a qué partida del catálogo de conceptos pertenece cada requisición, ni de acumular el gasto comprometido y pagado por partida. Sin este vínculo, Control de Proyectos no puede comparar el presupuesto vendido al cliente contra la ejecución física y económica real, impidiendo detectar desviaciones de costo a tiempo.

## What Changes

- Agregar catálogo de **categorías de gasto** predefinidas por el sistema, configurables por **Control de Proyectos** antes de iniciar el proyecto y congeladas al activarlo (por Centro de Costos / proyecto).
- **Control de Proyectos** asigna una **categoría de gasto** a cada insumo del catálogo global (`categoria_gasto` en la tabla de insumos de `gerencia-tecnica`). El sistema auto-clasifica por `tipo_insumo` y CP solo corrige excepciones.
- Vincular **obligatoriamente** cada requisición a una **partida del catálogo de conceptos** del proyecto (relación N:1 — una partida tiene muchas reqs, una req pertenece a una sola partida).
- Acumular en cada partida: **Presupuesto**, **Comprometido** (OCs emitidas) y **Pagado** (pagos registrados).
- Nueva vista **Control de Proyectos — Control de Costos WBS**: tabla partida × (Presupuesto / Comprometido / Pagado / % Económico / % Físico / Semáforo de desviación).
- Nueva vista **Control de Proyectos — Análisis por Categoría**: tabla categoría × montos acumulados del proyecto.

## Capabilities

### New Capabilities

- `categorias-gasto`: Catálogo de categorías de gasto predefinidas por el sistema (auto-mapeo desde `tipo_insumo`), gestionadas por **Control de Proyectos** en ControlObraView. Personalizables por tenant antes de activar el proyecto; congeladas al inicio. CP asigna/corrige la categoría de cada insumo del catálogo global con herencia automática a todos los proyectos.
- `partida-req-obligatoria`: Selector de partida del catálogo de conceptos en el header del formulario de requisición (ResidenciaView y ComprasView). La req no puede enviarse sin partida asignada. El flujo APU hereda `concepto_origen_id` automáticamente.
- `acumulado-costos-partida`: Cálculo de Comprometido (suma OCs EMITIDA/APROBADA vinculadas a la partida) y Pagado (suma pagos) por partida. Endpoint `GET /proyectos/:id/costos-wbs` en `gerencia-tecnica`.
- `dashboard-costos-wbs`: Vista en ControlObraView (tab "Control de Costos") con tabla partida × ejecución física y económica, semáforo de desviación, filtrable por categoría.
- `dashboard-costos-categorias`: Vista en ControlObraView (tab "Costos por Categoría") con barras de progreso por categoría, alertas de desviación y tabla de requisiciones vinculadas.

### Modified Capabilities

- `requisicion-creacion`: Agrega campo obligatorio `concepto_id` (partida) al header de la req. Valida que esté presente antes de guardar.

## Impact

- **`gerencia-tecnica`**: schema (campo `categoria_gasto_id` en insumos, tabla `categorias_gasto`), endpoints de lectura de insumos y CRUD de categorías accesibles para rol `control_obra`.
- **`compras`**: schema (campo `concepto_id` obligatorio en `requisiciones`, campo `requisicion_id` en `ordenes_compra`), validación backend.
- **`control-obra`**: nuevos endpoints de costos WBS y categorías; vistas de análisis en ControlObraView.
- **`app-shell`**: formulario de req (ResidenciaView y ComprasView), nueva tab "Control de Costos" y "Costos por Categoría" en ControlObraView, sección de clasificación de insumos en ControlObraView.
- Sin cambios en `finanzas`, `auth`, `personal` ni otros módulos.
