# Spec: bitacoras-obra

## Purpose

Gestiona, dentro de `control-proyectos`, el registro diario de bitácora de
obra por residente responsable de un frente de trabajo, y su firma, que la
vuelve inmutable para edición posterior. Esta capacidad reemplaza al
servicio `control-obra` original, fusionado a `control-proyectos`; el
evento publicado (`control_obra.bitacora_firmada`) conserva su nombre para
no romper a los consumidores existentes.
## Requirements
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

### Requirement: El panel "Nueva Entrada" de bitácora permanece abierto tras un guardado exitoso
El sistema SHALL mantener visible el panel "Nueva Entrada" de bitácora en `ControlObraView` después de que una entrada se registra exitosamente, conservando el frente de trabajo seleccionado, limpiando los campos propios de la entrada (`actividades_realizadas`, `personal_en_sitio`, y demás campos de captura del día) y mostrando una confirmación inline de la entrada guardada, en lugar de cerrar el panel.

#### Scenario: El panel se mantiene abierto tras guardar una entrada de bitácora
- **WHEN** un usuario con rol `residencia`/`control_obra` guarda exitosamente una entrada desde el panel "Nueva Entrada"
- **THEN** el panel permanece abierto, el frente de trabajo seleccionado se conserva, los demás campos de la entrada quedan vacíos listos para una nueva captura, y se muestra una confirmación inline con el número de entrada recién creado

#### Scenario: El usuario captura una segunda entrada para el mismo frente sin reabrir el panel
- **WHEN** el usuario, con el panel abierto tras un guardado exitoso y el mismo frente de trabajo aún seleccionado, captura una nueva entrada de bitácora
- **THEN** el sistema permite confirmar y enviar esta segunda entrada sin que el usuario haya tenido que reabrir el panel "Nueva Entrada" ni volver a seleccionar el frente de trabajo

#### Scenario: El usuario cierra el panel explícitamente
- **WHEN** el usuario hace clic en la acción "Cerrar" del panel "Nueva Entrada", con o sin haber guardado entradas previamente
- **THEN** el sistema cierra el panel sin registrar ninguna entrada adicional
