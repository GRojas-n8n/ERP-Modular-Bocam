## ADDED Requirements

### Requirement: Registro diario de bitácora de obra
El sistema SHALL permitir al residente responsable de un frente de trabajo
registrar una entrada de bitácora diaria en `control-proyectos`, con
consecutivo por proyecto, bajo `POST /api/v1/control-proyectos/bitacoras`.

#### Scenario: Residente registra la bitácora del día
- **WHEN** un usuario con rol `residencia`/`control_obra` envía
  `POST /api/v1/control-proyectos/bitacoras` con `proyecto_id`,
  `frente_trabajo`, `fecha`, `actividades_realizadas` y `personal_en_sitio`
- **THEN** el sistema crea la entrada con `numero_entrada` consecutivo por
  `(tenant_id, proyecto_id)`, estado inicial `BORRADOR`, y la asocia al
  `residente_id`/`residente_nombre` del token

#### Scenario: Listar bitácoras de un proyecto
- **WHEN** un usuario autorizado hace `GET /api/v1/control-proyectos/bitacoras?proyectoId=<uuid>`
- **THEN** el sistema devuelve solo las bitácoras cuyo `tenant_id` y
  `proyecto_id` coinciden con el contexto de sesión del usuario

### Requirement: Firma de bitácora
El sistema SHALL permitir marcar una bitácora como `FIRMADA` mediante
`PATCH /api/v1/control-proyectos/bitacoras/:id/firmar`, quedando inmutable
para edición posterior.

#### Scenario: Residente firma su bitácora
- **WHEN** el residente que la creó (o un superintendente) hace
  `PATCH /api/v1/control-proyectos/bitacoras/:id/firmar` sobre una
  bitácora en estado `BORRADOR`
- **THEN** el estado pasa a `FIRMADA` y el sistema publica
  `control_obra.bitacora_firmada`

#### Scenario: Intento de firmar una bitácora ya firmada
- **WHEN** se solicita firmar una bitácora cuyo estado ya es `FIRMADA` o
  `CERRADA`
- **THEN** el sistema rechaza la operación sin modificar el registro
