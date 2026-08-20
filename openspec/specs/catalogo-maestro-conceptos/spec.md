# catalogo-maestro-conceptos Specification

## Purpose

Catálogo maestro de conceptos (`ConceptoCatalogo`), único por
`(tenant_id, clave)` y reutilizable entre todos los proyectos del mismo
tenant, consultado al importar un presupuesto nuevo para advertir sobre
divergencias de descripción o unidad de medida contra claves ya usadas en
otras obras — sin bloquear la importación ni reemplazar el precio o cantidad
del presupuesto importado.

## Requirements

### Requirement: Catálogo maestro de conceptos por tenant
El sistema SHALL mantener un catálogo maestro de conceptos (`ConceptoCatalogo`)
único por `(tenant_id, clave)`, reutilizable entre todos los proyectos del
mismo tenant, y SHALL consultarlo al importar un presupuesto nuevo para
detectar divergencias de descripción o unidad de medida contra claves ya
usadas en otras obras.

#### Scenario: Concepto con clave nueva se agrega al catálogo maestro
- **WHEN** `POST /api/v1/gerencia-tecnica/presupuestos` importa un concepto
  cuya `clave` no existe todavía en `ConceptoCatalogo` del tenant
- **THEN** el sistema crea la entrada en `ConceptoCatalogo` con la
  `descripcion` y `unidad_medida` de ese concepto

#### Scenario: Concepto con clave conocida y datos consistentes
- **WHEN** se importa un concepto cuya `clave` ya existe en
  `ConceptoCatalogo` del tenant con la misma `descripcion` y
  `unidad_medida`
- **THEN** el sistema crea el `Concepto` del presupuesto normalmente, sin
  advertencia

#### Scenario: Concepto con clave conocida pero datos divergentes
- **WHEN** se importa un concepto cuya `clave` ya existe en
  `ConceptoCatalogo` del tenant con una `descripcion` o `unidad_medida`
  distinta a la del archivo importado
- **THEN** el sistema crea el `Concepto` igualmente (no bloquea la
  importación) y agrega una advertencia a la respuesta indicando la
  clave y los valores que difieren

#### Scenario: El catálogo maestro no reemplaza precio ni cantidad del presupuesto
- **WHEN** un concepto se resuelve contra `ConceptoCatalogo`
- **THEN** `precio_unitario` y `cantidad` del `Concepto` creado siguen
  siendo los del archivo importado, nunca un valor tomado del catálogo
  maestro
