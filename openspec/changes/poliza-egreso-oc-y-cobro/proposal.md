## Why

- **F7 (auditoría de Finanzas, 5 nov 2026):** Contabilidad no recibe los egresos multiproveedor
  (`finanzas.egreso_oc_registrado`). Un cheque o SPEI que liquida OCs de varios proveedores no genera póliza, ni
  conciliación bancaria ni fiscal.
- **Cobros (M4):** Finanzas ahora registra el cobro de estimaciones (`finanzas.cobro_registrado`), y Contabilidad no
  tiene la póliza de ingreso a Bancos.
- **F27 (hallazgo nuevo):** `handleEstimacionAprobadaEvent` exige `monto_total`, pero Control de Proyectos publica
  `total_neto`. En producción toda estimación aprobada termina en `invalid_payload`: la cuenta 1200 (Cuentas por
  Cobrar) nunca se carga y la póliza de cobro la dejaría negativa.

## What Changes

- `finanzas.egreso_oc_registrado` produce una póliza EGRESO por egreso.
  - Un cargo a 2100 (Cuentas por Pagar) por cada OC y su abono a 1100 (Bancos); la póliza cuadra con el total.
  - Abre la conciliación bancaria (referencia, método y monto) y la fiscal.
  - Idempotente por `pago_id`.
  - Un payload cuyo detalle no suma el total se rechaza sin póliza.
- `finanzas.cobro_registrado` produce una póliza COBRO (folio `POL-ING-…`): cargo 1100 y abono 1200, idempotente por
  `id_cobro`.
- `estimacion_aprobada` acepta `total_neto` (contrato real) y conserva `monto_total` por compatibilidad.
- `mapper.ts`:
  - Tipo `COBRO`.
  - `buildMovimientosEgresoOc`.
  - `persistDefsIfEligible`, que persiste líneas ya construidas con el mismo corte de partida doble.

## Impact

- Servicio: `apps/contabilidad`. Dos suscripciones nuevas; ningún contrato existente cambia.
- Cuentas usadas: las del catálogo base (1100, 1200, 2100, 4100). El contador confirma o sustituye las subcuentas por
  proveedor y por banco (pendiente del 13 nov). El egreso con fuente ANTICIPO también abona Bancos: el anticipo del
  cliente ya está en el banco. La amortización del anticipo se refleja en la estimación.
- Fuera de alcance:
  - Una conciliación fiscal por proveedor. Hoy se abre una por egreso; un egreso de N proveedores tendrá N CFDI.
  - La conciliación bancaria del cobro.
  - El contrato de `avance_fisico_validado`, que tiene el mismo tipo de desajuste y va en su propio change.
