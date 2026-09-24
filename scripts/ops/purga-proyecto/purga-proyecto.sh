#!/bin/sh
# purga-proyecto.sh — elimina DEFINITIVAMENTE proyectos (Centros de Costos) y todos
# sus datos en los esquemas de servicio. Herramienta operativa: la ejecuta el titular
# en la VPS; NO la usa la aplicación ni CI.
#
# Spec:    openspec/changes/purga-proyectos-demo-produccion/
# Runbook: docs/operacion/purga-proyectos-demo.md  (LEERLO ANTES de ejecutar)
#
# Por defecto hace DRY-RUN (no modifica nada). El borrado real exige, TODO a la vez:
#   --ejecutar
#   --confirmar <mismos códigos que --codigos>
#   --respaldo <archivo pg_dump -Fc> de menos de 24 h que pase `pg_restore --list`
#   conexión de superusuario (el SQL lo comprueba)
#
# Uso:
#   sh purga-proyecto.sh --tenant <uuid> --codigos COD1,COD2                 # dry-run
#   sh purga-proyecto.sh --tenant <uuid> --codigos COD1,COD2 \
#        --confirmar COD1,COD2 --respaldo /ruta/respaldo.dump --ejecutar     # real
#
# Variables opcionales:
#   ENV_FILE            archivo de entorno del VPS (default .env.vps; usa DB_USER y DB_NAME)
#   CONTENEDOR_PG       contenedor de PostgreSQL (default bocam-vps-postgres)
#   PSQL_CMD            comando psql completo (sobrescribe el default; para pruebas)
#   PGRESTORE_LIST_CMD  comando `pg_restore --list` que lee el dump por stdin
#   PURGA_ESQUEMAS      lista de esquemas (default: los 10 de servicio)
#   PURGA_SALIDA_DIR    dónde escribir el manifiesto de archivos (default: directorio actual)
#   PURGA_BITACORA_DIR  dónde escribir la bitácora (default: PURGA_SALIDA_DIR, o docs/operacion/purgas)
set -eu

DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "$DIR/../../.." && pwd)
SQL="$DIR/purga-proyecto.sql"

TENANT=""
CODIGOS=""
CONFIRMAR=""
RESPALDO=""
EJECUTAR=0

die() { echo "ERROR: $*" >&2; exit 1; }

usage() {
  sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --tenant)    TENANT=${2:-};    shift 2 ;;
    --codigos)   CODIGOS=${2:-};   shift 2 ;;
    --confirmar) CONFIRMAR=${2:-}; shift 2 ;;
    --respaldo)  RESPALDO=${2:-};  shift 2 ;;
    --ejecutar)  EJECUTAR=1;       shift ;;
    -h|--help)   usage; exit 0 ;;
    *) echo "Argumento desconocido: $1" >&2; usage >&2; exit 2 ;;
  esac
done

[ -n "$TENANT" ]  || die "Falta --tenant <uuid>."
[ -n "$CODIGOS" ] || die "Falta --codigos COD1,COD2 (códigos de Centro de Costos)."
[ -f "$SQL" ]     || die "No se encuentra $SQL"

# Producción real usa una base por servicio, no diez esquemas en una sola base.
# Se conserva este wrapper únicamente para tests/entornos legacy que pasan
# PSQL_CMD explícitamente. Esto impide usarlo por accidente en la VPS.
if [ -z "${PSQL_CMD:-}" ]; then
  die "Herramienta legacy deshabilitada para producción. Usa purga-proyecto-multidb.sh y el runbook actualizado."
fi

# ─── Conexión a la base ──────────────────────────────────────────────────────
: "${PGRESTORE_LIST_CMD:=pg_restore --list}"

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1
  else shasum -a 256 "$1" | cut -d' ' -f1; fi
}

# ─── Puerta de respaldo (solo para la ejecución real) ────────────────────────
RESPALDO_SHA=""
verificar_respaldo() {
  [ -n "$RESPALDO" ] || die "--ejecutar exige --respaldo <ruta>: un pg_dump -Fc verificado de menos de 24 h. Sin respaldo no se ejecuta."
  [ -f "$RESPALDO" ] || die "El respaldo no existe: $RESPALDO"
  [ -s "$RESPALDO" ] || die "El respaldo está vacío: $RESPALDO"
  if [ -z "$(find "$RESPALDO" -mmin -1440 2>/dev/null)" ]; then
    die "El respaldo tiene más de 24 h de antigüedad: $RESPALDO. Toma uno nuevo."
  fi
  # shellcheck disable=SC2086
  if ! $PGRESTORE_LIST_CMD < "$RESPALDO" >/dev/null 2>&1; then
    die "El respaldo no pasa 'pg_restore --list' (corrupto, truncado o no es un dump -Fc): $RESPALDO"
  fi
  RESPALDO_SHA=$(sha256 "$RESPALDO")
  echo "Respaldo verificado: $(basename "$RESPALDO")  SHA-256=$RESPALDO_SHA"
}

