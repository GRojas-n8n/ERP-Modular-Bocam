# eventos-pago

## Eventos publicados (Finanzas → RabbitMQ)

Exchange: `bocam.events` (topic)

### `finanzas.oc_pagada_parcial`
```json
{
  "oc_id": "uuid",
  "oc_folio": "OC-2026-012",
  "monto_aplicado": 40000.00,
  "saldo_pendiente": 45000.00,
  "pago_id": "uuid",
  "fecha_pago": "2026-06-25T10:00:00Z"
}
```
Publicado cuando `monto_aplicado < (monto_total_oc - pagos_previos)`.

### `finanzas.oc_pagada_total`
```json
{
  "oc_id": "uuid",
  "oc_folio": "OC-2026-012",
  "monto_aplicado": 45000.00,
  "saldo_pendiente": 0,
  "pago_id": "uuid",
  "fecha_pago": "2026-06-25T10:00:00Z"
}
```
Publicado cuando `saldo_pendiente = 0`.

## Consumidor: Compras

`apps/compras` se suscribe a:
- `finanzas.oc_pagada_parcial` → `UPDATE ordenes_compra SET estado_pago = 'PAGO_PARCIAL' WHERE id = oc_id`
- `finanzas.oc_pagada_total` → `UPDATE ordenes_compra SET estado_pago = 'PAGADA' WHERE id = oc_id`

### Campo nuevo en OC (Compras schema)

```prisma
// En model OrdenCompra
estado_pago String @default("PENDIENTE_PAGO") // PENDIENTE_PAGO | PAGO_PARCIAL | PAGADA
```

## Idempotencia

El evento lleva `pago_id`. Compras verifica que no haya procesado ya ese `pago_id` antes de actualizar. Tabla `eventos_procesados` con `(event_type, pago_id)` unique constraint.
