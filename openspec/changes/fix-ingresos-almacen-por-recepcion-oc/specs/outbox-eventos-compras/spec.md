## ADDED Requirements

### Requirement: La recepción y su evento SHALL registrarse en la misma transacción
Al registrar una recepción de OC, Compras SHALL escribir la recepción, sus ítems, el nuevo estado de la OC y el registro del outbox con su `event_id` en una sola transacción. Si cualquier escritura falla, ninguna SHALL persistir.

#### Scenario: Recepción exitosa
- **WHEN** se registra una recepción válida
- **THEN** existen la recepción, sus ítems, el estado de la OC actualizado y una fila del outbox en estado `PENDIENTE`

#### Scenario: Falla al escribir el outbox
- **WHEN** la escritura del outbox falla
- **THEN** la recepción no queda registrada y el usuario recibe un error

#### Scenario: Bus caído al recibir
- **WHEN** el bus no está disponible al registrar la recepción
- **THEN** la recepción se registra y el evento queda `PENDIENTE` para publicarse después

### Requirement: La publicación SHALL ser reintentable
Un despachador SHALL publicar las filas `PENDIENTE` cuyo momento de reintento venció. Un fallo SHALL incrementar `intentos`, guardar `ultimo_error` y reprogramar con espera creciente. Superado el máximo de intentos, la fila SHALL pasar a `ERROR`, registrarse en el log de errores y permanecer visible. Varias instancias NO SHALL publicar la misma fila a la vez.

#### Scenario: Publicación tras una falla transitoria
- **WHEN** la primera publicación falla y la segunda tiene éxito
- **THEN** la fila termina `PUBLICADO` con `intentos = 2`

#### Scenario: Máximo de intentos
- **WHEN** todos los intentos fallan
- **THEN** la fila queda en `ERROR` con el último error y se registra un log de error

#### Scenario: Dos instancias del despachador
- **WHEN** dos instancias consultan las filas pendientes al mismo tiempo
- **THEN** cada fila la toma una sola instancia

### Requirement: Una fila SHALL marcarse publicada solo tras la confirmación del broker
El despachador SHALL usar publicación confirmada y SHALL marcar `PUBLICADO` únicamente cuando el broker confirme el mensaje. Un mensaje no confirmado, devuelto por no tener cola enlazada o que venza el tiempo de espera SHALL tratarse como fallo y reintentarse.

#### Scenario: El broker no confirma
- **WHEN** el broker no confirma el mensaje dentro del tiempo de espera
- **THEN** la fila permanece `PENDIENTE` y se reprograma

#### Scenario: Mensaje sin cola enlazada
- **WHEN** el broker devuelve el mensaje por no encontrar una cola enlazada
- **THEN** la fila no se marca `PUBLICADO`

### Requirement: El outbox SHALL recuperarse tras reinicios
El estado del outbox SHALL residir en la base de datos. Tras reiniciar Compras, el despachador SHALL retomar las filas `PENDIENTE`. Una fila publicada pero no marcada SHALL republicarse con el mismo `event_id`.

#### Scenario: Reinicio con eventos pendientes
- **WHEN** Compras se reinicia con filas `PENDIENTE`
- **THEN** al arrancar el despachador las publica

#### Scenario: Caída entre la confirmación y el marcado
- **WHEN** el proceso cae después de la confirmación del broker y antes de marcar `PUBLICADO`
- **THEN** la fila se republica con el mismo `event_id` y el consumidor la trata como reentrega

### Requirement: El outbox SHALL respetar el aislamiento por tenant y proyecto
La tabla del outbox SHALL llevar `tenant_id` y `proyecto_id` y estar protegida por RLS. El despachador SHALL acceder a filas de todos los tenants únicamente mediante la variable de sesión interna reservada a su función, y SHALL publicar cada evento con el contexto de su propio tenant y proyecto.

#### Scenario: Consulta ordinaria de otro tenant
- **WHEN** una sesión de un tenant consulta el outbox
- **THEN** solo ve las filas de su tenant y proyecto

#### Scenario: Reemisión manual
- **WHEN** un usuario `admin` o `procurement` solicita reemitir una recepción de su tenant
- **THEN** la fila vuelve a `PENDIENTE` y se publica con el mismo `event_id`; un usuario de otro tenant recibe `404`
