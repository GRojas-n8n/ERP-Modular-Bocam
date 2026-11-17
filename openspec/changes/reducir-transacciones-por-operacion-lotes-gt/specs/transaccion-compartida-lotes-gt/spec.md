## ADDED Requirements

### Requirement: Los endpoints de lote SHALL ejecutar sus operaciones dentro de una única transacción de Postgres por request
`POST /api/v1/gerencia-tecnica/insumos/importar-lote` (loop de actualización), `POST /api/v1/gerencia-tecnica/composicion-apu`, `POST /api/v1/gerencia-tecnica/presupuestos/:presupuesto_id/composicion-apu` y `PUT /api/v1/gerencia-tecnica/insumos/clasificacion-bulk` SHALL agrupar las operaciones de su loop dentro de una sola transacción de Postgres (`withTenantTransaction`), en vez de abrir una transacción independiente por fila.

#### Scenario: Un lote de actualización de insumos abre una sola transacción
- **WHEN** `POST /insumos/importar-lote` procesa un lote con 50 insumos que ya existen (todos requieren `update`)
- **THEN** el servidor SHALL ejecutar las 50 actualizaciones dentro de una única transacción de Postgres, no 50 transacciones independientes

### Requirement: Una fila inválida dentro de un lote SHALL omitirse sin afectar a las demás filas de la misma transacción
Cuando una operación individual dentro del loop de un endpoint de lote falla (violación de constraint, referencia inexistente, error inesperado), el sistema SHALL aislar ese fallo mediante un `SAVEPOINT` de Postgres, contar la fila como omitida, y continuar procesando el resto del lote dentro de la misma transacción compartida — sin que el fallo de una fila arrastre a las filas subsecuentes.

#### Scenario: Una fila con violación de constraint no afecta a las filas posteriores del mismo lote
- **WHEN** `POST /composicion-apu` procesa un lote donde una fila intermedia produce un error de base de datos inesperado (no capturado por la validación previa) y el resto de las filas son válidas
- **THEN** la fila que falla SHALL contarse en `omitidos`, y las filas válidas posteriores a esa fila en el mismo lote SHALL crearse/actualizarse normalmente, no fallar en cascada

#### Scenario: El resultado observable del endpoint no cambia respecto al comportamiento actual
- **WHEN** cualquiera de los 4 endpoints de lote procesa un request con una mezcla de filas válidas e inválidas, en las mismas condiciones que antes de este change
- **THEN** los contadores de la respuesta (`creados`/`actualizados`/`omitidos`/`vinculados`, según el endpoint) SHALL ser idénticos a los que se obtenían con una transacción por fila
