# Proposal — Trazabilidad de Materiales por Proyecto

## Why

Hoy el sistema captura requisiciones, solicitudes de cotización, comparativas y órdenes de compra, pero **ningún actor puede responder en tiempo real preguntas como**:

- ¿Cuánta varilla del ∅3/8" necesita el proyecto, cuánta ya se requisitó, cuánta ya tiene OC y cuánta llegó al almacén?
- ¿Qué % del presupuesto de materiales ya está comprometido?
- ¿Qué partidas del catálogo todavía no tienen ninguna requisición?

Adicionalmente, cuando se requisita algo **fuera del presupuesto** (imprevisto, excedente de cantidad, material de emergencia) no existe ningún mecanismo para:

1. Exigir una justificación al requisitante que explique el motivo.
2. Vincular ese gasto extra a una partida del catálogo de conceptos, para que el presupuesto de esa partida refleje el costo total real (presupuestado + extras).

## What Changes

### Cap 1 — Justificación de excedentes e imprevistos
Nuevo campo `justificacion` en cada renglón de requisición. Obligatorio cuando:
- El ítem es de tipo IMPREVISTO (`es_imprevisto = true`), o
- La cantidad solicitada supera la `cantidad_presupuestada`.

El Residente escribe texto libre explicando la causa (ej. "Retroexcavadora reventó puesta a tierra — reposición urgente de cable cobre desnudo").

### Cap 2 — Persistencia del vínculo con el presupuesto
Al crear una requisición desde el catálogo de conceptos / explosión de insumos / APU, se persisten en la BD:
- `cantidad_presupuestada` — cantidad que el presupuesto asigna a ese insumo en el proyecto
- `concepto_origen_id` — ID del concepto APU de donde proviene el insumo (nullable; null si el material no viene de un APU)

Esto permite calcular avance sin depender de una consulta cruzada en tiempo real a gerencia-técnica.

### Cap 3 — Asignación de extras a concepto (incisos)
Para ítems fuera de presupuesto (IMPREVISTO o excedente), Compras o el Residente puede asignar ese renglón a una partida del catálogo de conceptos como "inciso extra". La tabla `asignaciones_extra_concepto` guarda esta relación.

El total presupuestal de un concepto pasa a mostrar: **monto_base + Σ(extras asignados)**.

### Cap 4 — Vista Trazabilidad de Materiales
Nueva pestaña "Trazabilidad" en ComprasView (visible para procurement, superintendent, admin, resident).

Muestra una tabla consolidada por insumo con columnas:
| Clave | Descripción | Unidad | Pres. | Req. | Cotiz. | OC Emitida | Surtido | % Avance | Gasto |
|---|---|---|---|---|---|---|---|---|---|

Semáforo por fila:
- 🟢 OC emitida ≥ 100% de lo presupuestado
- 🟡 Requisición creada pero sin OC completa
- 🔴 Sin ninguna requisición aún
- ⚪ Material extra (no estaba en presupuesto)

### Cap 5 — Vista de Partidas con Extras
En la vista de Trazabilidad, al expandir un concepto APU se listan sus extras asignados como sub-filas con badge "inciso" y su justificación visible.

## Out of Scope (v1)
- Integración automática con almacén para calcular "surtido" (se usa stock de `almacen_inventario` como proxy)
- Notificaciones automáticas cuando una partida supera su presupuesto
- Exportación a PDF/Excel del reporte de trazabilidad
- Portal de proveedor para responder cotizaciones digitalmente

## Impact

| Módulo | Tipo de cambio |
|---|---|
| `compras` schema | 2 campos nuevos en `requisicion_items` + 1 tabla nueva `asignaciones_extra_concepto` |
| `compras` backend | 4 endpoints nuevos (trazabilidad, asignación) + validación en POST /requisiciones |
| `app-shell` frontend | ResidenciaView: campo justificación + persistir qty_presupuestada/concepto_origen; ComprasView: tab Trazabilidad + UI de asignación |
| `gerencia-tecnica` | Endpoint nuevo o extensión: totales de concepto incluyendo extras |
