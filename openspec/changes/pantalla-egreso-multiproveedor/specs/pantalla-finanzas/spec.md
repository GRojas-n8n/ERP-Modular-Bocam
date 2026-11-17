## MODIFIED Requirements

### Requirement: La pantalla SHALL registrar un egreso contra varias OCs del proyecto
El usuario SHALL seleccionar OCs por pagar del proyecto activo, agrupadas por proveedor, y SHALL capturar el monto
de cada una sin exceder su saldo. La pantalla SHALL mostrar el total en vivo y SHALL enviar solo `oc_id` y
`monto_aplicado`. La vista no SHALL consultar servicios distintos de Finanzas.

#### Scenario: Tres OCs de dos proveedores
- **WHEN** se seleccionan 3 OCs de 2 proveedores y se confirma
- **THEN** SHALL enviarse un solo egreso con 3 detalles y SHALL mostrarse el total pagado

## ADDED Requirements

### Requirement: La pantalla SHALL registrar cobros de estimaciones y pagos de nómina
Finanzas SHALL listar las cuentas por cobrar y las nóminas por pagar del proyecto, y SHALL registrar el cobro o el
pago con la cuenta bancaria elegida, previa confirmación con el proyecto activo.
