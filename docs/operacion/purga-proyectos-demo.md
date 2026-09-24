# Purga de proyectos de ejemplo/práctica en producción

> **Irreversible sin respaldo.** Esta herramienta elimina proyectos (Centros de Costos) **y todos sus datos** en los 10 esquemas de servicio. Léelo completo antes de ejecutar nada.
> Spec: `openspec/changes/purga-proyectos-demo-produccion/`. Herramienta: `scripts/ops/purga-proyecto/`.

## Qué hace y qué NO hace

**Hace:** por cada proyecto indicado, borra sus filas en todas las tablas con `proyecto_id` (70 tablas en 10 esquemas), las filas hijas que las referencian (calcula el orden con las claves foráneas reales), y el registro en `auth.proyectos`. Todo en **una sola transacción**: si algo falla o la verificación no cuadra, no se borra nada.

**Verifica antes de confirmar:** cero filas restantes de los proyectos; los conteos por tabla de **todos los demás proyectos y de todos los demás tenants son idénticos** a los de antes. Si cualquier cosa cambia, revierte.

**No hace:** no borra archivos de los volúmenes (genera un manifiesto), no elimina usuarios ni clientes, no limpia Redis ni RabbitMQ, no borra bitácoras/auditoría append-only.

## Prerrequisitos

- Acceso SSH a la VPS y al directorio del proyecto (donde está `.env.vps`).
- La herramienta y este runbook en la VPS (`git pull` del repo).
- La **lista exacta** de proyectos a eliminar, con su **código de Centro de Costos** copiado tal cual del sistema.

> ⚠️ Copia los códigos **exactamente** (mayúsculas, guiones, ceros). Un código mal copiado aborta la purga con `PURGA_CODIGO_INEXISTENTE`, que es lo deseado: nunca borra "algo parecido". Ejemplo de confusión típica: `HCO…` (letra O) contra `HC0…` (cero).

Variables usadas abajo (ajusta):

```sh
cd /ruta/al/repo                     # donde está .env.vps
set -a; . ./.env.vps; set +a         # carga DB_USER y DB_NAME
PG=bocam-vps-postgres
```

## Paso 1 — Identificar el tenant y confirmar los códigos

```sh
docker exec -i $PG psql -U "$DB_USER" -d "$DB_NAME" -c \
 "select tenant_id, codigo_centro_costos, estatus, left(nombre_oficial,60) as nombre
    from auth.proyectos order by tenant_id, codigo_centro_costos;"
```

Anota el `tenant_id` y los códigos a eliminar. **Compara la lista contra tu lista de proyectos de práctica; si un proyecto no está en tu lista, no se toca.**

## Paso 2 — Respaldo completo, verificado y fuera de la VPS

```sh
mkdir -p ~/respaldos && chmod 700 ~/respaldos
R=~/respaldos/pre-purga-$(date -u +%Y%m%d-%H%M).dump

docker exec $PG pg_dump -Fc -U "$DB_USER" -d "$DB_NAME" > "$R"
docker exec -i $PG pg_restore --list < "$R" > /dev/null && echo "respaldo legible: OK"
sha256sum "$R"; ls -lh "$R"

# Roles y atributos (BYPASSRLS, etc.): imprescindibles para restaurar bien las políticas RLS
docker exec $PG pg_dumpall --globals-only -U "$DB_USER" > "${R%.dump}-globals.sql"
```

Copia **ambos archivos fuera de la VPS** (`scp` a tu equipo) antes de continuar. Un respaldo que solo existe en el mismo disco no protege de una falla de disco.

> Si ya existe el respaldo automático de `backups-postgres-verificados`, puedes usar su último dump **si tiene menos de 24 h y pasa `pg_restore --list`**. La herramienta lo exige de todas formas.

## Paso 3 — DRY-RUN en producción (no modifica nada)

```sh
sh scripts/ops/purga-proyecto/purga-proyecto.sh \
   --tenant <TENANT_ID> \
   --codigos COD1,COD2,COD3
```

Revisa la salida con calma:

- **Proyectos objetivo:** ¿son exactamente los de práctica? Fíjate en el **estatus** (`EN EJECUCIÓN` no es lo mismo que un ejemplo olvidado).
- **Detalle por tabla:** busca tablas que delaten **datos reales**: `finanzas.*` (pagos, anticipos), `contabilidad.*` (pólizas, CFDI), `personal.pre_nominas` / `personal.pre_nomina_detalles` (nómina), `compras.ordenes_compra`. Si hay cifras ahí y no esperabas datos reales, **detente** y confirma antes de seguir.
- **Archivos huérfanos:** cuántos y de qué módulos (se listan en el manifiesto).

Si algo no cuadra: no hay nada que deshacer, no se modificó nada.

## Paso 4 — Ensayo obligatorio sobre una copia aislada

Restaura el respaldo en un contenedor **sin red** y ejecuta allí la purga **real**. Solo si sale bien continúas.

