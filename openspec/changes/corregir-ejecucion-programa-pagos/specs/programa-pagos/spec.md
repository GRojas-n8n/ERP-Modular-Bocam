## MODIFIED Requirements

### Requirement: Ejecutar un pago SHALL aplicar el presupuesto según su compromiso
Al ejecutar un pago programado, el monto SHALL devengarse contra el COMPROMISO de la misma referencia hasta agotarlo;
el resto SHALL ejercerse del disponible solo si alcanza. Sin compromiso, el comprometido no SHALL cambiar.

#### Scenario: Pago sin compromiso
- **WHEN** se ejecuta un pago de 300 sobre un presupuesto con 1,000 disponibles y sin compromiso
- **THEN** el ejercido SHALL ser 300, el disponible 700 y el comprometido SHALL seguir en 0

#### Scenario: Sin disponible
- **WHEN** el pago no tiene compromiso y excede el disponible
- **THEN** SHALL responder 422 `FIN_INSUFFICIENT_BUDGET` sin descontar la cuenta ni cambiar el pago

### Requirement: Un pago SHALL salir de una cuenta bancaria una sola vez
`PATCH /pagos/:id/pagar` SHALL exigir `cuenta_id` y SHALL descontar la cuenta de forma atómica. Ejecuciones
simultáneas del mismo pago SHALL serializarse: una SHALL pasar y las demás SHALL responder 409 `FIN_PAGO_YA_PAGADO`.

#### Scenario: Ejecución simultánea
- **WHEN** el mismo pago se ejecuta tres veces al mismo tiempo
- **THEN** la cuenta SHALL descontarse una vez y el presupuesto SHALL ejercerse una vez

### Requirement: El lote de pagos SHALL ser todo o nada
Si un renglón es inválido o su presupuesto no existe, `POST /pagos/bulk` no SHALL programar ninguno.
