# Tasks — Trazabilidad de Materiales por Proyecto

## Grupo 1 — Schema Prisma (compras)

- [ ] 1.1 Agregar campo `cantidad_presupuestada Decimal? @db.Decimal(18,4)` a modelo `RequisicionItem`
- [ ] 1.2 Agregar campo `concepto_origen_id String? @db.Uuid` a modelo `RequisicionItem`
- [ ] 1.3 Agregar campo `justificacion String? @db.Text` a modelo `RequisicionItem`
- [ ] 1.4 Agregar `@@index([tenant_id, proyecto_id, insumo_id])` a `RequisicionItem`
- [ ] 1.5 Crear modelo `AsignacionExtraConcepto`:
  ```prisma
  model AsignacionExtraConcepto {
    id_asignacion      String   @id @default(uuid()) @db.Uuid
    tenant_id          String   @db.Uuid
    proyecto_id        String   @db.Uuid
    requisicion_item_id String  @db.Uuid
    concepto_id        String   @db.Uuid   // ref a concepto en gerencia-tecnica
    concepto_clave     String   @db.VarChar(100)  // desnormalizado
    concepto_descripcion String @db.Text          // desnormalizado
    monto_extra        Decimal  @db.Decimal(18,4)
    asignado_por       String   @db.Uuid
    created_at         DateTime @default(now())
    @@index([tenant_id, proyecto_id])
    @@index([tenant_id, concepto_id])
    @@map("asignaciones_extra_concepto")
  }
  ```
- [ ] 1.6 Ejecutar `npx prisma generate` en módulo `compras`
- [ ] 1.7 Crear migration SQL manual: `20260609130000_add_trazabilidad_materiales/migration.sql`

## Grupo 2 — Backend: validación en POST /requisiciones

- [ ] 2.1 Recibir y persistir `cantidad_presupuestada`, `concepto_origen_id`, `justificacion` en cada ítem del `POST /api/v1/compras/requisiciones`
- [ ] 2.2 Validar: si `es_imprevisto = true` → `justificacion` no vacía (return 400 si falta)
- [ ] 2.3 Validar: si `cantidad > cantidad_presupuestada` (y `cantidad_presupuestada` fue enviada) → `justificacion` no vacía (return 400 si falta)
- [ ] 2.4 Actualizar `GET /api/v1/compras/requisiciones/:id` para retornar los 3 campos nuevos en cada ítem

## Grupo 3 — Backend: endpoint de trazabilidad

- [ ] 3.1 Crear `GET /api/v1/compras/trazabilidad/materiales`
  - Roles: `procurement`, `admin`, `superintendent`, `resident`, `residencia`, `gerencia_tecnica`
  - Agrega por `(tenant_id, proyecto_id, insumo_id)`:
    - `SUM(cantidad)` de `requisicion_items` → `cantidad_requisicionada`
    - `SUM(cantidad_presupuestada)` MAX por insumo → `cantidad_presupuestada` (toma el max para evitar duplicados de múltiples reqs)
    - `SUM(cantidad_oc)` de `ordenes_compra_items` → `cantidad_oc_emitida` (JOIN via `insumo_id`)
    - `stock_actual` de `almacen_inventario` por `insumo_id` → `cantidad_surtida`
    - `SUM(precio_unitario * cantidad_oc)` → `monto_oc_emitida`
  - Calcula `semaforo` según D5
  - Retorna también extras (`asignaciones_extra_concepto`) agrupados por `concepto_id`
- [ ] 3.2 Manejar insumos que solo tienen `asignaciones_extra_concepto` (sin presupuesto base) → semáforo `EXTRA`

## Grupo 4 — Backend: endpoints de asignación de extras a concepto

- [ ] 4.1 Crear `POST /api/v1/compras/trazabilidad/asignaciones`
  - Roles: `procurement`, `admin`
  - Body: `{ requisicion_item_id, concepto_id, concepto_clave, concepto_descripcion, monto_extra }`
  - Valida que el `requisicion_item_id` pertenece al tenant/proyecto
  - Crea registro en `asignaciones_extra_concepto`
- [ ] 4.2 Crear `DELETE /api/v1/compras/trazabilidad/asignaciones/:id`
  - Roles: `procurement`, `admin`
  - Solo puede eliminar si la OC del ítem no está EMITIDA
