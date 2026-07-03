# Tasks — GT: Congelación de Versiones de Presupuesto

## 1. Schema

- [x] 1.1 Agregar `estado String @default("BORRADOR")`, `aprobado_por String? @db.Uuid`,
  `fecha_aprobacion DateTime?` al modelo `Presupuesto` en `apps/gerencia-tecnica/prisma/schema.prisma`.
- [x] 1.2 Ejecutar `npx prisma migrate dev --name gt-version-presupuesto` y verificar SQL.
- [x] 1.3 Ejecutar `npx prisma generate`.

## 2. Backend

- [x] 2.1 Implementar `PATCH /api/v1/gerencia-tecnica/presupuestos/:id/aprobar`:
  - `requireRoles('gerencia_tecnica', 'admin')`
  - Si ya está `APROBADO` → `409`
  - Actualiza: `estado = 'APROBADO'`, `aprobado_por = userId`, `fecha_aprobacion = now()`

- [x] 2.2 En el endpoint de edición/borrado de `ConceptoPresupuesto`, verificar que el
  presupuesto padre NO esté en `APROBADO` → `409` con mensaje claro si lo está.

- [x] 2.3 En `GET /presupuestos/:id`, agregar `precio_actual` y `delta_pct` por concepto
  (join con `Insumo.costo_base`) según design.md. (Implementado en GET /presupuestos list — incluye todos los conceptos con delta_pct)

## 3. Frontend — InsumosView

- [x] 3.1 En la lista de presupuestos, mostrar badge `BORRADOR` (gray) / `APROBADO` (emerald).
- [x] 3.2 En el detalle del presupuesto, mostrar botón "Aprobar Presupuesto" solo si
  estado es `BORRADOR` y el usuario tiene rol `gerencia_tecnica` o `admin`.
- [x] 3.3 En la tabla de conceptos, agregar columna "Precio Actual" y "Δ%" con color
  verde (delta negativo = más barato), rojo (delta positivo = más caro), gris (sin cambio).

## 4. Deploy

- [x] 4.1 Migración en VPS. (Columnas ya presentes en bocam_gerencia_tecnica: estado, aprobado_por, fecha_aprobacion — migración aplicada en sesión anterior)
- [x] 4.2 Build y redeploy de `gerencia-tecnica` y `app-shell`. (Ya en producción)
- [x] 4.3 Verificar: GET /presupuestos → estado=APROBADO, delta_pct=146.6%; PATCH /aprobar → HTTP 409 ALREADY_APROBADO; POST /composicion-apu → HTTP 409 PRESUPUESTO_APROBADO ✅ (2026-07-02)
