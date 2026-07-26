## ADDED Requirements

### Requirement: El sistema SHALL resolver la especificación técnica del renglón desde el RequisicionItem de origen
El sistema SHALL devolver `marca_modelo_ref` y `especificaciones_requeridas` resolviendo en vivo los campos `especificacion_marca_modelo`/`especificacion_detalle` del `RequisicionItem` referenciado por `detalle_req_id`, en vez de un valor copiado al momento de crear el cuadro. Para renglones sin `detalle_req_id` (cuadros creados antes de esta capability, o líneas de ítems imprevisto sin ítem de origen resoluble), el sistema SHALL usar el valor almacenado en `ComparativaLinea` como respaldo.

#### Scenario: Renglón con RequisicionItem de origen vigente
- **WHEN** Compras o cualquier rol consulta un Cuadro Comparativo cuya línea
  tiene `detalle_req_id` apuntando a un `RequisicionItem` existente
- **THEN** el sistema devuelve la especificación técnica actual de ese
  `RequisicionItem`, sin importar qué valor se copió al crear el cuadro

#### Scenario: Renglón legacy sin RequisicionItem de origen
- **WHEN** se consulta una línea de un cuadro creado antes de esta
  capability, sin `detalle_req_id`
- **THEN** el sistema devuelve el valor histórico almacenado en
  `ComparativaLinea.marca_modelo_ref`/`especificaciones_requeridas`

### Requirement: El Cuadro Comparativo SHALL NOT permitir editar la especificación técnica requerida de un renglón de catálogo cuando existe un RequisicionItem de origen
Para renglones de catálogo (`ComparativaLinea.insumo_id` no null) cuyo `detalle_req_id` tampoco sea null, el sistema SHALL rechazar cualquier intento de modificar `marca_modelo_ref` o `especificaciones_requeridas` desde los endpoints del Cuadro Comparativo — la única vía de corrección es editar el `RequisicionItem` de origen. Esta restricción SHALL NOT aplicar a renglones de texto libre/imprevisto (`insumo_id` null, identificados por `detalle_req_id`), donde Compras conserva la edición directa en el cuadro (ver capability `cotizar-items-texto-libre-comparativa`).

#### Scenario: Intento de editar spec requerida en un renglón de catálogo con origen
- **WHEN** un cliente envía `PUT /api/v1/compras/comparativas/:id/lineas/:insumoId`
  con nuevos valores de especificación para una línea de catálogo (`insumo_id`
  no null) cuyo `detalle_req_id` tampoco es null
- **THEN** el sistema responde con error de operación no permitida y no
  modifica el valor almacenado

#### Scenario: Edición permitida en línea legacy sin origen
- **WHEN** el mismo endpoint se invoca sobre una línea de catálogo con
  `detalle_req_id` null
- **THEN** el sistema acepta la edición como hoy, sin cambios de
  comportamiento

#### Scenario: Edición permitida en renglón de texto libre/imprevisto
- **WHEN** el mismo endpoint se invoca sobre una línea sin `insumo_id`
  (identificada por `detalle_req_id`, ítem de texto libre/imprevisto)
- **THEN** el sistema acepta la edición de `marca_modelo_ref`/`especificaciones_requeridas`
  directo en el cuadro, sin cambios de comportamiento respecto al existente

### Requirement: El Residente SHALL poder editar la especificación técnica del ítem mientras la Requisición no esté comprada
El sistema SHALL permitir modificar
`especificacion_marca_modelo`/`especificacion_detalle` de un
`RequisicionItem` mientras `Requisicion.estado` sea `PENDIENTE` o
`APROBADA`. El cambio SHALL reflejarse de inmediato en cualquier Cuadro
Comparativo vinculado que consulte ese renglón.

#### Scenario: Corrección de especificación tras aprobar la requisición
- **WHEN** el Residente edita la especificación de un ítem de una
  Requisición en estado `APROBADA`
- **THEN** el sistema guarda el cambio y una consulta posterior al Cuadro
  Comparativo vinculado muestra el valor corregido

#### Scenario: Requisición ya comprada
- **WHEN** se intenta editar la especificación de un ítem cuya Requisición
  está en estado `COMPRADA`
- **THEN** el sistema rechaza la edición
