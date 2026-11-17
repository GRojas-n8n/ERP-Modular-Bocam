## Why

Hallazgo F20 de la auditoría de Finanzas (5 nov 2026): `control_obra.estimacion_aprobada` y
`control_obra.avance_fisico_validado` creaban **pagos programados** (egresos) con beneficiario "Constructora (Self)".
Una estimación aprobada es dinero que el cliente debe a la constructora: aparecía como pago próximo y, al "pagarse",
se registraba como gasto ejercido del presupuesto. El avance validado además duplicaba el monto de la estimación.

## What Changes

- Tablas `cuentas_por_cobrar` (alta idempotente por `(tenant, origen, origen_id)`, CHECK `0 <= cobrado <= monto`) y
  `cobros_cxc` (folio único por tenant). RLS habilitado y forzado, Patrón Global con Trazabilidad.
- `estimacion_aprobada` crea una cuenta por cobrar. Si la estimación ya existe como pago programado (registro previo),
  no la duplica.
- `avance_fisico_validado` deja de generar dinero: valida el contrato y registra `sin_efecto_financiero`.
- `GET /cuentas-por-cobrar` (abiertas por defecto; `?estado=`) y `POST /cuentas-por-cobrar/:id/cobros`
  (`cuenta_id`, `folio`, `monto`, `fecha_cobro`): `FOR UPDATE` de la cuenta por cobrar, cobro <= saldo, abono atómico a la
  cuenta bancaria, idempotente por folio (200; 409 con otro contenido).
- Evento nuevo `finanzas.cobro_registrado` (para la póliza de ingreso en Contabilidad y el estado de la estimación en
  Control de Proyectos; cada consumidor con su propio change).
- `scripts/finanzas/migrar-estimaciones-a-cxc.sql`: mueve estimaciones abiertas a cuentas por cobrar y cancela sus
  pagos programados y las proyecciones por avance. Simula por defecto; `-v aplicar=1` aplica. Las ya PAGADO se listan
  para el contador.

## Impact

- Servicio: `apps/finanzas`. Pruebas adaptadas: `control-obra.event` (crea cuenta por cobrar),
  `control-obra.avance-validado` (sin efecto financiero), `event-contracts` (contrato inválido tampoco crea cuenta por cobrar).
- **Dependencia funcional:** Control de Proyectos marca la estimación FACTURADA al recibir `pago_registrado` de una
  Estimacion. Con este change ese evento ya no ocurre para estimaciones nuevas; el change
  `estimacion-cobrada-por-finanzas` (Control de Proyectos) consume `cobro_registrado`. Se despliegan juntos.
- Contrato de `estimacion_aprobada`: sin cambios (`presupuesto_id` sigue obligatorio).
- Base: `corregir-ejecucion-programa-pagos` (`tesoreria.ts`, `errores.ts`).
