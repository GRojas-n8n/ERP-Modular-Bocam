## RENAMED Requirements

- FROM: `### Requirement: Los roles de nivel-tenant sin proyecto activo SHALL ver el catálogo consolidado con trazabilidad por proyecto`
- TO: `### Requirement: Los roles de nivel-tenant sin proyecto activo SHALL ser rechazados en el catálogo de Insumos`

## MODIFIED Requirements

### Requirement: Los roles de nivel-tenant sin proyecto activo SHALL ser rechazados en el catálogo de Insumos
Cuando un usuario con rol de nivel-tenant (`admin`, `superintendent`) no tiene un proyecto activo en el contexto de sesión, `GET /api/v1/gerencia-tecnica/insumos` SHALL responder `403 AUTH_PROJECT_REQUIRED` antes de consultar datos y NO SHALL retornar insumos de ningún proyecto. El catálogo de Insumos es una capacidad project-scoped y no existe modo consolidado del tenant.

#### Scenario: Admin sin proyecto activo es rechazado
- **WHEN** un usuario con rol `admin` sin proyecto activo hace `GET /api/v1/gerencia-tecnica/insumos`
- **THEN** la respuesta SHALL ser `403` con código `AUTH_PROJECT_REQUIRED` y NO SHALL incluir datos de ningún proyecto

#### Scenario: Admin con proyecto activo ve solo ese proyecto
- **WHEN** un usuario con rol `admin` con proyecto activo `A` hace `GET /api/v1/gerencia-tecnica/insumos`
- **THEN** la respuesta SHALL incluir únicamente insumos con `proyecto_id = A`
