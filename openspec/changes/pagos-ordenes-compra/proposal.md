## Why

Las Órdenes de Compra se generan en Compras pero no existe un flujo de pago. El área de Finanzas necesita registrar pagos (anticipos, pagos parciales, liquidaciones), controlar cuentas bancarias propias de la empresa, y emitir cheques que pueden cubrir múltiples OCs total o parcialmente. Sin este módulo, el ERP no tiene cierre financiero del ciclo compras → pago.

## What Changes

- `apps/finanzas` expone nuevos endpoints para cuentas bancarias y pagos de OCs
- El schema de Prisma en finanzas agrega modelos `CuentaBancaria`, `PagoOC`, `DetallePagoOC`
- `ComprasView.tsx` muestra en cada OC el estado de pago (pendiente/parcial/pagado)
- `FinanzasView.tsx` tiene una sección de gestión de pagos con filtros por proveedor, OC y estado
- Al crear un proyecto se solicita monto de anticipo (campo en `proyectos`)

## Capabilities

### New Capabilities

- `cuentas-bancarias`: CRUD de cuentas bancarias de la empresa (banco, número de cuenta, saldo disponible)
- `anticipo-proyecto`: Campo `monto_anticipo` en la creación de proyectos; saldo de anticipo disponible para pagos de OCs
- `pago-oc`: Registrar un pago que puede cubrir 1 o N OCs en forma total o parcial; un pago tiene una fuente (cuenta bancaria + cheque/transferencia)
- `trazabilidad-pago`: Vista de historial de pagos por OC y por proveedor con saldo pendiente
- `estado-pago-oc`: Enum `PENDIENTE_PAGO`, `PAGO_PARCIAL`, `PAGADA` en cada OC (proyectado desde eventos de pago)

### Modified Capabilities

- `presupuesto-proyecto`: Al crear proyecto se solicita `monto_anticipo`; el anticipo se descuenta primero antes de usar saldo bancario libre
- `dashboard-finanzas`: muestra saldos de cuentas bancarias y OCs por pagar (ya especificado)

## Impact

- **`apps/finanzas/prisma/schema.prisma`**: modelos `CuentaBancaria`, `PagoOC`, `DetallePagoOC`
- **`apps/finanzas/src/main.ts`**: endpoints de cuentas bancarias y pagos
- **`apps/app-shell`**: sección de pagos en FinanzasView + indicador de estado en ComprasView OCs
- **Eventos RabbitMQ**: `finanzas.oc_pagada_parcial`, `finanzas.oc_pagada_total` para que Compras actualice el estado de pago de la OC
