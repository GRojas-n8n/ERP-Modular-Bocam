## ADDED Requirements

### Requirement: Admin, Gerencia Técnica y Control de Proyectos SHALL poder eliminar un Catálogo de Conceptos importado por error
El sistema SHALL exponer `DELETE /api/v1/gerencia-tecnica/presupuestos/:id`, restringido a
usuarios con rol `admin`, `gerencia_tecnica` o `control_proyectos`, que elimina el
`PresupuestoBase` junto con sus `Capitulo`, `Concepto` y `ConceptoInsumo` asociados. El
sistema SHALL rechazar la eliminación con `409` si algún `Concepto` del presupuesto tiene un
`SaldoPartida` con `monto_comprometido > 0` o `monto_ejercido > 0`, o si existe una
`CompraProyectada` asociada a alguno de sus conceptos. (Avances físicos, estimaciones y
bitácoras viven en el microservicio `control-proyectos` y quedan fuera de esta validación —
ver design.md.)

#### Scenario: Gerencia Técnica elimina un Catálogo de Conceptos recién importado sin uso
- **WHEN** un usuario con rol `gerencia_tecnica` hace
  `DELETE /api/v1/gerencia-tecnica/presupuestos/:id` de un presupuesto cuyos conceptos no
  tienen avances ni estimaciones registradas
- **THEN** el sistema responde `200` y elimina el `PresupuestoBase` con todos sus capítulos,
  conceptos y composiciones APU asociadas

#### Scenario: Control de Proyectos elimina un Catálogo de Conceptos recién importado sin uso
- **WHEN** un usuario con rol `control_proyectos` hace
  `DELETE /api/v1/gerencia-tecnica/presupuestos/:id` de un presupuesto cuyos conceptos no
  tienen avances ni estimaciones registradas
- **THEN** el sistema responde `200` y elimina el `PresupuestoBase` con todos sus capítulos,
  conceptos y composiciones APU asociadas

#### Scenario: Un rol no habilitado intenta eliminar el Catálogo de Conceptos
- **WHEN** un usuario con rol `superintendent`, `procurement`, `control_obra` o cualquier
  otro distinto de `admin`, `gerencia_tecnica` o `control_proyectos` hace
  `DELETE /api/v1/gerencia-tecnica/presupuestos/:id`
- **THEN** el sistema responde `403` y no elimina nada

#### Scenario: El presupuesto ya tiene compromiso financiero registrado
- **WHEN** un usuario con rol `admin`, `gerencia_tecnica` o `control_proyectos` intenta
  eliminar un `PresupuestoBase` cuyos conceptos ya tienen `SaldoPartida` con
  `monto_comprometido` o `monto_ejercido` mayor a cero, o `CompraProyectada` asociada
- **THEN** el sistema responde `409` con un mensaje indicando que el presupuesto está en uso
  y no lo elimina

### Requirement: Admin, Gerencia Técnica y Control de Proyectos SHALL poder revertir un lote de Explosión de Insumos importado por error
Cada llamada a `POST /api/v1/gerencia-tecnica/insumos/importar-lote` SHALL registrar un
`LoteImportacion` y estampar su identificador como `lote_importacion_id` en cada `Insumo`
creado o actualizado por esa llamada. El sistema SHALL exponer
`DELETE /api/v1/gerencia-tecnica/insumos/importar-lote/:loteId`, restringido a `admin`,
`gerencia_tecnica` o `control_proyectos`, que desactiva (`activo: false`, mismo patrón que
`DELETE /insumos/:id`) todos los `Insumo` con ese `lote_importacion_id`. El sistema SHALL
rechazar la eliminación con `409` si algún insumo del lote está referenciado por un
`ConceptoInsumo` fuera del lote, o por una `CompraProyectada` (orden de compra ya generada
sobre ese insumo).

#### Scenario: Gerencia Técnica revierte un lote de insumos que no se ha usado en ningún otro lugar
- **WHEN** un usuario con rol `gerencia_tecnica` hace
  `DELETE /api/v1/gerencia-tecnica/insumos/importar-lote/:loteId` de un lote cuyos insumos no
  están referenciados fuera del lote
- **THEN** el sistema responde `200`, desactiva esos insumos y marca el `LoteImportacion` como
  `revertido`

#### Scenario: Control de Proyectos revierte un lote de insumos que no se ha usado en ningún otro lugar
- **WHEN** un usuario con rol `control_proyectos` hace
  `DELETE /api/v1/gerencia-tecnica/insumos/importar-lote/:loteId` de un lote cuyos insumos no
  están referenciados fuera del lote
