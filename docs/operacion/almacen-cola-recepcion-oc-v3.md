# Cola `.v3` de recepciones de OC en Almacén

Change: `fix-ingresos-almacen-por-recepcion-oc`. Aplica a la suscripción de Almacén a `compras.recepcion_oc_registrada.v1`.

## Por qué existe la `.v3`

El EventBus declara toda cola principal con `x-message-ttl: 86400000` (24 h) y sin dead-letter. La `.v2` heredó ese TTL. Como el outbox de Compras marca un evento `PUBLICADO` cuando **el broker confirma**, un mensaje que quedara sin consumir más de 24 h (Almacén detenido) desaparecía sin pasar por la DLQ: la recepción se perdía definitivamente aunque Compras la diera por publicada.

Los argumentos de una cola existente son inmutables en RabbitMQ, así que la corrección es una cola nueva.

| Cola | Estado | Argumentos |
|---|---|---|
| `almacen.compras_recepcion_oc_registrada_v1.v2` (+ `.retry`, `.dlq`) | Obsoleta. Ya no se consume. **No se borra**: se conserva para rollback | `x-message-ttl: 86400000`, sin dead-letter |
| `almacen.compras_recepcion_oc_registrada_v1.v3` | Vigente | **sin `x-message-ttl`**; `x-dead-letter-exchange: ''`, `x-dead-letter-routing-key: <cola>.dlq` |
| `….v3.retry` | Vigente | `x-message-ttl` = espera entre intentos (30 s por defecto); dead-letter de vuelta a `.v3` |
| `….v3.dlq` | Vigente. Durable, sin TTL | sin argumentos |

Reglas de la `.v3`:

- Un mensaje **no expira** mientras Almacén esté detenido: permanece en la cola hasta que se consuma.
- Si por cualquier motivo un mensaje deja de poder permanecer en la cola principal (rechazo sin reencolar, expiración por una política futura), va a la `.dlq` por dead-letter de la propia cola. Nunca desaparece.
- Un fallo reintentable pasa por `.retry` y vuelve a `.v3`; agotados los intentos (`ALMACEN_RECEPCION_MAX_INTENTOS`, 5 por defecto) o ante un rechazo definitivo (`NonRetryableError`) va a la `.dlq` con `x-failure-reason` y `x-attempt`.
- El procesamiento es idempotente (`event_id` y `recepcion_id + recepcion_item_id`): un reproceso o una entrega duplicada no duplica el INGRESO.

La definición vive en `apps/almacen/src/recepcion-oc-cola.ts`. La prueba `almacen-recepcion-oc-retencion.integration.test.ts` la comprueba contra un RabbitMQ real.

## Orden de despliegue

Compras **no** debe publicar mientras exista más de una cola de Almacén enlazada a `compras.recepcion_oc_registrada.v1`. Orden:

1. Desplegar el Almacén de este PR. Declara la `.v3` y deja de consumir la `.v2`. Mientras Compras no publique este evento no hay tráfico en ninguna de las dos.
2. Verificar `.v3` operativa (siguiente sección).
3. Verificar que `.v2` está vacía.
4. Desvincular `.v2` del exchange (solo el binding).
5. Verificar que el único binding del evento hacia colas de Almacén es el de `.v3`.
6. Solo entonces se puede desplegar el publicador (Compras con el outbox).

## Verificación de la `.v3`

Solo lectura. En el VPS:

```bash
# Script de operación (comprueba existencia, consumidor activo, .retry, .dlq y argumentos):
docker exec -i bocam-vps-almacen node - verificar < scripts/ops/almacen-recepcion-oc/topologia.js

# Colas, mensajes, consumidores y argumentos:
docker exec bocam-vps-rabbitmq rabbitmqctl -q list_queues name messages consumers arguments | grep recepcion_oc

# Bindings del evento (los bindings no se pueden listar por AMQP):
docker exec bocam-vps-rabbitmq rabbitmqctl -q list_bindings source_name destination_name destination_kind routing_key \
  | grep compras.recepcion_oc_registrada.v1
```

Esperado:

- `.v3`: 1 consumidor y **sin** `x-message-ttl` (los argumentos solo muestran el dead-letter).
- `.v3.retry`: `x-message-ttl` de la espera configurada, dead-letter de vuelta a `.v3`.
- `.v3.dlq`: sin argumentos.
- Existe un binding `bocam.events → …v3` con `compras.recepcion_oc_registrada.v1`.
- Las colas antiguas (`.v2` incluida) conservan mensajes, consumidores (salvo la `.v2`, que pasa a 0) y argumentos.

## Desvincular la `.v2`

Solo quita el binding de la `.v2` al exchange. **No borra colas ni mensajes.** El script se niega a actuar si la `.v3` no está operativa o si la `.v2` tiene mensajes, y sin `--ejecutar` solo simula.

```bash
# 1. Simulación (no modifica nada):
docker exec -i bocam-vps-almacen node - desvincular < scripts/ops/almacen-recepcion-oc/topologia.js
# 2. Ejecución (requiere autorización expresa):
docker exec -i bocam-vps-almacen node - desvincular --ejecutar < scripts/ops/almacen-recepcion-oc/topologia.js
# 3. Comprobar que solo queda el binding de la .v3:
docker exec bocam-vps-rabbitmq rabbitmqctl -q list_bindings source_name destination_name routing_key \
  | grep compras.recepcion_oc_registrada.v1
```

Si la `.v2` tuviera mensajes: **no** desvincular. Investigar de dónde salieron y procesarlos o moverlos con una autorización específica; no se descartan.

## Rollback a `.v2`

Solo si la `.v3` presentara un defecto que no pueda corregirse hacia adelante. Nada se borra y no hay migraciones de base de datos involucradas.

1. Desactivar el publicador (Compras sin el despachador del outbox, o sin desplegar #169) para que no lleguen eventos nuevos.
2. Revisar los mensajes de `.v3`, `.v3.retry` y `.v3.dlq`. Los pendientes se conservan: no se purgan ni se descartan.
3. Volver a desplegar el commit anterior de Almacén, que declara y consume la `.v2`. La `.v2` conserva sus argumentos originales y se vuelve a enlazar sola al arrancar (`bindQueue` es idempotente).
4. El binding de la `.v3` sigue vigente aunque nadie la consuma: **quitarlo** (solo el binding, con una autorización específica y la misma llamada `unbindQueue` que usa el script para la `.v2`) antes de reactivar el publicador. Con ambas enlazadas, cada evento llegaría a las dos colas y la que no tiene consumidor acumularía una copia.
5. Los mensajes que hubieran quedado en `.v3` se trasladan a la `.v2` (o se reprocesan) con una autorización específica. Como el procesamiento es idempotente, reprocesar no duplica INGRESOS.
6. Tener presente que la `.v2` vuelve a tener TTL de 24 h: el rollback debe ser breve y con el publicador detenido.

Después de un rollback, la `.v3` y su DLQ permanecen; no se eliminan hasta que se autorice expresamente.

## DLQ

Ver `docs/operacion/event-bus-dlq-reproceso.md` para inspeccionar y reprocesar la `.dlq`. Cada mensaje conserva el payload original, `x-failure-reason`, `x-attempt`, `x-original-queue` y `x-dead-lettered-at`; los que llegan por dead-letter de la cola principal traen además `x-death`.
