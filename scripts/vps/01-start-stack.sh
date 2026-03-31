#!/bin/sh

set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.vps.yml}"
ENV_FILE="${ENV_FILE:-.env.vps}"
STACK_PROFILE="${STACK_PROFILE:-staging}"
START_TOOLING="${START_TOOLING:-0}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.vps.example and fill real values first."
  exit 1
fi

needs_redis=0
services=""

case "$STACK_PROFILE" in
  core)
    services="auth gerencia-tecnica finanzas compras control-obra contabilidad contabilidad-sat-worker app-shell"
    ;;
  full|staging)
    services="auth gerencia-tecnica finanzas compras control-obra contabilidad contabilidad-sat-worker personal seguridad app-shell"
    needs_redis=1
    ;;
  *)
    echo "Invalid STACK_PROFILE=$STACK_PROFILE."
    echo "Use: core, full, staging."
    exit 1
    ;;
esac

echo "[1/4] Starting infrastructure"
infra_services="postgres rabbitmq"
if [ "$needs_redis" = "1" ]; then
  infra_services="$infra_services redis"
fi
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d $infra_services

echo "[2/4] Waiting for healthy infrastructure"
wait_for_service() {
  service="$1"
  retries="${2:-40}"
  count=0
  while [ "$count" -lt "$retries" ]; do
    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "bocam-vps-$service" 2>/dev/null || true)"
    if [ "$status" = "healthy" ]; then
      echo "  - $service is healthy"
      return 0
    fi
    count=$((count + 1))
    sleep 3
  done

  echo "Service $service did not become healthy in time."
  return 1
}

wait_for_service postgres
wait_for_service rabbitmq
if [ "$needs_redis" = "1" ]; then
  wait_for_service redis
fi

if [ "$START_TOOLING" = "1" ]; then
  echo "Starting workspace-tooling because START_TOOLING=1"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d workspace-tooling
fi

echo "[3/4] Starting backend services"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile "$STACK_PROFILE" up -d $services

echo "[4/4] Stack target ready"
echo "Stack started with STACK_PROFILE=$STACK_PROFILE. Next step: scripts/vps/02-init-datastores.sh"
