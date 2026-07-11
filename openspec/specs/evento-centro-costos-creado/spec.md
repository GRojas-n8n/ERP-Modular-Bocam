## Purpose

Publicación del evento `auth.centro_costos_creado` desde `apps/auth` al crear
un Proyecto/Centro de Costos, y su consumo por los 10 microservicios de
negocio (11 servicios en total, incluyendo el publisher) — desde creación
proactiva de filas de proyección hasta registro de auditoría, según la
necesidad real de cada consumidor.

## Requirements

### Requirement: Publicación del evento al crear un centro de costos
`apps/auth` SHALL publicar un evento `auth.centro_costos_creado` en el exchange `bocam.events` inmediatamente después de que la creación de un `Proyecto` se confirme en base de datos, vía `POST /api/v1/auth/admin/proyectos`.

#### Scenario: Alta exitosa de centro de costos publica el evento
- **WHEN** un usuario con rol autorizado crea un `Proyecto` exitosamente
- **THEN** `apps/auth` publica `auth.centro_costos_creado` con
  `context.tenant_id` y `context.proyecto_id` iguales al tenant y al
  `proyecto_id` recién creado

#### Scenario: Falla la creación del proyecto
- **WHEN** el `create` del `Proyecto` falla (validación, conflicto de
  unicidad, error de base de datos)
- **THEN** no se publica ningún evento

#### Scenario: RabbitMQ no disponible al momento de publicar
- **WHEN** el canal de `EventBus` no está disponible (ver
  `EventBus.publish`, retorna `false` sin lanzar excepción)
- **THEN** la respuesta HTTP de creación del proyecto igual regresa éxito al
  usuario — la publicación del evento nunca bloquea ni revierte la creación
  del proyecto

### Requirement: Contrato del payload del evento
El payload de `auth.centro_costos_creado` SHALL incluir, como mínimo: `proyecto_id`, `codigo_centro_costos`, `empresa_grupo`, `anio_centro_costos`, `cliente_id` (nullable), `es_especial`, `estatus`, `nombre_oficial`, `fecha_creacion` (ISO 8601).

#### Scenario: Consumidor recibe todos los campos requeridos
- **WHEN** cualquier microservicio suscrito recibe el evento
- **THEN** el `payload` contiene los 8 campos listados, sin necesidad de
  hacer una llamada adicional a `apps/auth` para completar información
  básica del proyecto

### Requirement: Creación proactiva en gerencia-tecnica
`apps/gerencia-tecnica` SHALL suscribirse a `auth.centro_costos_creado` y, al recibirlo, crear (si no existe) el registro `ProyectoCostosConfig` para ese `(tenant_id, proyecto_id)` junto con las 10 categorías de gasto predefinidas, usando la misma lógica hoy encapsulada en `getOrCreateProyectoConfig` — sin duplicar categorías si la fila ya existe.

#### Scenario: Proyecto nuevo sin actividad previa en gerencia-tecnica
- **WHEN** llega `auth.centro_costos_creado` para un `proyecto_id` que
  gerencia-tecnica nunca ha visto
- **THEN** se crea `ProyectoCostosConfig` en estado `CONFIGURACION` y se
  siembran las 10 categorías de gasto predefinidas

#### Scenario: El proyecto ya fue tocado antes de que llegara el evento
- **WHEN** llega `auth.centro_costos_creado` pero `ProyectoCostosConfig` ya
  existe para ese `(tenant_id, proyecto_id)` (creado por el fallback
  perezoso de `getOrCreateProyectoConfig`)
- **THEN** el handler no crea una fila duplicada ni siembra categorías de
  nuevo

### Requirement: Creación proactiva en finanzas
`apps/finanzas` SHALL suscribirse a `auth.centro_costos_creado` y, al recibirlo, crear (si no existe) el registro `ProyectoFinanzas` para ese `(tenant_id, proyecto_id)` con `anticipo_total = 0` y `anticipo_usado = 0`.

#### Scenario: Proyecto nuevo sin anticipos registrados
- **WHEN** llega `auth.centro_costos_creado` para un `proyecto_id` sin fila
  previa en `ProyectoFinanzas`
- **THEN** se crea la fila con los valores por defecto en 0

#### Scenario: Ya existe la fila (creada manualmente antes del evento)
- **WHEN** llega el evento pero `ProyectoFinanzas` ya existe para ese
  `(tenant_id, proyecto_id)`
- **THEN** el handler no sobreescribe los valores existentes (`upsert` no
  toca los campos de actualización si la fila ya existe, solo garantiza
  presencia)

### Requirement: Registro liviano en consumidores de bajo acoplamiento
`contabilidad`, `control-proyectos`, `control-obra`, `compras`, `almacen`, `ventas` y `personal` SHALL suscribirse a `auth.centro_costos_creado` y registrar su recepción mediante logging estructurado (mismo helper de auditoría ya usado por cada servicio), sin persistir una tabla de proyección nueva en este change.

#### Scenario: Evento recibido por un consumidor de solo registro
- **WHEN** cualquiera de estos 7 servicios recibe `auth.centro_costos_creado`
- **THEN** queda un registro de auditoría/log con `tenant_id`, `proyecto_id`
  y `codigo_centro_costos`, y el mensaje se confirma (`ack`) sin error

### Requirement: Bootstrap de EventBus en auth, seguridad y calidad
`apps/auth`, `apps/seguridad` y `apps/calidad` SHALL tener un `EventBus` funcional (`createEventBus` + `.connect()` en el arranque del servicio, antes de levantar el servidor HTTP) como prerrequisito para publicar (`auth`) o suscribirse (`seguridad`, `calidad`) a `auth.centro_costos_creado`.

#### Scenario: RABBITMQ_URL no configurado en alguno de estos 3 servicios
- **WHEN** el servicio arranca sin `RABBITMQ_URL` en su entorno
- **THEN** el servicio sigue arrancando y respondiendo en `/health` con
  normalidad — el `EventBus` deshabilitado no es una falla fatal (mismo
  comportamiento defensivo ya garantizado por `EventBus.connect()`)

#### Scenario: seguridad ya tenía connect() sin subscribe
- **WHEN** se despliega la nueva versión de `apps/seguridad`
- **THEN** el `eventBus.connect()` existente pasa a tener al menos un
  `subscribe('auth.centro_costos_creado', ...)` activo

### Requirement: Idempotencia ante reentrega del evento
Todo handler de `auth.centro_costos_creado` SHALL ser seguro ante reentrega (at-least-once delivery de RabbitMQ) — procesar el mismo evento dos veces no debe crear filas duplicadas ni duplicar efectos secundarios (como el seed de categorías de gasto).

#### Scenario: RabbitMQ reentrega el mismo mensaje tras un nack o timeout
- **WHEN** un consumidor recibe el mismo `auth.centro_costos_creado` (mismo
  `proyecto_id`) dos veces
- **THEN** el resultado final es idéntico a haberlo procesado una sola vez
  (vía `upsert`/`findUnique`+`create` sobre la clave única
  `(tenant_id, proyecto_id)`, sin tabla de deduplicación de eventos)
