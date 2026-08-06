## ADDED Requirements

### Requirement: Un usuario de almacén SHALL poder solicitar el traspaso de proyecto y/o asignación de un activo
El sistema SHALL permitir solicitar que un activo cambie de proyecto, de empleado asignado, o ambos a la vez, dejando el activo en `estado = EN_TRASPASO` y creando una solicitud `TraspasoActivo` en estado `PENDIENTE` — sin aplicar el cambio todavía.

#### Scenario: Solicitar traspaso de proyecto
- **WHEN** un usuario de almacén solicita mover un activo `DISPONIBLE` de su proyecto actual a otro proyecto
- **THEN** el sistema crea una solicitud `PENDIENTE` de tipo `PROYECTO`, y el activo pasa a `estado = EN_TRASPASO` sin cambiar su `proyecto_id` todavía

#### Scenario: Solicitar asignación a un empleado
- **WHEN** un usuario de almacén solicita asignar un activo `DISPONIBLE` a un empleado del mismo proyecto
- **THEN** el sistema crea una solicitud `PENDIENTE` de tipo `ASIGNACION`, referenciando al empleado real por id con snapshot de su nombre

#### Scenario: Un activo con traspaso pendiente no admite otra solicitud
- **WHEN** se intenta solicitar un nuevo traspaso para un activo con `estado = EN_TRASPASO`
- **THEN** el sistema responde 409 y no crea una segunda solicitud

### Requirement: Quien confirma un traspaso SHALL estar operando en el proyecto destino
El sistema SHALL exigir que el usuario que confirma una solicitud de traspaso de proyecto tenga el `proyecto_id` destino activo en su sesión — SHALL rechazar la confirmación si el proyecto activo de la sesión no coincide con el proyecto destino de la solicitud.

#### Scenario: Confirmar desde el proyecto correcto
- **WHEN** un usuario de almacén, con el proyecto destino activo en su sesión, confirma una solicitud `PENDIENTE` de tipo `PROYECTO`
- **THEN** el sistema aplica el cambio: actualiza `proyecto_id` del activo, marca la solicitud `CONFIRMADO`, y el activo vuelve a `estado = DISPONIBLE` (o `ASIGNADO` si también incluía asignación)

#### Scenario: Confirmar desde el proyecto equivocado es rechazado
- **WHEN** un usuario intenta confirmar una solicitud de traspaso de proyecto sin tener el proyecto destino activo en su sesión
- **THEN** el sistema responde 403 y no aplica ningún cambio

### Requirement: Una solicitud de traspaso SHALL poder rechazarse sin aplicar cambios
El sistema SHALL permitir rechazar una solicitud `PENDIENTE`, devolviendo el activo a su estado previo sin modificar su proyecto ni su asignación.

#### Scenario: Rechazar una solicitud
- **WHEN** un usuario de almacén rechaza una solicitud `PENDIENTE`, opcionalmente con una nota
- **THEN** la solicitud queda `RECHAZADA`, y el activo vuelve a su `estado` anterior (`DISPONIBLE` o `ASIGNADO`) sin cambiar de proyecto ni de empleado asignado

### Requirement: El historial de un activo SHALL mostrar todas sus solicitudes de traspaso en orden cronológico
El sistema SHALL exponer, para un activo dado, la lista completa de sus solicitudes de traspaso (pendientes, confirmadas y rechazadas) ordenadas de más reciente a más antigua, como registro de rastreabilidad.

#### Scenario: Consultar historial de un activo con movimientos
- **WHEN** se consulta el historial de un activo que ha tenido 2 traspasos confirmados y 1 rechazado
- **THEN** el sistema devuelve las 3 solicitudes en orden cronológico descendente, cada una con su estado, fechas y quién la solicitó/resolvió
