## MODIFIED Requirements

### Requirement: Los movimientos manuales SHALL validarse con el presupuesto bloqueado
`POST /movimientos` SHALL bloquear la fila del presupuesto antes de validar saldos, SHALL aceptar solo
COMPROMISO, DEVENGADO, EJERCIDO y LIBERACION con monto > 0 y máximo 2 decimales, y SHALL rechazar movimientos sobre
partidas sincronizadas desde GT.

#### Scenario: Compromisos simultáneos
- **WHEN** llegan 20 compromisos de 100 sobre un disponible de 1,000
- **THEN** exactamente 10 SHALL registrarse y los demás SHALL responder 422 `FIN_INSUFFICIENT_BUDGET`

### Requirement: Una transferencia SHALL mover autorizado y disponible una sola vez
`POST /transferencias-presupuestales` SHALL exigir `transferencia_id`, SHALL bloquear ambos presupuestos y SHALL
mover autorizado y disponible del origen al destino. Repetir el mismo `transferencia_id` con el mismo contenido
SHALL devolver la transferencia existente sin efectos; con otro contenido SHALL responder 409.

#### Scenario: Reintento simultáneo
- **WHEN** la misma transferencia llega tres veces al mismo tiempo
- **THEN** SHALL aplicarse una vez, con dos movimientos y un solo evento publicado

### Requirement: La resincronización de GT SHALL respetar lo comprometido y lo ejercido
Al reemitir una partida, el disponible SHALL quedar en `autorizado nuevo - comprometido - ejercido`.

#### Scenario: Reemisión con compromisos
- **WHEN** una partida de 1,000 con 300 comprometidos se reemite por 1,000
- **THEN** el disponible SHALL quedar en 700
