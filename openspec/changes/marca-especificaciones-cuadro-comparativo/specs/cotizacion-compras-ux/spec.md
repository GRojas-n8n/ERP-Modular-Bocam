## ADDED Requirements

### Requirement: El Cuadro Comparativo SHALL prepoblarse con la marca/modelo y especificación técnica de la requisición
Al crear el Cuadro Comparativo, cada línea SHALL prepoblarse con la marca/modelo y la
especificación técnica que el Residente capturó en el ítem correspondiente de la
requisición (`especificacion_marca_modelo` / `especificacion_detalle`), sin requerir que
Compras las vuelva a capturar manualmente. Si el ítem ya tiene especificaciones
estructuradas registradas por el mecanismo de evaluación técnica por especificación, esas
SHALL tener prioridad sobre el texto libre de la requisición para el campo de
especificaciones. Compras SHALL poder seguir editando ambos campos manualmente después de
la creación del cuadro, sin cambios en ese flujo existente.

#### Scenario: Requisición con marca/modelo y especificación en texto libre
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem tiene
  `especificacion_marca_modelo` y `especificacion_detalle` capturados, y no tiene
  especificaciones estructuradas registradas
- **THEN** la línea del cuadro se crea con esa marca/modelo y esa especificación ya
  visibles en el panel de "Detalles técnicos", sin que Compras tenga que escribirlas de nuevo

#### Scenario: Requisición con especificaciones estructuradas ya registradas
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem sí tiene
  especificaciones estructuradas registradas (mecanismo de evaluación técnica por
  especificación)
- **THEN** el campo de especificaciones de la línea se puebla con esas especificaciones
  estructuradas, no con el texto libre de la requisición

#### Scenario: Requisición sin marca/modelo ni especificación capturados
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem no tiene
  `especificacion_marca_modelo` ni `especificacion_detalle` capturados
- **THEN** la línea del cuadro se crea con ambos campos vacíos, igual que el comportamiento
  actual, y Compras los captura manualmente si lo necesita
