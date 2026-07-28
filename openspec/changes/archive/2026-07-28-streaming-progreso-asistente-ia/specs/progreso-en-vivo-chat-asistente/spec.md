## ADDED Requirements

### Requirement: El chat del Asistente IA SHALL mostrar en tiempo real qué módulo se está consultando
Mientras se resuelve un turno de `POST /api/v1/asistente/chat` que invoca una o más tools, el sistema SHALL transmitir al cliente, antes de que el turno termine, el nombre del módulo del ERP correspondiente a cada tool que se está invocando, y el frontend SHALL mostrar ese nombre en la interfaz en vez de un mensaje de carga genérico y fijo.

#### Scenario: El asistente consulta un módulo durante el turno
- **WHEN** un usuario envía una pregunta que requiere que Claude invoque la tool de Compras
- **THEN** el chat muestra "Consultando Compras…" (o equivalente) antes de que el turno
  termine, no un texto fijo genérico

#### Scenario: El asistente consulta varios módulos en el mismo turno
- **WHEN** Claude encadena varias invocaciones de tools de módulos distintos dentro del
  mismo turno
- **THEN** el chat actualiza el nombre del módulo mostrado conforme cada tool nueva se
  invoca, reflejando la secuencia real

#### Scenario: El turno no invoca ninguna tool
- **WHEN** Claude resuelve el turno sin invocar ninguna tool
- **THEN** el chat muestra un estado de carga genérico (sin nombre de módulo), sin error

### Requirement: El resultado final del turno SHALL ser idéntico al comportamiento sin streaming
El cambio a streaming SHALL ser puramente de progreso intermedio — el payload final (`conversacion_id`, `respuesta`, `parcial`, `servicios_fallidos`), el timeout de 45 segundos, el manejo de `stop_reason === 'refusal'`, y el registro de auditoría SHALL comportarse exactamente igual que antes del streaming.

#### Scenario: El turno completa exitosamente
- **WHEN** un turno de chat se resuelve sin timeout ni refusal
- **THEN** el cliente recibe el mismo payload final (`conversacion_id`, `respuesta`,
  `parcial`, `servicios_fallidos`) que recibiría sin streaming

#### Scenario: El turno excede el timeout
- **WHEN** un turno tarda más de 45 segundos en resolverse
- **THEN** el sistema aborta el turno y transmite un frame `error` con el mismo mensaje
  ("El asistente no respondió a tiempo. Intenta de nuevo.") que antes iba en el body de un
  503 — el status HTTP de la respuesta SHALL seguir siendo 200 porque los headers de
  streaming ya se enviaron antes de que el timeout pudiera ocurrir; el frontend SHALL tratar
  un frame `error` igual que antes trataba una respuesta no-200

#### Scenario: Claude rechaza responder
- **WHEN** el `stop_reason` del turno es `refusal`
- **THEN** el sistema responde con el mismo mensaje de rechazo ya existente
  ("No puedo responder a esa solicitud."), transmitido como el evento final del stream
