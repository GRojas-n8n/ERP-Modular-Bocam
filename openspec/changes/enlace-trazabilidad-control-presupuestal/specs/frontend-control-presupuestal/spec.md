## ADDED Requirements

### Requirement: Salto directo de una partida a la pestaña Trazabilidad
El sistema SHALL permitir, desde una fila de la tabla de Control Presupuestal en `InsumosView`, saltar directamente a la pestaña "Trazabilidad" mostrando la misma partida (`concepto_id`) expandida, sin que el usuario tenga que volver a ubicarla manualmente.

#### Scenario: Usuario salta desde Control Presupuestal a Trazabilidad
- **WHEN** el usuario hace clic en la acción "Ver en Trazabilidad" de una fila de partida en la tabla de Control Presupuestal
- **THEN** el sistema cambia a la pestaña "Trazabilidad" y muestra esa misma partida expandida, sin requerir scroll ni búsqueda adicional

#### Scenario: Acción no visible en el uso de solo lectura de Control de Proyectos
- **WHEN** `ControlPresupuestalTabla` se usa desde `ControlObraView` (rol `control_proyectos`), que no tiene pestaña de Trazabilidad
- **THEN** la acción "Ver en Trazabilidad" no se muestra en esa vista
