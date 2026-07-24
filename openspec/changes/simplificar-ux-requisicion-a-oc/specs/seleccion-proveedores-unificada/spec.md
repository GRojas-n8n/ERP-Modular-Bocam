## ADDED Requirements

### Requirement: El sistema SHALL usar el mismo componente de selección de proveedores para invitar a cotizar y para dar de alta proveedores en el Cuadro Comparativo
El panel de Solicitud de Cotización y el alta de proveedores dentro del Cuadro Comparativo SHALL compartir el mismo componente de selección y la misma fuente de datos del catálogo de proveedores del proyecto/tenant.

#### Scenario: Mismo catálogo visible en ambas pantallas
- **WHEN** un proveedor está activo en el catálogo del tenant
- **THEN** aparece disponible para seleccionar tanto en el panel de
  Solicitud de Cotización como en el alta de proveedores del Cuadro
  Comparativo, sin listas divergentes

### Requirement: El Cuadro Comparativo SHALL NOT limitar el número de proveedores a un tope fijo
El sistema SHALL permitir agregar cualquier cantidad de proveedores al
Cuadro Comparativo, eliminando el tope fijo de 3 proveedores existente
previo a este change.

#### Scenario: Agregar un cuarto proveedor
- **WHEN** Compras intenta agregar un cuarto proveedor a un Cuadro
  Comparativo que ya tiene 3
- **THEN** el sistema lo permite, sin mostrar límite ni bloquear la acción

### Requirement: El sistema SHALL marcar como "agregado sin invitación" a todo proveedor del Cuadro Comparativo que no fue invitado formalmente
Un proveedor presente en un Cuadro Comparativo cuya requisición no tiene una fila correspondiente en `SolicitudCotizacionProveedor` para ese proveedor SHALL mostrarse en la interfaz con una marca visible de "agregado sin invitación", para preservar la trazabilidad de qué proveedores pasaron por el flujo formal de invitación y cuáles no.

#### Scenario: Proveedor agregado directamente en el cuadro
- **WHEN** Compras da de alta en el Cuadro Comparativo a un proveedor que
  nunca fue seleccionado en la Solicitud de Cotización de esa requisición
- **THEN** el sistema muestra ese proveedor con la marca "agregado sin
  invitación" en toda vista que liste los proveedores del cuadro

#### Scenario: Proveedor que sí fue invitado formalmente
- **WHEN** un proveedor del Cuadro Comparativo tiene una fila
  correspondiente en `SolicitudCotizacionProveedor` para esa requisición
- **THEN** el sistema no le muestra la marca de "agregado sin invitación"
