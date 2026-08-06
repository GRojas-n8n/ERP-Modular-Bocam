## ADDED Requirements

### Requirement: El cambio de proyecto activo SHALL reconocer a Finanzas como rol global
`POST /api/v1/auth/switch-project` SHALL permitir a un usuario cuyo `rol_global` incluya `'finanzas'` cambiar su proyecto activo a cualquier proyecto del tenant, sin requerir un registro explícito de acceso (`proyectos_acceso`) a ese proyecto — igual que `'admin'`, `'superintendent'` y `'procurement'`.

#### Scenario: Usuario con rol finanzas cambia de proyecto activo sin acceso explícito registrado
- **WHEN** un usuario cuyo `rol_global` incluye `'finanzas'` (y no tiene un registro en `proyectos_acceso` para el proyecto destino) envía `POST /api/v1/auth/switch-project` con un `proyecto_id` válido del mismo tenant
- **THEN** la respuesta es 200 con un `accessToken` para ese proyecto, no 403 `AUTH_PROJECT_FORBIDDEN`
