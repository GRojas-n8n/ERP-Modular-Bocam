# dashboard-entrada-finanzas

## UI Location

`apps/app-shell/src/views/FinanzasView.tsx` — sección superior.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard — Finanzas                    [proyecto activo]│
├────────────────────────┬──────────────┬─────────────────┤
│ Presupuesto            │ OCs por Pagar│ Cuentas Bancarias│
│ $5,000,000 autorizado  │     12       │ BBVA: $2.1M     │
│ $1,250,000 ejercido    │ $680k pdte.  │ HSBC: $450k     │
│ ████░░░░ 25%           │              │                  │
└────────────────────────┴──────────────┴─────────────────┘

[Alertas si alertas.length > 0]
⚠ Presupuesto ejercido supera el 80%

[Actividad reciente]
• Pago OC-2026-045... $45,000 — 20/06/2026
```

## Behavior

- Barra de progreso de presupuesto: verde < 70%, amarillo 70-85%, rojo > 85%
- Si `cuentas_bancarias` es `[]` (pagos-ordenes-compra no implementado aún): no muestra esa tarjeta
- Solo visible para rol `finanzas` y `admin`
- `proyectoId` se toma del contexto activo del usuario (mismo que usan otras vistas)
