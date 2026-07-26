## ADDED Requirements

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
El sistema SHALL exponer `GET /api/v1/personal/empleados/:id/residentes` que retorna las asignaciones vigentes (y, con `?incluirHistorico=true`, también las finalizadas) con `residente_id`, `fecha_inicio`, `fecha_fin`. El sistema SHALL intentar resolver el nombre del residente consultando a `auth`; si la consulta falla, SHALL retornar el registro con `residente_nombre: null` y `parcial: true` en lugar de fallar la respuesta completa.

#### Scenario: Consulta exitosa con nombre resuelto
- **WHEN** se consulta `GET /api/v1/personal/empleados/:id/residentes` y el servicio `auth` responde correctamente
- **THEN** cada asignación incluye `residente_nombre` resuelto

#### Scenario: Servicio auth no disponible
- **WHEN** se consulta `GET /api/v1/personal/empleados/:id/residentes` y el servicio `auth` no responde
- **THEN** el sistema retorna las asignaciones con `residente_nombre: null` y `parcial: true`, sin fallar con error 500

### Requirement: Residente consulta empleados a su cargo
El sistema SHALL exponer `GET /api/v1/personal/mis-empleados` para usuarios con rol `residencia`, que retorna únicamente los empleados con una `AsignacionResidente` vigente donde `residente_id` corresponde al usuario autenticado.

#### Scenario: Residente ve solo sus empleados asignados
- **WHEN** un usuario `residente` con id `R1` consulta `GET /api/v1/personal/mis-empleados`
- **THEN** el sistema retorna únicamente los empleados con asignación vigente a `R1`, excluyendo empleados asignados a otros residentes
