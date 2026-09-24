## ADDED Requirements

### Requirement: El catálogo OpenSpec SHALL validar íntegramente en modo estricto
Todas las especificaciones canónicas y todos los changes activos SHALL pasar `openspec validate --all --strict` sin errores ni propósitos placeholder antes de activar el gate obligatorio en CI.

#### Scenario: Catálogo completamente migrado
- **WHEN** se ejecuta la validación estricta integral después de los lotes de migración
- **THEN** todos los elementos terminan válidos y el proceso devuelve código cero

#### Scenario: Regresión posterior
- **WHEN** un PR introduce una spec sin secciones requeridas, un propósito placeholder o un delta que omite escenarios
- **THEN** el gate de CI falla e identifica el elemento y la causa

### Requirement: La migración estructural SHALL preservar requisitos y escenarios
La transformación de una spec de formato histórico al formato vigente SHALL conservar el texto y conjunto de requisitos y escenarios. Cualquier diferencia semántica SHALL tratarse como un change funcional independiente.

#### Scenario: Cambio solo de estructura
- **WHEN** se migra una spec con encabezados históricos
- **THEN** la comparación normalizada antes/después contiene los mismos requisitos, escenarios, condiciones `WHEN` y resultados `THEN`

#### Scenario: Diferencia funcional detectada
- **WHEN** la comparación encuentra un requisito o escenario agregado, eliminado o reescrito
- **THEN** el lote falla y el archivo se retira hasta contar con una propuesta funcional independiente

### Requirement: Los propósitos SHALL revisarse por dominio
Cada propósito placeholder SHALL reemplazarse por una descripción breve del objetivo de la capacidad, derivada de sus requisitos existentes y aprobada por revisión humana del dominio.

#### Scenario: Propósito revisado
- **WHEN** una spec con placeholder entra en un lote de migración
- **THEN** el PR identifica al revisor funcional y la validación deja de reportar el placeholder
