## MODIFIED Requirements

### Requirement: Crear pago contra OC genera MovimientoPoliza en contabilidad

Al crear un pago (`POST /api/v1/finanzas/pagos`), el evento `finanzas.pago_registrado` que ya se publica SHALL ahora provocar, en el servicio de contabilidad, la creación de un `AsientoContable` tipo `EGRESO` **y** sus `MovimientoPoliza` de partida doble (cargo en `2100-Cuentas por Pagar Proveedores`, abono en `1100-Bancos`), siempre que la `fecha_pago_real >= 2026-06-29`.

El endpoint de creación de pago en finanzas NO cambia. El cambio es exclusivamente en el handler de contabilidad que consume el evento.

#### Scenario: Pago registrado post-cutoff genera asiento con movimientos
- **WHEN** se registra un pago con `fecha_pago_real = "2026-07-01"` y el evento `finanzas.pago_registrado` llega a contabilidad
- **THEN** se crea `AsientoContable { tipo_poliza: "EGRESO", monto_total: monto_pagado }`
- **THEN** se crean 2 `MovimientoPoliza`:
  - `{ cuenta_clave: "2100", cargo: monto_pagado, abono: 0, descripcion: "Cancelación pasivo proveedor" }`
  - `{ cuenta_clave: "1100", cargo: 0, abono: monto_pagado, descripcion: "Salida de banco" }`
- **THEN** `sum(cargo) === sum(abono) === monto_pagado`

#### Scenario: Pago registrado pre-cutoff solo genera asiento sin movimientos
- **WHEN** se registra un pago con `fecha_pago_real = "2026-06-01"` (anterior al cutoff)
- **THEN** se crea `AsientoContable` como antes (partida simple)
- **THEN** NO se crean `MovimientoPoliza`

#### Scenario: Idempotencia preservada con movimientos
- **WHEN** el evento `finanzas.pago_registrado` se procesa dos veces por reintento RabbitMQ
- **THEN** la segunda vez el asiento se detecta por `external_event_key` y NO se crean movimientos duplicados
