# Spec: salida-almacen-obra

## Propósito

Eslabón faltante entre **Almacén** y **Control de Obra**.
Hoy el EGRESO de inventario es anónimo: los materiales salen pero el sistema no sabe a qué partida ni frente fueron. Este spec cierra ese hueco: cada salida de obra queda vinculada a un `concepto_id` del presupuesto y genera el evento `almacen.salida_obra` que Control de Obra consume para registrar el costo real de material por partida.

---

## Contexto de datos existente

- `MovimientoAlmacen` ya tiene campos `tipo` (INGRESO | EGRESO | TRASPASO), `item_id`, `cantidad`, `referencia`, `responsable`.
- `ItemInventario` ya tiene `insumo_id` → link al catálogo de GT.
- `AvanceFisico` en control-obra referencia `concepto_presupuesto` (clave string) pero no tiene tabla de insumos consumidos.
- El triángulo **presupuestado ↔ comprado ↔ consumido** no puede cerrarse sin este evento.

---

## Schema changes — Almacén

### Requirement: Nuevo tipo EGRESO_OBRA en MovimientoAlmacen
El campo `tipo` en `MovimientoAlmacen` SHALL aceptar un cuarto valor: `EGRESO_OBRA`.
Nuevos campos opcionales para todos los movimientos, **obligatorios** cuando `tipo = EGRESO_OBRA`:

| Campo | Tipo | Descripción |
|---|---|---|
| `concepto_id` | `UUID?` | ID del Concepto del presupuesto en GT (cross-ref) |
| `concepto_clave` | `VARCHAR(100)?` | Clave desnormalizada (ej. "CIM-001") |
| `frente_trabajo` | `VARCHAR(100)?` | Frente de obra (ej. "Frente 2 — Estructura") |
| `oc_item_id` | `UUID?` | OC de la que proviene este lote (opcional — trazabilidad FIFO) |

#### Scenario: Validación EGRESO_OBRA sin concepto_id
- **WHEN** se envía `POST /api/v1/almacen/movimientos` con `tipo: "EGRESO_OBRA"` sin `concepto_id`
- **THEN** el sistema retorna 422 con error `"concepto_id es obligatorio para EGRESO_OBRA"`

#### Scenario: EGRESO_OBRA exitoso
- **WHEN** se envía POST con `tipo: "EGRESO_OBRA"`, `item_id` válido, `concepto_id` y `cantidad <= stock_actual`
- **THEN** el sistema crea el movimiento, resta `cantidad` del `stock_actual` y retorna 201
- **THEN** el sistema publica el evento `almacen.salida_obra` (ver abajo)

#### Scenario: EGRESO_OBRA con stock insuficiente
- **WHEN** `cantidad` supera `stock_actual`
- **THEN** el sistema retorna 422 con `"Stock insuficiente: disponible X, solicitado Y"`
- **THEN** NO se publica ningún evento

---

## Evento publicado: `almacen.salida_obra`

```typescript
{
  event_type: 'almacen.salida_obra',
  timestamp: string,   // ISO 8601
  context: {
    tenant_id:   string,
    proyecto_id: string,
    user_id:     string
  },
  payload: {
    movimiento_id:  string,   // UUID del MovimientoAlmacen
    item_id:        string,   // UUID del ItemInventario
    insumo_id:      string | null,  // UUID del insumo en catálogo GT
    clave:          string,   // Clave del insumo (desnormalizada)
    descripcion:    string,
    unidad:         string,
    cantidad:       number,
    concepto_id:    string,   // UUID del Concepto en GT
    concepto_clave: string,   // Clave del concepto (ej. "CIM-001")
    frente_trabajo: string | null,
    responsable:    string | null,
    fecha:          string    // ISO date
  }
}
```

#### Scenario: Publicación best-effort
- **WHEN** RabbitMQ no está disponible al publicar
- **THEN** el movimiento se registra igual; el evento se pierde silenciosamente (log warn)

---

## Consumidor: Control de Obra

### Requirement: Subscriber almacen.salida_obra → MaterialConsumidoObra
Control de Obra SHALL suscribirse al evento `almacen.salida_obra` y crear un registro en la nueva tabla `MaterialConsumidoObra`.

```
MaterialConsumidoObra {
  id              UUID PK
  tenant_id       UUID
  proyecto_id     UUID
  concepto_id     UUID          -- cross-ref a GT Concepto
  concepto_clave  VARCHAR(100)  -- desnormalizado
  insumo_id       UUID?         -- cross-ref a GT Insumo
  clave_insumo    VARCHAR(50)   -- desnormalizado
  descripcion     VARCHAR(255)  -- desnormalizado
  unidad          VARCHAR(20)
  cantidad        DECIMAL(18,4)
  costo_unitario  DECIMAL(18,4) -- snapshot del costo_base al momento de la salida
  costo_total     DECIMAL(18,2) -- cantidad × costo_unitario
  frente_trabajo  VARCHAR(100)?
  movimiento_id   UUID          -- referencia al MovimientoAlmacen (idempotencia)
  fecha           DATE
  created_at      TIMESTAMPTZ
}
```

#### Scenario: Costo unitario snapshot
- **WHEN** se recibe `almacen.salida_obra`
- **THEN** Control de Obra consulta `GET /api/v1/gerencia-tecnica/insumos/{insumo_id}` para obtener `costo_base` actual
- **THEN** si la consulta falla, `costo_unitario = 0` y se registra con flag `costo_pendiente = true`

#### Scenario: Idempotencia del subscriber
- **WHEN** el mismo evento se recibe dos veces (RabbitMQ redelivery)
- **THEN** el sistema verifica si ya existe `MaterialConsumidoObra` con `movimiento_id` igual; si existe, lo ignora

#### Scenario: Costo real acumulado por concepto
- **WHEN** se llama `GET /api/v1/control-obra/conceptos/{concepto_id}/costo-real`
- **THEN** el sistema retorna `{ concepto_id, concepto_clave, total_consumido_qty, total_consumido_monto, materiales: [...] }`

---

## Endpoint de salidas por concepto (Almacén)

### Requirement: GET /api/v1/almacen/salidas-obra
Almacén SHALL exponer este endpoint retornando movimientos `EGRESO_OBRA` filtrados por `concepto_id` o `frente_trabajo`.

#### Scenario: Filtro por concepto
- **WHEN** `GET /api/v1/almacen/salidas-obra?concepto_id=uuid`
- **THEN** retorna array de movimientos EGRESO_OBRA de ese concepto con `{ fecha, clave, descripcion, cantidad, responsable }`

#### Scenario: Sin filtro
- **WHEN** `GET /api/v1/almacen/salidas-obra` sin parámetros
- **THEN** retorna todos los EGRESO_OBRA del proyecto activo, ordenados por `fecha` desc

---

## Roles autorizados

`EGRESO_OBRA` puede ser registrado por roles: `warehouse`, `resident`, `superintendent`, `admin`.
Los campos `concepto_id` / `concepto_clave` son validados contra el presupuesto activo del proyecto vía lookup interno (o aceptados sin validación si GT no responde — `parcial: true`).
