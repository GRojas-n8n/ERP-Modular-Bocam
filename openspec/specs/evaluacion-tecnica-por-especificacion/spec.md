## Requirements

### Requirement: El Residente SHALL evaluar cada característica individual con su propio veredicto C/NC/DA/?
El sistema SHALL permitir al Residente registrar un veredicto `C`, `NC`,
`DA` o `?` independiente por cada combinación de característica × proveedor
cuando el renglón (insumo) tiene especificaciones capturadas
(`EspecificacionDetalleReq`), en vez de un único veredicto para todo el
renglón.

#### Scenario: Renglón con 3 características y 2 proveedores
- **WHEN** un renglón tiene 3 especificaciones capturadas y el cuadro tiene 2
  proveedores
- **THEN** el Residente puede registrar hasta 6 veredictos independientes
  (3 características × 2 proveedores) para ese renglón

#### Scenario: Renglón sin especificaciones capturadas usa el camino legacy
- **WHEN** un renglón no tiene ninguna especificación capturada
  (`EspecificacionDetalleReq` vacío para su `RequisicionItem`)
- **THEN** el sistema permite evaluarlo directamente vía el endpoint legacy
  `PATCH .../evaluar`, con un único veredicto por renglón, igual que hoy

#### Scenario: Intento de evaluar directo un renglón que sí tiene especificaciones
- **WHEN** se llama a `PATCH .../evaluar` con un `detalle_id` cuyo insumo sí
  tiene especificaciones capturadas
- **THEN** el sistema responde 400 `EVALUACION_POR_ESPECIFICACION_REQUERIDA`
  y no modifica el veredicto de renglón

### Requirement: El sistema SHALL calcular el veredicto de renglón automáticamente a partir de sus características
El sistema SHALL calcular `ComparativaDetalle.evaluacion_tecnica`
automáticamente como el peor caso entre las evaluaciones de las
características de ese renglón para ese proveedor, con la prioridad
`PENDIENTE > NC > ? > DA > C`, dejando de ser editable directamente cuando
el renglón tiene especificaciones capturadas.

#### Scenario: Todas las características en C
- **WHEN** todas las características evaluadas de un renglón×proveedor son `C`
- **THEN** el veredicto de renglón calculado es `C`

#### Scenario: Al menos una característica en NC
- **WHEN** al menos una característica de un renglón×proveedor es `NC`,
  sin importar el resto
- **THEN** el veredicto de renglón calculado es `NC`

#### Scenario: Ninguna NC pero al menos una "?"
- **WHEN** ninguna característica es `NC` pero al menos una es `?`
- **THEN** el veredicto de renglón calculado es `?`

#### Scenario: Sin NC ni "?", al menos una DA
- **WHEN** ninguna característica es `NC` ni `?`, y al menos una es `DA`
- **THEN** el veredicto de renglón calculado es `DA`

#### Scenario: Alguna característica aún sin evaluar
- **WHEN** al menos una característica de un renglón×proveedor sigue en
  `PENDIENTE`
- **THEN** el veredicto de renglón calculado es `PENDIENTE`, sin importar el
  resto de veredictos ya capturados

### Requirement: El Residente SHALL poder registrar su duda sobre una característica y proveedor específicos
El sistema SHALL requerir un texto de `pregunta_residente` no vacío amarrado
exactamente a la combinación característica × proveedor cuando el Residente
marca el veredicto `?` en esa característica de ese proveedor.

#### Scenario: Marcar "?" sin pregunta
- **WHEN** el Residente intenta guardar una evaluación con veredicto `?` y
  `pregunta_residente` vacío o no enviado para esa característica×proveedor
- **THEN** el sistema responde 400 y no persiste esa evaluación

#### Scenario: Duda en una característica no afecta a las demás del mismo renglón
- **WHEN** el Residente marca `?` con pregunta en la característica A de un
  renglón, pero evalúa `C` sin pregunta en la característica B del mismo
  renglón y proveedor
- **THEN** solo la característica A queda con `pregunta_residente`
  registrada; la característica B no la requiere ni la almacena

### Requirement: Compras SHALL responder la duda sobre la característica y proveedor exactos
El sistema SHALL permitir a Compras registrar `respuesta_compras` amarrada a
la misma combinación característica × proveedor sobre la que el Residente
preguntó, visible en la revisión siguiente del cuadro.

#### Scenario: Compras responde una pregunta pendiente
- **WHEN** Compras registra una respuesta para una característica×proveedor
  con `pregunta_residente` pendiente en el cuadro de la revisión activa
- **THEN** el sistema persiste `respuesta_compras` en esa combinación exacta,
  sin afectar otras características

### Requirement: Una evaluación con al menos una duda SHALL avanzar la revisión del cuadro a la siguiente letra
El sistema SHALL transicionar el cuadro actual y crear una nueva revisión
con la siguiente letra (A→B→C…) cuando el Residente guarda evaluaciones por
característica que incluyen al menos una con veredicto `?` y su pregunta
correspondiente — igual que el mecanismo de revisión por letra ya existente
a nivel renglón.

#### Scenario: Guardar evaluación por característica con una duda
- **WHEN** el Residente guarda evaluaciones por característica para un cuadro
  en revisión "A" e incluye al menos una con `?` y pregunta
- **THEN** el cuadro "A" transiciona a `REVISION_SOLICITADA` y se crea un
  cuadro nuevo en revisión "B", estado `BORRADOR`

#### Scenario: Las evaluaciones por característica se clonan hacia la revisión nueva
- **WHEN** se crea la revisión "B" a partir de la revisión "A" con dudas
  pendientes
- **THEN** las evaluaciones por característica del cuadro "A" se clonan hacia
  el cuadro "B" (reset a `PENDIENTE`, salvo las marcadas `?` que heredan su
  `pregunta_residente`) — ninguna queda huérfana en el cuadro `SUPERSEDIDO`/
  `REVISION_SOLICITADA` anterior

### Requirement: La Requisición SHALL conservar el folio y la revisión del cuadro con la que se cerró
El sistema SHALL registrar en la `Requisicion` de origen una referencia al
`CuadroComparativo` y a su `revision` cuando ese cuadro se firma y queda
`FIRMADO_BLOQUEADO`, sin alterar el folio (`codigo`) existente de la
requisición.

#### Scenario: Firma exitosa registra la revisión de cierre
- **WHEN** un cuadro comparativo en revisión "C" se firma exitosamente y
  queda `FIRMADO_BLOQUEADO`
- **THEN** la `Requisicion` de origen queda con `cuadro_comparativo_cierre_id`
  apuntando a ese cuadro y `revision_cierre = "C"`, conservando su `codigo`
  (folio) sin cambios

#### Scenario: Cuadro cuya requisición de origen no existe (referencia huérfana)
- **WHEN** un cuadro comparativo se firma y su `requisicion_id` no
  corresponde a ninguna `Requisicion` real (no hay `@relation`/FK
  declarada entre ambos)
- **THEN** la firma se completa igual — no falla por no encontrar la
  Requisicion a actualizar
