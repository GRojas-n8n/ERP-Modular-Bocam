#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"

TARGET_USER="${TARGET_USER:-bocam}"
TARGET_HOME="${TARGET_HOME:-/home/$TARGET_USER}"
TARGET_GROUP="${TARGET_GROUP:-$TARGET_USER}"
INSTALL_DOCKER="${INSTALL_DOCKER:-1}"
HARDEN_SSH="${HARDEN_SSH:-0}"
CONFIGURE_FIREWALL="${CONFIGURE_FIREWALL:-1}"
CREATE_APP_USER="${CREATE_APP_USER:-1}"
APP_BASE_DIR="${APP_BASE_DIR:-/opt/bocam}"
CLONE_REPOSITORY="${CLONE_REPOSITORY:-0}"
REPO_URL="${REPO_URL:-}"
REPO_BRANCH="${REPO_BRANCH:-main}"
REMOTE_REPO_DIR="${REMOTE_REPO_DIR:-$APP_BASE_DIR/erp}"
SYNC_LOCAL_REPO="${SYNC_LOCAL_REPO:-0}"
BOOTSTRAP_ENV_FILE="${BOOTSTRAP_ENV_FILE:-.env.vps}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.vps.yml}"
STACK_PROFILE="${STACK_PROFILE:-staging}"
START_TOOLING="${START_TOOLING:-1}"
INIT_DATASTORES="${INIT_DATASTORES:-1}"
RUN_SMOKE_TESTS="${RUN_SMOKE_TESTS:-1}"
ALLOW_DATA_LOSS="${ALLOW_DATA_LOSS:-0}"
BASE_URL="${BASE_URL:-http://localhost}"
APP_DOMAIN="${APP_DOMAIN:-}"
POSTGRES_INIT_DIR="${POSTGRES_INIT_DIR:-docker/postgres/init}"
CREATE_MODULE_DATABASES="${CREATE_MODULE_DATABASES:-1}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

fail() {
  printf '\n[ERROR] %s\n' "$1" >&2
  exit 1
}

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    fail "Este script debe ejecutarse como root o con sudo."
  fi
}

ensure_app_user() {
  if [ "$CREATE_APP_USER" != "1" ]; then
    return 0
  fi

  if id "$TARGET_USER" >/dev/null 2>&1; then
    log "El usuario $TARGET_USER ya existe"
    return 0
  fi

  log "Creando usuario operativo $TARGET_USER"
  adduser --disabled-password --gecos "" "$TARGET_USER"
  usermod -aG sudo "$TARGET_USER"
}

install_base_packages() {
  log "Instalando paquetes base del sistema"
  apt update
  DEBIAN_FRONTEND=noninteractive apt install -y \
    ca-certificates \
    curl \
    fail2ban \
    git \
    gnupg \
    lsb-release \
    rsync \
    ufw \
    unzip
}

configure_timezone() {
  log "Configurando zona horaria America/Mexico_City"
  timedatectl set-timezone America/Mexico_City
}

install_docker_if_needed() {
  if [ "$INSTALL_DOCKER" != "1" ]; then
    return 0
  fi

  if command -v docker >/dev/null 2>&1; then
    log "Docker ya está instalado"
  else
    log "Instalando Docker Engine"
    curl -fsSL https://get.docker.com | sh
  fi

  usermod -aG docker "$TARGET_USER"
}

configure_firewall_if_needed() {
  if [ "$CONFIGURE_FIREWALL" != "1" ]; then
    return 0
  fi

  log "Configurando firewall UFW"
  ufw allow OpenSSH
  ufw allow 80
  ufw allow 443
  ufw --force enable
}

configure_fail2ban() {
  log "Habilitando fail2ban"
  systemctl enable fail2ban
  systemctl restart fail2ban
}

configure_ssh_if_needed() {
  if [ "$HARDEN_SSH" != "1" ]; then
    return 0
  fi

  log "Endureciendo SSH"
  SSH_CONFIG="/etc/ssh/sshd_config"

  sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin no/' "$SSH_CONFIG"
  sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' "$SSH_CONFIG"
  sed -i 's/^#\?PubkeyAuthentication .*/PubkeyAuthentication yes/' "$SSH_CONFIG"

  systemctl restart ssh
}

prepare_directories() {
  log "Preparando estructura de directorios en $APP_BASE_DIR"
  mkdir -p "$APP_BASE_DIR"
  chown -R "$TARGET_USER:$TARGET_GROUP" "$APP_BASE_DIR"
}

clone_repository_if_needed() {
  if [ "$CLONE_REPOSITORY" != "1" ]; then
    return 0
  fi

  [ -n "$REPO_URL" ] || fail "REPO_URL es obligatorio cuando CLONE_REPOSITORY=1."

  if [ -d "$REMOTE_REPO_DIR/.git" ]; then
    log "Actualizando repositorio existente en $REMOTE_REPO_DIR"
    su - "$TARGET_USER" -c "cd '$REMOTE_REPO_DIR' && git fetch --all && git checkout '$REPO_BRANCH' && git pull --ff-only origin '$REPO_BRANCH'"
    return 0
  fi

  log "Clonando repositorio en $REMOTE_REPO_DIR"
  su - "$TARGET_USER" -c "git clone --branch '$REPO_BRANCH' '$REPO_URL' '$REMOTE_REPO_DIR'"
}

