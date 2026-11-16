# Dry-run histórico sobre el respaldo (solo lectura, sin ejecutar)

Autorizado por el titular el 2026-09-25 **exclusivamente** sobre una restauración del respaldo `pre-purga-20260924-195212`, en un contenedor sin red y con consultas `SELECT`. No autoriza conciliación, inserciones, publicaciones, reinicios ni cambios en producción.

## Estado

**Ejecutado el 2026-09-25**, solo lectura. La copia externa del respaldo estaba en la máquina de trabajo; no se copió nada desde la VPS.

## Qué se restaura

Solo dos de los doce volcados, en formato custom: el de Compras (`bocam_compras`) y el de Almacén (`bocam_almacen`). El resto no se toca.

## Procedimiento

1. Comprobar la integridad: `sha256sum` frente al manifiesto SHA-256 del respaldo y `pg_restore --list` de cada volcado.
2. Contenedor desechable sin red, imagen local `postgres:15-alpine`:
   `docker run -d --rm --name dryrun-recepciones --network none -e POSTGRES_PASSWORD=<efímera> postgres:15-alpine`
3. Crear las dos bases y restaurar por entrada estándar, sin red: `docker exec -i dryrun-recepciones pg_restore -U postgres -d <base> --no-owner < <volcado>`.
4. Todas las consultas con la sesión en solo lectura: `PGOPTIONS="-c default_transaction_read_only=on"`.
5. Destruir el contenedor al terminar (`docker stop dryrun-recepciones`); no se conservan datos restaurados.

## Consultas (solo `SELECT`)

Compras (`bocam_compras`):

```sql
-- 1. Recepciones y su OC
SELECT r.id_recepcion, r.orden_id, r.fecha_recepcion, o.estado AS estado_oc,
       (SELECT count(*) FROM recepcion_oc_items ri WHERE ri.recepcion_id = r.id_recepcion) AS renglones
FROM recepciones_oc r JOIN ordenes_compra o ON o.id_orden = r.orden_id
ORDER BY r.fecha_recepcion;

-- 2. Renglones recibidos: con o sin insumo de catálogo
SELECT ri.id_recepcion_item, ri.recepcion_id, ri.cantidad_recibida,
       (oi.insumo_id IS NOT NULL) AS es_catalogo
FROM recepcion_oc_items ri JOIN ordenes_compra_items oi ON oi.id_item = ri.orden_item_id;

-- 3. OC cerradas (RECIBIDA) que sí publicaron el evento antiguo
SELECT o.id_orden, o.estado FROM ordenes_compra o WHERE o.estado IN ('RECIBIDA','PARCIALMENTE_RECIBIDA');
```

Almacén (`bocam_almacen`):

```sql
-- 4. ¿Hubo algún INGRESO por OC?
SELECT tipo, origen, count(*), min(fecha), max(fecha) FROM movimientos_almacen GROUP BY 1, 2;

-- 5. INGRESOS cuya referencia coincide con las OC del paso 3 (lista pegada como literal)
SELECT referencia, count(*) FROM movimientos_almacen
WHERE tipo = 'INGRESO' AND referencia IN ('<id_orden_1>', '<id_orden_2>') GROUP BY 1;
```

La comparación entre bases se hace fuera de SQL (no hay JOIN entre servicios): los identificadores del paso 3 se llevan como literales al paso 5.

## Resultado esperado y clasificación

Se espera, según las estadísticas de PostgreSQL: como máximo 2 recepciones con 3 renglones y ningún movimiento en Almacén. Cada recepción se clasifica como:

- **Proyecto de prueba:** sin acción; los datos ya se eliminaron por decisión del titular.
- **Dato real:** se presenta al titular el alcance exacto (recepciones, renglones y cantidades) y no se modifica nada sin una autorización expresa adicional.

## Entrega

Informe con: integridad verificada, cantidades por consulta, recepciones sin ingreso correspondiente, filas sin correlación suficiente y las limitaciones (el respaldo no incluye Redis ni mensajes en RabbitMQ).

## Resultado (2026-09-25)

Ejecución conforme al procedimiento: SHA-256 de ambos volcados coincidente con el manifiesto; contenedor `postgres:15-alpine` con red `none`; solo se restauraron `bocam_compras` y `bocam_almacen`; sesión con `default_transaction_read_only = on`; contenedor y datos destruidos al terminar.

| Consulta | Resultado |
|---|---|
| Recepciones de OC en el respaldo | **0** (0 renglones de recepción) |
| OC en el respaldo | 2: una `EMITIDA` con 1 renglón de texto libre y una `ERROR_FINANZAS` con 1 renglón de catálogo |
| Movimientos de Almacén | **0**; inventario 0; activos 0 |
| INGRESOS cuya referencia coincide con las OC del respaldo | 0 |
| Estadísticas `n_tup_ins`/`n_tup_del` de recepciones en el respaldo | 0 / 0 (las estadísticas no se incluyen en el volcado) |

### Interpretación

- El respaldo previo a la purga **no contiene ninguna recepción**: las 2 recepciones (3 renglones) que las estadísticas de producción registran desde el 2026-07-21 ya habían sido eliminadas antes del 2026-09-24. No se pueden identificar con esta fuente.
- No hay recepciones sin ingreso correspondiente, ni filas sin correlación que examinar: no existen ni recepciones ni movimientos.
- **Clasificación:** ninguna recepción de dato real identificable; nada que conciliar. Se confirma la recomendación de **no ejecutar conciliación histórica**.

### Limitaciones

- Las 2 recepciones eliminadas antes del respaldo no son recuperables con esta fuente; solo se sabe que existieron por las estadísticas.
- El respaldo no incluye Redis ni mensajes de RabbitMQ.
