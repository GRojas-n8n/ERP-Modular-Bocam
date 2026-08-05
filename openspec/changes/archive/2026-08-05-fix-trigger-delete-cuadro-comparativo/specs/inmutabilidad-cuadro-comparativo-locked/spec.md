## ADDED Requirements

### Requirement: DELETE sobre cuadro comparativo no LOCKED debe eliminar la fila
El sistema SHALL permitir que un `DELETE` sobre una fila de `cuadros_comparativos` cuyo `estado` no sea `LOCKED` elimine realmente esa fila de la base de datos.

#### Scenario: Borrar un cuadro comparativo en estado distinto de LOCKED
- **WHEN** se ejecuta `DELETE FROM cuadros_comparativos WHERE id_cuadro = :id` sobre un cuadro cuyo `estado` es distinto de `LOCKED` (por ejemplo `BORRADOR` o `EN_EVALUACION`)
- **THEN** la fila deja de existir en la tabla y una consulta posterior por ese `id_cuadro` no encuentra resultados

### Requirement: DELETE o UPDATE sobre cuadro comparativo LOCKED debe rechazarse con error explícito
El sistema SHALL rechazar cualquier `DELETE` o `UPDATE` sobre una fila de `cuadros_comparativos` cuyo `estado` sea `LOCKED`, lanzando una excepción explícita y dejando la fila sin cambios.

#### Scenario: Intentar borrar un cuadro comparativo LOCKED
- **WHEN** se ejecuta `DELETE FROM cuadros_comparativos WHERE id_cuadro = :id` sobre un cuadro cuyo `estado` es `LOCKED`
- **THEN** la operación falla con el error `cannot_modify_locked_comparativa` y la fila permanece intacta en la tabla

#### Scenario: Intentar actualizar un cuadro comparativo LOCKED
- **WHEN** se ejecuta un `UPDATE` sobre cualquier columna de una fila de `cuadros_comparativos` cuyo `estado` es `LOCKED`
- **THEN** la operación falla con el error `cannot_modify_locked_comparativa` y la fila permanece sin cambios