sync_local_repository_if_needed() {
  if [ "$SYNC_LOCAL_REPO" != "1" ]; then
    return 0
  fi

  log "Sincronizando copia local del repositorio hacia $REMOTE_REPO_DIR"
  mkdir -p "$REMOTE_REPO_DIR"
  rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "dist" \
    "$REPO_DIR/" "$REMOTE_REPO_DIR/"
  chown -R "$TARGET_USER:$TARGET_GROUP" "$REMOTE_REPO_DIR"
}

ensure_postgres_init_sql() {
  if [ "$CREATE_MODULE_DATABASES" != "1" ]; then
    return 0
  fi

  log "Generando bootstrap SQL para bases por módulo"
  mkdir -p "$REMOTE_REPO_DIR/$POSTGRES_INIT_DIR"

  cat > "$REMOTE_REPO_DIR/$POSTGRES_INIT_DIR/01-create-databases.sql" <<'SQL'
SELECT 'CREATE DATABASE bocam_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_auth')\gexec
SELECT 'CREATE DATABASE bocam_compras'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_compras')\gexec
SELECT 'CREATE DATABASE bocam_finanzas'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_finanzas')\gexec
SELECT 'CREATE DATABASE bocam_control_obra'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_control_obra')\gexec
SELECT 'CREATE DATABASE bocam_contabilidad'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_contabilidad')\gexec
SELECT 'CREATE DATABASE bocam_personal'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_personal')\gexec
SELECT 'CREATE DATABASE bocam_seguridad'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_seguridad')\gexec
SELECT 'CREATE DATABASE bocam_gerencia_tecnica'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_gerencia_tecnica')\gexec
SELECT 'CREATE DATABASE bocam_ventas'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bocam_ventas')\gexec
SQL

  chown -R "$TARGET_USER:$TARGET_GROUP" "$REMOTE_REPO_DIR/$POSTGRES_INIT_DIR"
}

validate_runtime_files() {
  [ -f "$REMOTE_REPO_DIR/$COMPOSE_FILE" ] || fail "No existe $COMPOSE_FILE en $REMOTE_REPO_DIR."
  [ -f "$REMOTE_REPO_DIR/$BOOTSTRAP_ENV_FILE" ] || fail "No existe $BOOTSTRAP_ENV_FILE en $REMOTE_REPO_DIR."
  [ -f "$REMOTE_REPO_DIR/scripts/vps/01-start-stack.sh" ] || fail "Falta scripts/vps/01-start-stack.sh."
  [ -f "$REMOTE_REPO_DIR/scripts/vps/02-init-datastores.sh" ] || fail "Falta scripts/vps/02-init-datastores.sh."
  [ -f "$REMOTE_REPO_DIR/scripts/vps/03-smoke-test.sh" ] || fail "Falta scripts/vps/03-smoke-test.sh."
}

run_stack_start() {
  log "Levantando stack base con scripts/vps/01-start-stack.sh"
  su - "$TARGET_USER" -c "
    cd '$REMOTE_REPO_DIR' && \
    COMPOSE_FILE='$COMPOSE_FILE' \
    ENV_FILE='$BOOTSTRAP_ENV_FILE' \
    STACK_PROFILE='$STACK_PROFILE' \
    START_TOOLING='$START_TOOLING' \
    sh scripts/vps/01-start-stack.sh
  "
}

run_datastore_init() {
  if [ "$INIT_DATASTORES" != "1" ]; then
    return 0
  fi

  log "Inicializando datastores con scripts/vps/02-init-datastores.sh"
  su - "$TARGET_USER" -c "
    cd '$REMOTE_REPO_DIR' && \
    COMPOSE_FILE='$COMPOSE_FILE' \
    ENV_FILE='$BOOTSTRAP_ENV_FILE' \
    STACK_PROFILE='$STACK_PROFILE' \
    ALLOW_DATA_LOSS='$ALLOW_DATA_LOSS' \
    sh scripts/vps/02-init-datastores.sh
  "
}

run_smoke_tests() {
  if [ "$RUN_SMOKE_TESTS" != "1" ]; then
    return 0
  fi

  log "Ejecutando smoke tests con scripts/vps/03-smoke-test.sh"
  su - "$TARGET_USER" -c "
    cd '$REMOTE_REPO_DIR' && \
    STACK_PROFILE='$STACK_PROFILE' \
    BASE_URL='$BASE_URL' \
    sh scripts/vps/03-smoke-test.sh
  "
}

print_next_steps() {
  log "Bootstrap terminado"
  cat <<EOF
Repositorio operativo: $REMOTE_REPO_DIR
Archivo de entorno: $REMOTE_REPO_DIR/$BOOTSTRAP_ENV_FILE
Perfil desplegado: $STACK_PROFILE

Siguientes pasos sugeridos:
1. Revisar contenedores:
   docker compose --env-file $BOOTSTRAP_ENV_FILE -f $COMPOSE_FILE ps
2. Revisar logs:
   docker logs bocam-vps-auth --tail 100
3. Validar dominio y TLS:
   ${APP_DOMAIN:-"configura APP_DOMAIN en .env.vps y el proxy reverse"}
4. Iniciar pruebas funcionales de login, tenant, proyecto y flujos intermodulares.
EOF
}

main() {
  require_root
  install_base_packages
  configure_timezone
  ensure_app_user
  install_docker_if_needed
  configure_firewall_if_needed
  configure_fail2ban
  configure_ssh_if_needed
  prepare_directories
  clone_repository_if_needed
  sync_local_repository_if_needed
  ensure_postgres_init_sql
  validate_runtime_files
  run_stack_start
  run_datastore_init
  run_smoke_tests
  print_next_steps
}

main "$@"
