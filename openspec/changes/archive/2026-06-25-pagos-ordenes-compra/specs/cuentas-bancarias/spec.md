# cuentas-bancarias

## Schema (Prisma — apps/finanzas)

```prisma
model CuentaBancaria {
  id          String   @id @default(uuid())
  tenant_id   String
  banco       String
  numero      String   // últimos 4 dígitos o alias
  descripcion String?
  saldo       Decimal  @default(0) @db.Decimal(15,2)
  activa      Boolean  @default(true)
  created_at  DateTime @default(now())
  pagos       PagoOC[]
  @@map("cuentas_bancarias")
}
```

## Endpoints

```
GET  /api/v1/finanzas/cuentas-bancarias
  → Array<CuentaBancaria> donde tenant_id = req.user.tenantId y activa = true

POST /api/v1/finanzas/cuentas-bancarias
  Body: { banco: string, numero: string, descripcion?: string, saldo_inicial?: number }
  → 201 CuentaBancaria creada
  Roles: finanzas, admin

PATCH /api/v1/finanzas/cuentas-bancarias/:id
  Body: { banco?, numero?, descripcion?, saldo?, activa? }
  → 200 CuentaBancaria actualizada
  Roles: finanzas, admin

DELETE /api/v1/finanzas/cuentas-bancarias/:id
  → soft delete: activa = false
  Roles: admin
```

## Validaciones

- `banco`: requerido, string no vacío
- `numero`: requerido, string no vacío (alias o últimos 4 dígitos)
- `saldo_inicial`: si se provee, debe ser ≥ 0
- No se puede eliminar una cuenta con pagos registrados (devolver 409)
