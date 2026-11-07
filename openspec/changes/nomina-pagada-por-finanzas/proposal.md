## Why

Hoy RH marca la prenómina como PAGADA en Personal (`PATCH /prenominas/:id/pagar`). Ninguna cuenta bancaria se
descuenta, Tesorería no sabe de qué cuenta salió la nómina y la conciliación bancaria no tiene contra qué comparar.

**Decisión (Germán, 6 nov 2026):**
- Las nóminas autorizadas aparecen en RH y en Finanzas.
- Finanzas las paga desde una cuenta bancaria.
- Personal las marca PAGADAS.
- Es el mismo patrón que las OCs por pagar.

## What Changes (este change: Finanzas)

- Tabla `nominas_por_pagar`:
  - Proyección de `personal.nomina_autorizada`.
  - Idempotente, sin depender de que exista presupuesto MANO_OBRA.
  - CHECK de monto y de estado. Una fila PAGADA exige cuenta, referencia y fecha.
  - RLS forzado.
- `GET /nominas-por-pagar` (`?estado=`).
- `POST /nominas-por-pagar/:prenominaId/pagar` (`cuenta_id`, `referencia`, `fecha_pago`):
  - `FOR UPDATE` de la nómina.
  - Límite de autoridad.
  - Descuento atómico de la cuenta.
  - Devengo del compromiso de la autorización; sin compromiso, ejercido directo si el disponible alcanza.
  - El presupuesto no bloquea el pago (obligación laboral); si no alcanza, se reporta `sin_presupuesto`.
  - Idempotente por (cuenta, referencia); otra referencia responde 409.
- Evento nuevo `finanzas.nomina_pagada`.
- `handleNominaPagadaEvent` (`personal.nomina_pagada`):
  - No vuelve a aplicar el presupuesto si Finanzas ya pagó.
  - Sin compromiso no descuenta comprometido. Antes podía dejarlo negativo, el mismo defecto que F19.

## Impact

- Servicio: `apps/finanzas`.
- Changes complementarios, cada uno en su servicio:
  - `personal-nomina-pagada-por-finanzas` (Personal): consume `finanzas.nomina_pagada`, marca PAGADA y emite
    `personal.nomina_pagada` con cuenta y referencia; `PATCH /pagar` deja de mover el estado.
  - `evm-mano-obra-desde-finanzas` (Control de Proyectos): suma la nómina pagada al costo real.
  - Contabilidad no cambia: su póliza PAGO_NOMINA sigue saliendo de `personal.nomina_pagada`.
- Pantalla: pestaña "Nómina por pagar" en Finanzas (con M10).
- Backfill: las prenóminas AUTORIZADAS antes del despliegue se cargan con
  `scripts/finanzas/backfill-nominas-por-pagar.sql`.
- Base: `optimizar-api-y-dashboard-finanzas`.
