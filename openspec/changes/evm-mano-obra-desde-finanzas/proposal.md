## Why

Con `nomina-pagada-por-finanzas`, la nómina la paga Finanzas desde una cuenta y publica `finanzas.nomina_pagada`. El
costo real de mano de obra del EVM (`mano_obra_proyecto`) solo se alimentaba de `finanzas.pago_registrado` con
referencia PreNomina, que nadie emite para nóminas. El AC de mano de obra quedaba en cero.

## What Changes

- Suscripción a `finanzas.nomina_pagada`.
- Suma `total_neto` al costo real de mano de obra del proyecto con la rutina existente
  `aplicarPagoPreNominaAlEvm`, que es idempotente por `pago_evm_procesado`. La llave es la prenómina.

## Impact

- Servicio: `apps/control-proyectos`. Suscripción nueva, sin cambio de contratos.
- Se despliega con `nomina-pagada-por-finanzas`.
