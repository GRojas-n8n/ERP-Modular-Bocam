## Why

Hallazgos de la auditoría de Finanzas (5 nov 2026):

- **F1, F2, F8:** la pantalla de pago registraba una sola OC por egreso y pedía capturar a mano el UUID de la OC,
  copiándolo de Compras. Además enviaba saldos calculados en el navegador.
- **F9:** consultaba `/api/v1/compras/...` desde la vista de Finanzas, lo que viola la regla de `CLAUDE.md`
  (una vista solo llama a su propio servicio).

El cliente necesita que un cheque o SPEI pague OCs de varios proveedores (cualquier giro) del mismo proyecto. Además,
M4 y M9 agregaron cobros de estimaciones y pago de nómina en el backend, sin pantalla.

## What Changes

- `components/finanzas/EgresoMultiproveedorModal.tsx` sustituye el modal de un solo pago:
  - OCs por pagar del proyecto (`GET /finanzas/ocs-por-pagar`) agrupadas por proveedor, con casillas.
  - Monto editable por OC, precargado con su saldo y sin poder excederlo.
  - Total en vivo con conteo de OCs y proveedores.
  - Envía solo `{ oc_id, monto_aplicado }`; el servidor resuelve proveedor, código y saldos.
  - Sin llamadas a Compras.
  - Muestra el `error.message` del formato único (M8).
  - Conserva la confirmación con el proyecto activo.
- `CuentasPorCobrarSeccion`: estimaciones por cobrar, con las vencidas resaltadas, y registro de cobro (cuenta,
  folio, monto <= saldo, fecha).
- `NominasPorPagarSeccion`: nóminas autorizadas y su pago (cuenta, referencia, fecha).
- Ayuda contextual de Finanzas actualizada al flujo nuevo.

## Impact

- `apps/app-shell` (vista de Finanzas). Solo llama a `/api/v1/finanzas/*`.
- Depende de los endpoints de M1 (`ocs-por-pagar`, `pagos-oc`), M4 (`cuentas-por-cobrar`) y M9 (`nominas-por-pagar`).
- Prueba existente `confirmacion-registrar-pago-oc` ajustada: selecciona la OC de la lista en lugar de capturar el UUID.
