## Context

Observado el 2026-09-25 por lectura de código y evidencia de solo lectura (`evidence-2026-09-25.md`).

- **Publicador.** `POST /api/v1/compras/ordenes-compra/:id/recepciones` registra la recepción y, solo si la OC queda `RECIBIDA`, publica `compras.oc_recibida_total` con `{ id_orden, codigo, proveedor_id, total, proyecto_id }`. Una recepción parcial no publica nada. La publicación ocurre después de la transacción, dentro de un `try` que ignora el resultado.
- **Bus.** `EventBus.publish` usa un canal normal: devuelve `true` al encolar en el socket, `false` sin lanzar si no hay canal, y descarta en silencio un mensaje sin cola enlazada. No hay confirmación del broker ni `mandatory`. Ante una excepción del handler hace `nack(msg, false, false)` y las colas solo declaran `x-message-ttl`.
- **Consumidor.** `handleOcRecibida` exige `orden_compra_id` e `items[]` y registra `skip_no_items` si faltan. Captura la excepción de cada ítem y sigue. Su prueba usa un payload que ningún publicador emite.
- **Idempotencia actual.** OC + insumo + `INGRESO`: ignoraría una segunda recepción parcial legítima.
- **Datos en Compras.** `OrdenCompraItem` guarda `insumo_id` (nulo en texto libre) y `descripcion_libre`/`unidad_libre` solo para esos. Clave, descripción, unidad y categoría de un insumo de catálogo viven en Gerencia Técnica, que Compras ya consulta por HTTP.
- **RLS.** El rol de ejecución no tiene `BYPASSRLS`: un proceso sin contexto de sesión ve cero filas de una tabla con RLS.

## Goals / Non-Goals

**Goals**

- Que toda recepción produzca, una sola vez, los INGRESOS correspondientes, incluso ante caídas del bus, del consumidor o reinicios.
- Que ningún fallo se confirme en silencio: reintento con espera y, agotados, una cola de mensajes fallidos con el payload original.
- Idempotencia que distinga recepciones y renglones distintos.
- Separar prueba de vida de disponibilidad de dependencias.

**Non-Goals**

- Cambiar a los demás consumidores del bus.
- Rediseñar el inventario o los movimientos manuales.
- Corregir datos históricos de producción sin autorización expresa.

## Decisions

### 1. Contrato versionado `compras.recepcion_oc_registrada.v1`

Un solo evento por recepción, sin tipos "parcial" y "total" incompatibles. El estado de la OC es un dato del evento. El `event_type` y la routing key son `compras.recepcion_oc_registrada.v1`; una versión nueva usa otra clave.

Payload mínimo:

- `event_id` (UUID), `event_version` (1) y `occurred_at`.
- `tenant_id` y `proyecto_id`, iguales a los del contexto del bus, que se valida.
- `orden_compra_id`, `orden_compra_codigo`, `proveedor_id`, `recepcion_id`, `fecha_recepcion` y `estado_oc_resultante` (`PARCIALMENTE_RECIBIDA` o `RECIBIDA`).
- `items[]`, solo lo recibido en esa recepción: `recepcion_item_id` (identificador estable del renglón), `orden_item_id`, `insumo_id` (nulo si no hay catálogo), `cantidad_recibida` y el snapshot `descripcion`, `unidad`, y para insumos de catálogo también `clave` y `categoria`.

El envoltorio del bus gana `event_id` y `event_version` opcionales; `publish` asigna un `event_id` si falta.

### 2. Snapshot autosuficiente, tomado de datos persistidos en Compras

**Invariante:** todo ítem inventariable (con `insumo_id`) produce un evento con `clave`, `descripcion`, `unidad` y `categoria`. Un evento incompleto no se publica como procesable.

