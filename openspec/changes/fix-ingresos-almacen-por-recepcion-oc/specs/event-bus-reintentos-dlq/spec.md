## ADDED Requirements

### Requirement: El bus SHALL ofrecer publicación confirmada
`@bocam/event-bus` SHALL exponer una publicación confirmada que use un canal de confirmación y el indicador `mandatory`, y que se resuelva únicamente cuando el broker confirme el mensaje. SHALL rechazarse si el broker no confirma, si devuelve el mensaje por no tener cola enlazada, si no hay canal o si vence el tiempo de espera. La publicación existente SHALL permanecer sin cambios.

#### Scenario: Broker confirma
- **WHEN** se publica con confirmación y el broker acepta el mensaje
- **THEN** la promesa se resuelve

#### Scenario: Mensaje devuelto por no tener cola
- **WHEN** ninguna cola está enlazada a la routing key
- **THEN** la promesa se rechaza con un error que lo indica

#### Scenario: Sin canal
- **WHEN** no hay canal disponible
- **THEN** la promesa se rechaza en vez de devolver `false` en silencio

### Requirement: El envoltorio SHALL llevar identificador y versión de evento
`BocamEvent` SHALL admitir `event_id` y `event_version` opcionales. Al publicar, si falta `event_id`, el bus SHALL asignar un UUID, y SHALL incluirlo en un header del mensaje.

#### Scenario: Evento sin identificador
- **WHEN** se publica un evento sin `event_id`
- **THEN** el mensaje sale con un `event_id` generado

### Requirement: Una suscripción SHALL poder activar reintentos y cola de mensajes fallidos
Las opciones de una suscripción SHALL aceptar `retry` (máximo de intentos y espera) y `deadLetter`. Con `retry`, un fallo del handler SHALL republicar el mensaje a una cola de espera que lo devuelve a la principal tras la espera, contando los intentos en el header `x-attempt`. Agotados los intentos, o ante un mensaje ininterpretable, el mensaje SHALL enviarse a `<cola>.dlq` con su payload original y el motivo. Sin estas opciones, el comportamiento vigente SHALL permanecer sin cambios.

#### Scenario: Reintento con éxito
- **WHEN** el handler falla una vez y luego tiene éxito
- **THEN** el mensaje se procesa en el segundo intento y no llega a la DLQ

#### Scenario: Intentos agotados
- **WHEN** el handler falla en todos los intentos
- **THEN** el mensaje llega a `<cola>.dlq` con el payload original, el contador de intentos y el motivo

#### Scenario: Mensaje ininterpretable
- **WHEN** el contenido no es JSON válido o carece de contexto de tenant
- **THEN** el mensaje va a `<cola>.dlq` sin reintentos

#### Scenario: Suscripción sin opciones
- **WHEN** una suscripción existente no declara `retry` ni `deadLetter`
- **THEN** ante un error del handler el bus se comporta exactamente como antes

### Requirement: Un handler SHALL poder marcar un error como no reintentable
El bus SHALL exportar un error `NonRetryableError`. Cuando el handler de una suscripción con `retry` o `deadLetter` lo lance, el mensaje SHALL enviarse directamente a `<cola>.dlq`, sin reintentos, con el mensaje del error como motivo. Cualquier otro error SHALL seguir la política de reintentos.

#### Scenario: Formato o versión no soportados
- **WHEN** el handler lanza `NonRetryableError`
- **THEN** el mensaje llega a `<cola>.dlq` tras un solo intento y no pasa por `<cola>.retry`

### Requirement: El bus SHALL informar su disponibilidad
El bus SHALL exponer `isReady()`, verdadero solo cuando hay una conexión vigente y todas las suscripciones registradas tienen un consumidor activo, para que un servicio construya su `/ready`.

#### Scenario: Sin conexión
- **WHEN** el bus no se ha conectado o ya se cerró
- **THEN** `isReady()` es falso

#### Scenario: Suscripciones activas
- **WHEN** el bus está conectado y todas sus suscripciones tienen consumidor
- **THEN** `isReady()` es verdadero

### Requirement: Las colas nuevas SHALL declararse sin alterar las existentes
Las colas de reintento y de mensajes fallidos SHALL declararse solo para las suscripciones que las activan, con nombres nuevos. El bus NO SHALL redeclarar una cola durable existente con argumentos distintos ni aplicar políticas globales.

#### Scenario: Cola existente
- **WHEN** existe una cola durable con el nombre anterior
- **THEN** su declaración no se modifica

### Requirement: Los mensajes fallidos SHALL ser observables y reprocesables
Cada envío a la DLQ SHALL registrarse con `event_type`, `event_id`, `tenant_id`, `correlation_id` y el motivo, y el procedimiento de reproceso SHALL estar documentado.

#### Scenario: Mensaje enviado a la DLQ
- **WHEN** un mensaje llega a `<cola>.dlq`
- **THEN** se registra un log de error con esos campos

#### Scenario: Reproceso tras corregir la causa
- **WHEN** un operador reprocesa la DLQ según el procedimiento documentado
- **THEN** los mensajes vuelven a la cola principal y, al ser idempotentes, no duplican efectos ya aplicados
