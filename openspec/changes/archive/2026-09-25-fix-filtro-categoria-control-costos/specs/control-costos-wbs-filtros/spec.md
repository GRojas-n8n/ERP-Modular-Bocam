## ADDED Requirements

### Requirement: Filtros de la tabla Control de Costos
El sistema SHALL ofrecer en la pestaña "Control de Costos" de `InsumosView` únicamente filtros que tengan datos reales que respaldarlos: el filtro "Solo con desviación" sobre el semáforo por partida. El sistema SHALL NOT presentar un selector de categoría de gasto en esta tabla mientras el endpoint `GET /api/v1/gerencia-tecnica/proyectos/:id/costos-wbs` no calcule un desglose real de comprometido/pagado por categoría.

#### Scenario: Filtro "Solo con desviación" sigue disponible y funcional
- **WHEN** el usuario activa el checkbox "Solo con desviación" en la pestaña "Control de Costos"
- **THEN** la tabla muestra únicamente las partidas cuyo semáforo es `amarillo` o `rojo`

#### Scenario: No existe selector de categoría no funcional
- **WHEN** el usuario abre la pestaña "Control de Costos"
- **THEN** el sistema no presenta ningún selector de categoría de gasto en esta tabla

#### Scenario: Reintroducción futura del filtro por categoría requiere datos reales
- **WHEN** una futura propuesta agregue el cálculo de desglose por categoría de gasto en el backend de `costos-wbs`
- **THEN** esa propuesta SHALL modificar este requerimiento (delta a esta spec) para documentar el nuevo filtro, en vez de reintroducirlo sin datos que lo respalden