```sh
# 4.1 Contenedor desechable, sin red, sin volúmenes de producción
docker run -d --rm --name purga-ensayo --network none \
  -e POSTGRES_PASSWORD=ensayo postgres:15-alpine

until docker exec purga-ensayo pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

# 4.2 Roles (globals) y base
docker exec -i purga-ensayo psql -U postgres -v ON_ERROR_STOP=0 -q < "${R%.dump}-globals.sql" > /dev/null
docker exec purga-ensayo createdb -U postgres "$DB_NAME"

# 4.3 Restaurar
docker exec -i purga-ensayo pg_restore -U postgres -d "$DB_NAME" --no-owner < "$R"

# 4.4 Purga REAL contra la copia (mismo respaldo como puerta)
PSQL_CMD="docker exec -i purga-ensayo psql -U postgres -d $DB_NAME" \
PGRESTORE_LIST_CMD="docker exec -i purga-ensayo pg_restore --list" \
PURGA_BITACORA_DIR=/tmp/purga-ensayo \
sh scripts/ops/purga-proyecto/purga-proyecto.sh \
   --tenant <TENANT_ID> --codigos COD1,COD2,COD3 \
   --confirmar COD1,COD2,COD3 --respaldo "$R" --ejecutar
```

Comprueba en la copia que el resumen coincide con el dry-run del paso 3 y que el mensaje final es `Purga COMPLETADA`. Si la aplicación se puede apuntar a la copia, ábrela y confirma que carga sin errores. Luego destruye el ensayo:

```sh
docker stop purga-ensayo    # --rm lo elimina
```

**Criterios de parada** (no sigas a producción si ocurre cualquiera): el ensayo falla; el resumen difiere del dry-run; aparecen datos reales que no esperabas; el respaldo no restaura.

## Paso 5 — Ejecución real en producción

Solo con los pasos 2–4 en verde y tu confirmación explícita de la lista:

```sh
sh scripts/ops/purga-proyecto/purga-proyecto.sh \
   --tenant <TENANT_ID> \
   --codigos COD1,COD2,COD3 \
   --confirmar COD1,COD2,COD3 \
   --respaldo "$R" \
   --ejecutar
```

La herramienta rechaza la ejecución si: no es superusuario, `--confirmar` no coincide exactamente, no hay respaldo válido de menos de 24 h, o piden más de 10 proyectos. Al terminar imprime `Purga COMPLETADA` y escribe la **bitácora** en `docs/operacion/purgas/` (fecha, códigos, filas por esquema, respaldo y SHA-256; **sin** nombres de proyecto).

## Paso 6 — Verificación posterior

1. Abre https://iretum.com → Administración → Proyectos: los proyectos ya no aparecen; los demás sí.
2. Selector de proyectos y dashboards de un proyecto que **no** se purgó: cargan igual que antes.
3. Revisa los registros de los servicios (`docker compose -f docker-compose.vps.yml logs --tail=100 <servicio>`) por errores nuevos.
4. Confirma la bitácora generada y haz commit de ella si quieres conservarla en el repo (no contiene datos de negocio).

## Paso 7 — Archivos huérfanos (manual)

El manifiesto `purga-archivos-*.txt` (en el directorio donde ejecutaste) lista las rutas que ya no tienen fila en la base. Revisa la lista y, si procede, bórralos de los volúmenes (`vps_fichas_uploads`, `vps_cotizaciones_uploads`, `vps_docs_proveedores`, `vps_personal_uploads`, `vps_calidad_uploads`). Es opcional: solo ocupan espacio.

## Si algo sale mal

- **Falló durante la purga:** no se modificó nada (transacción revertida). Lee el mensaje `PURGA_*` y corrige.
- **Purgaste algo que no debías:** restaura desde el respaldo del paso 2. Para recuperar un proyecto concreto sin pisar el resto: restaura el dump en una base aparte (como en el paso 4) y copia de ahí los datos, o restaura todo si los datos posteriores no importan.
- **Conserva el respaldo `pre-purga-*.dump` (y sus globals) al menos 30 días** y hasta que confirmes que todo opera con normalidad.

## Mensajes de error de la herramienta

| Código | Significado |
|---|---|
| `PURGA_SIN_SUPERUSUARIO` | La conexión no es superusuario: RLS ocultaría filas. Usa el usuario del contenedor (`$DB_USER`). |
| `PURGA_CODIGO_INEXISTENTE` | Un código no existe en ese tenant. Cópialo tal cual del paso 1. |
| `PURGA_CONFIRMACION_NO_COINCIDE` | `--confirmar` debe repetir exactamente los códigos de `--codigos`. |
| `PURGA_DEMASIADOS_PROYECTOS` | Máximo 10 por corrida. |
| `PURGA_FK_COMPUESTA` / `PURGA_CICLO_FK` | El esquema tiene una clave foránea que la herramienta no soporta: **no** se borró nada; avisar a desarrollo. |
| `PURGA_VERIFICACION_FALLIDA` | La purga habría afectado a otro proyecto/tenant o dejado filas: se revirtió todo. |
| `--ejecutar exige --respaldo …` | Falta un respaldo válido de menos de 24 h. |
