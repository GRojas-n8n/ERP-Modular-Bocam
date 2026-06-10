## ADDED Requirements

### Requirement: Marcador "?" abre campo de pregunta en el renglón

Cuando el Residente selecciona "?" para un renglón durante su evaluación, el sistema SHALL mostrar inmediatamente, en la parte baja de ese renglón en la tabla, un campo de texto para que el Residente escriba su pregunta o solicitud de aclaración. El campo es obligatorio cuando el renglón está marcado con "?".

#### Scenario: Campo de pregunta aparece al seleccionar "?"

- **WHEN** el Residente hace clic en el botón "?" de un renglón
- **THEN** aparece debajo de ese renglón un textarea con placeholder "¿Qué necesitas aclarar de este renglón?"
- **THEN** el botón de guardar evaluación permanece deshabilitado hasta que ese campo tenga texto

#### Scenario: Pregunta guardada queda visible en el cuadro

- **WHEN** el Residente guarda la evaluación con un renglón en "?" y su pregunta
- **THEN** la pregunta queda registrada y visible en ese renglón para Compras

#### Scenario: Renglón sin "?" no muestra campo de pregunta

- **WHEN** el Residente selecciona C, NC o DA para un renglón
- **THEN** no aparece campo de pregunta en ese renglón

### Requirement: Guardar evaluación con "?" crea nueva revisión del cuadro

Cuando el Residente guarda una evaluación que contiene al menos un renglón con "?", el sistema SHALL crear automáticamente una nueva revisión del cuadro comparativo. El cuadro original transiciona a estado `REVISION_SOLICITADA`. La nueva revisión inicia en estado `BORRADOR` con `revision` incrementado (A→B, B→C, etc.) y `revision_padre_id` apuntando al cuadro anterior.

#### Scenario: Nueva revisión creada al guardar con "?"

- **WHEN** el Residente guarda una evaluación con uno o más renglones en "?"
- **THEN** se crea automáticamente una nueva revisión del cuadro
- **THEN** el cuadro original pasa a estado `REVISION_SOLICITADA`
- **THEN** la nueva revisión tiene el mismo contenido base (proveedores, renglones, precios) con `revision` incrementado
- **THEN** se muestra al Residente: "Se creó la revisión [B]. Compras verá tus preguntas y responderá."

#### Scenario: Evaluación sin "?" no crea nueva revisión

- **WHEN** el Residente guarda una evaluación con todos los renglones en C, NC o DA
- **THEN** no se crea una nueva revisión
- **THEN** el cuadro avanza al siguiente paso normal (veredicto y firma)

### Requirement: Compras ve las preguntas del Residente en la nueva revisión

En la nueva revisión del cuadro (estado `BORRADOR`), el sistema SHALL mostrar a Compras, por cada renglón con "?", la pregunta del Residente. Compras puede responder en un campo `respuesta_proveedor` en ese renglón antes de re-enviar a evaluación.

#### Scenario: Compras ve preguntas y puede responder

- **WHEN** Compras abre la nueva revisión del cuadro en estado `BORRADOR`
- **THEN** los renglones que tenían "?" muestran la pregunta del Residente con fondo distinto (alerta)
- **THEN** Compras puede escribir una respuesta en un campo "Respuesta:" en ese renglón

#### Scenario: Respuesta del proveedor visible para el Residente en la nueva revisión

- **WHEN** Compras envía la nueva revisión a evaluación técnica
- **THEN** el Residente, al abrir la revisión B, ve en cada renglón con pregunta: la pregunta original y la respuesta de Compras
- **THEN** el Residente puede ahora evaluar definitivamente con C, NC o DA
