## MODIFIED Requirements

### Requirement: compras.oc_creada SHALL incluir el nombre del proveedor
Cada evento `compras.oc_creada` SHALL incluir `proveedor_nombre` con la razón social del proveedor de la OC,
además de los campos existentes (`oc_id`, `codigo`, `total`, `proveedor_id`, `proyecto_id`, `requisicion_id`,
`concepto_id`, `items`), que no cambian.

#### Scenario: Dos proveedores en un cuadro
- **WHEN** se convierte a OC un cuadro aprobado con dos proveedores ganadores
- **THEN** SHALL publicarse un `compras.oc_creada` por OC y cada uno SHALL traer en `proveedor_nombre` la razón social de su proveedor
