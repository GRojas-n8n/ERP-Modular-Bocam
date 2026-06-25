# frontend-pagos

## Sección en FinanzasView — Gestión de Pagos

### UI Location
`apps/app-shell/src/views/FinanzasView.tsx` — tab o sección "Pagos de OCs"

### Lista de Pagos

```
┌─────────────────────────────────────────────────────────────────────┐
│ Pagos de Órdenes de Compra          [+ Registrar Pago]  [Filtros ▼]│
├──────────┬────────────┬─────────────┬────────┬─────────────────────┤
│ Fecha    │ Referencia │ Proveedor(es│ Total  │ OCs Cubiertas       │
├──────────┼────────────┼─────────────┼────────┼─────────────────────┤
│ 20/06    │ CHQ-12345  │ Mat. SA     │$85,000 │ OC-012, OC-015      │
│ 18/06    │ TRF-89012  │ Const. XYZ  │$45,000 │ OC-009              │
└──────────┴────────────┴─────────────┴────────┴─────────────────────┘
```

### Modal: Registrar Pago

```
┌──────────────────────────────────────────────────────┐
│ Registrar Pago de OCs                                │
│                                                      │
│ Proyecto: [proyecto activo]                          │
│ Fecha de pago: [date picker]                         │
│ Fuente: ○ Anticipo ($X disponible)  ○ Cuenta Bancaria│
│   Cuenta: [BBVA ****4521 ▼]  (si fuente = CUENTA)  │
│ Tipo: ○ Cheque  ○ Transferencia  ○ Efectivo          │
│ Referencia: [CHQ-12345]  (número cheque/folio)       │
│ Concepto: [descripción opcional]                     │
│                                                      │
│ OCs a pagar:                                         │
│ [+ Agregar OC]                                       │
│ ┌──────────────┬──────────────┬────────────┬───────┐ │
│ │ OC           │ Proveedor    │Saldo Pdte  │Monto  │ │
│ ├──────────────┼──────────────┼────────────┼───────┤ │
│ │ OC-2026-012  │ Materiales SA│$85,000     │$85,000│ │
│ │ OC-2026-015  │ Materiales SA│$40,000     │$40,000│ │
│ └──────────────┴──────────────┴────────────┴───────┘ │
│                                                      │
│ Total: $125,000                                      │
│ [Cancelar]              [Registrar Pago]             │
└──────────────────────────────────────────────────────┘
```

### Badge de estado de pago en ComprasView — OCs

En el listado de OCs en `ComprasView.tsx`, agregar badge junto al estado de recepción:
- `PENDIENTE_PAGO` → chip gris "Sin pago"
- `PAGO_PARCIAL` → chip amarillo "Pago parcial"
- `PAGADA` → chip verde "Pagada"

Este badge lee el campo `estado_pago` de la OC (proyectado desde eventos `finanzas.oc_pagada_*`).

## Comportamiento

- Al abrir modal "Registrar Pago": buscar OCs del proyecto con `estado_pago != 'PAGADA'`
- El selector de OC muestra folio, proveedor y saldo pendiente
- Validación frontend: suma de montos aplicados ≤ saldo disponible de la fuente seleccionada
- Después de `POST /api/v1/finanzas/pagos`: recargar lista de pagos y cerrar modal
