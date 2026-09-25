## ADDED Requirements

### Requirement: Una suscripción SHALL poder activar reintentos y cola de mensajes fallidos
`@bocam/event-bus` SHALL aceptar en las opciones de una suscripción `retry` (número máximo de intentos y espera entre intentos) y `deadLetter`. Con `retry`, un fallo del handler SHALL republicar el mensaje a una cola de espera que lo devuelve a la cola principal tras la espera, contando los intentos en un header. Agotados los intentos, o ante un mensaje ininterpretable, el mensaje SHALL enviarse a `<cola>.dlq` conservando el payload original y el motivo del error. Sin estas opciones, el comportamiento vigente (`nack` sin reencolar) SHALL permanecer sin cambios.

#### Scenario: Suscripción con reintentos y un fallo transitorio
- **WHEN** el handler falla una vez y luego tiene éxito
- **THEN** el mensaje se procesa en el segundo intento, se confirma y no llega a la DLQ

#### Scenario: Suscripción con reintentos agotados
- **WHEN** el handler falla en todos los intentos
- **THEN** el mensaje llega a `<cola>.dlq` con el payload original, el contador de intentos y el motivo del error

#### Scenario: Mensaje ininterpretable
- **WHEN** el contenido no es JSON válido o carece de contexto de tenant
- **THEN** el mensaje se envía a `<cola>.dlq` sin reintentos

#### Scenario: Suscripción sin opciones
- **WHEN** una suscripción existente no declara `retry` ni `deadLetter`
- **THEN** ante un error del handler el bus se comporta exactamente como antes

### Requirement: Los mensajes fallidos SHALL ser observables y reprocesables
El paquete SHALL registrar cada envío a la DLQ con `event_type`, `tenant_id`, `correlation_id` y el motivo, y SHALL documentar el procedimiento para reprocesar los mensajes de una DLQ una vez corregida la causa.

#### Scenario: Mensaje enviado a la DLQ
- **WHEN** un mensaje llega a `<cola>.dlq`
- **THEN** se registra un log de error con el tipo de evento, el tenant, la correlación y el motivo

#### Scenario: Reproceso tras corregir la causa
- **WHEN** un operador reprocesa los mensajes de la DLQ siguiendo el procedimiento documentado
- **THEN** los mensajes vuelven a la cola principal y, al ser idempotentes, no duplican efectos ya aplicados
