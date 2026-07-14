## ADDED Requirements

### Requirement: El Cuadro Comparativo SHALL registrar la fecha de entrega estimada por partida y proveedor
Al capturar los precios de una cotización en el Cuadro Comparativo,
Compras SHALL poder registrar una fecha de entrega estimada estructurada
(no texto libre) para cada combinación de partida (línea/insumo) y
proveedor. El sistema SHALL persistir esta fecha junto con el precio
ofertado de esa misma línea.

#### Scenario: Compras registra la fecha de entrega al capturar un precio
- **WHEN** Compras ingresa un precio para un proveedor en una línea del
  Cuadro Comparativo y también captura una fecha de entrega estimada para
  esa misma línea
- **THEN** al guardar la cotización, la fecha queda asociada a esa
  combinación específica de partida y proveedor

#### Scenario: Fecha de entrega ausente no bloquea guardar la cotización
- **WHEN** Compras guarda una cotización con precios capturados pero sin
  fecha de entrega estimada en alguna línea
- **THEN** el sistema guarda el precio de todas formas — la fecha de
  entrega es opcional, no bloquea el flujo

#### Scenario: La fecha de entrega se conserva al crear una nueva revisión
- **WHEN** se crea una nueva revisión de un cuadro comparativo
  (`nueva-revision` o `revision-con-preguntas`)
- **THEN** la fecha de entrega estimada capturada en el cuadro original se
  copia a la línea correspondiente del cuadro de la nueva revisión
