## Why

El módulo de Finanzas no tiene pantalla de entrada contextual. El responsable de finanzas necesita ver al entrar: saldo de anticipo disponible, estado de cuentas bancarias, OCs pendientes de pago y próximos vencimientos.

## What Changes

- Vista de Finanzas muestra sección de dashboard como entrada
- `apps/finanzas` expone `GET /api/v1/finanzas/dashboard` con KPIs financieros del proyecto

## Capabilities

### New Capabilities

- `dashboard-entrada-finanzas`: Sección de dashboard con KPIs: anticipo disponible, total en bancos, OCs pendientes de pago (monto), crédito con proveedores; alertas de pagos por vencer en 15 días; actividad reciente de pagos
- `endpoint-dashboard-finanzas`: `GET /api/v1/finanzas/dashboard` que agrega presupuesto, saldos de cuentas bancarias, OCs pendientes proyectadas desde evento RabbitMQ, y próximos vencimientos

### Modified Capabilities

(ninguna)

## Impact

- **`apps/finanzas/src/main.ts`**: nuevo endpoint `GET /api/v1/finanzas/dashboard`
- **`apps/app-shell`**: sección de dashboard en la vista de Finanzas
- **RabbitMQ**: Finanzas debe suscribirse a `compras.oc_creada` para proyectar count de OCs pendientes de pago en su propia BD
