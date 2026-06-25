# Design — Trazabilidad de Materiales por Proyecto

## Context

El módulo `compras` ya tiene:
- `requisicion_items` con `insumo_id`, `cantidad`, `es_imprevisto`
- `comparativas` + `detalles` con precios por proveedor
- `ordenes_compra` con montos comprometidos
- `almacen_inventario` con stock actual
- `solicitudes_cotizacion` (recién añadidas en flujo-solicitud-cotizacion)

El módulo `gerencia-tecnica` tiene:
- `conceptos` (APU) con su composición de insumos via `concepto_insumos`
- `presupuesto_proyecto` con cantidades y costos base

El problema es que **no hay persistencia de la cantidad presupuestada ni del concepto de origen en la requisición**. Hoy esa información vive solo en el frontend (ResidenciaView la calcula al vuelo desde la composición del APU) pero no se guarda al crear la req.

## Goals

- G1: Cualquier usuario con rol procurement, superintendent, admin o resident puede ver, por proyecto, el semáforo de avance de compras por insumo.
- G2: Los datos de trazabilidad no requieren JOIN en tiempo real contra gerencia-técnica — toda la información necesaria está desnormalizada en `compras`.
- G3: Cada renglón de requisición fuera de presupuesto tiene justificación obligatoria visible para todos los actores.
- G4: Un gasto extra puede vincularse a una partida del catálogo y aparecer como inciso en los totales de esa partida.

## Non-Goals

- No reemplazar el módulo de Control de Obra (avance físico); este feature es solo avance de compras.
- No sincronizar automáticamente con SAT/contabilidad.
- No implementar flujo de aprobación para los incisos extra (v1: cualquier procurement/admin puede asignar).

## Decisions

### D1 — Desnormalizar `cantidad_presupuestada` y `concepto_origen_id` en `requisicion_items`

**Opción A (elegida):** Al crear la req, el frontend envía estos campos en cada ítem del body. El backend los persiste. Las consultas de trazabilidad corren solo contra `compras`.

**Opción B:** Consultar gerencia-técnica en tiempo real para cada query de trazabilidad.

Razón de elección: Evita dependencia síncrona en tiempo de consulta. Si gerencia-técnica está abajo, la trazabilidad sigue funcionando. El precio es una ligera inconsistencia si el presupuesto se modifica después (aceptable en v1 — los presupuestos deberían congelarse antes de iniciar requisiciones, ver DT conocida en CLAUDE.md §19).

### D2 — Tabla `asignaciones_extra_concepto` independiente

Los incisos extra no modifican el modelo `concepto_insumos` en gerencia-técnica (que es un módulo ajeno). Se crea una tabla en `compras` que referencia `concepto_id` (UUID) y `requisicion_item_id`. El endpoint de totales por concepto suma esta tabla.

Esto respeta la regla de no tener JOINs cruzados entre módulos (§4 CLAUDE.md).

### D3 — Justificación obligatoria: validación en backend, no solo frontend

El backend valida en `POST /requisiciones`:
- Si `es_imprevisto = true` → `justificacion` requerida y no vacía.
- Si `cantidad > cantidad_presupuestada` (y `cantidad_presupuestada` fue enviada) → `justificacion` requerida.

El frontend ya muestra la advertencia visual; el backend es la barrera real.

### D4 — Vista Trazabilidad: endpoint agregado en compras

`GET /api/v1/compras/trazabilidad/materiales` devuelve la lista consolidada por `insumo_id`:

```json
{
  "insumo_id": "uuid",
  "clave": "VAR-3/8",
  "descripcion": "Varilla corrugada ∅3/8\"",
  "unidad": "KG",
  "cantidad_presupuestada": 4500,
  "cantidad_requisicionada": 3200,
  "cantidad_oc_emitida": 2000,
  "cantidad_surtida": 1500,
  "monto_oc_emitida": 48000.00,
  "pct_avance_req": 71.1,
  "pct_avance_oc": 44.4,
  "semaforo": "AMARILLO",
  "es_extra": false,
  "extras": []
}
```

La columna `cantidad_surtida` es una aproximación usando `almacen_inventario.stock_actual` filtrado por `insumo_id` — suficiente para v1 sin integración profunda con almacén.

### D5 — `semaforo` calculado en backend

| Condición | Semáforo |
|---|---|
| `cantidad_oc_emitida >= cantidad_presupuestada` | `VERDE` |
| `cantidad_requisicionada > 0` | `AMARILLO` |
| `cantidad_requisicionada == 0` y `cantidad_presupuestada > 0` | `ROJO` |
| `es_extra = true` (no tenía presupuesto) | `EXTRA` |

### D6 — Roles: trazabilidad visible para todos los roles con acceso al proyecto

`requireRoles('procurement', 'admin', 'superintendent', 'resident', 'residencia', 'gerencia_tecnica')`

La asignación de extras a concepto solo la puede hacer `procurement` y `admin`.

### D7 — Tab de Trazabilidad en ComprasView

Se agrega una nueva `TabId = 'trazabilidad'` al sidebar de Compras. El tab es visible para los roles listados en D6. La tabla es de solo-lectura para resident/residencia/gerencia_tecnica; procurement/admin pueden hacer la asignación de incisos desde ahí.

## Risks

| Riesgo | Mitigación |
|---|---|
| La `cantidad_presupuestada` se vuelve obsoleta si el presupuesto cambia | Agregar campo `presupuesto_snapshot_fecha` en `requisicion_items`; marcar visualmente si el presupuesto fue modificado después |
| La consulta de trazabilidad puede ser lenta en proyectos grandes | Agregar índice en `(tenant_id, proyecto_id, insumo_id)` en `requisicion_items` |
| Residencia no siempre conoce `cantidad_presupuestada` (ej. imprevistos) | `cantidad_presupuestada` es nullable; si es null el semáforo reporta `EXTRA` |

## Migration Plan

1. `ALTER TABLE compras.requisicion_items` — ADD 3 columnas (nullable para retrocompatibilidad):
   - `cantidad_presupuestada DECIMAL(18,4)`
   - `concepto_origen_id UUID`
   - `justificacion TEXT`
2. CREATE TABLE `compras.asignaciones_extra_concepto`
3. Sin migración de datos históricos (las reqs existentes quedan con NULL en los nuevos campos — el semáforo las trata como EXTRA si `cantidad_presupuestada IS NULL`)
