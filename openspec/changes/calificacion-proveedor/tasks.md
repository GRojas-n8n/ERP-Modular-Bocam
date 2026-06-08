# Tasks — calificacion-proveedor

## 1. Schema — Nuevo modelo CalificacionProveedor

- [ ] 1.1 Agregar modelo `CalificacionProveedor` en `apps/compras/prisma/schema.prisma`:
  - `id_calificacion` UUID PK
  - `tenant_id` Uuid
  - `proveedor_id` Uuid FK → Proveedor onDelete Cascade
  - `proyecto_id` Uuid
  - `proyecto_nombre` VarChar(255) — desnormalizado al registrar
  - `puntuacion` Decimal(3,2)
  - `comentario` Text nullable
  - `calificado_por` Uuid
  - `calificado_por_nombre` VarChar(255) — desnormalizado al registrar
  - `created_at` DateTime default now()
  - `updated_at` DateTime @updatedAt
  - `@@unique([tenant_id, proveedor_id, proyecto_id])`
  - `@@index([tenant_id, proveedor_id])`
  - `@@map("calificaciones_proveedor")`
- [ ] 1.2 Agregar relación `calificaciones CalificacionProveedor[]` en modelo `Proveedor`
- [ ] 1.3 Ejecutar `npx prisma generate` en `apps/compras` para actualizar el cliente

## 2. Migración SQL manual

- [ ] 2.1 Crear directorio `apps/compras/prisma/migrations/20260608150000_add_calificaciones_proveedor/`
- [ ] 2.2 Escribir `migration.sql`:
  ```sql
  CREATE TABLE "calificaciones_proveedor" (
    "id_calificacion"      UUID         NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            UUID         NOT NULL,
    "proveedor_id"         UUID         NOT NULL,
    "proyecto_id"          UUID         NOT NULL,
    "proyecto_nombre"      VARCHAR(255) NOT NULL,
    "puntuacion"           DECIMAL(3,2) NOT NULL,
    "comentario"           TEXT,
    "calificado_por"       UUID         NOT NULL,
    "calificado_por_nombre" VARCHAR(255) NOT NULL,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "calificaciones_proveedor_pkey" PRIMARY KEY ("id_calificacion"),
    CONSTRAINT "calificaciones_proveedor_proveedor_id_fkey"
      FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "calificaciones_proveedor_tenant_proveedor_proyecto_unique"
      UNIQUE ("tenant_id", "proveedor_id", "proyecto_id")
  );
  CREATE INDEX "calificaciones_proveedor_tenant_id_proveedor_id_idx"
    ON "calificaciones_proveedor"("tenant_id", "proveedor_id");
  ```

## 3. Backend — Endpoint POST (upsert + recálculo)

- [ ] 3.1 Implementar `POST /api/v1/compras/proveedores/:id/calificaciones` — `requireRoles('procurement', 'admin')`:
  - Leer `tenantId`, `proyectoId`, `userId`, `userName` (claim `name`) de `req.securityContext`
  - Validar body: `puntuacion` requerida, entre 0.00 y 5.00; `comentario` opcional
  - Verificar que el proveedor existe (`tenant_id` scope)
  - Resolver `proyecto_nombre`: buscar en los `projects` del JWT claim si está disponible; fallback a `proyectoId` truncado
  - `upsert` en `calificaciones_proveedor` con `where: { tenant_id_proveedor_id_proyecto_id: {...} }`
  - Calcular promedio: `SELECT AVG(puntuacion) FROM calificaciones_proveedor WHERE tenant_id=? AND proveedor_id=?`
  - Actualizar `proveedores.calificacion_desempeno` con el promedio (Decimal, redondear a 2 decimales)
  - Responder `201` con `{ data: calificacion, promedio_actualizado, accion: 'created'|'updated' }`

## 4. Backend — Endpoint GET historial

- [ ] 4.1 Implementar `GET /api/v1/compras/proveedores/:id/calificaciones` — `requireRoles('procurement', 'admin', 'finance', 'gerencia_tecnica', 'superintendent')`:
  - Verificar que el proveedor existe (`tenant_id` scope)
  - Devolver `calificaciones_proveedor` donde `tenant_id=? AND proveedor_id=?`, ordenado `created_at DESC`
  - Incluir en response: array de calificaciones + `promedio_global` (el `calificacion_desempeno` del proveedor)
  - Responder `200` con `{ data: { calificaciones: [...], promedio_global: N, total: N } }`

