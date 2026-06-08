# Design — calificacion-proveedor

## Context

El módulo `compras` ya tiene la tabla `proveedores` con `calificacion_desempeno Decimal(3,2)` como campo libre. La nueva tabla `calificaciones_proveedor` añade historial por proyecto y el campo existente pasa a ser el promedio calculado.

El `proyecto_id` y `tenant_id` para las calificaciones vienen del JWT (`req.securityContext`), igual que en todo el sistema.

## Goals

- Trazabilidad completa: quién calificó, cuándo, en qué proyecto, con qué comentario.
- Score global (`calificacion_desempeno`) siempre consistente con el historial.
- UX mínima: una acción en el catálogo, no un flujo multi-paso.

## Non-Goals

- Calificación automática basada en OCs (fase futura).
- Dimensiones múltiples de evaluación (fase futura).
- Exportación de historial a PDF/Excel (fase futura).

## Decisions

### D1: Unicidad (proveedor, proyecto) con UPDATE implícito

Una sola calificación por par `(tenant_id, proveedor_id, proyecto_id)`. El endpoint `POST /calificaciones` usa `upsert` (Prisma): si ya existe una calificación para ese proyecto, la actualiza; si no, la crea. La respuesta indica si fue `created` o `updated`. Esto simplifica la UX (un solo botón "Calificar / Actualizar").

**Por qué:** Evita acumulación de duplicados por error. El usuario puede corregir una calificación sin flujo adicional de "editar".

### D2: Recálculo del promedio en el mismo request

Tras el upsert, el handler calcula `AVG(puntuacion)` sobre todas las calificaciones del proveedor en el mismo `createTenantContext` y actualiza `proveedor.calificacion_desempeno`. No hay worker asíncrono ni trigger de BD.

**Por qué:** El volumen de calificaciones por proveedor es bajo (un registro por proyecto). Un `AVG` sobre <100 filas es instantáneo. Mantener el cálculo en el handler evita desincronización.

### D3: `proyecto_id` viene del JWT, no de un selector libre

El usuario califica en el proyecto al que está logeado (`req.securityContext.proyectoId`). No puede calificar en nombre de otro proyecto.

**Por qué:** Garantiza que la calificación corresponde a experiencia real del usuario en ese proyecto. Evita calificaciones fantasma.

### D4: Historial visible en SideSheet separado del de documentos

El botón "★ Historial" abre un SideSheet independiente al de "📎 Docs". El SideSheet muestra la lista cronológica de calificaciones y, si el usuario es `procurement`/`admin`, el formulario de calificación para el proyecto actual.

**Por qué:** Mezclar documentos y calificaciones en un SideSheet genera una UI sobrecargada y flujos confusos.

### D5: `calificacion_desempeno` en formulario de proveedor pasa a read-only

El campo ya no es editable directamente. Se muestra como badge de score con tooltip "Calculado automáticamente del historial de calificaciones". La edición manual del score queda bloqueada.

**Por qué:** Mantener la edición directa crea inconsistencia entre el valor manual y el promedio calculado.

## Schema

```prisma
model CalificacionProveedor {
  id_calificacion  String   @id @default(uuid()) @db.Uuid
  tenant_id        String   @db.Uuid
  proveedor_id     String   @db.Uuid
  proyecto_id      String   @db.Uuid
  puntuacion       Decimal  @db.Decimal(3, 2)   // 0.00 – 5.00
  comentario       String?  @db.Text
  calificado_por   String   @db.Uuid             // userId del JWT
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  proveedor        Proveedor @relation(fields: [proveedor_id], references: [id_proveedor], onDelete: Cascade)

  @@unique([tenant_id, proveedor_id, proyecto_id])
  @@index([tenant_id, proveedor_id])
  @@map("calificaciones_proveedor")
}
```

## Endpoints

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/compras/proveedores/:id/calificaciones` | `procurement`, `admin` | Upsert de calificación para el proyecto del JWT. Recalcula promedio. |
| `GET` | `/api/v1/compras/proveedores/:id/calificaciones` | `procurement`, `admin`, `finance`, `gerencia_tecnica`, `superintendent` | Historial de calificaciones del proveedor, ordenado por `created_at DESC`. |
| `DELETE` | `/api/v1/compras/proveedores/:id/calificaciones/:cid` | `admin` | Elimina calificación y recalcula promedio. Solo admin. |

### POST body
```json
{ "puntuacion": 4.5, "comentario": "Entregó a tiempo, calidad del material correcta." }
```

### GET response item
```json
{
  "id_calificacion": "uuid",
  "proyecto_id": "uuid",
  "proyecto_nombre": "CFE - Carbonser",   // lookup por proyecto_id contra lista de proyectos del token
  "puntuacion": 4.5,
  "comentario": "...",
  "calificado_por": "uuid",
  "calificado_por_nombre": "Fabiola Compras",
  "created_at": "2026-06-08T...",
  "updated_at": "2026-06-08T..."
}
```

**Nota:** `proyecto_nombre` y `calificado_por_nombre` se resuelven en el backend consultando las tablas `proyectos` del módulo `auth` o incluyéndolo en el payload del JWT. Dado que el JWT solo lleva el proyecto activo, los nombres de proyectos históricos se omiten si no están disponibles (se muestra el `proyecto_id` truncado como fallback).

> **D6 — Resolución de nombres de proyecto:** Los nombres de proyectos históricos se guardan en `CalificacionProveedor` como campo desnormalizado `proyecto_nombre VARCHAR(255)` al momento del registro. Esto evita la necesidad de llamadas al módulo `auth` en cada GET de historial y protege contra renombrados futuros de proyectos.

> **D7 — Resolución de nombre del calificador:** Similar a D6, guardar `calificado_por_nombre VARCHAR(255)` al registrar. El nombre viene del JWT claim `name`.

## Migration Plan

1. Crear tabla `calificaciones_proveedor` con la constraint `@@unique([tenant_id, proveedor_id, proyecto_id])`.
2. El campo `calificacion_desempeno` en `proveedores` se mantiene como está (Decimal nullable). No hay migración de datos existentes.
3. Bloquear edición directa del campo solo en frontend (no en BD — podría usarse para correcciones administrativas futuras vía SQL).

## Risks

| Riesgo | Mitigación |
|---|---|
| Usuario califica en proyecto equivocado | El proyecto viene del JWT — no hay selector manual; si el proyecto es incorrecto, es un problema de login, no de calificación |
| Score inconsistente si se eliminan calificaciones | El DELETE de admin recalcula el promedio inmediatamente |
| Proyecto histórico sin nombre disponible | D6 resuelto con `proyecto_nombre` desnormalizado al registrar |
