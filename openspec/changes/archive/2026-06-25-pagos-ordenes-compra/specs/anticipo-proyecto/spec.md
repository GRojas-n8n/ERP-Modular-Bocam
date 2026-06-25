# anticipo-proyecto

## Schema (Prisma — apps/finanzas)

```prisma
model ProyectoFinanzas {
  id               String   @id @default(uuid())
  tenant_id        String
  proyecto_id      String   @unique  // ID del proyecto en el microservicio de proyectos (UUID, sin FK cruzada)
  monto_anticipo   Decimal  @default(0) @db.Decimal(15,2)
  anticipo_usado   Decimal  @default(0) @db.Decimal(15,2)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  @@map("proyectos_finanzas")
}
```

## Endpoints

```
GET  /api/v1/finanzas/proyectos/:proyectoId/anticipo
  → { proyecto_id, monto_anticipo, anticipo_usado, anticipo_disponible }

POST /api/v1/finanzas/proyectos/:proyectoId/anticipo
  Body: { monto_anticipo: number }
  → 201 ProyectoFinanzas creado o actualizado
  Roles: finanzas, admin
  Validación: monto_anticipo ≥ 0
  Validación: monto_anticipo no puede ser menor que anticipo_usado si ya hay pagos
```

## Integración con creación de proyecto

- Cuando se crea un proyecto en el microservicio de proyectos, el frontend (en la misma pantalla de creación) llama también a `POST /api/v1/finanzas/proyectos/:id/anticipo` con el monto ingresado (puede ser 0)
- El anticipo es opcional — si no se provee, `monto_anticipo = 0` y todos los pagos deben usar cuenta bancaria

## Lógica de anticipo disponible

- `anticipo_disponible = monto_anticipo - anticipo_usado`
- Al registrar un `PagoOC` con `fuente = 'ANTICIPO'`, validar que `monto_total_pago ≤ anticipo_disponible`
- Si el anticipo se agota a mitad de un pago, retornar 422 con `anticipo_insuficiente: true`
