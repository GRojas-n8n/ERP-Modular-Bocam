# endpoint-dashboard-finanzas

## Interface

```
GET /api/v1/finanzas/dashboard?proyectoId=<uuid>
Headers: Authorization: Bearer <jwt>
Roles: finanzas, admin

Response 200:
{
  "presupuesto": {
    "monto_autorizado": 5000000.00,
    "monto_ejercido": 1250000.00,
    "porcentaje_ejercido": 25.0,
    "disponible": 3750000.00
  },
  "cuentas_bancarias": [
    {
      "id": "uuid",
      "banco": "BBVA",
      "cuenta": "****4521",
      "saldo": 2100000.00
    }
  ],
  "ocs_por_pagar": 12,
  "monto_ocs_pendientes": 680000.00,
  "alertas": [
    {
      "tipo": "PRESUPUESTO_BAJO",
      "mensaje": "Presupuesto ejercido supera el 80%",
      "severidad": "warning"
    }
  ],
  "reciente": [
    {
      "tipo": "PAGO",
      "descripcion": "Pago OC-2026-045 a Proveedor X",
      "monto": 45000.00,
      "fecha": "2026-06-20T10:00:00Z"
    }
  ]
}
```

## Logic

- `presupuesto`: desde tabla `PresupuestoAsignado` filtrado por `proyecto_id`
- `cuentas_bancarias`: desde tabla `CuentaBancaria` (creada en `pagos-ordenes-compra`). Si la tabla no existe aún, retorna `[]`
- `ocs_por_pagar`: proyección local mantenida por eventos RabbitMQ (`compras.oc_creada` → +1, `pagos.oc_pagada` → -1)
- Alerta `PRESUPUESTO_BAJO` si `monto_ejercido / monto_autorizado > 0.80`
- `reciente`: últimos 5 movimientos de pagos del proyecto
