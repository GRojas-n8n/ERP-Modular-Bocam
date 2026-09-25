## Context

Situación observada el 2026-09-25 por lectura de código; falta confirmarla con los logs de producción (tarea 1.1).

- **Publicador.** `POST /api/v1/compras/ordenes-compra/:id/recepciones` (`apps/compras/src/main.ts`) registra la recepción y, solo si el estado calculado es `RECIBIDA`, publica `compras.oc_recibida_total` con `{ id_orden, codigo, proveedor_id, total, proyecto_id }`. La publicación es best-effort: si el bus está caído se descarta sin registro. Una recepción parcial no publica nada.
- **Consumidor.** `handleOcRecibida` (`apps/almacen/src/main.ts`) exige `orden_compra_id` e `items[]` con `insumo_id`, `clave`, `descripcion`, `unidad`, `categoria` y `cantidad_recibida` (o `cantidad_recibida_parcial`). Sin ellos registra `skip_no_items` y retorna. Su prueba de integración usa ese payload ideal, que ningún publicador emite.
- **Errores.** El handler captura la excepción de cada ítem y sigue; nunca propaga. Aunque propagara, `EventBus.bindAndConsume` responde `nack(msg, false, false)` y la cola solo declara `x-message-ttl` de 24 h, sin exchange de mensajes muertos: el mensaje se descarta.
- **Idempotencia.** Clave actual: `referencia = orden_compra_id`, `tipo = INGRESO` e insumo. Dos recepciones parciales del mismo insumo en la misma OC colisionan y la segunda se ignora.
- **Datos disponibles en Compras.** `OrdenCompraItem` guarda `insumo_id` (nulo en ítems de texto libre) y solo `descripcion_libre`/`unidad_libre` para esos; la clave, descripción, unidad y categoría de un insumo de catálogo viven en Gerencia Técnica.
- **Health.** `GET /health` responde siempre `200`. Docker lo usa como healthcheck.

## Goals / Non-Goals

**Goals**

- Que toda recepción de OC produzca, una sola vez, los INGRESOS correspondientes en Almacén.
- Que ningún fallo de procesamiento se confirme en silencio: debe reintentarse y, agotados los intentos, quedar en una cola inspeccionable con su payload.
- Que la idempotencia distinga recepciones distintas de la misma OC.
- Separar prueba de vida de disponibilidad de dependencias.

**Non-Goals**

- Cambiar el comportamiento de los demás consumidores del bus (registrado como hallazgo separado).
- Rediseñar el inventario o los movimientos manuales.
- Corregir por código, sin autorización expresa, datos históricos de producción.

## Decisions

### 1. Un contrato de evento por recepción

Compras publica `compras.oc_recibida_parcial` o `compras.oc_recibida_total` en cada recepción, según el estado resultante de la OC. Ambos llevan el mismo payload: `recepcion_id`, `orden_compra_id`, `codigo`, `proveedor_id` e `items[]` con **solo lo recibido en esa recepción** (no acumulado): `orden_item_id`, `insumo_id` y `cantidad_recibida`. Se conserva `id_orden` durante la transición para no romper a otros lectores. Ambos eventos usan `cantidad_recibida`; el campo `cantidad_recibida_parcial` desaparece.

### 2. Ítems sin insumo de catálogo

Los ítems con `insumo_id` nulo (texto libre o imprevisto) no tienen `ItemInventario` asociado. Propuesta: el evento los incluye con `insumo_id: null` y Almacén los registra como no inventariables (log informativo, sin error ni reintento). Pregunta abierta 1.

### 3. Datos descriptivos del ítem

Almacén crea un `ItemInventario` nuevo con `clave`, `descripcion`, `unidad` y `categoria`. Opciones: (A) Compras resuelve el snapshot desde el catálogo de Gerencia Técnica al publicar; (B) Almacén lo consulta a Gerencia Técnica al procesar. Recomendada A, para que el evento sea autosuficiente y Almacén no dependa de Gerencia Técnica en línea; si Compras no logra resolverlo, el evento no se publica y queda registrado como error. Pregunta abierta 2.

