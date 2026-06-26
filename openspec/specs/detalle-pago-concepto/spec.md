# detalle-pago-concepto

## Schema (Prisma — apps/finanzas)

Campos agregados a `DetallePagoOC` para trazabilidad de pagos por partida APU:

```prisma
model DetallePagoOC {
  id             String   @id @default(uuid())
  pago_id        String
  pago           PagoOC   @relation(fields: [pago_id], references: [id])
  oc_id          String
  oc_folio       String
  proveedor      String
  monto_aplicado Decimal  @db.Decimal(15,2)
  concepto_id    String?  @db.Uuid        // UUID del Concepto (partida APU) en GT — nullable (legacy)
  concepto_clave String?  @db.VarChar(100) // clave desnormalizada para display
  @@map("detalles_pago_oc")
}
```

Migración: `20260625_add_concepto_to_detalle_pago` — ADD COLUMN IF NOT EXISTS (safe, nullable).

## Comportamiento

- `concepto_id` y `concepto_clave` son opcionales — su ausencia es válida (pagos legacy)
- No hay FK cruzada a GT — son campos desnormalizados para performance
- El endpoint `POST /api/v1/finanzas/pagos` acepta ambos campos en cada elemento del array `detalles`
- Los endpoints `GET /api/v1/finanzas/pagos` y `GET /api/v1/finanzas/pagos/:id` incluyen ambos campos en la respuesta (null si no asignados)

## Scenarios

#### Scenario: Nuevo pago con concepto_id
- **WHEN** `POST /api/v1/finanzas/pagos` incluye `detalles[i].concepto_id` y `detalles[i].concepto_clave`
- **THEN** se persisten en `DetallePagoOC` sin validación cruzada

#### Scenario: Pago sin concepto_id (compatibilidad)
- **WHEN** `POST /api/v1/finanzas/pagos` no incluye `concepto_id` en los detalles
- **THEN** `concepto_id = null`, pago se crea normalmente sin error

#### Scenario: Migración sin datos existentes afectados
- **WHEN** se ejecuta `prisma migrate deploy`
- **THEN** columnas nullable agregadas sin tocar filas existentes

#### Scenario: Serialización en GET
- **WHEN** `GET /api/v1/finanzas/pagos/:id`
- **THEN** respuesta incluye `detalles[i].concepto_id` y `detalles[i].concepto_clave` (null si no asignado)
