## ADDED Requirements

### Requirement: El proveedor ganador SHALL determinarse automáticamente al aprobar GT, sin selección manual

Cuando un Cuadro Comparativo transiciona a `APROBADO_GT`, el sistema SHALL marcar
automáticamente `es_ganador = true` en el renglón del proveedor correspondiente para cada
línea, sin requerir que Compras seleccione manualmente un ganador en la tabla de precios.

#### Scenario: Primera opción aprobada económicamente
- **WHEN** el Gerente Técnico aprueba el cuadro y el proveedor de `primera_opcion_proveedor_id`
  tiene `aprobacion_gt` en C, DA o APROBADO para un renglón
- **THEN** ese renglón queda con `es_ganador = true` para ese proveedor, sin intervención
  manual

#### Scenario: Primera opción rechazada económicamente, segunda opción aprobada
- **WHEN** el proveedor de `primera_opcion_proveedor_id` no está aprobado económicamente
  para un renglón pero el de `segunda_opcion_proveedor_id` sí
- **THEN** ese renglón queda con `es_ganador = true` para el proveedor de la segunda
  opción

#### Scenario: Sin primera ni segunda opción aplicable — desempate por precio
- **WHEN** ni la primera ni la segunda opción tienen `aprobacion_gt` aprobado para un
  renglón específico, pero hay al menos un proveedor aprobado
- **THEN** ese renglón queda con `es_ganador = true` para el proveedor aprobado con menor
  `precio_ofertado`

### Requirement: Los renglones de requisición de texto libre (imprevisto) SHALL poder generar Orden de Compra

`convertir-oc` SHALL incluir renglones sin `insumo_id` de catálogo (identificados por
`detalle_req_id`, vinculados a una partida real vía el flujo de imprevistos del
Residente) al generar Órdenes de Compra, con la misma cobertura de suficiencia
financiera y partida presupuestal que los renglones de catálogo.

#### Scenario: Cuadro con renglón de texto libre aprobado por GT
- **WHEN** Compras convierte a OC un cuadro `APROBADO_GT` que incluye un renglón de
  texto libre (imprevisto) con proveedor ganador determinado
- **THEN** se genera la Orden de Compra correspondiente con la cantidad real de la
  requisición y la descripción/unidad capturadas por el Residente

#### Scenario: PDF de la OC muestra la descripción del ítem de texto libre
- **WHEN** se genera el PDF de una Orden de Compra que incluye un ítem de texto libre
- **THEN** el PDF muestra la descripción y unidad capturadas, no "Insumo no encontrado en
  catálogo"
