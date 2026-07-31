## MODIFIED Requirements

### Requirement: Consultar residentes asignados a un empleado
El sistema SHALL exponer `GET /api/v1/personal/empleados/:id/residentes` que retorna las asignaciones vigentes (y, con `?incluirHistorico=true`, también las finalizadas) con `residente_id`, `fecha_inicio`, `fecha_fin`. El sistema SHALL resolver el nombre del residente mediante una única consulta de listado a `GET /api/v1/personal/residentes-disponibles` (no una consulta por cada `residente_id`) y mapear los ids localmente. Si esa consulta falla, SHALL retornar el registro con `residente_nombre: null` y `parcial: true` en lugar de fallar la respuesta completa.

#### Scenario: Consulta exitosa con nombre resuelto
- **WHEN** se consulta `GET /api/v1/personal/empleados/:id/residentes` y el servicio `auth` responde correctamente
- **THEN** cada asignación incluye `residente_nombre` resuelto a partir del listado, no `null`

#### Scenario: Servicio auth no disponible
- **WHEN** se consulta `GET /api/v1/personal/empleados/:id/residentes` y el servicio `auth` no responde
- **THEN** el sistema retorna las asignaciones con `residente_nombre: null` y `parcial: true`, sin fallar con error 500

## ADDED Requirements

### Requirement: RH consulta el directorio de residentes disponibles para asignar
El sistema SHALL exponer `GET /api/v1/personal/residentes-disponibles`, restringido a `personal_rh`/`admin`, que hace proxy a `GET /api/v1/auth/usuarios?rol=residencia` reenviando el `Authorization` de la petición original, y retorna la lista de usuarios (`id`, `nombre`, `email`) sin exponer datos adicionales de `auth`.

#### Scenario: personal_rh obtiene el directorio de residentes
- **WHEN** un usuario con rol `personal_rh` envía `GET /api/v1/personal/residentes-disponibles`
- **THEN** la respuesta es 200 con la lista de usuarios de `auth` cuyo rol incluye `residencia`, scoped al tenant de la sesión

#### Scenario: Rol sin permiso no puede consultar el directorio
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni `'personal_rh'` envía `GET /api/v1/personal/residentes-disponibles`
- **THEN** la respuesta es 403

#### Scenario: auth no disponible al consultar el directorio
- **WHEN** `auth` no responde a la consulta proxy
- **THEN** el sistema retorna un error controlado (no 500 sin estructura) que el frontend pueda mostrar como "directorio no disponible"

### Requirement: El formulario de asignar residente usa un selector por nombre
En el panel de detalle de empleado, la sección "Residente(s) asignado(s)" SHALL reemplazar el campo de texto libre de `residente_id` por un `<select>` poblado con `GET /api/v1/personal/residentes-disponibles` (texto visible: nombre; valor: id). Si el directorio no está disponible, el selector SHALL deshabilitarse con un mensaje, sin bloquear el resto del panel.

#### Scenario: RH asigna un residente eligiéndolo por nombre
- **WHEN** RH abre el panel de un empleado y el directorio de residentes cargó correctamente
- **THEN** el selector muestra los nombres de los residentes del tenant y, al elegir uno y confirmar, se llama `POST /empleados/:id/residentes` con el `residente_id` correspondiente

#### Scenario: Directorio no disponible
- **WHEN** `GET /api/v1/personal/residentes-disponibles` falla
- **THEN** el selector se muestra deshabilitado con un mensaje de error, y el resto de las secciones del panel de empleado siguen funcionando

### Requirement: Aviso de que asignar un residente no otorga elegibilidad de proyecto
Junto a la sección "Residente(s) asignado(s)" del panel de detalle de empleado, el sistema SHALL mostrar una nota visible indicando que asignar un residente no hace elegible al empleado para asistencia/nómina de un proyecto, y que para eso se requiere una Asignación a Frente de Trabajo (o pertenencia a una Cuadrilla).

#### Scenario: La nota es visible siempre que la sección esté abierta
- **WHEN** RH abre el panel de detalle de cualquier empleado
- **THEN** la nota aclaratoria es visible junto a "Residente(s) asignado(s)", sin importar si el empleado ya tiene residentes asignados o no
