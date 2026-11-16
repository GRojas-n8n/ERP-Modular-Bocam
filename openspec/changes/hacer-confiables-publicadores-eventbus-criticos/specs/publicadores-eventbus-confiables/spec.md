## ADDED Requirements

### Requirement: El evento crítico SHALL escribirse en la misma transacción que el cambio de negocio
Un servicio SHALL registrar cada evento crítico en una outbox local dentro de la misma transacción que confirma el cambio de negocio que lo origina. NO SHALL publicar el evento directamente al broker como único mecanismo. Si la transacción de negocio se revierte, el evento NO SHALL quedar registrado; si se confirma, el evento SHALL quedar registrado.

#### Scenario: Caída tras el commit
- **WHEN** el proceso cae después de confirmar el compromiso y antes de publicar
- **THEN** la fila de outbox existe en estado `PENDIENTE` y se publica al reiniciar el despachador

#### Scenario: Reversión de la transacción
- **WHEN** la transacción de negocio se revierte
- **THEN** no existe fila de outbox para ese evento

### Requirement: El evento SHALL tener identidad estable y contexto completo
Cada fila de outbox SHALL tener un `event_id` único generado al escribirla, `event_type`, versión de esquema, `tenant_id`, `proyecto_id`, fecha de creación y `correlation_id`. Un reintento SHALL publicar el mismo `event_id`.

#### Scenario: Reintento
- **WHEN** una publicación falla y se reintenta
- **THEN** el mensaje lleva el mismo `event_id` y los mismos datos

### Requirement: La publicación SHALL confirmarse por el broker y detectar la falta de routing
El despachador SHALL publicar con confirmación del broker y con el indicador de mensaje obligatorio. SHALL marcar `PUBLICADO` únicamente tras la confirmación. Un mensaje devuelto por no tener cola enlazada, una falta de canal, un plazo vencido o un rechazo SHALL contarse como fallo de ese intento.

#### Scenario: Sin cola enlazada
- **WHEN** el broker devuelve el mensaje porque ninguna cola está enlazada a la routing key
- **THEN** la fila no se marca `PUBLICADO`, se registra el error y se reprograma

#### Scenario: Sin canal
- **WHEN** no hay conexión con el broker
- **THEN** la fila permanece `PENDIENTE` y no se pierde ningún evento

### Requirement: Un fallo SHALL reintentarse con espera creciente y ser observable
Un fallo de publicación SHALL reprogramar la fila con espera creciente y acotada. Agotado el máximo de intentos la fila SHALL pasar a `ERROR`, conservarse y poder reintentarse manualmente. El estado fallido SHALL exponerse en `/ready`, en métricas y en alertas.

#### Scenario: Intentos agotados
- **WHEN** una fila agota sus intentos
- **THEN** queda en `ERROR` con el último error, no se elimina y `/ready` refleja el estado degradado

### Requirement: El despachador SHALL nacer apagado y la activación SHALL ser por servicio
El despachador SHALL estar apagado por defecto en el despliegue y encenderse solo con un valor explícito de configuración. Hasta su activación, el servicio SHALL conservar su publicación actual sin cambios y NO SHALL escribir filas de outbox. La activación y la reversa SHALL ser por servicio, nunca globales. La reversa NO SHALL eliminar eventos pendientes.

#### Scenario: Despliegue con despachador apagado
- **WHEN** se despliega el servicio con el modo y el despachador por defecto
- **THEN** el comportamiento observable de publicación es idéntico al anterior y la tabla de outbox permanece vacía

#### Scenario: Reversa
- **WHEN** se revierte de `outbox` a `direct`
- **THEN** las filas `PENDIENTE` y `ERROR` se conservan y se reanudan al reactivar

### Requirement: La activación SHALL exigir consumidores idempotentes
Un evento SHALL activarse en modo outbox solo si sus consumidores esperados son idempotentes ante duplicados por `event_id` o por un estado demostrado por pruebas. NO SHALL activarse el reintento del consumidor mientras no se garantice esa idempotencia.

#### Scenario: Consumidor sin idempotencia demostrada
- **WHEN** un consumidor esperado del evento no tiene idempotencia demostrada
- **THEN** ese evento permanece en modo `direct`

### Requirement: La tabla de outbox SHALL tener RLS habilitado y forzado
La tabla de outbox SHALL tener aislamiento por tenant y proyecto con RLS habilitado y forzado, y SHALL ser operable con el rol de runtime del servicio sin `BYPASSRLS`.

#### Scenario: Otro tenant
- **WHEN** una sesión de otro tenant consulta la outbox
- **THEN** no ve filas ajenas

### Requirement: La retención SHALL ser controlada
Las filas `PUBLICADO` SHALL conservarse durante un periodo configurable y limpiarse con un trabajo controlado y registrado. Las filas `PENDIENTE` y `ERROR` NO SHALL eliminarse automáticamente.

#### Scenario: Limpieza
- **WHEN** corre la limpieza
- **THEN** solo se eliminan filas `PUBLICADO` anteriores al periodo de retención y se registra cuántas

### Requirement: El orden SHALL respetarse por agregado
Las filas de un mismo agregado (p. ej. una OC) SHALL publicarse en orden de inserción; una fila en reintento SHALL retener a las posteriores de ese agregado y no a las de otros. Los consumidores NO SHALL depender de orden entre agregados distintos.

#### Scenario: Fallo de un evento de una OC
- **WHEN** falla `fondos_comprometidos` de la OC A
- **THEN** `fondos_liberados` de la OC A espera, y los eventos de la OC B se publican

### Requirement: La disponibilidad de consumidores SHALL verificarse
El servicio SHALL mantener un catálogo de consumidores esperados por evento y verificar, al arrancar y periódicamente, que sus colas existan y tengan consumidor activo, alertando si no. La confirmación con mensaje obligatorio NO SHALL considerarse prueba de que cada consumidor tenga cola.

#### Scenario: Cola de consumidor ausente
- **WHEN** falta la cola de un consumidor esperado
- **THEN** se genera alerta y `/ready` queda degradado

### Requirement: Las pruebas SHALL usar PostgreSQL y RabbitMQ reales
Las pruebas de cada lote SHALL ejecutarse con PostgreSQL y RabbitMQ reales, sin simular el motor ni el broker, y SHALL escribirse antes de la implementación. SHALL cubrir: atomicidad con la transacción, caída tras el commit, sin canal, sin cola enlazada, reintento con el mismo `event_id`, duplicado, orden por agregado, varias instancias, `ERROR` y reintento manual, RLS con rol sin `BYPASSRLS`, despachador apagado y reversa sin pérdida.

#### Scenario: Prueba en rojo previa
- **WHEN** se ejecutan las pruebas contra el código sin outbox
- **THEN** fallan las que demuestran la pérdida (caída tras el commit y sin canal)
