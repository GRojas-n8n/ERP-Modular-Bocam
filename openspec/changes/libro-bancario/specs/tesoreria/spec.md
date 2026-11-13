## ADDED Requirements

### Requirement: Todo cambio de saldo SHALL quedar en el libro bancario
Cada cargo o abono a una cuenta bancaria SHALL registrar un movimiento con tipo, origen, origen_id, monto,
saldo_anterior y saldo_posterior en la misma sentencia que cambia el saldo. El saldo de la cuenta SHALL ser igual a la
suma de abonos menos la suma de cargos de su libro.

#### Scenario: Operaciones con origen
- **WHEN** se registra un egreso de OCs, se paga un pago programado, se paga una nómina o se registra un cobro
- **THEN** SHALL existir un movimiento con origen EGRESO_OC, PAGO_PROGRAMADO, NOMINA o COBRO_CXC y el id de esa operación

#### Scenario: Cargos simultáneos
- **WHEN** 10 cargos de $100 llegan a la vez a una cuenta con $500
- **THEN** SHALL pasar 5, la cuenta SHALL quedar en $0 y cada saldo_anterior SHALL ser el saldo_posterior del movimiento previo

#### Scenario: Rechazo sin efectos
- **WHEN** una operación se rechaza por saldo insuficiente
- **THEN** no SHALL quedar movimiento

### Requirement: El libro bancario SHALL ser inmutable
UPDATE y DELETE sobre `movimientos_bancarios` SHALL fallar. Una corrección SHALL ser un movimiento AJUSTE.

### Requirement: El saldo SHALL cambiar solo por operación o ajuste con motivo
`PATCH /cuentas-bancarias/:id` SHALL rechazar `saldo` con 400 `FIN_SALDO_NO_EDITABLE`. El saldo inicial de una
cuenta nueva SHALL registrarse como movimiento SALDO_INICIAL dentro del límite de autoridad.

#### Scenario: Ajuste
- **WHEN** Finanzas registra `POST /cuentas-bancarias/:id/ajustes` con tipo, monto, folio y motivo de al menos 10 caracteres
- **THEN** SHALL registrarse un movimiento AJUSTE y responder 201
- **AND** el mismo folio con el mismo contenido SHALL responder 200 sin duplicar
- **AND** el mismo folio con otro contenido SHALL responder 409 `FIN_AJUSTE_DUPLICADO`
- **AND** un monto sobre el límite de autoridad SHALL responder 403 `FIN_LIMIT_EXCEEDED`
- **AND** un cargo mayor al saldo SHALL responder 422 `FIN_SALDO_INSUFICIENTE`

### Requirement: Número de cuenta y CLABE SHALL salir enmascarados
La API SHALL devolver `numero_cuenta` y `clabe` como `****` más los últimos 4 caracteres.

### Requirement: El libro SHALL consultarse paginado
`GET /cuentas-bancarias/:id/movimientos` SHALL devolver los movimientos del más reciente al más antiguo, con
`?limit=`, `?cursor=` y `?origen=`. Una cuenta de otro tenant SHALL responder 404.
