## MODIFIED Requirements

### Requirement: La prenómina SHALL pasar a PAGADA cuando Finanzas confirma el pago
Al recibir `finanzas.nomina_pagada`, la prenómina AUTORIZADA del mismo proyecto SHALL pasar a PAGADA y SHALL
publicarse `personal.nomina_pagada` con la cuenta y la referencia del pago. `PATCH /prenominas/:id/pagar` SHALL
responder 409 `PER_PAGO_EN_FINANZAS`.

#### Scenario: Reentrega
- **WHEN** el mismo pago llega dos veces
- **THEN** la prenómina SHALL seguir PAGADA y `personal.nomina_pagada` SHALL publicarse de nuevo
