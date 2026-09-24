#!/bin/sh
# Purga definitiva para la topología REAL de producción: una base PostgreSQL
# por servicio, tablas en public. Dry-run por defecto. bocam_auth se procesa al
# final para que los proyectos sigan identificables si falla un servicio previo.
set -eu

DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "$DIR/../../.." && pwd)
SQL_RESOLVER="$DIR/resolver-proyectos.sql"
SQL_BASE="$DIR/purga-base.sql"

TENANT=""
CODIGOS=""
CONFIRMAR=""
RESPALDO_DIR=""
EJECUTAR=0
MANTENIMIENTO=0
RESPALDO_FUERA=0

die() { echo "ERROR: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Uso (dry-run, no modifica datos):
  sh purga-proyecto-multidb.sh --tenant UUID --codigos COD1,COD2

Uso real (requiere todas las guardas):
  sh purga-proyecto-multidb.sh --tenant UUID --codigos COD1,COD2 \
    --confirmar COD1,COD2 --respaldo-dir /ruta/pre-purga-AAAAMMDD-HHMM \
    --mantenimiento-confirmado --respaldo-fuera-vps-confirmado --ejecutar

El directorio de respaldo debe contener globals.sql y un <base>.dump por cada
base indicada en PURGA_BASES. Todos deben tener menos de 24 h.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --tenant) TENANT=${2:-}; shift 2 ;;
    --codigos) CODIGOS=${2:-}; shift 2 ;;
    --confirmar) CONFIRMAR=${2:-}; shift 2 ;;
    --respaldo-dir) RESPALDO_DIR=${2:-}; shift 2 ;;
    --mantenimiento-confirmado) MANTENIMIENTO=1; shift ;;
    --respaldo-fuera-vps-confirmado) RESPALDO_FUERA=1; shift ;;
    --ejecutar) EJECUTAR=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Argumento desconocido: $1" ;;
  esac
done

[ -n "$TENANT" ] || die "Falta --tenant UUID."
[ -n "$CODIGOS" ] || die "Falta --codigos COD1,COD2."
[ -f "$SQL_RESOLVER" ] || die "Falta $SQL_RESOLVER"
[ -f "$SQL_BASE" ] || die "Falta $SQL_BASE"

CONTENEDOR=${CONTENEDOR_PG:-bocam-vps-postgres}
BASE_AUTH=${PURGA_BASE_AUTH:-bocam_auth}
BASES=${PURGA_BASES:-"bocam_almacen bocam_calidad bocam_compras bocam_contabilidad bocam_control_obra bocam_control_proyectos bocam_finanzas bocam_gerencia_tecnica bocam_personal bocam_seguridad bocam_ventas bocam_auth"}
SALIDA_DIR=${PURGA_SALIDA_DIR:-.}
BITACORA_DIR=${PURGA_BITACORA_DIR:-$REPO_ROOT/docs/operacion/purgas}
TS=$(date -u +%Y%m%d-%H%M%S)
mkdir -p "$SALIDA_DIR"

normalizar_codigos() {
  printf '%s' "$1" | tr ',' '\n' | sed '/^[[:space:]]*$/d; s/^[[:space:]]*//; s/[[:space:]]*$//' | sort -u | paste -sd, -
}

CODIGOS_NORM=$(normalizar_codigos "$CODIGOS")
[ -n "$CODIGOS_NORM" ] || die "La lista de códigos está vacía."
[ "$(printf '%s' "$CODIGOS_NORM" | awk -F, '{print NF}')" -le 10 ] || die "Máximo 10 proyectos."

psql_file() {
  db=$1
  file=$2
  shift 2
  docker exec -i "$CONTENEDOR" sh -lc \
    'db=$1; shift; exec psql -U "$POSTGRES_USER" -d "$db" "$@"' sh "$db" \
    -X -q -A -t -F '|' -v ON_ERROR_STOP=1 "$@" -f - < "$file"
}

db_existe() {
  db=$1
  docker exec "$CONTENEDOR" sh -lc \
    'psql -U "$POSTGRES_USER" -d "$1" -X -q -A -t -v ON_ERROR_STOP=1 -c "select 1"' sh "$db" \
    | grep -qx 1
}

