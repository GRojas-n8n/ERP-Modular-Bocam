#!/bin/bash
# -----------------------------------------------------------------------------
# Aplica apps/<servicio>/prisma/rls-policies.sql contra la base de datos real
# de ese servicio, como superusuario (contenedor `postgres`, rol
# POSTGRES_USER) — no como el rol de runtime de la app (bocam_app, sin
# privilegios de owner sobre funciones/políticas tras el hardening de
# openspec: fix-rls-bypass-bocam-admin).
#
# Corre EN el VPS (no dentro de ningún contenedor): SSH lo invoca directo.
# Ver .github/workflows/deploy-vps-rls-apply.yml.
#
# Uso: bash scripts/ci/apply-rls-as-admin.sh <servicio>
# -----------------------------------------------------------------------------
set -euo pipefail

SERVICE="${1:?Uso: apply-rls-as-admin.sh <servicio>}"
COMPOSE="docker compose -f docker-compose.vps.yml"

DATABASE_URL=$($COMPOSE exec -T "$SERVICE" printenv DATABASE_URL)
DBNAME=$(echo "$DATABASE_URL" | sed -E 's#.*/([^/?]+).*#\1#')

echo "Servicio: $SERVICE — base de datos real: $DBNAME"
echo "Aplicando apps/$SERVICE/prisma/rls-policies.sql como superusuario..."

$COMPOSE exec -T postgres bash -c "psql -U \"\$POSTGRES_USER\" -d \"$DBNAME\" -v ON_ERROR_STOP=1" \
  < "apps/$SERVICE/prisma/rls-policies.sql"

echo "OK: rls-policies.sql aplicado contra $DBNAME."
