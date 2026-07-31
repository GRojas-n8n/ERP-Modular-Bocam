## ADDED Requirements

### Requirement: Alta individual de empleado SHALL verificar rol personal_rh o admin
`POST /api/v1/personal/empleados` SHALL verificar que
`securityContext.roles` incluya `'admin'` o `'personal_rh'` antes de
crear el empleado.

#### Scenario: Usuario con rol personal_rh da de alta un empleado
- **WHEN** un usuario cuyo `roles` incluye `'personal_rh'` envía
  `POST /api/v1/personal/empleados` con los campos obligatorios
  completos
- **THEN** la respuesta es 201 y el empleado se crea

#### Scenario: Usuario sin rol autorizado no puede dar de alta empleados
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni
  `'personal_rh'` (por ejemplo, `'residencia'` o `'control_obra'`) envía
  `POST /api/v1/personal/empleados`
- **THEN** la respuesta es 403 con código `PER_FORBIDDEN` y no se crea
  ningún empleado

### Requirement: Baja de empleado SHALL verificar rol personal_rh o admin
`PATCH /api/v1/personal/empleados/:id/baja` SHALL verificar que
`securityContext.roles` incluya `'admin'` o `'personal_rh'` antes de
marcar al empleado como `BAJA`.

#### Scenario: Usuario con rol admin da de baja a un empleado
- **WHEN** un usuario cuyo `roles` incluye `'admin'` envía
  `PATCH /api/v1/personal/empleados/:id/baja` sobre un empleado
  existente
- **THEN** la respuesta es 200 y el empleado transiciona a estado
  `BAJA`

#### Scenario: Usuario sin rol autorizado no puede dar de baja empleados
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni
  `'personal_rh'` envía `PATCH /api/v1/personal/empleados/:id/baja`
- **THEN** la respuesta es 403 con código `PER_FORBIDDEN` y el empleado
  conserva su estado anterior

### Requirement: Creación de cuadrilla SHALL verificar rol personal_rh o admin
`POST /api/v1/personal/cuadrillas` SHALL verificar que
`securityContext.roles` incluya `'admin'` o `'personal_rh'` antes de
crear la cuadrilla.

#### Scenario: Usuario con rol personal_rh crea una cuadrilla
- **WHEN** un usuario cuyo `roles` incluye `'personal_rh'` envía
  `POST /api/v1/personal/cuadrillas` con `nombre` y `especialidad`
- **THEN** la respuesta es 201 y la cuadrilla se crea

#### Scenario: Usuario sin rol autorizado no puede crear cuadrillas
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni
  `'personal_rh'` envía `POST /api/v1/personal/cuadrillas`
- **THEN** la respuesta es 403 con código `PER_FORBIDDEN` y no se crea
  ninguna cuadrilla

### Requirement: Asignar empleados a cuadrilla SHALL verificar rol personal_rh o admin
`POST /api/v1/personal/cuadrillas/:id/asignar` SHALL verificar que
`securityContext.roles` incluya `'admin'` o `'personal_rh'` antes de
asignar empleados a la cuadrilla.

#### Scenario: Usuario con rol admin asigna empleados a una cuadrilla
- **WHEN** un usuario cuyo `roles` incluye `'admin'` envía
  `POST /api/v1/personal/cuadrillas/:id/asignar` con un arreglo de
  `empleado_ids` válidos
- **THEN** la respuesta es 200 y los empleados quedan asignados a la
  cuadrilla

#### Scenario: Usuario sin rol autorizado no puede asignar empleados a cuadrilla
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni
  `'personal_rh'` envía `POST /api/v1/personal/cuadrillas/:id/asignar`
- **THEN** la respuesta es 403 con código `PER_FORBIDDEN` y ningún
  empleado cambia de cuadrilla

### Requirement: Crear asignación a frente de trabajo SHALL verificar rol personal_rh o admin
`POST /api/v1/personal/asignaciones` SHALL verificar que
`securityContext.roles` incluya `'admin'` o `'personal_rh'` antes de
crear la asignación a frente de trabajo.

#### Scenario: Usuario con rol personal_rh crea una asignación a frente
- **WHEN** un usuario cuyo `roles` incluye `'personal_rh'` envía
  `POST /api/v1/personal/asignaciones` con `empleado_id` y
  `frente_trabajo`
- **THEN** la respuesta es 201 y la asignación se crea

#### Scenario: Usuario sin rol autorizado no puede crear asignaciones a frente
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni
  `'personal_rh'` envía `POST /api/v1/personal/asignaciones`
- **THEN** la respuesta es 403 con código `PER_FORBIDDEN` y no se crea
  ninguna asignación

### Requirement: Calcular pre-nómina SHALL verificar rol personal_rh o admin
`POST /api/v1/personal/prenominas/calcular` SHALL verificar que
`securityContext.roles` incluya `'admin'` o `'personal_rh'` antes de
calcular y crear el registro de pre-nómina.

#### Scenario: Usuario con rol personal_rh calcula una pre-nómina
- **WHEN** un usuario cuyo `roles` incluye `'personal_rh'` envía
  `POST /api/v1/personal/prenominas/calcular` con `periodo_inicio` y
  `periodo_fin` válidos, y hay empleados elegibles en el proyecto
- **THEN** la respuesta es 201 y se crea una pre-nómina en estado
  `CALCULADA`

#### Scenario: Usuario sin rol autorizado no puede calcular pre-nómina
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni
  `'personal_rh'` (por ejemplo, `'residencia'`) envía
  `POST /api/v1/personal/prenominas/calcular`
- **THEN** la respuesta es 403 con código `PER_FORBIDDEN` y no se crea
  ninguna pre-nómina
