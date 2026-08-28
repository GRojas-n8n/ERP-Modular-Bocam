## ADDED Requirements

### Requirement: La API de insumos SHALL exponer la cantidad agregada de cada insumo dentro del presupuesto activo
`GET /api/v1/gerencia-tecnica/insumos` y `GET /api/v1/gerencia-tecnica/insumos/explosion` SHALL incluir, para cada insumo, un campo `cantidad` calculado como la suma de `ConceptoInsumo.cantidad × Concepto.cantidad` para todos los conceptos del presupuesto activo (estado `APROBADO`, `LIBERADO` o `CONGELADO`) del proyecto que referencian ese insumo.

#### Scenario: Insumo usado en un único concepto
- **WHEN** un insumo con `costo_base` X está vinculado a un único concepto del presupuesto activo con `ConceptoInsumo.cantidad = 2` y `Concepto.cantidad = 10`
- **THEN** la respuesta SHALL incluir `cantidad = 20` para ese insumo

#### Scenario: Insumo usado en múltiples conceptos
- **WHEN** un insumo está vinculado a dos conceptos del presupuesto activo, con aportes de cantidad 20 y 15 respectivamente
- **THEN** la respuesta SHALL incluir `cantidad = 35` para ese insumo (suma de ambos aportes)

#### Scenario: Insumo sin composiciones vinculadas
- **WHEN** un insumo del catálogo no está referenciado por ningún `ConceptoInsumo` del presupuesto activo
- **THEN** la respuesta SHALL incluir `cantidad = 0` para ese insumo, no `null` ni un campo ausente

#### Scenario: Proyecto sin presupuesto activo (BORRADOR)
- **WHEN** el proyecto no tiene ningún `PresupuestoBase` en estado `APROBADO`, `LIBERADO` o `CONGELADO`
- **THEN** todos los insumos del proyecto SHALL retornar `cantidad = 0`

### Requirement: La vista de Explosión de Insumos SHALL mostrar la cantidad y su unidad de medida
La tabla de Explosión de Insumos en el frontend SHALL renderizar una columna "Cantidad" con el valor devuelto por la API junto a la `unidad_medida` del insumo.

#### Scenario: Usuario visualiza la explosión de insumos de un proyecto con presupuesto aprobado
- **WHEN** un usuario abre la vista de Explosión de Insumos de un proyecto con presupuesto activo
- **THEN** cada fila de la tabla SHALL mostrar la cantidad del insumo junto a su unidad de medida (ej. "120 m3")
