## ADDED Requirements

### Requirement: Listar usuarios del tenant filtrados por rol con campos mínimos
`GET /api/v1/auth/usuarios` SHALL requerir `roles` incluya `'admin'` o
`'personal_rh'`. SHALL aceptar un query param `rol` obligatorio y SHALL
retornar los usuarios del tenant autenticado (`req.securityContext.tenantId`)
cuyo `rol_global` incluya ese valor y `activo` sea `true`, cada uno con
únicamente `id`, `nombre`, `email` — sin `proyectos_acceso`,
`limite_aprobacion` ni otros campos que expone `GET /api/v1/auth/admin/users`.

#### Scenario: personal_rh lista usuarios con rol residencia
- **WHEN** un usuario con rol `personal_rh` envía
  `GET /api/v1/auth/usuarios?rol=residencia`
- **THEN** la respuesta es 200 con un arreglo de usuarios activos del
  tenant cuyo `rol_global` incluye `'residencia'`, cada uno con solo
  `id`, `nombre`, `email`

#### Scenario: Usuario inactivo no aparece en el listado
- **WHEN** existe un usuario con rol `residencia` pero `activo: false`
- **THEN** `GET /api/v1/auth/usuarios?rol=residencia` no lo incluye en la
  respuesta

#### Scenario: Falta el query param rol
- **WHEN** se envía `GET /api/v1/auth/usuarios` sin `rol`
- **THEN** la respuesta es 400

#### Scenario: Rol sin permiso no puede listar usuarios
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni `'personal_rh'`
  envía `GET /api/v1/auth/usuarios?rol=residencia`
- **THEN** la respuesta es 403

#### Scenario: Aislamiento por tenant
- **WHEN** un usuario `personal_rh` del tenant `T1` envía
  `GET /api/v1/auth/usuarios?rol=residencia`
- **THEN** la respuesta solo incluye usuarios con `tenant_id = T1`, nunca
  usuarios de otro tenant aunque tengan el mismo rol
