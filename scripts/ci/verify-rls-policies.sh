#!/bin/bash
# -----------------------------------------------------------------------------
# Lista las políticas RLS activas (pg_policies, schema public) de la base de
# datos real de un servicio, vía el contenedor `postgres` (que trae psql) y
# el DATABASE_URL real que ya tiene resuelto el contenedor del servicio —
# sin adivinar ni exponer usuario/nombre de base en el workflow que llama.
#
# Corre EN el VPS. Ver .github/workflows/deploy-vps-rls-apply.yml.
#
# Uso: bash scripts/ci/verify-rls-policies.sh <servicio>
# -----------------------------------------------------------------------------
set -euo pipefail

SERVICE="${1:?Uso: verify-rls-policies.sh <servicio>}"
COMPOSE="docker compose -f docker-compose.vps.yml"

DATABASE_URL=$($COMPOSE exec -T "$SERVICE" printenv DATABASE_URL)
DBNAME=$(echo "$DATABASE_URL" | sed -E 's#.*/([^/?]+).*#\1#')

$COMPOSE exec -T postgres bash -c "psql -U \"\$POSTGRES_USER\" -d \"$DBNAME\" -c \"SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;\""
