## ADDED Requirements

### Requirement: Toda suscripción SHALL declarar su política de fallo
Cada suscripción al bus SHALL declarar explícitamente qué ocurre cuando su handler falla: reintentos con espera y cola de mensajes fallidos, o descarte deliberado y documentado. NO SHALL depender del comportamiento por defecto del bus para eventos de negocio críticos o relevantes. Esto aplica también al cliente RabbitMQ propio de Gerencia Técnica.

#### Scenario: Suscripción crítica
- **WHEN** una suscripción procesa un evento que afecta dinero, inventario, nómina o cumplimiento fiscal
- **THEN** declara reintentos con espera y cola de mensajes fallidos, y tiene una prueba de idempotencia

#### Scenario: Suscripción informativa
- **WHEN** una suscripción solo registra información
- **THEN** su política de fallo, incluido un descarte explícito, está documentada

### Requirement: Ningún error de handler SHALL descartar en silencio un evento de negocio
Un error de un handler de una suscripción crítica o relevante NO SHALL provocar la pérdida del mensaje sin dejar registro recuperable. Ningún handler SHALL tragar el error en un `catch` ni retornar sin más ante un payload inválido. El mensaje SHALL reintentarse (si el error es transitorio) y, agotados los intentos, quedar en una cola de mensajes fallidos con su payload y el motivo.

#### Scenario: Handler que falla siempre
- **WHEN** el handler de una suscripción crítica falla en todos los intentos
- **THEN** el mensaje queda en su cola de mensajes fallidos y se registra un log de error

#### Scenario: Error tragado
- **WHEN** un handler de una suscripción crítica o relevante captura un error
- **THEN** lo relanza para que el bus aplique la política de fallo, o lo registra como fallo no reintentable en la cola de mensajes fallidos

### Requirement: Cada evento consumido SHALL tener un contrato canónico
Cada evento consumido por un servicio SHALL tener un contrato canónico (campos, tipos y obligatorios) compartido por publicador y consumidor. El consumidor NO SHALL exigir campos que el publicador real no emite.

#### Scenario: Publicador y consumidor divergen
- **WHEN** el payload que emite el publicador real no cumple el contrato que valida el consumidor
- **THEN** una prueba de conformidad falla en CI

#### Scenario: Evento sin contrato
- **WHEN** existe una suscripción a un evento sin contrato canónico documentado
- **THEN** figura en la matriz de contratos como deuda con su lote de corrección

### Requirement: Las pruebas SHALL usar el payload del publicador real
Las pruebas de un consumidor SHALL construir el payload con el contrato canónico o con un fixture verificado contra el publicador real. NO SHALL usar payloads escritos a mano que ningún publicador emite.

#### Scenario: Prueba con payload sintético
- **WHEN** una prueba de consumidor usa campos que el publicador real no emite
- **THEN** se corrige o se reemplaza por la del contrato canónico, y la prueba reproduce el flujo real

### Requirement: Un payload inválido SHALL ir a la cola de mensajes fallidos como no reintentable
Un payload inválido o que incumple el contrato SHALL rechazarse con un error no reintentable y quedar en la cola de mensajes fallidos con su payload y motivo, sin reintentos y sin ACK silencioso. El log NO SHALL imprimir el payload completo ni montos.

#### Scenario: Payload sin campo obligatorio
- **WHEN** llega un evento al que le falta un campo obligatorio del contrato
- **THEN** el mensaje va a la cola de mensajes fallidos marcado como no reintentable, sin reintentos

### Requirement: Un error transitorio SHALL reintentarse
Un error transitorio (base de datos, red, timeout) o un no-encontrado por carrera SHALL reintentarse con espera hasta agotar los intentos, y después quedar en la cola de mensajes fallidos.

#### Scenario: Base de datos no disponible
- **WHEN** el handler falla por un error transitorio y el servicio se recupera antes de agotar los intentos
- **THEN** el evento se procesa una sola vez, con el mismo efecto que sin fallo

### Requirement: Ningún retry SHALL activarse sin idempotencia y atomicidad verificadas
Antes de activar reintentos en una suscripción SHALL existir una prueba que demuestre que procesar el mismo evento dos veces produce el mismo estado, y la escritura de negocio del handler SHALL ser una única transacción. Los contratos incompatibles conocidos SHALL estar corregidos antes de activar retry en los consumidores afectados.

#### Scenario: Handler no atómico
- **WHEN** un handler escribe en varias transacciones o su reintento puede dejar un estado parcial
- **THEN** no se activa retry hasta unificar la escritura y probar la idempotencia

#### Scenario: Contrato incompatible pendiente
- **WHEN** el contrato de un evento es incompatible entre publicador y consumidor
- **THEN** no se activa retry en ese consumidor hasta corregirlo, para no llenar la cola de mensajes fallidos con eventos siempre inválidos

### Requirement: Los consumidores críticos SHALL exponer readiness
Todo servicio con suscripciones críticas SHALL exponer un `/ready` que refleje el estado real de sus consumidores (conexión, canal y suscripciones activas), no solo `/health`. Tras una reconexión, el servicio SHALL volver a suscribirse a todos sus eventos.

#### Scenario: Consumidor caído
- **WHEN** la conexión al broker se cierra y las suscripciones no se restablecen
- **THEN** `/ready` responde no listo hasta que se restablezcan

#### Scenario: Reconexión
- **WHEN** el servicio reconecta tras un cierre de conexión
- **THEN** todas sus suscripciones se restablecen sin reiniciar el servicio

### Requirement: Las colas nuevas SHALL seguir una convención versionada y permitir rollback
La adopción de una política nueva SHALL usar colas nuevas con nombre versionado (`<módulo>.<routing_key>.v<N>`, con N superior a cualquier versión existente) en lugar de redeclarar colas durables. Debe poder revertirse a la suscripción anterior sin perder mensajes, y solo una versión de una misma suscripción SHALL consumir a la vez.

#### Scenario: Cola nueva
- **WHEN** un lote adopta reintentos y cola de mensajes fallidos para una suscripción
- **THEN** declara una cola nueva versionada y no altera los argumentos de la cola existente

#### Scenario: Rollback
- **WHEN** la nueva suscripción debe revertirse
- **THEN** se reactiva la anterior mediante una bandera, sin eliminar la cola nueva ni perder sus mensajes pendientes

### Requirement: Existirá un inventario vigente de consumidores y colas
Debe existir un inventario de suscripciones con su clasificación, política de fallo, cola y responsable, y una lista de las colas sin consumidor con su última actividad conocida. Retirar una cola SHALL requerir autorización expresa.

#### Scenario: Cola sin consumidor
- **WHEN** una cola no tiene consumidor
- **THEN** figura en el inventario con su origen y su propuesta de retiro o conservación

### Requirement: La confiabilidad de la publicación SHALL tratarse fuera de este change
La publicación fire-and-forget de eventos (sin confirmación ni outbox) NO es alcance de esta capacidad y SHALL abordarse en un change separado de confiabilidad de publicadores.

#### Scenario: Hallazgo de publicación
- **WHEN** se detecta un publicador sin confirmación ni outbox
- **THEN** se registra para el change de publicadores y no se corrige en un lote de consumidores