if [ "$EJECUTAR" = 1 ]; then
  verificar_respaldo
  [ -n "$CONFIRMAR" ] || die "--ejecutar exige --confirmar con los mismos códigos de --codigos."
  echo "MODO: EJECUCIÓN REAL (irreversible sin el respaldo)."
else
  echo "MODO: DRY-RUN (no se modificará ningún dato). Para ejecutar de verdad añade --ejecutar --confirmar ... --respaldo ..."
fi

# ─── Ejecución ───────────────────────────────────────────────────────────────
TS=$(date -u +%Y%m%d-%H%M%S)
SALIDA_DIR=${PURGA_SALIDA_DIR:-.}
BITACORA_DIR=${PURGA_BITACORA_DIR:-${PURGA_SALIDA_DIR:-$REPO_ROOT/docs/operacion/purgas}}
mkdir -p "$SALIDA_DIR"
OUT=$(mktemp)
ERR=$(mktemp)
trap 'rm -f "$OUT" "$ERR"' EXIT

# shellcheck disable=SC2086
if ! $PSQL_CMD -X -q -A -t -F'|' -v ON_ERROR_STOP=1 \
     -v "tenant=$TENANT" -v "codigos=$CODIGOS" -v "confirmar=$CONFIRMAR" -v "ejecutar=$EJECUTAR" \
     ${PURGA_ESQUEMAS:+-v "esquemas=$PURGA_ESQUEMAS"} \
     -f - < "$SQL" >"$OUT" 2>"$ERR"; then
  cat "$ERR" >&2
  die "La purga FALLÓ y la transacción se revirtió: no se modificó ningún dato."
fi

# ─── Resumen ─────────────────────────────────────────────────────────────────
echo
echo "Proyectos objetivo:"
grep '^PROYECTO|' "$OUT" | awk -F'|' '{printf "  %-16s %-14s %s\n", $2, "["$4"]", $3}'
echo
echo "Filas por esquema (incluye las eliminadas por CASCADE):"
grep '^FILAS|' "$OUT" | awk -F'|' '{split($2, a, "."); s[a[1]] += $3; t += $3} END {for (k in s) printf "  %-20s %d\n", k, s[k]; printf "  %-20s %d\n", "TOTAL", t}' | sort
echo
echo "Detalle por tabla:"
grep '^FILAS|' "$OUT" | awk -F'|' '{printf "  %-55s %d\n", $2, $3}'

N_ARCHIVOS=$(grep -c '^ARCHIVO|' "$OUT" || true)
MANIFIESTO="$SALIDA_DIR/purga-archivos-$TS.txt"
grep '^ARCHIVO|' "$OUT" | cut -d'|' -f2- > "$MANIFIESTO" || true
echo
echo "Archivos que quedan huérfanos en los volúmenes: $N_ARCHIVOS (manifiesto: $MANIFIESTO)."
echo "Esta herramienta NO borra archivos: revisa el manifiesto y bórralos a mano si procede."

if [ "$EJECUTAR" != 1 ]; then
  echo
  echo "DRY-RUN terminado: no se modificó nada."
  exit 0
fi

# ─── Bitácora (sin datos de negocio: ni nombres de proyecto ni rutas) ────────
mkdir -p "$BITACORA_DIR"
BITACORA="$BITACORA_DIR/$TS-purga.md"
{
  echo "# Purga de proyectos — $TS (UTC)"
  echo
  echo "- **Operador:** $(whoami 2>/dev/null || echo desconocido)"
  echo "- **Tenant:** $TENANT"
  echo "- **Códigos de Centro de Costos purgados:** $CODIGOS"
  echo "- **Respaldo previo:** $(basename "$RESPALDO")"
  echo "- **SHA-256 del respaldo:** $RESPALDO_SHA"
  echo "- **Verificaciones:** cero filas restantes de los proyectos; conteos de otros proyectos y tenants idénticos."
  echo "- **Archivos huérfanos listados en el manifiesto:** $N_ARCHIVOS (revisión manual pendiente)"
  echo
  echo "## Filas eliminadas por esquema"
  echo
  grep '^FILAS|' "$OUT" | awk -F'|' '{split($2, a, "."); s[a[1]] += $3; t += $3} END {for (k in s) printf "- %s: %d\n", k, s[k]; printf "- **TOTAL:** %d\n", t}' | sort
} > "$BITACORA"

echo
echo "Purga COMPLETADA. Bitácora: $BITACORA"
echo "Conserva el respaldo $(basename "$RESPALDO") al menos 30 días."
