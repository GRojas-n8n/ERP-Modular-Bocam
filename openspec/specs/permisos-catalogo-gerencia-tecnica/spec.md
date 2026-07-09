## ADDED Requirements

### Requirement: El rol gerencia_tecnica SHALL poder crear y editar insumos del catálogo
`POST /api/v1/gerencia-tecnica/insumos` y `PATCH /api/v1/gerencia-tecnica/insumos/:id`
SHALL aceptar peticiones de usuarios con rol `gerencia_tecnica`, además de `admin` y
`superintendent`.

#### Scenario: Usuario con rol gerencia_tecnica crea un insumo
- **WHEN** un usuario autenticado con rol `gerencia_tecnica` hace
  `POST /api/v1/gerencia-tecnica/insumos` con datos válidos
- **THEN** el sistema responde `201` y el insumo queda creado en el catálogo

### Requirement: El rol gerencia_tecnica SHALL poder crear presupuestos
`POST /api/v1/gerencia-tecnica/presupuestos` SHALL aceptar peticiones de usuarios con
rol `gerencia_tecnica`, además de `admin` y `superintendent`.

#### Scenario: Usuario con rol gerencia_tecnica importa el catálogo de conceptos
- **WHEN** un usuario autenticado con rol `gerencia_tecnica` hace
  `POST /api/v1/gerencia-tecnica/presupuestos` con la lista de conceptos del
  catálogo de obra
- **THEN** el sistema responde `201` y crea el `PresupuestoBase` con sus conceptos

### Requirement: La importación de composición APU SHALL aceptar payloads de catálogos reales
El servidor SHALL aceptar bodies JSON de hasta 15mb en las rutas de
`gerencia-tecnica`, y el proxy (nginx) SHALL permitir hasta 20mb en esa misma ruta,
para soportar la importación de composición APU de catálogos OPUS reales (cientos de
insumos con cantidad/rendimiento/costo por partida).

#### Scenario: Importación de composición APU de un catálogo grande
- **WHEN** el frontend envía `POST /api/v1/gerencia-tecnica/composicion-apu` con un
  payload que excede 100kb (el default de Express) pero es menor a 15mb
- **THEN** el servidor lo procesa sin `PayloadTooLargeError` y crea/actualiza los
  registros de `ConceptoInsumo` correspondientes