### 4. Idempotencia por recepción e ítem

Se agregan a `movimientos_almacen` las columnas `recepcion_id` y (ya existente) `oc_item_id`, con índice único parcial `(tenant_id, proyecto_id, recepcion_id, oc_item_id)` para `tipo = 'INGRESO'` y `recepcion_id` no nulo. Un redelivery del mismo evento choca con el índice y se trata como ya aplicado. La comprobación por OC e insumo se elimina.

### 5. Procesamiento atómico

Cada evento se procesa en una sola transacción: o se aplican todos sus ítems o ninguno. Un error revierte la transacción y se propaga al bus. Ya no se captura ítem por ítem.

### 6. Reintentos y cola de mensajes fallidos en el bus

`SubscriptionOptions` gana `retry?: { maxAttempts, delayMs }` y `deadLetter?: boolean`, ambos opcionales. Con `retry`, un fallo republica el mensaje a una cola de espera con TTL que vuelve a la cola principal, con el contador de intentos en un header; al agotar los intentos pasa a `<cola>.dlq` con el motivo y el payload original. Un mensaje que no se puede interpretar (JSON o contexto inválidos) va directo a la DLQ sin reintentos. Sin las opciones, `nack` sin reencolar sigue igual.

**Restricción de RabbitMQ:** una cola durable existente no admite redeclararse con argumentos distintos (`PRECONDITION_FAILED`). Por eso Almacén usa nombres de cola nuevos (sufijo `.v2`); las colas anteriores se vacían y se retiran tras el despliegue. Pregunta abierta 3.

### 7. `/health` y `/ready`

`/health` sigue siendo prueba de vida: `200` mientras el proceso responde, sin consultar dependencias, para que Docker no reinicie el contenedor por una caída transitoria de RabbitMQ o de la base. `/ready` responde `200` solo si la base responde y el bus está conectado con las suscripciones activas; en otro caso `503` con el detalle de la dependencia. `/ready` no se usa como healthcheck de reinicio.

### 8. Publicación fiable desde Compras

Hoy la publicación es best-effort y silenciosa. Fase 1: la falla se registra a nivel de error con `recepcion_id` y el evento se puede reemitir con un endpoint interno restringido. Fase 2 (fuera de este change): outbox transaccional. Pregunta abierta 4.

### 9. Conciliación de datos históricos

Antes de decidir nada se cuantifican, en modo solo lectura, las recepciones sin ingreso correspondiente. Cualquier corrección de datos de producción se presenta con su alcance exacto (recepciones, ítems, cantidades), se ensaya en una copia y requiere autorización expresa del titular.

### 10. Orden de despliegue

1) Almacén (consumidor con contrato nuevo, `/ready`, colas `.v2`); acepta el contrato nuevo y sigue ignorando el antiguo. 2) Compras (publicador). 3) Retiro de las colas antiguas. Se verifica con una recepción de prueba identificable y reversible solo en un entorno no productivo; en producción, con la lectura de logs.

## Preguntas abiertas

1. ¿Cómo deben tratarse los ítems sin `insumo_id`: no inventariables o con alta manual?
2. ¿Quién resuelve el snapshot de insumo: Compras (A) o Almacén (B)?
3. ¿Se acepta renombrar las colas de Almacén (`.v2`) o se prefiere una política de RabbitMQ?
4. ¿Se difiere el outbox transaccional a un change posterior?
5. ¿Cuántas recepciones históricas quedaron sin ingreso y cuáles se concilian?

## Risks / Trade-offs

- Cambiar el contrato entre dos servicios exige orden de despliegue; el consumidor debe tolerar ambos formatos durante la transición.
- Los reintentos pueden duplicar trabajo si la transacción no es idempotente; la clave única del punto 4 lo evita.
- Una DLQ sin vigilancia solo cambia dónde se pierde la información: se define su monitoreo y el procedimiento de reproceso en las tareas.
- El `EventBus` es compartido: el cambio es opt-in y se prueba que los consumidores existentes se comportan igual.
