## ADDED Requirements

### Requirement: Agregar un proveedor o una línea manualmente SHALL preservar el estado del cuadro
Agregar un proveedor desde el catálogo o una línea/ítem manualmente al
Cuadro Comparativo, mientras está en `BORRADOR`, SHALL preservar
`estado: 'BORRADOR'` en la actualización local — NO SHALL introducir un
estado distinto que el backend no reconozca.

#### Scenario: Agregar proveedor no bloquea "Enviar a Evaluación Técnica"
- **WHEN** Compras agrega un proveedor desde el catálogo a un cuadro en
  `BORRADOR`
- **THEN** el cuadro permanece en `estado: 'BORRADOR'` y el botón "Enviar
  a Evaluación Técnica →" sigue disponible

#### Scenario: Agregar una línea manualmente no bloquea "Enviar a Evaluación Técnica"
- **WHEN** Compras agrega una línea/ítem manualmente a un cuadro en
  `BORRADOR`
- **THEN** el cuadro permanece en `estado: 'BORRADOR'` y el botón "Enviar
  a Evaluación Técnica →" sigue disponible
