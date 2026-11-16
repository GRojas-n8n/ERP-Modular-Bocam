# Observación de la primera recepción real (outbox Compras → Almacén)

Procedimiento **solo de lectura** para comprobar el circuito completo la primera vez que un usuario registre una recepción de OC real, con `COMPRAS_OUTBOX_DISPATCHER=on` y la cola `.v3` de Almacén.

- No crear proyectos, órdenes ni recepciones de prueba para este fin: se espera a una recepción real.
- No publicar, reemitir ni borrar nada durante la observación. Ante cualquier desviación, detenerse y recoger evidencia.
- Consultas de base con `bocam_admin` (`docker exec -i bocam-vps-postgres psql -U bocam_admin -d <base> -X`), porque `bocam_app` está sujeto a RLS. Bases: `bocam_compras` y la de Almacén (confirmar el nombre con `\l`).
- No pegar en informes payloads, descripciones ni datos de clientes: registrar identificadores, estados y conteos.

## 0. Antes de la recepción (línea base)

1. `bocam-vps-compras` y `bocam-vps-almacen` `healthy`; `GET /ready` de Compras (`:3002`) con `outbox_dispatcher: ok`.
2. `select count(*) from outbox_eventos;` (esperado 0 la primera vez).
3. `rabbitmqctl list_queues name messages consumers`: `.v3` con 1 consumidor y 0 mensajes; `.v3.retry` y `.v3.dlq` en 0.
4. `rabbitmqctl list_bindings source_name destination_name routing_key`: `.v3` es el único binding de `compras.recepcion_oc_registrada.v1`.

## 1. Fila de outbox creada (Compras)

Identificar la recepción (`recepciones_oc.id_recepcion`) y su OC, y comprobar:

```sql
select id_evento, recepcion_id, orden_id, estado, intentos, ultimo_error, created_at, publicado_en
from outbox_eventos where recepcion_id = '<id_recepcion>';
```

Esperado: **exactamente una** fila (índice único `uq_outbox_recepcion`) con `event_type = 'compras.recepcion_oc_registrada.v1'` y `event_version = 1`.

## 2. Transición a enviado

Repetir la consulta a los pocos segundos (el despachador corre cada ~5 s). Esperado: `estado = 'PUBLICADO'`, `publicado_en` no nulo, `intentos` bajo y `ultimo_error` nulo. Alerta si queda en `PENDIENTE` más de un minuto o pasa a `ERROR`. `/ready` debe seguir con `outbox_dispatcher: ok`.

## 3. Un solo evento en `.v3`

- `.v3` vuelve a 0 mensajes con 1 consumidor.
- Los logs de Almacén muestran `almacen.event.recepcion_oc.applied` una vez por ítem inventariable (`…item_no_inventariable` para los ítems sin insumo) y **ninguna** línea `…idempotent` ni `…item_idempotent` (serían una segunda entrega).
- En Almacén: `select count(*) from eventos_procesados where event_id = '<id_evento>';` = 1.

## 4. Un solo INGRESO en Almacén por ítem, con `recepcion_id`

```sql
select recepcion_item_id, tipo, cantidad, unidad, item_id
from movimientos_almacen where recepcion_id = '<id_recepcion>' order by recepcion_item_id;
```

Esperado: `tipo = 'INGRESO'`, un movimiento por ítem inventariable y sin `recepcion_item_id` repetido (restricción `uq_mov_recepcion_item`):

```sql
select recepcion_item_id, count(*) from movimientos_almacen
where recepcion_id = '<id_recepcion>' group by 1 having count(*) > 1;   -- 0 filas
```

## 5. Sin duplicados ni pérdidas silenciosas

- Cuenta de INGRESOS igual al número de ítems inventariables de la recepción.
- Ninguna otra fila en `outbox_eventos` para la misma recepción.
- `.v3.retry` y `.v3.dlq` en 0 mensajes; `.v2`, `.v2.retry` y `.v2.dlq` en 0 y sin binding.
- Logs de Compras, Almacén y RabbitMQ sin errores ni reintentos nuevos.

## 6. Ítems y cantidades coinciden

Comparar por `recepcion_item_id` (identificador de renglón de `recepcion_oc_items` frente a `movimientos_almacen.recepcion_item_id`; confirmar el nombre exacto de la columna con `\d recepcion_oc_items`):

```sql
-- Compras
select * from recepcion_oc_items where recepcion_id = '<id_recepcion>';   -- orden_item_id, cantidad_recibida
-- Almacén
select recepcion_item_id, cantidad from movimientos_almacen where recepcion_id = '<id_recepcion>' order by 1;
```

Esperado: mismos identificadores y cantidades. Los ítems sin `insumo_id` no generan ingreso (no inventariables): anotarlos como excepción esperada, no como diferencia.

## Resultado

Registrar en `openspec/changes/fix-ingresos-almacen-por-recepcion-oc/` (archivo de evidencia con fecha) los identificadores, estados, conteos y horas, sin datos sensibles. Con esa evidencia se puede cerrar la tarea 7.1. Si algo falla: **no** reemitir, restaurar ni revertir sin nueva autorización (rollback del despachador en `compras-outbox-despachador.md`).
