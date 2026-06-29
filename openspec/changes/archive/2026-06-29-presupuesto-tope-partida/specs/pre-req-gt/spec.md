## ADDED Requirements

### Requirement: Verificación de SaldoPartida al aprobar req en GT
Cuando GT aprueba una requisición (o cuando esta pasa a estado listo para Compras), el sistema SHALL verificar el saldo de la partida correspondiente.

#### Scenario: Partida LIBRE — req aprobada normalmente
- **WHEN** la partida del concepto tiene `estado_tope = 'LIBRE'`
- **THEN** la req avanza normalmente al flujo de Compras

#### Scenario: Partida BLOQUEADA — req pasa a PENDIENTE_TRANSFERENCIA
- **WHEN** la partida tiene `estado_tope = 'BLOQUEADO'`
- **THEN** la req queda en estado `PENDIENTE_TRANSFERENCIA`
- **THEN** se publica evento `gerencia_tecnica.partida_bloqueada` con `trigger = 'REQUISICION'`
- **THEN** la req NO avanza a Compras hasta que se resuelva la transferencia

#### Scenario: Partida LIMITADA — req aprobada con advertencia
- **WHEN** la partida tiene `estado_tope = 'LIMITADO'`
- **THEN** la req se aprueba normalmente
- **THEN** la respuesta incluye `warning: "Partida al X% de ejecución. Disponible: $Y"`

### Requirement: Estado PENDIENTE_TRANSFERENCIA es visible en el listado de requisiciones
El listado de requisiciones SHALL mostrar las reqs en `PENDIENTE_TRANSFERENCIA` con badge visual distinto y mensaje explicativo.

#### Scenario: Badge PENDIENTE_TRANSFERENCIA en UI
- **WHEN** una req tiene `estado = 'PENDIENTE_TRANSFERENCIA'`
- **THEN** aparece badge naranja/amber "Esperando transferencia presupuestal"
- **THEN** la fila muestra la partida bloqueada y el monto faltante

### Requirement: Req en PENDIENTE_TRANSFERENCIA se desbloquea automáticamente al resolverse la partida
Cuando una `TransferenciaPartida` es aprobada y la partida destino tiene saldo suficiente, el sistema SHALL re-evaluar las reqs bloqueadas de esa partida.

#### Scenario: Req desbloqueada automáticamente tras transferencia
- **WHEN** se aprueba una `TransferenciaPartida` que restaura saldo en la partida bloqueada
- **THEN** el sistema busca reqs en `PENDIENTE_TRANSFERENCIA` de esa partida
- **THEN** si `monto_disponible >= monto_req`, la req pasa a `APROBADA`
- **THEN** se notifica a Compras para continuar el flujo
