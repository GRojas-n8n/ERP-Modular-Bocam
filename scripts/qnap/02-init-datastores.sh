#!/bin/sh

set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.qnap.yml}"
ENV_FILE="${ENV_FILE:-.env.qnap}"
TOOLING_SERVICE="${TOOLING_SERVICE:-workspace-tooling}"
ALLOW_DATA_LOSS="${ALLOW_DATA_LOSS:-0}"
STACK_PROFILE="${STACK_PROFILE:-core}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.qnap.example and fill real values first."
  exit 1
fi

push_with_optional_force() {
  schema_path="$1"
  if [ "$ALLOW_DATA_LOSS" = "1" ]; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm "$TOOLING_SERVICE" \
      sh -lc "npx prisma db push --accept-data-loss --schema $schema_path"
  else
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm "$TOOLING_SERVICE" \
      sh -lc "npx prisma db push --schema $schema_path"
  fi
}

schemas_for_target() {
  case "$STACK_PROFILE" in
    core)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/gerencia-tecnica/prisma/schema.prisma \
        apps/compras/prisma/schema.prisma \
        apps/finanzas/prisma/schema.prisma \
        apps/control-obra/prisma/schema.prisma \
        apps/contabilidad/prisma/schema.prisma
      ;;
    full)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/gerencia-tecnica/prisma/schema.prisma \
        apps/compras/prisma/schema.prisma \
        apps/finanzas/prisma/schema.prisma \
        apps/control-obra/prisma/schema.prisma \
        apps/contabilidad/prisma/schema.prisma \
        apps/personal/prisma/schema.prisma \
        apps/seguridad/prisma/schema.prisma
      ;;
    shell-min)
      printf '%s\n' apps/auth/prisma/schema.prisma
      ;;
    insumos-dev)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/gerencia-tecnica/prisma/schema.prisma
      ;;
    finanzas-dev)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/finanzas/prisma/schema.prisma
      ;;
    compras-dev)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/finanzas/prisma/schema.prisma \
        apps/compras/prisma/schema.prisma
      ;;
    control-obra-dev)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/finanzas/prisma/schema.prisma \
        apps/control-obra/prisma/schema.prisma
      ;;
    contabilidad-dev)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/contabilidad/prisma/schema.prisma
      ;;
    personal-dev)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/personal/prisma/schema.prisma
      ;;
    seguridad-dev)
      printf '%s\n' \
        apps/auth/prisma/schema.prisma \
        apps/seguridad/prisma/schema.prisma
      ;;
    *)
      echo "Invalid STACK_PROFILE=$STACK_PROFILE."
      echo "Use: core, full, shell-min, insumos-dev, finanzas-dev, compras-dev, control-obra-dev, contabilidad-dev, personal-dev, seguridad-dev."
      exit 1
      ;;
  esac
}

echo "[1/3] Generating Prisma clients"
for schema in $(schemas_for_target); do
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm "$TOOLING_SERVICE" \
    sh -lc "npx prisma generate --schema $schema"
done

echo "[2/3] Applying schema strategy per module"
for schema in $(schemas_for_target); do
  if [ "$schema" = "apps/gerencia-tecnica/prisma/schema.prisma" ]; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm "$TOOLING_SERVICE" \
      sh -lc "npx prisma migrate deploy --schema $schema"
  else
    push_with_optional_force "$schema"
  fi
done

echo "[3/3] Done"
if [ "$ALLOW_DATA_LOSS" = "1" ]; then
  echo "Schema sync finished with ALLOW_DATA_LOSS=1. Use this only for controlled internal preproduction."
else
  echo "Schema sync finished. If a future db push needs destructive changes, rerun with ALLOW_DATA_LOSS=1 after backup."
fi
