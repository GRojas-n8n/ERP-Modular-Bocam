## ADDED Requirements

### Requirement: Un cuadro firmado SHALL exponer la acción de envío al Gerente Técnico

Inmediatamente después de que la firma se complete exitosamente (`CuadroComparativo.estado
= FIRMADO_BLOQUEADO`), la acción "Enviar al Gerente Técnico" SHALL estar disponible para
el Residente, Compras y Superintendent — sin depender de ningún estado intermedio
adicional.

#### Scenario: Botón visible tras firma exitosa
- **WHEN** el Residente firma un cuadro comparativo (todos los renglones evaluados, sin
  preguntas abiertas, primera opción seleccionada sin NC/?)
- **THEN** el cuadro queda en estado `FIRMADO_BLOQUEADO` y el botón "Enviar al Gerente
  Técnico →" es visible para Residente, Compras y Superintendent

#### Scenario: Envío exitoso hace visible el cuadro para el Gerente Técnico
- **WHEN** cualquiera de los roles autorizados presiona "Enviar al Gerente Técnico →"
  sobre un cuadro `FIRMADO_BLOQUEADO`
- **THEN** el cuadro transiciona a `EN_APROBACION_GT` y aparece en la bandeja de
  pendientes del Gerente Técnico
