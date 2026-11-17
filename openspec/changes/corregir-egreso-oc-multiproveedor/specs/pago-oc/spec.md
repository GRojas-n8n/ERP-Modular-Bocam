## MODIFIED Requirements

### Requirement: Un egreso SHALL liquidar N OCs de N proveedores del mismo proyecto
`POST /api/v1/finanzas/pagos-oc` SHALL registrar un solo egreso (cheque, transferencia, SPEI o efectivo) que
aplica montos a una o más OCs, de uno o más proveedores de cualquier giro, siempre que todas pertenezcan al
proyecto del egreso. El cliente SHALL enviar solo `oc_id` y `monto_aplicado` por detalle; proyecto, proveedor,
código y saldo de cada OC SHALL resolverse en el servidor desde `ocs_por_pagar`.

#### Scenario: Tres proveedores del mismo proyecto
- **WHEN** un usuario `finanzas` registra un egreso SPEI de 3,500 con OCs de 1,000, 2,000 y 500 de tres proveedores del proyecto P desde una cuenta de empresa con saldo 10,000
- **THEN** la respuesta SHALL ser 201, la cuenta SHALL quedar en 6,500, las tres OCs SHALL quedar PAGADA, el presupuesto SHALL mover 3,500 de comprometido a ejercido y SHALL publicarse `finanzas.oc_pagada_total` por OC y un `finanzas.egreso_oc_registrado`

#### Scenario: OC de otro proyecto
- **WHEN** el egreso incluye una OC del proyecto Q
- **THEN** la respuesta SHALL ser 422 y no SHALL modificarse saldo, pagos, proyección ni presupuesto

### Requirement: El saldo de la OC SHALL calcularse en el servidor y nunca excederse
El monto aplicado SHALL ser mayor a 0, con máximo 2 decimales, y menor o igual al saldo de la OC. El estado SHALL
pasar a PAGO_PARCIAL o PAGADA según el saldo resultante. Egresos concurrentes sobre la misma OC SHALL
serializarse.

#### Scenario: Abonos parciales
- **WHEN** se abonan 400 y luego 600 a una OC de 1,000
- **THEN** la OC SHALL quedar PAGO_PARCIAL y luego PAGADA, y un tercer abono SHALL responder 409 `FIN_OC_PAGADA`

#### Scenario: Concurrencia
- **WHEN** dos egresos de 800 sobre una OC de 1,000 llegan al mismo tiempo
- **THEN** exactamente uno SHALL responder 201 y el otro 422 `FIN_MONTO_EXCEDE_SALDO`, y la cuenta SHALL descontarse una vez

### Requirement: El folio bancario SHALL ser único por cuenta
El par (fuente, cuenta o proyecto, tipo de pago, referencia) SHALL identificar un egreso. Repetir el mismo folio
con el mismo contenido SHALL devolver el egreso existente (200, `idempotente: true`) sin efectos ni eventos. El
mismo folio con contenido distinto SHALL responder 409 `FIN_FOLIO_DUPLICADO`.

#### Scenario: Reintento
- **WHEN** la pantalla reenvía el mismo egreso
- **THEN** SHALL responder 200 con el mismo `pago_id` y el saldo SHALL descontarse una sola vez

### Requirement: La fuente SHALL descontarse de forma atómica
Una cuenta bancaria SHALL descontarse solo si está activa, pertenece al tenant, es de empresa o del mismo proyecto
y tiene saldo suficiente; el anticipo SHALL descontarse solo si alcanza. Si no, SHALL responder 422 sin efectos.

#### Scenario: Saldo insuficiente
- **WHEN** la cuenta tiene 100 y el egreso es de 500
- **THEN** SHALL responder 422 `FIN_SALDO_INSUFICIENTE` y no SHALL insertarse ningún pago

#### Scenario: Anticipo concurrente
- **WHEN** dos egresos de 700 se pagan con un anticipo de 1,000
- **THEN** uno SHALL pasar y el otro SHALL responder 422 `FIN_ANTICIPO_INSUFICIENTE`

### Requirement: La cancelación de una OC con abonos SHALL liberar solo lo no pagado
`registrarCancelacionOc` SHALL liberar `compromiso - devengado` de la OC y la proyección SHALL bloquear nuevos
pagos.

#### Scenario: Cancelación tras abono
- **WHEN** una OC de 1,000 con 400 pagados se cancela
- **THEN** el presupuesto SHALL quedar con comprometido 0 y ejercido 400, y un nuevo egreso SHALL responder 409 `FIN_OC_CANCELADA`