- **Fuente única:** el renglón de la OC (`ordenes_compra_items`). Se añaden columnas opcionales `clave_snapshot`, `descripcion_snapshot`, `unidad_snapshot` y `categoria_snapshot` (migración compatible: solo columnas nulas, el código anterior sigue funcionando). El evento se arma únicamente con esas columnas, dentro de la transacción de la recepción. Para texto libre, con `descripcion_libre` y `unidad_libre` de la propia OC.
- **Cuándo se guardan:** al crear la OC (`convertir-oc`), que ya consulta a Gerencia Técnica, con el token del usuario. Si el catálogo no responde en ese momento, la OC se crea igual, con snapshot nulo.
- **OC sin snapshot** (creadas antes de esta migración o con el catálogo caído): en la primera recepción se completa dentro de la petición, con el token del usuario y **antes de abrir la transacción**; el resultado se persiste en la OC. Si no se puede obtener, la recepción se **rechaza antes de escribir nada** con `503 SNAPSHOT_INSUMO_NO_DISPONIBLE` y la causa indicada; es reintentable y no deja recepción, evento ni cambios en la OC.
- **Nunca durante el despacho:** el despachador no llama a Gerencia Técnica ni resuelve nada. Publica el payload ya persistido.
- **Ningún evento incompleto:** (1) el alta del outbox lanza `SnapshotIncompletoError` si el payload no es completo, lo que revierte la recepción; (2) el despachador valida el payload y, si estuviera incompleto por un defecto, **no lo envía al broker**: la fila pasa a `ERROR` con la causa `PAYLOAD_INCOMPLETO` y no se marca publicada; (3) la reemisión reconstruye el payload solo con datos persistidos, conservando el `event_id`, y responde `409 SNAPSHOT_INCOMPLETO` si aún faltan datos, sin republicar.
- **Almacén** exige el snapshot completo de todo ítem con `insumo_id`, exista o no el ítem en su inventario (`SNAPSHOT_INCOMPLETO`, no reintentable). Es una defensa: el publicador nunca emite ese caso, y un evento así no llega al bus.

### 3. Ítems sin `insumo_id`

No son inventariables. El evento los incluye para trazabilidad de la recepción y Almacén registra un evento informativo por ítem. No se crean registros artificiales ni altas automáticas, y no se considera un error ni provoca reintento.

### 4. Idempotencia

Doble clave, en el orden en que se evalúan:

1. `event_id`: tabla `eventos_procesados` con clave única `(tenant_id, event_id)`, insertada en la misma transacción que los movimientos.
2. `recepcion_id` + `recepcion_item_id`: columnas en `movimientos_almacen` e índice único parcial `(tenant_id, proyecto_id, recepcion_id, recepcion_item_id)` para `tipo = 'INGRESO'`.

La comprobación por OC e insumo desaparece. Reemitir un evento con el mismo `event_id` o reenviar la misma recepción no duplica stock; dos recepciones distintas se suman.

### 5. Procesamiento atómico

Un evento se procesa en una sola transacción: se registran el `event_id`, los movimientos y el stock de todos sus ítems, o nada. Un error revierte y se propaga al bus.

### 6. Reintentos y cola de mensajes fallidos

`SubscriptionOptions` gana `retry?: { maxAttempts, delayMs }` y `deadLetter?: boolean`. Con `retry`, un fallo republica el mensaje a `<cola>.retry` (TTL igual a `delayMs`, con dead-letter de regreso a la cola principal) y cuenta los intentos en el header `x-attempt`. Agotados, va a `<cola>.dlq` con el payload original y el motivo. Un mensaje ininterpretable va directo a la DLQ. Sin las opciones, el comportamiento actual no cambia. Solo las suscripciones nuevas de Almacén las activan.

### 7. Colas `.v2`

RabbitMQ no permite redeclarar una cola durable con argumentos distintos (`PRECONDITION_FAILED`). Se declaran colas nuevas `almacen.compras_recepcion_oc_registrada.v1.v2`, o el nombre que resulte del convenio, con sus `.retry` y `.dlq`; no se usan políticas globales ni se modifican las colas existentes. Las colas `almacen.compras_oc_recibida_*` actuales no se tocan en este change; su retiro se decide aparte con evidencia de que no reciben tráfico.

### 8. Outbox transaccional en Compras

Tabla `outbox_eventos` en la base de Compras con: `event_id`, `tenant_id`, `proyecto_id`, `event_type`, `payload` (JSON), `estado` (`PENDIENTE`, `PUBLICADO`, `ERROR`), `intentos`, `proximo_intento_en`, `ultimo_error`, `created_at` y `publicado_en`.

