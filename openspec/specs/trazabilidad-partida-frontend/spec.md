## ADDED Requirements

### Requirement: Drill-down de movimientos en la tabla de Control Presupuestal
La tabla de "Control Presupuestal" SHALL permitir expandir cada fila de partida para mostrar su historial de movimientos, combinando los resultados de `GET /partidas/:concepto_id/movimientos` (GT) y `GET /movimientos?concepto_id=` (Finanzas) en una sola lista ordenada por fecha, sin bloquear la carga de la tabla principal.

#### Scenario: Expandir una partida con movimientos
- **WHEN** el usuario hace clic en una fila de partida
- **THEN** se despliega una sub-tabla con: fecha, tipo de movimiento, referencia (código de OC si existe), monto/delta, origen (GT o Finanzas)

#### Scenario: Partida sin movimientos
- **WHEN** se expande una partida que no tiene ningún movimiento en ninguno de los dos servicios
- **THEN** se muestra el mensaje "Sin movimientos registrados para esta partida"

#### Scenario: Uno de los dos servicios no responde
- **WHEN** GT responde correctamente pero Finanzas falla (timeout o error), o viceversa
- **THEN** se muestran los movimientos del servicio que sí respondió, con una nota indicando que la lista puede estar incompleta — no se bloquea el drill-down completo por la falla de un solo servicio

#### Scenario: Nombre distinto a la pestaña "Trazabilidad" existente
- **WHEN** se etiqueta esta funcionalidad en la UI
- **THEN** se usa un nombre distinto a "Trazabilidad" (ej. "Movimientos" o "Historial") para no confundirla con la pestaña existente basada en `CompraProyectada`

### Requirement: Control de Proyectos accede a la tabla de Control Presupuestal en modo lectura
El módulo "Control de Obra" (`ControlObraView.tsx`, rol `control_proyectos`) SHALL incluir una pestaña que muestre la misma tabla de Control Presupuestal (con el mismo drill-down de movimientos) que ya ve Gerencia Técnica, en modo estrictamente de solo lectura — sin ninguna acción de escritura disponible.

#### Scenario: Usuario control_proyectos ve la nueva pestaña
- **WHEN** un usuario con rol `control_proyectos` navega al módulo Control de Obra
- **THEN** ve una pestaña "Presupuesto por Partida" con la tabla y el drill-down de movimientos

#### Scenario: Sin acciones de escritura visibles
- **WHEN** el usuario `control_proyectos` visualiza cualquier fila o el drill-down expandido
- **THEN** no se muestra ningún botón o control que modifique datos (misma tabla que GT, pero sin las acciones que GT no tiene tampoco — esta tabla nunca tuvo acciones de escritura)

#### Scenario: Componente compartido entre GT y CP
- **WHEN** se implementa la tabla en ambos módulos
- **THEN** ambos usan el mismo componente React, sin duplicar el JSX ni la lógica de fetching
