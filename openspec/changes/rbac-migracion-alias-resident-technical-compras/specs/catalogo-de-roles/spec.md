## MODIFIED Requirements

### Requirement: El alta de usuarios SHALL rechazar roles no reconocidos
`POST /api/v1/auth/admin/users` SHALL rechazar cualquier rol que no sea
asignable, y `PATCH /api/v1/auth/admin/users/:id` SHALL rechazar cualquier rol
que no esté en el catálogo — aceptando alias vigentes, para no bloquear la
edición de usuarios que ya los tienen. Un rol retirado del catálogo (que dejó
de ser alias porque ya no lo exige ningún `requireRoles`) SHALL rechazarse
igual en alta y en edición. El mensaje de error SHALL nombrar el rol
rechazado.

#### Scenario: Errata al crear un usuario
- **WHEN** se envía `roles: ['finanzs']` a `POST /api/v1/auth/admin/users`
- **THEN** la petición SHALL rechazarse con un mensaje que incluya el rol
  rechazado, y el usuario NO SHALL crearse

#### Scenario: Editar un usuario con un rol retirado del catálogo
- **WHEN** se envía `roles: ['resident']` a `PATCH /api/v1/auth/admin/users/:id`
- **THEN** la petición SHALL rechazarse con un mensaje que incluya `resident`,
  porque `resident` ya no está catalogado (se retiró tras migrar todos los
  usuarios existentes a `residencia` y quitarlo de todo `requireRoles`)

## ADDED Requirements

### Requirement: Un alias SHALL retirarse del catálogo cuando ya no lo exige ningún servicio
Un rol con `estado: 'alias'` SHALL retirarse por completo del catálogo en
cuanto ningún `requireRoles(...)` real del backend lo exija ya, en el mismo
cambio que lo retira del backend — no SHALL dejarse catalogado como alias
huérfano. El test guardián del paquete `roles` SHALL fallar, nombrando el
alias, si detecta uno catalogado que ya no aparece en ningún `requireRoles`
real del backend.

#### Scenario: Un alias deja de ser exigido por el backend
- **WHEN** se quita la última referencia a un rol `estado: 'alias'` de todos
  los `requireRoles(...)` del backend, sin retirarlo de
  `packages/roles/src/index.ts`
- **THEN** la suite de `catalogo.test.ts` SHALL fallar, nombrando el alias y
  señalando que debe retirarse del catálogo

#### Scenario: resident, compras y technical dejan de existir
- **WHEN** se consulta `esRolValido('resident')`, `esRolValido('compras')` o
  `esRolValido('technical')` tras este cambio
- **THEN** las tres llamadas SHALL devolver `false` — ninguno de los tres
  aparece ya en `ROLES`
