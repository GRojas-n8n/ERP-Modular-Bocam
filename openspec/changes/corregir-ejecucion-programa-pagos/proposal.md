## Why

Hallazgos de la auditoría de Finanzas (5 nov 2026):

- **F19:** `PATCH /pagos/:id/pagar` restaba comprometido aunque el pago programado no tuviera compromiso: dejaba el
  comprometido negativo y el disponible inflado. No bloqueaba la fila: dos ejecuciones simultáneas pasaban el
  `estado !== PAGADO` y ejercían dos veces.
- **F13:** el pago no descontaba ninguna cuenta bancaria; tesorería no reflejaba los egresos programados.
- `POST /pagos` y `/pagos/bulk` no validaban monto, presupuesto ni fecha; el lote insertaba renglones inválidos.

## What Changes

- `src/programa-pagos.ts`: programar (individual idempotente por referencia; lote todo o nada) y ejecutar.
- Ejecutar: `FOR UPDATE` del pago y del presupuesto; DEVENGADO contra el COMPROMISO de la misma referencia hasta
  agotarlo; el excedente (o todo, sin compromiso) como EJERCIDO solo si el disponible alcanza (422 si no);
  descuento atómico de la cuenta bancaria, ahora **obligatoria** (`cuenta_id`).
- `src/tesoreria.ts`: descuento atómico de cuenta compartido con el egreso de OCs. `src/errores.ts`: base común
  `ErrorFinanzas` (los endpoints la traducen a `createApiError`).
- `finanzas.pago_registrado` agrega `cuenta_id` (aditivo) para la conciliación bancaria.
- Pruebas de Contabilidad `finanzas-banco-lote` y `finanzas-banco-archivo`: mandan `cuenta_id` y su semilla respalda
  el comprometido con su movimiento COMPROMISO (solo cambia la prueba).

## Impact

- Servicio: `apps/finanzas`. Ninguna pantalla ni servicio llama a `POST /pagos`, `/bulk` ni `PATCH /pagar` hoy
  (verificado con grep); solo las dos pruebas de Contabilidad, ajustadas en este change.
- Contrato: `PATCH /pagos/:id/pagar` exige `cuenta_id` (400 `FIN_CUENTA_REQUERIDA`). Errores con códigos estables:
  `FIN_PAGO_YA_PAGADO` (409), `FIN_PAGO_CANCELADO` (409), `FIN_INSUFFICIENT_BUDGET` (422), `FIN_SALDO_INSUFICIENTE` (422).
- Base: `blindar-movimientos-y-sincronizacion-gt` (reutiliza `montos.ts`).
