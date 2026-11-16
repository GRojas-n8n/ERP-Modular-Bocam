## ADDED Requirements

### Requirement: Un egreso multiproveedor SHALL generar una póliza cuadrada
Al recibir `finanzas.egreso_oc_registrado`, Contabilidad SHALL registrar una póliza EGRESO con un cargo a Cuentas por
Pagar por cada OC y abonos a Bancos por el total, y SHALL abrir la conciliación bancaria y la fiscal. Una reentrega
no SHALL duplicarla.

#### Scenario: Detalle que no suma el total
- **WHEN** la suma de `monto_aplicado` difiere de `monto_total`
- **THEN** no SHALL registrarse póliza

### Requirement: Un cobro SHALL generar una póliza de ingreso
Al recibir `finanzas.cobro_registrado`, Contabilidad SHALL registrar una póliza COBRO con cargo a Bancos y abono a
Cuentas por Cobrar.

## MODIFIED Requirements

### Requirement: La estimación aprobada SHALL registrarse con el contrato publicado
`control_obra.estimacion_aprobada` SHALL aceptar `total_neto` como monto (y `monto_total` por compatibilidad).
