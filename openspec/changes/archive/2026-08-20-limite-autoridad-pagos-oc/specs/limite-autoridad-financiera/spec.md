## ADDED Requirements

### Requirement: Toda mutación que mueva dinero SHALL validar el Límite de Autoridad Financiera
Toda mutación de Finanzas que descuente saldo de una cuenta bancaria, consuma el
anticipo de un proyecto, o transfiera monto entre partidas presupuestales SHALL
comparar el monto de la operación contra el `limite_aprobacion` del JWT del
usuario, y rechazar con 403 `FIN_LIMIT_EXCEEDED` cuando lo exceda — antes de
aplicar cualquier escritura.

Esto aplica a `POST /pagos-oc`, `POST /proyectos/:proyectoId/anticipo` y
`POST /transferencias-presupuestales`, que hoy no lo hacen.

#### Scenario: Pago de OC por encima del límite del usuario
- **WHEN** un usuario con rol `finanzas` y `limite_aprobacion` de 1000 hace
  `POST /api/v1/finanzas/pagos-oc` con detalles que suman 2500
- **THEN** la respuesta SHALL ser 403 con `error.code: 'FIN_LIMIT_EXCEEDED'`, el
  saldo de la cuenta bancaria NO SHALL modificarse, el anticipo del proyecto NO
  SHALL consumirse, y no SHALL publicarse el evento de pago

#### Scenario: El mismo pago por un usuario con límite suficiente
- **WHEN** un usuario con rol `finanzas` y `limite_aprobacion` de 999999 hace el
  mismo `POST /api/v1/finanzas/pagos-oc`
- **THEN** la petición SHALL continuar a la validación de negocio existente
  (suficiencia de saldo o anticipo) sin cambio de comportamiento

### Requirement: Programar un pago NO SHALL exigir Límite de Autoridad Financiera
`POST /pagos` y `POST /pagos/bulk` crean pagos en estado programado sin mover
dinero. NO SHALL validar `limite_aprobacion`: el límite se ejerce al ejecutar el
pago, no al planificarlo. Esta ausencia SHALL estar documentada en el código para
que no se interprete como un hueco.

#### Scenario: Superintendencia programa un pago grande
- **WHEN** un usuario con rol `superintendent` y `limite_aprobacion` bajo hace
  `POST /api/v1/finanzas/pagos` por un monto que excede su límite
- **THEN** el pago SHALL crearse en estado programado, y SHALL ser rechazado más
  tarde si ese mismo usuario intenta ejecutarlo
