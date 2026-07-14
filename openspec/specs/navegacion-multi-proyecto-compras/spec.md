## Requirements

### Requirement: Cambiar de proyecto activo SHALL regresar a la lista de requisiciones, nunca dejar un detalle stale
El sistema SHALL limpiar la vista de detalle de Cuadro Comparativo (volver a la lista de
requisiciones del módulo de Compras) cada vez que el usuario cambia de proyecto activo,
independientemente de si el cuadro que estaba viendo pertenece o no al proyecto nuevo. El
sistema NO SHALL dejar al usuario en una pantalla en blanco o mostrando datos mezclados de
un proyecto distinto al activo.

#### Scenario: Usuario cambia de proyecto mientras ve el detalle de un cuadro
- **WHEN** un usuario tiene abierto el detalle de un Cuadro Comparativo de la Requisición X
  (proyecto A) y cambia su proyecto activo al proyecto B
- **THEN** la vista regresa a la lista de requisiciones del proyecto B, sin mostrar el
  detalle de la Requisición X ni una pantalla en blanco

#### Scenario: El cuadro que se estaba viendo también existe en el proyecto nuevo
- **WHEN** un usuario cambia de proyecto activo mientras ve el detalle de un cuadro (caso
  poco común, pero posible si el usuario cambia y vuelve a cambiar rápido)
- **THEN** la vista igual regresa a la lista, sin asumir que el `requisicion_id` previamente
  activo sigue siendo válido en el contexto del proyecto nuevo
