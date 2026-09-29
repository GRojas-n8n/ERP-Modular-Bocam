## ADDED Requirements

### Requirement: Vista agrupada por concepto y totales en la pestaña Estimaciones
La pestaña "Estimaciones" de `ResidenciaView` SHALL mostrar los avances agrupados por concepto (una fila por concepto, detalle expandible por estimación/periodo) y tarjetas de totales contratado, estimado, cobrado y restante por cobrar obtenidos de control-proyectos.

#### Scenario: Concepto no se repite
- **WHEN** un concepto tiene avances en varias estimaciones
- **THEN** la tabla muestra una sola fila del concepto y el detalle expandible lista cada estimación

#### Scenario: Totales parciales
- **WHEN** la respuesta de totales trae `parcial: true`
- **THEN** las tarjetas de contratado y restante muestran "—" con aviso de dato parcial
