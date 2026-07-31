## ADDED Requirements

### Requirement: El panel de detalle de empleado muestra sus asignaciones a frente de trabajo
El sistema SHALL mostrar, junto a la sección "Residente(s) asignado(s)"
del panel de detalle de empleado, una sección "Asignación a Frente de
Trabajo" que lista las `AsignacionFrente` en estado `ACTIVA` del empleado
(obtenidas filtrando client-side el resultado de
`GET /api/v1/personal/asignaciones` por `empleado_id`), mostrando
`frente_trabajo`, `turno`, `fecha_inicio` y `fecha_fin`.

#### Scenario: Empleado con asignaciones activas
- **WHEN** RH abre el panel de un empleado con una `AsignacionFrente`
  activa
- **THEN** la sección muestra esa asignación con su frente de trabajo,
  turno y fechas

#### Scenario: Empleado sin asignaciones
- **WHEN** RH abre el panel de un empleado sin ninguna `AsignacionFrente`
- **THEN** la sección muestra un estado vacío indicando que no tiene
  asignación a ningún frente de trabajo

### Requirement: RH puede crear una asignación a frente de trabajo desde el panel de empleado
La sección SHALL incluir un formulario para crear una nueva
`AsignacionFrente`, exponiendo los campos que acepta
`POST /api/v1/personal/asignaciones`: `frente_trabajo` (obligatorio),
`turno`, `fecha_inicio`, `fecha_fin` (opcional), `horas_diarias` y
`cuadrilla_id` (opcional, poblado desde `GET /api/v1/personal/cuadrillas`).
`empleado_id` SHALL tomarse del empleado cuyo panel está abierto, sin
capturarlo en el formulario.

#### Scenario: Alta exitosa de asignación a frente
- **WHEN** RH completa `frente_trabajo` y confirma, y el backend responde
  201
- **THEN** el sistema refresca la lista de asignaciones del empleado y la
  nueva asignación aparece en la sección

#### Scenario: Intento de guardar sin frente_trabajo
- **WHEN** RH deja vacío `frente_trabajo` e intenta guardar
- **THEN** el sistema muestra un error y no envía la petición

#### Scenario: El backend rechaza la asignación
- **WHEN** el backend responde con error (4xx/5xx)
- **THEN** el sistema muestra el mensaje de error devuelto, sin limpiar
  el formulario ni modificar la lista de asignaciones mostrada
