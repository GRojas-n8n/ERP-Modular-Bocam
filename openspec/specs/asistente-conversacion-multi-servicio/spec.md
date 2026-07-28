# asistente-conversacion-multi-servicio Specification

## Purpose
TBD - created by archiving change asistente-ia-agente-conversacional. Update Purpose after archive.
## Requirements
### Requirement: El sistema SHALL exponer un endpoint de chat conversacional
El sistema SHALL exponer `POST /api/v1/asistente/chat`, que acepta un mensaje de
texto del usuario y un `conversacion_id` opcional. Si no se envía
`conversacion_id`, el sistema SHALL generar uno nuevo en el servidor y
devolverlo en la respuesta.

#### Scenario: Primer mensaje de una conversación nueva
- **WHEN** un usuario autorizado envía un mensaje a `/chat` sin `conversacion_id`
- **THEN** el sistema crea una conversación nueva, genera un `conversacion_id`,
  procesa el mensaje, y devuelve la respuesta junto con el `conversacion_id`
  generado

#### Scenario: Mensaje siguiente en una conversación existente
- **WHEN** un usuario envía un mensaje a `/chat` con un `conversacion_id` de una
  conversación previa aún vigente (dentro del TTL de sesión)
- **THEN** el sistema recupera el historial de esa conversación, lo usa como
  contexto, y responde considerando lo hablado en turnos anteriores

### Requirement: El sistema SHALL decidir dinámicamente qué microservicios consultar
Ante cada mensaje, el sistema SHALL usar tool-use de Claude para decidir qué
microservicios (si alguno) consultar para responder, sin requerir que el
usuario indique explícitamente el módulo o servicio.

#### Scenario: Pregunta que requiere combinar varios servicios
- **WHEN** el usuario pregunta algo que solo puede responderse combinando datos
  de dos o más microservicios (por ejemplo, avance físico y presupuesto
  ejercido de una obra)
- **THEN** el sistema invoca las tools correspondientes a cada servicio
  necesario y consolida una única respuesta en lenguaje natural

#### Scenario: Pregunta que solo requiere un servicio
- **WHEN** el usuario hace una pregunta que un solo microservicio puede
  responder completamente
- **THEN** el sistema invoca únicamente la tool de ese servicio, sin consultar
  servicios adicionales de forma innecesaria

### Requirement: El sistema SHALL rechazar preguntas fuera del dominio operativo del ERP
El sistema SHALL reconocer cuando una pregunta no corresponde a datos
operativos del ERP (obras, compras, finanzas, personal, seguridad, calidad) y
SHALL responder con un mensaje de alcance sin invocar ninguna tool.

#### Scenario: Pregunta fuera de dominio
- **WHEN** el usuario envía una pregunta ajena al dominio del ERP (por ejemplo,
  una pregunta de cultura general sin relación con la operación de la empresa)
- **THEN** el sistema responde indicando que solo puede ayudar con datos
  operativos del ERP, sin haber invocado ninguna tool ni consumido tokens de
  llamadas a microservicios

### Requirement: El sistema SHALL restringir el acceso al chat a roles autorizados
El endpoint `/chat` SHALL requerir uno de los roles autorizados
(`admin`, `superintendent`, `finance`, `gerencia-tecnica`) y SHALL rechazar
cualquier otro rol.

#### Scenario: Usuario sin rol autorizado
- **WHEN** un usuario autenticado sin ninguno de los roles autorizados intenta
  usar `/chat`
- **THEN** el sistema responde 403 sin procesar el mensaje ni invocar tools

### Requirement: El sistema SHALL aplicar rate limiting por tenant al chat
El sistema SHALL limitar el número de mensajes de chat por tenant en una
ventana de tiempo, de forma independiente al rate limiting de los demás
endpoints de `asistente`.

#### Scenario: Tenant excede el límite de mensajes
- **WHEN** un tenant supera el límite configurado de mensajes de chat en la
  ventana de 15 minutos
- **THEN** el sistema responde 429 con un mensaje indicando cuándo puede volver
  a intentar, sin invocar Claude ni ninguna tool

### Requirement: El sistema SHALL mantener el contexto de conversación aislado por tenant
La memoria de una conversación SHALL estar asociada al `tenant_id` extraído del
JWT verificado, nunca a un valor provisto por el cliente, y un `conversacion_id`
SHALL ser inaccesible desde un tenant distinto al que la originó.

#### Scenario: Intento de continuar una conversación de otro tenant
- **WHEN** un usuario de un tenant distinto envía un mensaje con un
  `conversacion_id` que pertenece a otro tenant
- **THEN** el sistema no encuentra la conversación para ese tenant y la trata
  como una conversación nueva, sin exponer ningún dato del historial ajeno

