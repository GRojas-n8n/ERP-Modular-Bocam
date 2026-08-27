## ADDED Requirements

### Requirement: El catálogo de Insumos SHALL aislarse por proyecto para roles de nivel-proyecto
`GET /api/v1/gerencia-tecnica/insumos` y `GET /api/v1/gerencia-tecnica/insumos/explosion` SHALL retornar únicamente los insumos cuyo `proyecto_id` coincide con el proyecto activo de la sesión, cuando el usuario autenticado tiene un rol de nivel-proyecto (`gerencia_tecnica`, `technical`).

#### Scenario: Usuario de Gerencia Técnica solo ve los insumos de su proyecto activo
- **WHEN** un usuario con rol `gerencia_tecnica` y proyecto activo `A` hace `GET /api/v1/gerencia-tecnica/insumos`
- **THEN** la respuesta SHALL incluir únicamente insumos con `proyecto_id = A`, y NO SHALL incluir insumos de ningún otro proyecto del mismo tenant

#### Scenario: Un Residente solo puede seleccionar insumos de su propio proyecto en una requisición
- **WHEN** un Residente con proyecto activo `A` hace `GET /api/v1/gerencia-tecnica/insumos/explosion` para armar una requisición "Por Insumo"
- **THEN** la respuesta SHALL incluir únicamente insumos con `proyecto_id = A`

### Requirement: Los roles de nivel-tenant sin proyecto activo SHALL ver el catálogo consolidado con trazabilidad por proyecto
Cuando un usuario con rol de nivel-tenant (`admin`, `superintendent`) no tiene un proyecto activo en el contexto de sesión, `GET /api/v1/gerencia-tecnica/insumos` SHALL retornar los insumos de todos los proyectos del tenant, y cada insumo en la respuesta SHALL incluir su `proyecto_id` de origen.

#### Scenario: Admin sin proyecto activo ve el catálogo consolidado
- **WHEN** un usuario con rol `admin` sin proyecto activo hace `GET /api/v1/gerencia-tecnica/insumos`
- **THEN** la respuesta SHALL incluir insumos de todos los proyectos del tenant, cada uno con su campo `proyecto_id`

#### Scenario: Admin con proyecto activo ve solo ese proyecto
- **WHEN** un usuario con rol `admin` con proyecto activo `A` hace `GET /api/v1/gerencia-tecnica/insumos`
- **THEN** la respuesta SHALL incluir únicamente insumos con `proyecto_id = A`

### Requirement: Las escrituras de Insumo SHALL asociarse al proyecto activo de la sesión
`POST /api/v1/gerencia-tecnica/insumos` y `POST /api/v1/gerencia-tecnica/insumos/importar-lote` SHALL estampar el `proyecto_id` del proyecto activo de la sesión en cada insumo creado. La unicidad de `clave` SHALL evaluarse dentro del alcance `(tenant_id, proyecto_id)`, no a nivel de todo el tenant.

#### Scenario: Crear un insumo con una clave ya usada en otro proyecto del mismo tenant
- **WHEN** un usuario con proyecto activo `A` hace `POST /api/v1/gerencia-tecnica/insumos` con una `clave` que ya existe en el catálogo del proyecto `B` del mismo tenant, pero no en el de `A`
- **THEN** el sistema SHALL crear el insumo normalmente en el proyecto `A`, como una fila independiente de la del proyecto `B`

#### Scenario: Importar un lote de insumos estampa el proyecto activo
- **WHEN** un usuario con proyecto activo `A` hace `POST /api/v1/gerencia-tecnica/insumos/importar-lote` con un array de insumos válidos
- **THEN** cada insumo creado SHALL tener `proyecto_id = A`

### Requirement: Los insumos históricos sin proyecto determinable SHALL preservarse archivados, no reasignados por adivinanza
Un `Insumo` que existía antes de este change y cuyo proyecto de origen no puede determinarse sin ambigüedad a partir de `ConceptoInsumo` (referenciado por más de un proyecto, o por ninguno) SHALL marcarse `activo = false` y conservar `proyecto_id = NULL`, en vez de asignársele un proyecto adivinado.

#### Scenario: Insumo histórico usado en un único proyecto se migra a ese proyecto
- **WHEN** el backfill de datos encuentra un `Insumo` con `proyecto_id NULL` referenciado en `ConceptoInsumo` únicamente del proyecto `A`
- **THEN** el backfill SHALL asignarle `proyecto_id = A`

#### Scenario: Insumo histórico ambiguo o sin referencia se archiva sin proyecto asignado
- **WHEN** el backfill de datos encuentra un `Insumo` con `proyecto_id NULL` referenciado en `ConceptoInsumo` de más de un proyecto, o sin ninguna referencia
- **THEN** el backfill SHALL marcarlo `activo = false`, SHALL conservar `proyecto_id = NULL`, y NO SHALL eliminar el registro
