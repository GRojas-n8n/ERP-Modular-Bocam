## ADDED Requirements

### Requirement: La evaluación económica de Gerencia Técnica SHALL registrarse C/NC/DA/? por proveedor, con costo, días de suministro y condiciones de crédito visibles
El sistema SHALL permitir a Gerencia Técnica (roles `gerencia_tecnica`, `superintendent`,
`admin`) registrar una decisión C/NC/DA/? independiente para cada proveedor de cada
renglón de un cuadro en `EN_APROBACION_GT`, mostrando el costo cotizado, los días de
suministro estimados y las condiciones de crédito (si el proveedor otorga crédito y a
cuántos días) de cada proveedor en el momento de evaluar — directamente en "TABLA DE
COTIZACIONES", sin un panel modal separado. GT SHALL persistir la evaluación de todos los
proveedores, no solo la del primero agrupado.

#### Scenario: Cuadro con 3 proveedores en un mismo renglón
- **WHEN** Gerencia Técnica revisa un renglón cotizado por 3 proveedores en un cuadro
  `EN_APROBACION_GT`
- **THEN** ve, por cada proveedor, su costo cotizado, sus días de suministro estimados,
  sus condiciones de crédito y controles C/NC/DA/? independientes

#### Scenario: Proveedor sin crédito frente a proveedor con crédito
- **WHEN** Gerencia Técnica compara dos proveedores del mismo renglón, uno con
  `ofrece_credito = true` y `dias_credito = 30`, y otro con `ofrece_credito = false`
- **THEN** ve claramente "Crédito 30 días" para el primero y "Sin crédito" para el
  segundo, sin necesidad de consultar el catálogo de Proveedores por separado

#### Scenario: GT no puede aprobar un proveedor que el Residente rechazó técnicamente
- **WHEN** Gerencia Técnica intenta marcar `C` en un proveedor cuya `evaluacion_tecnica`
  es `NC`
- **THEN** el sistema rechaza la evaluación con un mensaje explicando que ese proveedor
  fue rechazado en la evaluación técnica

#### Scenario: Guardar evaluaciones de GT no finaliza el cuadro
- **WHEN** Gerencia Técnica guarda evaluaciones C/NC/DA de algunos proveedores mediante
  `PATCH /comparativas/:id/evaluar-gt`
- **THEN** el cuadro permanece en `EN_APROBACION_GT`, sin transicionar a
  `APROBADO_GT`/`RECHAZADO_GT`, hasta que se ejecute la finalización explícita

#### Scenario: Finalizar exige evaluar a todos los proveedores de todos los renglones
- **WHEN** Gerencia Técnica intenta finalizar (`PATCH /comparativas/:id/revisar-gt`) con
  al menos un proveedor de algún renglón en `PENDIENTE` o `?`
- **THEN** el sistema rechaza la finalización con un mensaje indicando qué falta evaluar

### Requirement: Un "?" de Gerencia Técnica SHALL crear una nueva revisión que hereda la evaluación técnica ya aprobada
El sistema SHALL crear una nueva revisión del cuadro cuando Gerencia Técnica marca `?` en
cualquier proveedor de cualquier renglón y redacta una pregunta (mismo mecanismo de
incremento de letra A→B→C... ya usado para las preguntas del Residente). Esa nueva
revisión SHALL conservar la `evaluacion_tecnica`/`comentario_tecnico` del cuadro original
sin reiniciarlos, y SHALL iniciar directamente en estado `EN_APROBACION_GT` — no en
`BORRADOR` — de modo que no se le exige al Residente evaluar de nuevo lo técnico.

#### Scenario: Pregunta de GT sobre un proveedor
- **WHEN** Gerencia Técnica marca `?` en un proveedor con la pregunta "¿Puede sostener
  este precio con entrega en 15 días?" y guarda
- **THEN** se crea la revisión siguiente del cuadro (ej. si la evaluación técnica quedó en
  revisión B, la nueva es C), heredando la evaluación técnica de la revisión anterior tal
  cual, y el cuadro nuevo queda en `EN_APROBACION_GT`

#### Scenario: Compras responde la pregunta de GT
- **WHEN** Compras abre la revisión creada por la pregunta de GT y responde
- **THEN** la respuesta queda visible para Gerencia Técnica al retomar la evaluación
  económica de esa línea/proveedor, sin que el Residente participe de nuevo

#### Scenario: La evaluación técnica no se pierde al crear la revisión de GT
- **WHEN** se crea una revisión nueva por una pregunta de GT
- **THEN** los renglones de la revisión nueva muestran la misma `evaluacion_tecnica` y
  `comentario_tecnico` que tenían en la revisión anterior — no aparecen como `PENDIENTE`
