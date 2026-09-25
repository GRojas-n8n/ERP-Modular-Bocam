## ADDED Requirements

### Requirement: Toda suscripción SHALL declarar su política de fallo
Cada suscripción al bus SHALL declarar explícitamente qué ocurre cuando su handler falla: reintentos con espera y cola de mensajes fallidos, o descarte deliberado y documentado. NO SHALL depender del comportamiento por defecto del bus para eventos de negocio críticos o relevantes.

#### Scenario: Suscripción crítica
- **WHEN** una suscripción procesa un evento que afecta dinero, inventario, nómina o cumplimiento fiscal
- **THEN** declara reintentos con espera y cola de mensajes fallidos, y tiene una prueba de idempotencia

#### Scenario: Suscripción informativa
- **WHEN** una suscripción solo registra información
- **THEN** su política de fallo, incluido un descarte explícito, está documentada

### Requirement: Ningún error de handler SHALL descartar en silencio un evento de negocio
Un error de un handler de una suscripción crítica o relevante NO SHALL provocar la pérdida del mensaje sin dejar registro recuperable. El mensaje SHALL reintentarse y, agotados los intentos, quedar en una cola de mensajes fallidos con su payload y el motivo.

#### Scenario: Handler que falla siempre
- **WHEN** el handler de una suscripción crítica falla en todos los intentos
- **THEN** el mensaje queda en su cola de mensajes fallidos y se registra un log de error

### Requirement: Existirá un inventario vigente de consumidores y colas
Debe existir un inventario de suscripciones con su clasificación, política de fallo, cola y responsable, y una lista de las colas sin consumidor con su última actividad conocida. Retirar una cola SHALL requerir autorización expresa.

#### Scenario: Cola sin consumidor
- **WHEN** una cola no tiene consumidor
- **THEN** figura en el inventario con su origen y su propuesta de retiro o conservación
