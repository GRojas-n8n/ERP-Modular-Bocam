## ADDED Requirements

### Requirement: El alta de usuarios sin rol explícito SHALL asignar el rol canónico
El sistema SHALL asignar por defecto el rol canónico `residencia` cuando
`POST /api/v1/auth/register` o `POST /api/v1/auth/admin/users` reciben la
petición sin `roles` (campo ausente o `undefined`). El sistema NUNCA SHALL
asignar por defecto un rol marcado `alias` en el catálogo — un alias solo
puede llegar a `rol_global` si el cliente lo envía explícito en una edición
(`PATCH /api/v1/auth/admin/users/:id`), nunca como valor implícito de alta.

#### Scenario: Alta pública sin rol
- **WHEN** se envía `POST /api/v1/auth/register` con email/password/nombre/
  tenant_id válidos y sin campo `roles`
- **THEN** el usuario creado SHALL tener `rol_global: ['residencia']`

#### Scenario: Alta por administrador sin rol
- **WHEN** un administrador envía `POST /api/v1/auth/admin/users` con datos
  válidos y sin campo `roles`
- **THEN** el usuario creado SHALL tener `rol_global: ['residencia']`
