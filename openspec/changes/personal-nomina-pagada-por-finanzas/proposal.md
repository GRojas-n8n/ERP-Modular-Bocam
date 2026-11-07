## Why

**Decisión (Germán, 6 nov 2026):**
- Las nóminas autorizadas aparecen en RH y en Finanzas.
- Finanzas las paga desde una cuenta bancaria (`nomina-pagada-por-finanzas`).
- Personal las marca PAGADAS.

Hoy RH marca PAGADA a mano con `PATCH /prenominas/:id/pagar`, sin cuenta ni referencia bancaria.

## What Changes

- Suscripción a `finanzas.nomina_pagada`:
  - Cola `personal.finanzas_nomina_pagada.v1` con reintento y DLQ.
  - La prenómina AUTORIZADA del proyecto pasa a PAGADA con un UPDATE condicional por estado y proyecto.
  - Publica `personal.nomina_pagada` con `cuenta_id`, `referencia` y `fecha_pago`, en adición aditiva al payload
    actual.
  - Si ya estaba PAGADA, vuelve a publicar. Los consumidores (Contabilidad y Finanzas) son idempotentes, así que una
    publicación fallida se recupera con el reintento.
- `PATCH /prenominas/:id/pagar` responde 409 `PER_PAGO_EN_FINANZAS` y no cambia el estado. Ninguna pantalla la llama
  (verificado en `app-shell`).
- CI: Personal entra a la generación de clientes y a `db push`, y gana su primera prueba de integración en el
  pipeline.

## Impact

- Servicio: `apps/personal`.
- Pruebas ajustadas:
  - `rol-personal-rh-autorizar-pagar-nomina`: RH recibe 409.
  - `personal.nomina-a-contabilidad` (Contabilidad): el paso 4 dispara el pago con `finanzas.nomina_pagada`. No
    corre en CI hoy.
- Se despliega junto con `nomina-pagada-por-finanzas` (Finanzas).