- **THEN** el sistema responde `200`, desactiva esos insumos y marca el `LoteImportacion` como
  `revertido`

#### Scenario: El lote tiene insumos ya usados en una composición APU o una compra proyectada
- **WHEN** un usuario con rol `admin`, `gerencia_tecnica` o `control_proyectos` intenta
  revertir un lote donde al menos un insumo ya está referenciado por un `ConceptoInsumo` o
  por una `CompraProyectada` creada después de la importación
- **THEN** el sistema responde `409` sin eliminar ningún insumo del lote

#### Scenario: Un rol no habilitado intenta revertir un lote de insumos
- **WHEN** un usuario con rol distinto de `admin`, `gerencia_tecnica` o `control_proyectos`
  hace `DELETE /api/v1/gerencia-tecnica/insumos/importar-lote/:loteId`
- **THEN** el sistema responde `403`

### Requirement: Admin, Gerencia Técnica y Control de Proyectos SHALL poder eliminar la composición APU de un concepto importada por error
El sistema SHALL exponer `DELETE /api/v1/gerencia-tecnica/composicion-apu/:conceptoId`,
restringido a `admin`, `gerencia_tecnica` o `control_proyectos`, que elimina todos los
`ConceptoInsumo` asociados a ese concepto sin eliminar el `Concepto` ni los `Insumo` del
catálogo.

#### Scenario: Gerencia Técnica elimina la composición APU de un concepto
- **WHEN** un usuario con rol `gerencia_tecnica` hace
  `DELETE /api/v1/gerencia-tecnica/composicion-apu/:conceptoId` de un concepto con
  composición APU cargada
- **THEN** el sistema responde `200`, elimina todos los `ConceptoInsumo` de ese concepto y
  el `Concepto` queda sin composición, listo para reimportar

#### Scenario: Control de Proyectos elimina la composición APU de un concepto
- **WHEN** un usuario con rol `control_proyectos` hace
  `DELETE /api/v1/gerencia-tecnica/composicion-apu/:conceptoId` de un concepto con
  composición APU cargada
- **THEN** el sistema responde `200`, elimina todos los `ConceptoInsumo` de ese concepto y
  el `Concepto` queda sin composición, listo para reimportar

#### Scenario: El concepto no tiene composición APU cargada
- **WHEN** un usuario con rol `admin`, `gerencia_tecnica` o `control_proyectos` hace `DELETE`
  de composición APU sobre un concepto sin `ConceptoInsumo` asociados
- **THEN** el sistema responde `404`

#### Scenario: Un rol no habilitado intenta eliminar una composición APU
- **WHEN** un usuario con rol distinto de `admin`, `gerencia_tecnica` o `control_proyectos`
  hace `DELETE /api/v1/gerencia-tecnica/composicion-apu/:conceptoId`
- **THEN** el sistema responde `403`

### Requirement: Las respuestas de importación SHALL incluir el identificador necesario para deshacerlas
`POST /api/v1/gerencia-tecnica/presupuestos` (ya incluye `id` del `PresupuestoBase`
creado), `POST /api/v1/gerencia-tecnica/insumos/importar-lote` (SHALL incluir
`lote_importacion_id`) y `POST /api/v1/gerencia-tecnica/composicion-apu` (SHALL incluir
`conceptos_afectados`, el array de `concepto_id` tocados por esa llamada) SHALL exponer en
su respuesta lo que el frontend necesita para ofrecer de inmediato la acción "Deshacer
importación" a un usuario con rol `admin`, `gerencia_tecnica` o `control_proyectos`.

#### Scenario: Importar Explosión de Insumos devuelve el id del lote
- **WHEN** un usuario importa un archivo de Explosión de Insumos vía
  `POST /api/v1/gerencia-tecnica/insumos/importar-lote`
- **THEN** la respuesta `201` incluye `lote_importacion_id`, utilizable para revertir ese
  lote específico

#### Scenario: Importar Composición APU devuelve los conceptos afectados
- **WHEN** un usuario importa composición APU vía
  `POST /api/v1/gerencia-tecnica/composicion-apu`
- **THEN** la respuesta incluye `conceptos_afectados` con los `concepto_id` que recibieron
  al menos un `ConceptoInsumo` vinculado o actualizado, utilizables para revertir la
  composición APU de cada uno individualmente
