## ADDED Requirements

### Requirement: Una nómina autorizada SHALL quedar por pagar en Finanzas
Al recibir `personal.nomina_autorizada`, Finanzas SHALL registrar una nómina por pagar por `total_neto`, exista o no
presupuesto MANO_OBRA. Una reentrega no SHALL duplicarla.

### Requirement: Finanzas SHALL pagar la nómina desde una cuenta bancaria una sola vez
`POST /nominas-por-pagar/:prenominaId/pagar` SHALL descontar la cuenta, aplicar el presupuesto y publicar
`finanzas.nomina_pagada` en una sola operación. Pagos simultáneos SHALL serializarse: uno pasa y los demás SHALL
responder 409.

#### Scenario: Sin presupuesto
- **WHEN** el proyecto no tiene presupuesto MANO_OBRA
- **THEN** la nómina SHALL pagarse y el resultado SHALL indicar `efecto_presupuestal: sin_presupuesto`

#### Scenario: Saldo insuficiente
- **WHEN** la cuenta no alcanza
- **THEN** SHALL responder 422 `FIN_SALDO_INSUFICIENTE` y la nómina SHALL seguir POR_PAGAR
