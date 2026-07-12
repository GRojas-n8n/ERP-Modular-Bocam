## ADDED Requirements

### Requirement: Un usuario de almacén SHALL poder dar de alta un activo fijo clasificado
El sistema SHALL permitir a un usuario con rol `admin`, `superintendent`, `procurement` o `warehouse` registrar un activo fijo con clave, descripción, clasificación (`EQUIPO`, `HERRAMIENTA`, `MAQUINARIA` o `VEHICULO`) y proyecto inicial, asignándole un `numero_activo` correlativo único por tenant.

#### Scenario: Alta de un activo válido
- **WHEN** un usuario con rol de almacén registra un activo con clave, descripción, clasificación válida y proyecto
- **THEN** el sistema crea el activo con `numero_activo` correlativo, `estado = DISPONIBLE`, y `fecha_alta` igual a la fecha actual

#### Scenario: Clasificación inválida es rechazada
- **WHEN** se intenta registrar un activo con una clasificación fuera de `EQUIPO`/`HERRAMIENTA`/`MAQUINARIA`/`VEHICULO`
- **THEN** el sistema responde 400 y no crea el activo

### Requirement: El catálogo de activos SHALL poder filtrarse por clasificación y estado
El endpoint de listado de activos SHALL aceptar filtros opcionales por `clasificacion` y `estado`, además de búsqueda por clave/descripción.

#### Scenario: Filtrar por clasificación
- **WHEN** se consulta el catálogo de activos con `clasificacion=VEHICULO`
- **THEN** la respuesta incluye únicamente activos de esa clasificación

### Requirement: Un usuario de almacén SHALL poder editar los datos descriptivos de un activo
El sistema SHALL permitir editar `descripcion`, `ubicacion` y `valor_adquisicion` de un activo existente, sin permitir cambiar `proyecto_id` ni `asignado_a_empleado_id` desde este endpoint (esos cambios van por el flujo de traspaso).

#### Scenario: Editar descripción y ubicación
- **WHEN** un usuario de almacén actualiza la descripción y ubicación de un activo existente
- **THEN** el sistema persiste los cambios sin alterar su proyecto ni su asignación actual

### Requirement: Un usuario de almacén SHALL poder dar de baja un activo con motivo obligatorio
El sistema SHALL permitir marcar un activo como `BAJA`, exigiendo un motivo, y SHALL impedir que un activo dado de baja participe en nuevos traspasos o asignaciones.

#### Scenario: Baja con motivo
- **WHEN** un usuario de almacén da de baja un activo indicando el motivo
- **THEN** el sistema marca `estado = BAJA`, guarda `fecha_baja` y `motivo_baja`

#### Scenario: Baja sin motivo es rechazada
- **WHEN** se intenta dar de baja un activo sin indicar motivo
- **THEN** el sistema responde 400 y el activo conserva su estado anterior

#### Scenario: Un activo dado de baja no admite un nuevo traspaso
- **WHEN** se intenta solicitar un traspaso para un activo con `estado = BAJA`
- **THEN** el sistema responde 409 y no crea la solicitud