- **Atomicidad.** La recepción, sus ítems, el nuevo estado de la OC y la fila del outbox se escriben en la misma transacción. Si algo falla, no queda evento huérfano ni recepción sin evento.
- **Despachador.** Un proceso interno de Compras toma filas `PENDIENTE` cuyo `proximo_intento_en` ya venció, con bloqueo `FOR UPDATE SKIP LOCKED` para que varias instancias no dupliquen trabajo, valida que el payload sea completo, publica con confirmación y solo entonces marca `PUBLICADO`. Un fallo incrementa `intentos` y reprograma con espera exponencial; superado un umbral pasa a `ERROR` y queda visible.
- **Publicación confirmada.** Se añade `publishConfirmed` al bus: canal de confirmación, `mandatory`, y una promesa que se rechaza si el broker no confirma, si devuelve el mensaje por no tener cola enlazada o si vence un tiempo de espera. Solo su resolución permite marcar `PUBLICADO`.
- **Recuperación tras reinicios.** El estado vive en la base, no en memoria: al arrancar, el despachador retoma lo `PENDIENTE`. Una fila ya publicada pero no marcada se republica con el mismo `event_id`, y el consumidor la trata como reentrega (semántica al menos una vez).
- **RLS.** La tabla lleva `tenant_id` y `proyecto_id`. Como el despachador corre sin contexto de tenant, la política acepta además una variable de sesión interna reservada al despachador (`app.internal_worker = 'outbox'`), en la misma política única, para que el proceso liste filas de todos los tenants y luego publique cada una con su contexto. La política compara los GUC con `NULLIF(..., '')::uuid`: tras una transacción con `set_config(..., true)` el GUC queda vacío en esa conexión del pool y un `''::uuid` lanzaría un error antes de evaluar la rama del despachador (defecto detectado y corregido por las pruebas). Se cubre con pruebas de aislamiento entre tenants y proyectos y del camino del despachador bajo un rol sin privilegios.
- **Observabilidad.** Log de error por cada fila en `ERROR` y por cada fallo de publicación; contadores de pendientes y errores en el log periódico del despachador. Un endpoint interno de reemisión, restringido a `admin` y `procurement`, vuelve a poner en `PENDIENTE` una recepción concreta.

### 9. `/health` y `/ready`

`/health` sigue siendo prueba de vida: `200` mientras el proceso responde, sin consultar dependencias, para que Docker no reinicie el contenedor por una caída transitoria de RabbitMQ o de la base. `/ready` responde `200` solo si la base responde y el bus está conectado con sus suscripciones activas; en otro caso `503` con el detalle de la dependencia. `/ready` no se usa como healthcheck de reinicio.

### 10. Conciliación histórica

Cuantificada en `evidence-2026-09-25.md`: a lo sumo 2 recepciones, ambas purgadas. Se recomienda no conciliar y cerrar el histórico. La herramienta de reporte de solo lectura y la reemisión (idempotente) forman parte del change, pero **ninguna ejecución productiva se hace sin autorización expresa adicional**.

### 11. Orden de despliegue

Fusionar a `main` despliega y aplica migraciones, por lo que los PR de código quedan abiertos hasta autorización expresa. Orden previsto una vez autorizado: `@bocam/event-bus`; Almacén (consumidor, migración, colas `.v2`, `/ready`); Compras (outbox y contrato). Así el consumidor existe antes de que el publicador emita. El change no se considera completo hasta que se cumplan las garantías del outbox: atomicidad, reintento, marcado tras confirmación del broker y recuperación tras reinicios.

## Risks / Trade-offs

- Semántica al menos una vez: duplicados posibles, absorbidos por la doble clave de idempotencia.
- Cambiar el contrato entre dos servicios y el bus exige el orden de despliegue del punto 11.
- El despachador con una política de RLS especial es un punto sensible: se limita a esta tabla y se prueba explícitamente.
- Una DLQ sin vigilancia solo cambia dónde se pierde la información: se define su monitoreo y el procedimiento de reproceso.
- `@bocam/event-bus` es compartido: los cambios son opt-in y se prueba que los consumidores existentes se comportan igual.
