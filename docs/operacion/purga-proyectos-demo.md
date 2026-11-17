# Purga de los seis proyectos de prueba en producción

> **Operación destructiva.** No ejecutar el paso real sin respaldo completo,
> copia fuera de la VPS, ensayo aislado satisfactorio y confirmación final.

## Topología verificada

Producción usa PostgreSQL 15 con una base por servicio y tablas en `public`:

`bocam_almacen`, `bocam_auth`, `bocam_calidad`, `bocam_compras`,
`bocam_contabilidad`, `bocam_control_obra`, `bocam_control_proyectos`,
`bocam_finanzas`, `bocam_gerencia_tecnica`, `bocam_personal`,
`bocam_seguridad` y `bocam_ventas`.

La herramienta válida es
`scripts/ops/purga-proyecto/purga-proyecto-multidb.sh`.
`purga-proyecto.sh` corresponde al diseño antiguo y está bloqueada para uso
directo en producción.

PostgreSQL tiene `max_prepared_transactions=0`; no existe una transacción atómica
entre bases. Es obligatorio detener escrituras, respaldar todas las bases,
ejecutar el preflight completo, purgar `bocam_auth` al final y restaurar el
conjunto completo ante cualquier fallo parcial.

## Objetivos confirmados por el titular

Tenant: `8e07a7ac-8157-4e5d-8499-e985a9fcdbfc`

- `CC-2026-AGU-01`
- `CIB2026005001`
- `CIB2026033001`
- `CIB2026049001`
- `CIB2026049002`
- `HCO2019027001`

Ningún otro código se puede añadir durante la operación.

```sh
TENANT=8e07a7ac-8157-4e5d-8499-e985a9fcdbfc
CODIGOS=CC-2026-AGU-01,CIB2026005001,CIB2026033001,CIB2026049001,CIB2026049002,HCO2019027001
PG=bocam-vps-postgres
BASES="bocam_almacen bocam_calidad bocam_compras bocam_contabilidad bocam_control_obra bocam_control_proyectos bocam_finanzas bocam_gerencia_tecnica bocam_personal bocam_seguridad bocam_ventas bocam_auth"
```

## 1. Publicar y verificar la herramienta

La VPS debe estar en el commit revisado que contiene la herramienta
multidatabase. No copiar scripts sueltos.

```sh
cd /root/ERP-Modular-Bocam
git status --short --branch
git pull --ff-only
test -f scripts/ops/purga-proyecto/purga-proyecto-multidb.sh
```

Detenerse si el pull falla o aparecen cambios locales inesperados.

## 2. Congelar escrituras

Guardar la lista de contenedores activos y detener todos los servicios de Iretum
excepto PostgreSQL:

```sh
docker ps --format '{{.Names}}' | grep '^bocam-vps-' > /tmp/iretum-activos-pre-purga.txt
grep -v '^bocam-vps-postgres$' /tmp/iretum-activos-pre-purga.txt | xargs -r docker stop
docker ps --format '{{.Names}}' | grep '^bocam-vps-'
```

La última salida debe contener únicamente `bocam-vps-postgres`.

## 3. Respaldar todas las bases

```sh
R="$HOME/respaldos/pre-purga-$(date -u +%Y%m%d-%H%M)"
mkdir -p "$R"
chmod 700 "$R"

docker exec "$PG" sh -lc 'pg_dumpall --globals-only -U "$POSTGRES_USER"' > "$R/globals.sql"

for db in $BASES; do
  docker exec "$PG" sh -lc 'pg_dump -Fc -U "$POSTGRES_USER" -d "$1"' sh "$db" > "$R/$db.dump"
  docker exec -i "$PG" pg_restore --list < "$R/$db.dump" > /dev/null
done

sha256sum "$R"/* > "$R/SHA256SUMS"
ls -lh "$R"
```

Copiar el directorio completo fuera de la VPS y verificar los SHA-256 en destino.
No continuar si la única copia está en la VPS.

## 4. Dry-run contra producción congelada

```sh
sh scripts/ops/purga-proyecto/purga-proyecto-multidb.sh \
  --tenant "$TENANT" \
  --codigos "$CODIGOS"
```

El dry-run abre una transacción independiente en cada base, ejecuta el mismo
borrado, verifica que otros proyectos y tenants no cambien y hace rollback.
Revisar especialmente órdenes de compra, avances, presupuestos, nómina y archivos.

## 5. Ensayo sobre un clúster aislado

```sh
docker run -d --rm --name purga-ensayo --network none \
  -e POSTGRES_PASSWORD=ensayo postgres:15-alpine

until docker exec purga-ensayo pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec -i purga-ensayo psql -U postgres -v ON_ERROR_STOP=0 < "$R/globals.sql"

for db in $BASES; do
  docker exec purga-ensayo createdb -U postgres "$db"
  docker exec -i purga-ensayo pg_restore -U postgres -d "$db" --no-owner < "$R/$db.dump"
done
```

Ejecutar la purga real únicamente en la copia:

```sh
CONTENEDOR_PG=purga-ensayo \
sh scripts/ops/purga-proyecto/purga-proyecto-multidb.sh \
  --tenant "$TENANT" \
  --codigos "$CODIGOS" \
  --confirmar "$CODIGOS" \
  --respaldo-dir "$R" \
  --mantenimiento-confirmado \
  --respaldo-fuera-vps-confirmado \
  --ejecutar
```

Debe terminar con `Purga COMPLETADA en todas las bases`. Después:

```sh
docker stop purga-ensayo
```

## 6. Pausa y confirmación final

Presentar al titular los seis códigos, el resumen del dry-run, los SHA-256, la
evidencia de la copia externa y el resultado del ensayo. La confirmación previa
de los objetivos no sustituye la confirmación final posterior a esta evidencia.

## 7. Ejecución real

Solo después de la confirmación final:

```sh
sh scripts/ops/purga-proyecto/purga-proyecto-multidb.sh \
  --tenant "$TENANT" \
  --codigos "$CODIGOS" \
  --confirmar "$CODIGOS" \
  --respaldo-dir "$R" \
  --mantenimiento-confirmado \
  --respaldo-fuera-vps-confirmado \
  --ejecutar
```

Ante un fallo parcial, no reiniciar servicios: restaurar todas las bases desde el
mismo conjunto de respaldos. Nunca intentar completar el borrado manualmente.

## 8. Verificación y reapertura

1. Confirmar que los seis códigos no existen en `bocam_auth.public.proyectos`.
2. Confirmar cero filas para sus UUID en todas las columnas `proyecto_id`.
3. Reiniciar únicamente los contenedores guardados antes del mantenimiento.
4. Probar Administración, selector de proyectos y dashboards restantes.
5. Revisar errores nuevos en los registros de servicios.
6. Guardar la bitácora y conservar los respaldos durante un mínimo de 30 días.

Los archivos de los volúmenes no se borran automáticamente. La herramienta crea
un manifiesto para su revisión y eliminación manual posterior.
