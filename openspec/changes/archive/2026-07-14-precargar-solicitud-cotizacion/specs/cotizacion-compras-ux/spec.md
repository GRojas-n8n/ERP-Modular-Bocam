## ADDED Requirements

### Requirement: El botón para crear/continuar el Cuadro Comparativo SHALL reflejar el estado real de la Solicitud de Cotización sin depender de una acción previa en la sesión
El sistema SHALL cargar el estado de la Solicitud de Cotización de cada requisición
`APROBADA` al mostrar la lista de requisiciones, sin requerir que el usuario abra
previamente el panel "Ver Solicitud de Cotización" en la sesión actual. El botón "Crear
Cuadro Comparativo" (o "Continuar comparativa") SHALL estar visible siempre que exista al
menos un proveedor con estado `RESPONDIO`, independientemente de si la página se acaba de
cargar, recargar, o si el usuario recién volvió a la vista.

#### Scenario: Recargar la página tras proveedores respondidos
- **WHEN** Compras marca proveedores como `RESPONDIO` en la Solicitud de Cotización de una
  requisición, sale de la vista o recarga la página, y vuelve a la tarjeta de esa
  requisición
- **THEN** el botón "Crear Cuadro Comparativo" está visible sin que Compras tenga que abrir
  de nuevo el panel "Ver Solicitud de Cotización"

#### Scenario: Requisición sin Solicitud de Cotización enviada
- **WHEN** Compras ve la tarjeta de una requisición `APROBADA` que nunca tuvo una Solicitud
  de Cotización enviada
- **THEN** el botón "Crear Cuadro Comparativo" no aparece (comportamiento actual sin
  cambios), y no se generan errores por la precarga

#### Scenario: Solicitud de Cotización sin ningún proveedor respondido aún
- **WHEN** Compras ve la tarjeta de una requisición `APROBADA` con Solicitud de Cotización
  enviada pero ningún proveedor ha respondido todavía
- **THEN** el botón "Crear Cuadro Comparativo" no aparece, igual que el comportamiento actual
