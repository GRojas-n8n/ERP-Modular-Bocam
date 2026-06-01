# Tasks — GT: Congelación de Versiones de Presupuesto

## 1. Schema

- [ ] 1.1 Agregar `estado String @default("BORRADOR")`, `aprobado_por String? @db.Uuid`,
  `fecha_aprobacion DateTime?` al modelo `Presupuesto` en `apps/gerencia-tecnica/prisma/schema.prisma`.
- [ ] 1.2 Ejecutar `npx prisma migrate dev --name gt-version-presupuesto` y verificar SQL.
- [ ] 1.3 Ejecutar `npx prisma generate`.

## 2. Backend

- [ ] 2.1 Implementar `PATCH /api/v1/gerencia-tecnica/presupuestos/:id/aprobar`:
  - `requireRoles('gerencia_tecnica', 'admin')`
  - Si ya está `APROBADO` → `409`
  - Actualiza: `estado = 'APROBADO'`, `aprobado_por = userId`, `fecha_aprobacion = now()`

- [ ] 2.2 En el endpoint de edición/borrado de `ConceptoPresupuesto`, verificar que el
  presupuesto padre NO esté en `APROBADO` → `409` con mensaje claro si lo está.

- [ ] 2.3 En `GET /presupuestos/:id`, agregar `precio_actual` y `delta_pct` por concepto
  (join con `Insumo.costo_base`) según design.md.

## 3. Frontend — InsumosView

- [ ] 3.1 En la lista de presupuestos, mostrar badge `BORRADOR` (gray) / `APROBADO` (emerald).
- [ ] 3.2 En el detalle del presupuesto, mostrar botón "Aprobar Presupuesto" solo si
  estado es `BORRADOR` y el usuario tiene rol `gerencia_tecnica` o `admin`.
- [ ] 3.3 En la tabla de conceptos, agregar columna "Precio Actual" y "Δ%" con color
  verde (delta negativo = más barato), rojo (delta positivo = más caro), gris (sin cambio).

## 4. Deploy

- [ ] 4.1 Migración en VPS.
- [ ] 4.2 Build y redeploy de `gerencia-tecnica` y `app-shell`.
- [ ] 4.3 Verificar: crear presupuesto, aprobar, intentar editar concepto → debe retornar 409.
