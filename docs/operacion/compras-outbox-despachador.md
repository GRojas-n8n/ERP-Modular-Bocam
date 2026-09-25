# Despachador del outbox de Compras: activación y rollback

Change: `fix-ingresos-almacen-por-recepcion-oc`. Aplica al evento `compras.recepcion_oc_registrada.v1`.

## Qué hace cada pieza

- **Outbox (`outbox_eventos`).** Cada recepción de OC guarda su evento en la **misma transacción** de la recepción. Esto ocurre siempre, con el despachador encendido o apagado.
- **Despachador.** Es quien lee las filas `PENDIENTE`, publica en RabbitMQ con confirmación del broker y **solo entonces** las marca `PUBLICADO`. Con el despachador apagado no se publica ni se marca nada: los eventos esperan en el outbox.

## Estado por defecto: apagado

`COMPRAS_OUTBOX_DISPATCHER` controla el arranque del despachador. **Solo el valor exacto `on` lo enciende.**

| Valor | Resultado |
|---|---|
| ausente | apagado |
| vacío o solo espacios | apagado |
| `off` | apagado |
| cualquier otro (`ON`, `true`, `1`, `yes`, `on ` con espacio…) | apagado, con un aviso (`warn`) en el arranque |
| `on` | encendido |

Un valor mal escrito nunca enciende el despachador: la ambigüedad se resuelve siempre hacia apagado.

Al arrancar, Compras registra una línea JSON con `"message":"dispatcher disabled"` (acción `compras.outbox.dispatcher_disabled`, con el motivo) o `"message":"dispatcher enabled"` (acción `compras.outbox.dispatcher_enabled`).

### `/ready`

`GET /ready` (sin autenticación, igual que `/health`; no se usa como healthcheck de reinicio) distingue los estados del despachador:

| `checks.outbox_dispatcher` | Significado | ¿Servicio listo? |
|---|---|---|
| `disabled` | Apagado a propósito (`COMPRAS_OUTBOX_DISPATCHER` no es `on`). **No es un fallo.** El motivo está en `outbox_dispatcher.motivo` | sí (200) |
| `starting` | Encendido, aún sin terminar su primera tanda | sí (200) |
| `ok` | Encendido y su última tanda salió bien | sí (200) |
| `error` | Encendido y su última tanda falló (`outbox_dispatcher.ultimo_error`) | no (503) |

`database` y `event_bus` se evalúan aparte, como en Almacén. `/health` sigue siendo solo liveness.

## Cómo llega la variable al contenedor

El compose del VPS declara `COMPRAS_OUTBOX_DISPATCHER: ${COMPRAS_OUTBOX_DISPATCHER:-off}` para Compras, de modo que el valor sale de `.env.vps` y, si no está, es `off`. Sin esa línea la variable no llegaría al contenedor. Se despliega en un cambio separado, antes que el publicador.

## Requisitos previos para activar

No activar hasta que se cumpla **todo** esto:

1. Cola `.v3` de Almacén operativa (ver `docs/operacion/almacen-cola-recepcion-oc-v3.md`): consumidor activo, `.retry` y `.dlq`, sin TTL.
2. Cola `.v2` vacía y **desvinculada** del exchange: el único binding de `compras.recepcion_oc_registrada.v1` hacia Almacén es el de `.v3`.
3. Compras con el outbox desplegado, `outbox_eventos` con RLS habilitado y forzado, y el workflow de RLS (`service=compras`) verificado.
4. `/ready` de Almacén y de Compras en 200 (Compras con `outbox_dispatcher: disabled`).
5. La DLQ `.v3.dlq` vacía y las colas antiguas sin cambios.
6. Revisadas las filas pendientes del outbox (cuántas y de qué recepciones). Todas se publicarán al encender.

## Activación (requiere autorización expresa)

En el VPS, en `/root/ERP-Modular-Bocam`:

```bash
# 1. Editar .env.vps y dejar COMPRAS_OUTBOX_DISPATCHER=on
# 2. Recrear solo Compras (sin reconstruir ninguna imagen):
docker compose -f docker-compose.vps.yml --env-file .env.vps up -d --no-deps compras
```

Verificar:

- El log de arranque de Compras tiene `dispatcher enabled` y **no** `dispatcher disabled`.
- `GET /ready` de Compras: 200 con `checks.outbox_dispatcher` en `starting` y luego `ok`.
- Las filas pasan de `PENDIENTE` a `PUBLICADO`; ninguna queda en `ERROR`.
- Almacén registra `almacen.event.recepcion_oc.applied` por cada ítem, `.v3` vuelve a 0 mensajes y `.v3.dlq` sigue en 0.
- Contenedores sanos, sin reinicios, sin errores en los logs de Compras, Almacén y RabbitMQ.

## Rollback

Apagar el despachador no requiere reconstruir ni desplegar código:

```bash
# 1. En .env.vps poner COMPRAS_OUTBOX_DISPATCHER=off (o quitar la línea)
# 2. Recrear solo Compras:
docker compose -f docker-compose.vps.yml --env-file .env.vps up -d --no-deps compras
```

- Los eventos que ya estaban `PUBLICADO` no se revierten. Almacén los aplicó de forma idempotente (`event_id` y `recepcion_id` + `recepcion_item_id`), así que una reemisión posterior no duplica INGRESOS.
- Los eventos `PENDIENTE` permanecen en el outbox y se publicarán cuando se vuelva a encender. Nada se pierde.
- No se borran colas, mensajes ni filas del outbox. Un evento en `ERROR` se reemite con el endpoint de reemisión, no a mano.
- Si el problema está en la cola de Almacén, ver el rollback de `.v3` en `docs/operacion/almacen-cola-recepcion-oc-v3.md`.
