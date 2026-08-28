## ADDED Requirements

### Requirement: La pestaña Trazabilidad expande automáticamente una partida al recibir un salto directo
Cuando el usuario llega a la pestaña "Trazabilidad" mediante la acción "Ver en Trazabilidad" desde Control Presupuestal o Control de Costos, el sistema SHALL expandir automáticamente la fila correspondiente a esa partida (`concepto_id`) en cuanto esté disponible en los datos cargados.

#### Scenario: Partida disponible al llegar a Trazabilidad
- **WHEN** el usuario llega a la pestaña "Trazabilidad" desde "Ver en Trazabilidad" y la partida ya está en la lista cargada
- **THEN** la fila de esa partida aparece expandida sin acción adicional del usuario

#### Scenario: Partida sin datos en Trazabilidad
- **WHEN** el usuario llega a la pestaña "Trazabilidad" desde "Ver en Trazabilidad" pero la partida no existe en el reporte de Trazabilidad (por ejemplo, sin `CompraProyectada` asociada)
- **THEN** el sistema muestra la pestaña normalmente sin ninguna fila expandida, sin error visible

#### Scenario: Salto directo no se confunde con el drill-down de Movimientos
- **WHEN** se documenta o implementa esta funcionalidad
- **THEN** se mantiene la distinción de nombre ya establecida: "Trazabilidad" es esta pestaña basada en `CompraProyectada`, y "Movimientos"/"Historial" es el drill-down por fila dentro de la tabla de Control Presupuestal — ambos coexisten sin renombrarse entre sí