- [ ] 4.3 Crear `GET /api/v1/compras/trazabilidad/concepto/:conceptoId`
  - Roles: mismos que trazabilidad
  - Retorna: `monto_base` + lista de `asignaciones_extra` + total

## Grupo 5 — Frontend: ResidenciaView — justificación y persistencia de campos

- [ ] 5.1 Ampliar interfaz `InsumoSeleccionado` con `justificacion: string`
- [ ] 5.2 Mostrar campo de justificación bajo el chip de cantidad cuando:
  - El ítem es de tipo IMPREVISTO, o
  - `cantidad > cantidad_presupuestada`
  - Placeholder: "Justifica el excedente o el material fuera de presupuesto…"
  - Campo requerido visualmente (borde rojo si vacío al intentar generar req)
- [ ] 5.3 Validar en frontend antes de `handleGenerarRequisicion`: ítems que requieren justificación deben tenerla
- [ ] 5.4 En el branch INSUMO de `handleGenerarRequisicion`: incluir `cantidad_presupuestada`, `concepto_origen_id` y `justificacion` en el body de cada ítem al hacer POST
- [ ] 5.5 En el branch APU de `handleGenerarRequisicion`: incluir `concepto_origen_id` (el ID del concepto APU seleccionado) en cada ítem
- [ ] 5.6 En el branch IMPREVISTO: `justificacion` ya existe como `reqNotas`; moverla/copiarla al nivel de cada ítem (o un solo campo global para el IMPREVISTO)

## Grupo 6 — Frontend: ComprasView — Tab Trazabilidad

- [ ] 6.1 Agregar `TabId = 'trazabilidad'` al tipo y al sidebar de Compras
- [ ] 6.2 Agregar el ítem en el sidebar de navegación de ComprasView con badge de count de materiales en ROJO
- [ ] 6.3 Crear estado `trazabilidad: TrazabilidadMaterial[]` y `loadingTrazabilidad`
- [ ] 6.4 Cargar trazabilidad con `GET /trazabilidad/materiales` en `fetchData` (solo si el tab está activo)
- [ ] 6.5 Renderizar tabla de trazabilidad con columnas: Semáforo | Clave | Descripción | Unidad | Presupuestado | Req. | OC Emitida | Surtido | % Avance | Gasto
- [ ] 6.6 Colorear filas según semáforo (verde/amarillo/rojo/gris para EXTRA)
- [ ] 6.7 Para filas EXTRA: mostrar badge "Ext." y columna Presupuestado con "—"
- [ ] 6.8 Mostrar `justificacion` en tooltip o sub-fila expandible (click en la fila)
- [ ] 6.9 Para filas sin asignación de concepto (extras sin asignar): mostrar botón "Asignar a Partida" para procurement/admin
- [ ] 6.10 Mini-panel de asignación: picker de conceptos de gerencia-técnica + campo de monto → llama `POST /trazabilidad/asignaciones`
- [ ] 6.11 Agregar sección "Resumen por Concepto" debajo de la tabla: lista de conceptos con monto_base, monto_extras, total

## Grupo 7 — Frontend: ComprasView — Vista de Detalle por Concepto (extras como incisos)

- [ ] 7.1 Al hacer click en una fila de concepto en el resumen: expandir sub-filas con los incisos extra
- [ ] 7.2 Cada inciso muestra: clave del ítem extra, justificación, monto extra, quién lo asignó
- [ ] 7.3 Botón "Eliminar inciso" para procurement/admin (llama `DELETE /trazabilidad/asignaciones/:id`)

## Grupo 8 — VPS: Deploy

- [ ] 8.1 `docker exec bocam-vps-compras npx prisma migrate deploy` — aplicar migration del grupo 1
- [ ] 8.2 `docker compose build compras` y `up -d compras`
- [ ] 8.3 `docker compose build app-shell` y `up -d app-shell`
- [ ] 8.4 Verificar: `GET /api/v1/compras/trazabilidad/materiales` responde 200 (puede ser lista vacía)
- [ ] 8.5 Verificar: tab Trazabilidad visible en iretum.com → Compras
- [ ] 8.6 Crear req de prueba con excedente → verificar que requiere justificación
- [ ] 8.7 Verificar semáforo ROJO en insumos sin requisición
