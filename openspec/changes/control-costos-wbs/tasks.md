## 1. Schema gerencia-tecnica — Categorías de gasto

- [x] 1.1 Crear tabla `categorias_gasto`
- [x] 1.2 Agregar campo `categoria_gasto_id` (UUID nullable) a `insumos`
- [x] 1.3 Crear tabla `proyecto_costos_config` en gerencia-tecnica (CONFIGURACION/ACTIVO/CERRADO)
- [x] 1.4 Crear migration SQL `20260610200000_add_categorias_gasto` en `apps/gerencia-tecnica`
- [x] 1.5 Regenerar cliente Prisma en `apps/gerencia-tecnica`
- [x] 1.6 Seed automático de 10 categorías predefinidas en `getOrCreateProyectoConfig`

## 2. Schema compras — Partida obligatoria en req y vínculo OC→req

- [x] 2.1 Agregar campo `concepto_id` (UUID nullable) a `requisiciones`
- [x] 2.2 Agregar campo `requisicion_id` (UUID nullable) a `ordenes_compra`
- [x] 2.3 Crear migration SQL `20260610200001_add_concepto_req_y_req_oc` en `apps/compras`
- [x] 2.4 Regenerar cliente Prisma en `apps/compras`

## 3. Backend gerencia-tecnica — CRUD categorías de gasto

- [x] 3.1 `GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/categorias-gasto`
- [x] 3.2 `POST /api/v1/gerencia-tecnica/proyectos/:proyecto_id/categorias-gasto`
- [x] 3.3 `PUT /api/v1/gerencia-tecnica/categorias-gasto/:id`
- [x] 3.4 `DELETE /api/v1/gerencia-tecnica/categorias-gasto/:id`
- [x] 3.5 `PUT /api/v1/gerencia-tecnica/proyectos/:id/estado-costos`
- [x] 3.6 Seed automático al primer GET de categorías si está vacío

## 4. Backend gerencia-tecnica — Asignación de categoría al insumo

- [x] 4.1 `PUT /api/v1/gerencia-tecnica/insumos/:id/categoria` (roles: control_obra, gerencia_tecnica, admin)
- [x] 4.2 `PUT /api/v1/gerencia-tecnica/insumos/clasificacion-bulk`
- [x] 4.3 `GET /api/v1/gerencia-tecnica/insumos` devuelve `categoria_gasto_id` y `categoria_gasto_nombre`

## 5. Backend gerencia-tecnica — Endpoints de costos WBS

- [x] 5.1 `GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-wbs`
- [x] 5.2 `GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-categorias`

## 6. Backend compras — Partida obligatoria y vínculo OC

- [x] 6.1 Validar `concepto_id` en `POST /api/v1/compras/requisiciones`
- [x] 6.2 `GET /api/v1/compras/proyectos/:id/acumulado-por-concepto` (nuevo endpoint para GT)
- [x] 6.3 OC hereda `requisicion_id` desde comparativa al emitir
- [x] 6.4 Frontend llama directo a GT para conceptos del proyecto

## 7. Frontend — ControlObraView: clasificación de insumos (Control de Proyectos)

- [x] 7.1 Tab "Configuración" visible para roles `control_obra`, `admin` en ControlObraView
- [x] 7.2 Sección "Clasificación de Insumos" agrupada por `tipo_insumo`
- [x] 7.3 Botón "Auto-clasificar" aplica mapeo tipo_insumo → categoría
- [x] 7.4 Botón "Aplicar a todos" por tipo_insumo con selector de categoría
- [x] 7.5 Selector individual de categoría por insumo
- [x] 7.6 Barra de progreso: X/Y clasificados · Z sin categoría
- [x] 7.7 Insumos sin clasificar destacados con badge amber

## 8. Frontend — AdminView: gestión de categorías y estado del proyecto

- [x] 8.1 Sub-view "categorias" en AdminView con lista y gestión de categorías de gasto
- [x] 8.2 Lista de categorías con Editar/Eliminar deshabilitados si proyecto ACTIVO
- [x] 8.3 Formulario "Nueva categoría" con validación + Enter key
- [x] 8.4 Botón "Activar Proyecto" con modal de confirmación
- [x] 8.5 Badge de estado del proyecto (CONFIGURACION/ACTIVO/CERRADO)

## 9. Frontend — ResidenciaView: selector de partida en formulario de req

- [x] 9.1 Agregar selector "Partida del catálogo *" como primer campo en el formulario de nueva req (flujos INSUMO e IMPREVISTO)
- [x] 9.2 Deshabilitar botón "Generar Requisición" hasta que haya partida seleccionada
- [x] 9.3 Presupuesto de partida no implementado en esta iteración (fuera del MVP)
- [x] 9.4 Flujo APU: `concepto_id` se llena desde `conceptoSeleccionado.id`
- [x] 9.5 Mostrar `[clave] descripción` en cards de req del Residente

## 10. Frontend — ComprasView: selector de partida y visualización

- [x] 10.1 Agregar selector de partida en el formulario de nueva req de ComprasView
- [x] 10.2 En los cards de req, mostrar la partida vinculada: `[01.001] Cimentación`
- [x] 10.3 Filtro por partida del catálogo en la lista de reqs

## 11. Frontend — InsumosView (GT): tab "Control de Costos"

- [x] 11.1 Tab "Control de Costos" en InsumosView (control-costos sub-view)
- [x] 11.2 KPI cards: Presupuesto Total, Comprometido, Pagado, Partidas en Riesgo
- [x] 11.3 Tabla WBS: Clave, Descripción, Presupuesto, Comprometido, Pagado, % Económico, Semáforo
- [x] 11.4 Expansión de fila: desglose por categoría + requisiciones vinculadas
- [x] 11.5 Filtro por categoría y toggle "Solo con desviación"
- [x] 11.6 Botón "Actualizar" que recarga costos WBS

## 12. Frontend — ControlObraView: tab "Costos"

- [x] 12.1 Tab "Costos" en ControlObraView (costos sub-view)
- [x] 12.2 KPI cards: Presupuesto Total, Comprometido, Pagado, % Avance Físico Global
- [x] 12.3 Barras de progreso por categoría (doble barra comprometido + pagado)
- [x] 12.4 Sección "Alertas de desviación" con partidas 🔴 y 🟡
- [x] 12.5 Desglose alertas inline (sin tabla adicional — funcional para MVP)

## 13. Integración y deploy

- [ ] 13.1 Aplicar migraciones en VPS: `gerencia-tecnica` y `compras`
- [ ] 13.2 Seed automático (lazy-init en primer GET de categorías)
- [ ] 13.3 Rebuild y restart de `gerencia-tecnica` en VPS
- [ ] 13.4 Rebuild y restart de `compras` en VPS
- [ ] 13.5 Rebuild y restart de `app-shell` en VPS
- [ ] 13.6 Verificar: crear req con partida → aparece la partida en el card
- [ ] 13.7 Verificar: emitir OC desde comparativa → OC hereda `requisicion_id`
- [ ] 13.8 Verificar: dashboard GT muestra Comprometido correcto para una partida con OCs
- [ ] 13.9 Verificar: semáforo 🔴 aparece cuando % económico > 130%
- [ ] 13.10 Verificar: admin puede agregar/editar categorías en CONFIGURACION y no puede en ACTIVO