## 5. Backend — Endpoint DELETE

- [ ] 5.1 Implementar `DELETE /api/v1/compras/proveedores/:id/calificaciones/:cid` — `requireRoles('admin')`:
  - Verificar que la calificación pertenece al proveedor y al tenant
  - Eliminar registro
  - Recalcular `AVG` y actualizar `proveedor.calificacion_desempeno` (null si no quedan calificaciones)
  - Responder `200`

## 6. Frontend — Estado y fetch de calificaciones

- [ ] 6.1 Agregar estado en `ComprasView`:
  - `calHistorialId: string | null` — proveedorId cuyo historial está abierto
  - `calHistorial: Record<string, CalificacionItem[]>` — cache por proveedor
  - `calPromedios: Record<string, number | null>` — cache de promedios
  - `calLoading: boolean`
  - `calPuntuacion: string` — valor del formulario (string para el input)
  - `calComentario: string` — valor del formulario
- [ ] 6.2 Implementar `fetchCalHistorial(proveedorId)` que llama `GET /api/v1/compras/proveedores/:id/calificaciones` y popula `calHistorial` y `calPromedios`
- [ ] 6.3 Agregar botón **★ Calificar** en cada fila de la tabla de proveedores (junto a 📎 Docs y Editar), visible solo para `isProcurement`. Al hacer clic: `setCalHistorialId(id)` + `fetchCalHistorial(id)`

## 7. Frontend — Columna de score enriquecida en tabla

- [ ] 7.1 Actualizar la columna de score en la tabla de proveedores:
  - Mostrar `★ N.N (K)` donde N.N es `calificacion_desempeno` y K es el número de calificaciones (si K > 0)
  - Si `calificacion_desempeno` es null: mostrar `—` en gris
  - Código de color: ≥4.0 = verde esmeralda, 2.5–3.9 = amarillo ámbar, <2.5 = rojo
- [ ] 7.2 En el formulario de edición de proveedor (`SlidePanel`), ocultar el campo `calificacion_desempeno` o mostrarlo como texto read-only con label "Score calculado automáticamente"

## 8. Frontend — SideSheet de historial y calificación

- [ ] 8.1 Agregar `SlidePanel` que se abre cuando `calHistorialId !== null` con `accentColor="amber"` y título "Historial de Calificaciones":
  - Header: nombre del proveedor + promedio actual como badge `★ N.N` con color según rango
  - Lista de calificaciones: por cada item mostrar:
    - Proyecto nombre + fecha (`created_at` formateado a `dd/MM/yyyy`)
    - Estrellitas (filled/empty SVG simples según puntuacion) + valor numérico
    - Comentario en gris si existe
    - Calificado por nombre
    - Botón eliminar (solo `isAdmin`)
  - Estado vacío: "Sin calificaciones registradas. Sé el primero en calificar a este proveedor."
- [ ] 8.2 Sección de formulario (solo `isProcurement`) en el mismo SideSheet:
  - Título de sección: "Calificar en proyecto actual"
  - Badge del proyecto actual (tomado del contexto `tenant.projects[0]?.name` o similar)
  - Input de puntuación: 5 estrellas clicables (1–5) o input numérico 0.0–5.0
  - Textarea de comentario (opcional, max 500 chars)
  - Si ya existe calificación para este proyecto: precargar valores y mostrar "Actualizar calificación"
  - SubmitButton con label "Registrar" / "Actualizar" + estado loading
  - Al confirmar: `POST /calificaciones`, actualizar `calHistorial`, actualizar `proveedoresList` (el score del proveedor)

## 9. Deploy en VPS

- [ ] 9.1 Copiar y ejecutar `migration.sql` en VPS: `prisma db execute --file migration.sql`
- [ ] 9.2 Registrar migración: `prisma migrate resolve --applied 20260608150000_add_calificaciones_proveedor`
- [ ] 9.3 Commit + push al repo, `git pull` en VPS, rebuild: `docker compose up -d --build compras app-shell`
- [ ] 9.4 Verificar: calificar un proveedor con puntuación 4.5 → confirmar que el score aparece en la tabla
- [ ] 9.5 Verificar: calificar el mismo proveedor de nuevo con 3.0 → confirmar que el promedio cambia a 3.75
- [ ] 9.6 Verificar: abrir historial → confirmar que aparecen ambas entradas con nombre de proyecto correcto
