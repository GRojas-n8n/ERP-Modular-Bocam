## ADDED Requirements

### Requirement: Una estimación aprobada SHALL registrarse como cuenta por cobrar
Al recibir `control_obra.estimacion_aprobada`, Finanzas SHALL crear una cuenta por cobrar por `total_neto` y no SHALL
crear pagos programados ni movimientos presupuestales. Una reentrega no SHALL duplicarla.

#### Scenario: Reentrega del evento
- **WHEN** la misma estimación llega dos veces
- **THEN** SHALL existir una sola cuenta por cobrar en estado POR_COBRAR

### Requirement: El avance físico validado no SHALL generar dinero
`control_obra.avance_fisico_validado` no SHALL crear pagos programados, cuentas por cobrar ni movimientos.

### Requirement: Un cobro SHALL abonar el banco sin exceder el saldo
`POST /cuentas-por-cobrar/:id/cobros` SHALL abonar la cuenta bancaria y acumular lo cobrado en la misma transacción.
El cobro no SHALL exceder el saldo, ni con cobros simultáneos. Un folio repetido con el mismo contenido SHALL
responder 200 sin efectos; con otro contenido, 409 `FIN_COBRO_DUPLICADO`.

#### Scenario: Cobros simultáneos
- **WHEN** llegan 5 cobros de 300 sobre una cuenta por cobrar de 1,000
- **THEN** exactamente 3 SHALL pasar y los demás SHALL responder 422 `FIN_COBRO_EXCEDE_SALDO`

#### Scenario: Cobro total
- **WHEN** lo cobrado alcanza el monto
- **THEN** el estado SHALL ser COBRADA y SHALL publicarse `finanzas.cobro_registrado` con `estado: COBRADA`
