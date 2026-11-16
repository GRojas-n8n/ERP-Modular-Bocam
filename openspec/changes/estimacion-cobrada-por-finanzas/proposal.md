## Why

Finanzas registra la estimación aprobada como cuenta por cobrar (`cuentas-por-cobrar-estimaciones`, hallazgo F20) y
ya no emite `finanzas.pago_registrado` para estimaciones. Control de Proyectos usaba ese evento para pasar la
estimación a FACTURADA; sin este change, las estimaciones nuevas quedarían en APROBADA_FINANCIERA para siempre.

## What Changes

- `handleCobroRegistradoEvent` suscrito a `finanzas.cobro_registrado`:
  - `origen = ESTIMACION` y `estado = COBRADA`: la estimación pasa a FACTURADA con nota del cobro.
  - Cobro parcial: solo nota.
  - Reentrega del mismo `id_cobro`: sin cambios. UPDATE condicional y filtro explícito por proyecto además del RLS.
- La rama de `pago_registrado` para Estimacion se conserva para pagos programados previos.

## Impact

- Servicio: `apps/control-proyectos`. Suscripción nueva; ningún contrato existente cambia.
- Se despliega junto con `cuentas-por-cobrar-estimaciones` (Finanzas).
