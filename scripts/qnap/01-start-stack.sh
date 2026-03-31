#!/bin/sh

set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.qnap.yml}"
ENV_FILE="${ENV_FILE:-.env.qnap}"
STACK_PROFILE="${STACK_PROFILE:-core}"
START_TOOLING="${START_TOOLING:-0}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.qnap.example and fill real values first."
  exit 1
fi

needs_redis=0
services=""

case "$STACK_PROFILE" in
  core)
    services="auth gerencia-tecnica finanzas compras control-obra contabilidad contabilidad-sat-worker app-shell"
    ;;
  full)
    services="auth gerencia-tecnica finanzas compras control-obra contabilidad contabilidad-sat-worker personal seguridad app-shell"
    needs_redis=1
    ;;
  shell-min)
    services="auth app-shell"
    ;;
  insumos-dev)
    services="auth gerencia-tecnica app-shell"
    ;;
  finanzas-dev)
    services="auth finanzas app-shell"
    ;;
  compras-dev)
    services="auth finanzas compras app-shell"
    ;;
  control-obra-dev)
    services="auth finanzas control-obra app-shell"
    ;;
  contabilidad-dev)
    services="auth contabilidad app-shell"
    ;;
  personal-dev)
    services="auth personal app-shell"
    needs_redis=1
    ;;
  seguridad-dev)
    services="auth seguridad app-shell"
    needs_redis=1
    ;;
  *)
    echo "Invalid STACK_PROFILE=$STACK_PROFILE."
    echo "Use: core, full, shell-min, insumos-dev, finanzas-dev, compras-dev, control-obra-dev, contabilidad-dev, personal-dev, seguridad-dev."
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
    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "bocam-qnap-$service" 2>/dev/null || true)"
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
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d $services

echo "[4/4] Stack target ready"

echo "Stack started with STACK_PROFILE=$STACK_PROFILE. Next step: scripts/qnap/02-init-datastores.sh"
