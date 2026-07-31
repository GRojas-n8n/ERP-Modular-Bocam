# asignacion-residente-empleado Specification

## Purpose
TBD - created by archiving change mejoras-ux-personal-rh. Update Purpose after archive.
## Requirements
### Requirement: RH asigna uno o más Residentes a un empleado
El sistema SHALL permitir a un usuario con rol `personal_rh` o `admin` asignar a un empleado uno o más `residente_id` (identificador de usuario con rol `residencia` en `auth`), registrando `fecha_inicio` y `asignado_por`. Un empleado puede tener más de una asignación vigente simultánea.

#### Scenario: Asignar un solo residente
- **WHEN** RH asigna `residente_id = R1` a un empleado sin asignaciones previas
- **THEN** el sistema crea una `AsignacionResidente` vigente (`fecha_fin = null`) para ese empleado

#### Scenario: Asignar un segundo residente sin remover el primero
- **WHEN** RH asigna `residente_id = R2` a un empleado que ya tiene a `R1` vigente
- **THEN** el sistema crea una segunda `AsignacionResidente` vigente; ambas (`R1`, `R2`) quedan activas para el mismo empleado

#### Scenario: Rol sin permiso intenta asignar residente
- **WHEN** un usuario con rol distinto a `personal_rh`/`admin` intenta asignar un residente
- **THEN** el sistema responde `403`

### Requirement: RH desasigna un residente conservando historial
El sistema SHALL permitir a RH finalizar una asignación vigente estableciendo `fecha_fin`, sin borrar el registro.

#### Scenario: Finalizar una asignación vigente
- **WHEN** RH desasigna a `R1` de un empleado con asignación vigente
- **THEN** el sistema actualiza `fecha_fin` a la fecha actual; el registro permanece consultable en el historial

### Requirement: Consultar residentes asignados a un empleado
El sistema SHALL exponer `GET /api/v1/personal/empleados/:id/residentes` que retorna las asignaciones vigentes (y, con `?incluirHistorico=true`, también las finalizadas) con `residente_id`, `fecha_inicio`, `fecha_fin`. El sistema SHALL resolver el nombre del residente mediante una única consulta de listado a `GET /api/v1/personal/residentes-disponibles` (no una consulta por cada `residente_id`) y mapear los ids localmente. Si esa consulta falla, SHALL retornar el registro con `residente_nombre: null` y `parcial: true` en lugar de fallar la respuesta completa.

#### Scenario: Consulta exitosa con nombre resuelto
- **WHEN** se consulta `GET /api/v1/personal/empleados/:id/residentes` y el servicio `auth` responde correctamente
- **THEN** cada asignación incluye `residente_nombre` resuelto a partir del listado, no `null`

#### Scenario: Servicio auth no disponible
- **WHEN** se consulta `GET /api/v1/personal/empleados/:id/residentes` y el servicio `auth` no responde
- **THEN** el sistema retorna las asignaciones con `residente_nombre: null` y `parcial: true`, sin fallar con error 500

### Requirement: Residente consulta empleados a su cargo
El sistema SHALL exponer `GET /api/v1/personal/mis-empleados` para usuarios con rol `residencia`, que retorna únicamente los empleados con una `AsignacionResidente` vigente donde `residente_id` corresponde al usuario autenticado.

#### Scenario: Residente ve solo sus empleados asignados
- **WHEN** un usuario `residente` con id `R1` consulta `GET /api/v1/personal/mis-empleados`
- **THEN** el sistema retorna únicamente los empleados con asignación vigente a `R1`, excluyendo empleados asignados a otros residentes

### Requirement: Aislamiento de `asignaciones_residente` reforzado por RLS
La tabla `asignaciones_residente` SHALL tener Row-Level Security habilitado y forzado con una única política que exija `tenant_id` coincidente con `current_setting('app.current_tenant_id')` en `USING` y `WITH CHECK`. Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id` que ya existe en el código de `apps/personal/src/main.ts` en los endpoints de asignación/desasignación de residente y en `GET /mis-empleados`.

#### Scenario: Un tenant no puede ver asignaciones residente-empleado de otro tenant
- **WHEN** una consulta ejecuta `findMany` sobre `asignaciones_residente` con `app.current_tenant_id` fijado a un tenant distinto
- **THEN** la consulta retorna 0 filas de ese otro tenant, incluso si la consulta de aplicación no incluyera un `WHERE tenant_id` explícito

#### Scenario: Asignación no puede escribir en otro tenant
- **WHEN** una transacción con `app.current_tenant_id = T1` intenta crear una fila de `asignaciones_residente` con `tenant_id = T2`
- **THEN** la operación es rechazada por `WITH CHECK`

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

