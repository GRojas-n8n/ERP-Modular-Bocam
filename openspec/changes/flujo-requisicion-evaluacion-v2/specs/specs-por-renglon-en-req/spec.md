## ADDED Requirements

### Requirement: Residente captura especificaciones técnicas por renglón en la requisición

Al crear o editar una requisición, el Residente SHALL poder agregar, por cada renglón de material, una marca/modelo de referencia (texto libre, máx 200 chars) y un texto de especificaciones técnicas (texto libre sin límite). Ambos campos son opcionales. La ausencia de specs no bloquea el guardado de la req.

#### Scenario: Agregar specs al crear una requisición

- **WHEN** el Residente agrega un material al formulario de creación de req
- **THEN** aparecen dos campos opcionales debajo del material: "Marca / Modelo ref." (input texto) y "Especificaciones técnicas" (textarea)
- **THEN** el Residente puede llenar uno, ambos, o ninguno antes de guardar

#### Scenario: Specs se persisten y se muestran en el cuadro comparativo

- **WHEN** la requisición con specs es aprobada y Compras abre el cuadro comparativo en estado BORRADOR
- **THEN** los campos `especificacion_marca_modelo` y `especificacion_detalle` de cada renglón se muestran como referencia para Compras (solo lectura en el cuadro)

#### Scenario: Requisición sin specs funciona igual que antes

- **WHEN** el Residente crea una req sin llenar los campos de specs
- **THEN** el cuadro comparativo muestra "Sin especificaciones" en esa columna sin error

### Requirement: Especificaciones fluyen a la Solicitud de Cotización (SCP)

Las especificaciones técnicas por renglón SHALL incluirse en los datos enviados al proveedor dentro de la SCP, de modo que el proveedor sepa exactamente qué se requiere.

#### Scenario: SCP contiene specs del renglón

- **WHEN** Compras genera una SCP para un proveedor sobre una req con specs
- **THEN** la SCP incluye, por renglón, el texto de `especificacion_marca_modelo` y `especificacion_detalle`
