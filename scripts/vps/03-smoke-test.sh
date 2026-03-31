#!/bin/sh

set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"
STACK_PROFILE="${STACK_PROFILE:-staging}"

check() {
  name="$1"
  path="$2"
  echo "Checking $name -> $BASE_URL$path"
  curl --fail --silent --show-error "$BASE_URL$path" >/dev/null
}

case "$STACK_PROFILE" in
  core)
    check "auth" "/api/v1/auth/health"
    check "gerencia-tecnica" "/api/v1/gerencia-tecnica/health"
    check "compras" "/api/v1/compras/health"
    check "finanzas" "/api/v1/finanzas/health"
    check "control-obra" "/api/v1/control-obra/health"
    check "contabilidad" "/api/v1/contabilidad/health"
    ;;
  full|staging)
    check "auth" "/api/v1/auth/health"
    check "gerencia-tecnica" "/api/v1/gerencia-tecnica/health"
    check "compras" "/api/v1/compras/health"
    check "finanzas" "/api/v1/finanzas/health"
    check "control-obra" "/api/v1/control-obra/health"
    check "contabilidad" "/api/v1/contabilidad/health"
    check "personal" "/api/v1/personal/health"
    check "seguridad" "/api/v1/seguridad/health"
    ;;
  *)
    echo "Invalid STACK_PROFILE=$STACK_PROFILE."
    echo "Use: core, full, staging."
    exit 1
    ;;
esac

echo "Smoke test passed for STACK_PROFILE=$STACK_PROFILE."
