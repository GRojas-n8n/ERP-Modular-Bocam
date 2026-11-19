## MODIFIED Requirements

### Requirement: El administrador SHALL poder completar el flujo del cuadro comparativo
El rol `admin` SHALL poder enviar un cuadro firmado a aprobación de Gerencia Técnica y consultar las bandejas
de evaluación técnica y de aprobación GT, igual que puede firmarlo y aprobarlo en GT. Los roles que ya tenían
acceso SHALL conservarlo.

#### Scenario: admin envía el cuadro a GT
- **WHEN** un usuario con rol `admin` llama `PATCH /api/v1/compras/comparativas/:id/enviar-gt`
- **THEN** la respuesta NO SHALL ser 403 `AUTH_FORBIDDEN`; aplican las mismas validaciones de estado que a los demás roles

#### Scenario: admin consulta las bandejas
- **WHEN** un usuario con rol `admin` llama `GET /comparativas/pendientes-evaluacion` o `GET /comparativas/pendientes-gt`
- **THEN** la respuesta NO SHALL ser 403 `AUTH_FORBIDDEN`