RESUELTOS=$(mktemp)
TMP_DIR=$(mktemp -d)
cleanup() {
  rm -f "$RESUELTOS"
  rm -f "$TMP_DIR"/* 2>/dev/null || true
  rmdir "$TMP_DIR" 2>/dev/null || true
}
trap cleanup EXIT

db_existe "$BASE_AUTH" || die "No existe la base de autenticación $BASE_AUTH."
if ! psql_file "$BASE_AUTH" "$SQL_RESOLVER" \
     -v "tenant=$TENANT" -v "codigos=$CODIGOS_NORM" > "$RESUELTOS"; then
  die "No se pudieron resolver exactamente los proyectos en $BASE_AUTH."
fi

IDS=$(awk -F'|' 'NF >= 4 {print $1}' "$RESUELTOS" | paste -sd, -)
CODIGOS_RESUELTOS=$(awk -F'|' 'NF >= 4 {print $2}' "$RESUELTOS" | sort -u | paste -sd, -)
[ -n "$IDS" ] || die "La consulta no devolvió proyectos."
[ "$CODIGOS_RESUELTOS" = "$CODIGOS_NORM" ] || die "Los códigos resueltos no coinciden exactamente con los solicitados."

echo "Proyectos objetivo confirmados en $BASE_AUTH:"
awk -F'|' 'NF >= 4 {printf "  %-22s %-14s %s\n", $2, "["$4"]", $3}' "$RESUELTOS"

BASES_VALIDAS=""
for db in $BASES; do
  db_existe "$db" || die "La base requerida no existe: $db"
  BASES_VALIDAS="$BASES_VALIDAS $db"
done
BASES_VALIDAS=$(printf '%s' "$BASES_VALIDAS" | sed 's/^ *//')

run_all() {
  modo=$1
  for db in $BASES_VALIDAS; do
    es_auth=0
    [ "$db" = "$BASE_AUTH" ] && es_auth=1
    out="$TMP_DIR/$modo-$db.out"
    err="$TMP_DIR/$modo-$db.err"
    echo "[$modo] $db"
    if ! psql_file "$db" "$SQL_BASE" \
         -v "ids=$IDS" -v "tenant=$TENANT" -v "ejecutar=$modo" -v "es_auth=$es_auth" \
         > "$out" 2> "$err"; then
      cat "$err" >&2
      return 1
    fi
  done
}

echo
echo "Preflight obligatorio: dry-run transaccional en todas las bases."
run_all 0 || die "El dry-run falló; no se modificó ninguna base."

cat "$TMP_DIR"/0-*.out | grep '^FILAS|' | sort > "$TMP_DIR/dry-filases.txt" || true
echo
echo "Filas que se eliminarían por base y tabla:"
if [ -s "$TMP_DIR/dry-filases.txt" ]; then
  awk -F'|' '{printf "  %-28s %-45s %d\n", $2, $3, $4}' "$TMP_DIR/dry-filases.txt"
else
  echo "  (ninguna fila transaccional; solo podrían existir los registros de auth)"
fi

MANIFIESTO="$SALIDA_DIR/purga-archivos-$TS.txt"
cat "$TMP_DIR"/0-*.out | grep '^ARCHIVO|' | cut -d'|' -f2- > "$MANIFIESTO" || true
N_ARCHIVOS=$(wc -l < "$MANIFIESTO" | tr -d ' ')
echo "Archivos potencialmente huérfanos: $N_ARCHIVOS (manifiesto: $MANIFIESTO)."

if [ "$EJECUTAR" != 1 ]; then
  echo "DRY-RUN multidatabase terminado: no se modificó ningún dato."
  exit 0
fi

[ "$(normalizar_codigos "$CONFIRMAR")" = "$CODIGOS_NORM" ] || die "--confirmar debe repetir exactamente los seis códigos."
[ "$MANTENIMIENTO" = 1 ] || die "Falta --mantenimiento-confirmado."
[ "$RESPALDO_FUERA" = 1 ] || die "Falta --respaldo-fuera-vps-confirmado."
[ -n "$RESPALDO_DIR" ] && [ -d "$RESPALDO_DIR" ] || die "Falta un --respaldo-dir válido."

reciente() {
  [ -n "$(find "$1" -mmin -1440 2>/dev/null)" ]
}

GLOBALS="$RESPALDO_DIR/globals.sql"
[ -s "$GLOBALS" ] && reciente "$GLOBALS" || die "globals.sql falta, está vacío o tiene más de 24 h."

SHA_FILE="$TMP_DIR/respaldos.sha256"
: > "$SHA_FILE"
for db in $BASES_VALIDAS; do
  dump="$RESPALDO_DIR/$db.dump"
  [ -s "$dump" ] && reciente "$dump" || die "Respaldo faltante, vacío o antiguo: $dump"
  if ! docker exec -i "$CONTENEDOR" pg_restore --list < "$dump" >/dev/null 2>&1; then
    die "Respaldo inválido: $dump"
  fi
  sha256sum "$dump" >> "$SHA_FILE"
done
sha256sum "$GLOBALS" >> "$SHA_FILE"

echo
echo "EJECUCIÓN REAL: servicios en mantenimiento; auth se procesará al final."
if ! run_all 1; then
  echo "FALLO PARCIAL ENTRE BASES. Mantén el sistema detenido y restaura TODO el conjunto de respaldos." >&2
  echo "Directorio de respaldo: $RESPALDO_DIR" >&2
  exit 1
fi

mkdir -p "$BITACORA_DIR"
BITACORA="$BITACORA_DIR/$TS-purga-multidb.md"
{
  echo "# Purga multidatabase de proyectos — $TS (UTC)"
  echo
  echo "- **Tenant:** $TENANT"
  echo "- **Códigos:** $CODIGOS_NORM"
  echo "- **Bases procesadas:** $BASES_VALIDAS"
  echo "- **Respaldo:** $RESPALDO_DIR (copia fuera de VPS confirmada)"
  echo "- **Mantenimiento:** confirmado"
  echo "- **Resultado:** verificaciones por base completadas; auth procesada al final"
  echo "- **Archivos huérfanos:** $N_ARCHIVOS (borrado manual pendiente)"
  echo
  echo "## SHA-256"
  echo '```text'
  cat "$SHA_FILE"
  echo '```'
  echo
  echo "## Filas eliminadas"
  echo '```text'
  cat "$TMP_DIR"/1-*.out | grep '^FILAS|' | sort || true
  echo '```'
} > "$BITACORA"

echo "Purga COMPLETADA en todas las bases. Bitácora: $BITACORA"
echo "Conserva el respaldo completo al menos 30 días."
