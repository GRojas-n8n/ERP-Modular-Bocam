## ADDED Requirements

### Requirement: Los endpoints de callback SAT exentos de JWT SHALL exigir el secreto compartido de forma estructuralmente inseparable de esa exención
Cualquier ruta que se exima de autenticación JWT porque su llamador legítimo es un proceso interno (no una sesión de usuario) SHALL exigir, en el mismo punto de configuración que otorga la exención, una verificación de secreto compartido — de modo que no sea posible agregar una ruta exenta de JWT sin exigirle también el secreto.

#### Scenario: Ruta agregada a la lista de exención de JWT
- **WHEN** una ruta nueva se agrega al arreglo que exime rutas de `createAuthMiddleware`
- **THEN** esa misma ruta SHALL quedar automáticamente sujeta a `requireSatCallbackSecret` (o el middleware equivalente), sin requerir un segundo cambio de código independiente

### Requirement: El secreto del callback SAT no SHALL tener fallback a la credencial saliente hacia el adaptador externo
`SAT_CALLBACK_SHARED_SECRET` (credencial entrante, worker → API) y `SAT_ADAPTER_API_KEY` (credencial saliente, API/worker → adaptador externo) SHALL tratarse como límites de confianza distintos. La función que resuelve el secreto de callback NO SHALL caer a `SAT_ADAPTER_API_KEY` cuando `SAT_CALLBACK_SHARED_SECRET` no esté configurado.

#### Scenario: Solo la credencial del adaptador externo está configurada
- **WHEN** `SAT_CALLBACK_SHARED_SECRET` no está configurado pero `SAT_ADAPTER_API_KEY` sí
- **THEN** los endpoints de callback SHALL responder `503` (no configurado), nunca aceptar `SAT_ADAPTER_API_KEY` como credencial válida de entrada

### Requirement: La comparación del secreto compartido SHALL ser en tiempo constante y nunca lanzar por longitudes distintas
La comparación SHALL usar un mecanismo resistente a ataques de temporización (ej. `crypto.timingSafeEqual` sobre un hash de longitud fija de ambos operandos), y SHALL manejar sin excepción el caso de que el valor provisto y el esperado tengan longitudes distintas.

#### Scenario: Secreto provisto de longitud distinta al configurado
- **WHEN** el valor del header de secreto tiene una longitud distinta a la del secreto configurado
- **THEN** la comparación SHALL retornar `false` sin lanzar una excepción, y sin que el tiempo de respuesta revele en qué posición difieren

### Requirement: Un endpoint de callback autenticado solo por secreto compartido no SHALL confiar en tenant_id/proyecto_id del body sin una verificación adicional ligada a la operación específica
Cuando un endpoint deriva su contexto de aislamiento (`tenant_id`/`proyecto_id`) directamente del cuerpo de una petición autenticada únicamente por un secreto de proceso (no por sesión de usuario), SHALL exigir además una verificación de que el llamador conoce un identificador de operación impredecible y generado server-side (ej. un `dispatch_id` persistido antes de iniciar la operación asíncrona), rechazando la operación si no coincide con el valor almacenado — con el mismo código de error que un "recurso no encontrado" genuino, sin señal distinguible.

#### Scenario: tenant_id y id de recurso correctos, identificador de operación incorrecto o ausente
- **WHEN** el secreto compartido es válido y el `tenant_id`/id de recurso del body corresponden a un registro real, pero el identificador de operación (`dispatch_id`) no coincide con el guardado en ese registro, o está ausente
- **THEN** la operación SHALL rechazarse con el mismo código que "recurso no encontrado", y el registro NO SHALL modificarse

#### Scenario: Identificador de operación coincide con una rotación previa ya completada
- **WHEN** el identificador de operación coincide con el valor que quedó registrado como "última operación completada" (no con el identificador activo actual)
- **THEN** SHALL aceptarse como una entrega duplicada o reintento legítimo, sin rechazar la operación

### Requirement: Un identificador de operación que funciona como token de un solo uso no SHALL exponerse en ninguna respuesta HTTP, incluyendo respuestas de rechazo
Un identificador generado server-side que se usa para autorizar una operación posterior (ej. `dispatch_id`) SHALL tratarse como secreto una vez que empieza a usarse con ese propósito — ningún endpoint, autenticado o no, SHALL incluirlo en el cuerpo de su respuesta, incluyendo respuestas que rechazan la operación solicitada.

#### Scenario: Endpoint que resuelve/reclama una operación rechaza el intento
- **WHEN** un endpoint que resuelve una operación por su identificador rechaza el intento (ej. identificador obsoleto o ya completado)
- **THEN** la respuesta NO SHALL incluir el identificador real almacenado en ningún campo, incluso si la operación en sí no se considera un error (ej. HTTP `200` con `claimed: false`)
