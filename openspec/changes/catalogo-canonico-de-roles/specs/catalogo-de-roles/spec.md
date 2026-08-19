## ADDED Requirements

### Requirement: El sistema SHALL tener una única fuente de verdad de los roles
El repositorio SHALL exponer un catálogo de roles en un paquete compartido, sin
dependencias, importable tanto por los microservicios Express como por el bundle
del navegador. Ningún consumidor SHALL mantener su propia lista de roles.

Cada rol SHALL declarar un identificador, una etiqueta legible y un estado que
distinga los asignables, los reconocidos que aún no tienen endpoints propios, y
los alias históricos de otro rol.

#### Scenario: Un servicio exige un rol que no está catalogado
- **WHEN** un `requireRoles(...)` o una comprobación de rol en handler menciona
  un rol que no existe en el catálogo
- **THEN** la suite del paquete de roles SHALL fallar, nombrando el rol y el
  servicio que lo exige

### Requirement: Todo rol exigido por el backend SHALL poder asignarse desde Administración
Salvo los alias históricos, todo rol que algún servicio compruebe SHALL estar
disponible en el selector de alta y edición de usuarios. Un rol que el backend
exige y la interfaz no ofrece deja funcionalidad inalcanzable salvo otorgando
`admin`, lo que anula la separación de permisos.

#### Scenario: Alta de un usuario de Almacén
- **WHEN** un administrador crea un usuario para el responsable de almacén
- **THEN** el rol `warehouse` SHALL estar disponible en el selector, y el usuario
  resultante SHALL poder operar el módulo de Almacén sin tener rol `admin`

#### Scenario: Un alias histórico no se ofrece para usuarios nuevos
- **WHEN** un administrador abre el selector de roles
- **THEN** los roles marcados como alias NO SHALL aparecer, porque otorgan
  accesos distintos según el endpoint

### Requirement: El alta de usuarios SHALL rechazar roles no reconocidos
`POST /api/v1/auth/admin/users` SHALL rechazar cualquier rol que no sea
asignable, y `PATCH /api/v1/auth/admin/users/:id` SHALL rechazar cualquier rol
que no esté en el catálogo — aceptando alias, para no bloquear la edición de
usuarios que ya los tienen. El mensaje de error SHALL nombrar el rol rechazado.

#### Scenario: Errata al crear un usuario
- **WHEN** se envía `roles: ['finanzs']` a `POST /api/v1/auth/admin/users`
- **THEN** la petición SHALL rechazarse con un mensaje que incluya el rol
  rechazado, y el usuario NO SHALL crearse

#### Scenario: Editar un usuario que ya trae un alias
- **WHEN** se envía `roles: ['resident']` a `PATCH /api/v1/auth/admin/users/:id`
- **THEN** la petición SHALL aceptarse

### Requirement: Un rol sin endpoints SHALL advertirse al asignarlo
Cuando un rol está catalogado pero ningún servicio lo comprueba todavía, la
interfaz de alta de usuarios SHALL indicarlo al seleccionarlo, para que el
administrador sepa que el usuario verá el módulo en el menú y recibirá acceso
denegado al usarlo.

#### Scenario: Alta de un contador
- **WHEN** un administrador selecciona el rol `contabilidad`
- **THEN** la interfaz SHALL mostrar un aviso de que ese rol todavía no abre su
  módulo
