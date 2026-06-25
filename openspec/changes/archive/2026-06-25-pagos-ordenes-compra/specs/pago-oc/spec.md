# pago-oc

## Schema (Prisma — apps/finanzas)

```prisma
enum FuentePago {
  ANTICIPO
  CUENTA_BANCARIA
}

enum TipoPago {
  CHEQUE
  TRANSFERENCIA
  EFECTIVO
}

model PagoOC {
  id                String        @id @default(uuid())
  tenant_id         String
  proyecto_id       String
  fuente            FuentePago
  cuenta_bancaria_id String?      // null si fuente = ANTICIPO
  cuenta_bancaria   CuentaBancaria? @relation(fields: [cuenta_bancaria_id], references: [id])
  tipo_pago         TipoPago
  referencia        String?       // número de cheque, folio de transferencia
  monto_total       Decimal       @db.Decimal(15,2)
  fecha_pago        DateTime
  concepto          String?
  detalles          DetallePagoOC[]
  created_at        DateTime      @default(now())
  @@map("pagos_oc")
}

model DetallePagoOC {
  id             String   @id @default(uuid())
  pago_id        String
  pago           PagoOC   @relation(fields: [pago_id], references: [id])
  oc_id          String   // UUID de la OC en Compras — sin FK cruzada
  oc_folio       String   // almacenado para display sin consultar Compras
  proveedor      String   // almacenado para display
  monto_aplicado Decimal  @db.Decimal(15,2)
  @@map("detalles_pago_oc")
}
```

## Endpoints

```
GET  /api/v1/finanzas/pagos?proyectoId=<uuid>&proveedorId=<uuid>&estado=<...>
  → Array<PagoOC> con detalles

POST /api/v1/finanzas/pagos
  Body: {
    proyecto_id: string,
    fuente: "ANTICIPO" | "CUENTA_BANCARIA",
    cuenta_bancaria_id?: string,       // requerido si fuente = CUENTA_BANCARIA
    tipo_pago: "CHEQUE" | "TRANSFERENCIA" | "EFECTIVO",
    referencia?: string,
    fecha_pago: string (ISO),
    concepto?: string,
    detalles: Array<{
      oc_id: string,
      oc_folio: string,
      proveedor: string,
      monto_aplicado: number
    }>
  }
  → 201 PagoOC creado con detalles

GET  /api/v1/finanzas/pagos/:id
  → PagoOC con detalles
```

## Lógica de negocio al crear pago

1. Validar `monto_total = sum(detalles.monto_aplicado)`
2. Si `fuente = ANTICIPO`: validar `anticipo_disponible ≥ monto_total`, luego incrementar `anticipo_usado`
3. Si `fuente = CUENTA_BANCARIA`: validar `cuenta.saldo ≥ monto_total`, luego decrementar `cuenta.saldo`
4. Insertar `PagoOC` y todos los `DetallePagoOC` en transacción
5. Para cada detalle: publicar evento RabbitMQ (ver spec `eventos-pago`)
6. Roles permitidos: `finanzas`, `admin`
