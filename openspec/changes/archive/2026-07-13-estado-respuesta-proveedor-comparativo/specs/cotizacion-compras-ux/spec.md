## ADDED Requirements

### Requirement: El Cuadro Comparativo SHALL mostrar el estado de respuesta de cada proveedor invitado
El sistema SHALL mostrar, en el chip de cada proveedor dentro de
`ComparativaDetail`, un indicador visual de su estado de respuesta a la
Solicitud de Cotización (`RESPONDIO`, `DECLINO` o `PENDIENTE`), cuando ese
proveedor fue invitado a través de una Solicitud de Cotización de la misma
requisición. El sistema SHALL obtener este estado desde el registro
`SolicitudCotizacionProveedor` correspondiente sin requerir que Compras
navegue al panel de Solicitud de Cotización para consultarlo.

Este indicador es de solo lectura dentro del Cuadro Comparativo — el
cambio de estado (marcar "Respondió"/"Declinó") SHALL seguir haciéndose
únicamente desde el panel de Solicitud de Cotización, sin duplicar esa
acción aquí. La subida del PDF de cotización SHALL seguir ocurriendo
únicamente dentro del Cuadro Comparativo, sin cambios.

#### Scenario: Proveedor invitado que ya respondió
- **WHEN** Compras abre el Cuadro Comparativo de una requisición donde un
  proveedor invitado ya fue marcado como `RESPONDIO` en Solicitud de
  Cotización
- **THEN** el chip de ese proveedor muestra un badge verde "Respondió"

#### Scenario: Proveedor invitado que declinó
- **WHEN** un proveedor invitado fue marcado como `DECLINO` en Solicitud de
  Cotización
- **THEN** su chip en el Cuadro Comparativo muestra un badge rojo
  "Declinó"

#### Scenario: Proveedor invitado sin respuesta todavía
- **WHEN** un proveedor invitado sigue en estado `PENDIENTE` en Solicitud
  de Cotización
- **THEN** su chip en el Cuadro Comparativo muestra un badge gris
  "Pendiente"

#### Scenario: Proveedor agregado manualmente, sin invitación previa
- **WHEN** Compras agrega al Cuadro Comparativo un proveedor del catálogo
  general que nunca fue invitado vía Solicitud de Cotización para esa
  requisición
- **THEN** su chip no muestra ningún badge de estado de respuesta (no se
  asume "Pendiente" para proveedores sin invitación)
