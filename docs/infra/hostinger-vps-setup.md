# Hostinger VPS Setup

## VPS objetivo
- Proveedor: Hostinger
- SO: Ubuntu 24.04 LTS
- CPU: 8 vCPU
- RAM: 32 GB
- Disco: 400 GB

## Objetivo
Preparar el VPS para alojar el stack completo del ERP con Docker Compose, TLS, backups y pruebas de staging.

## Preparacion base
1. Actualizar el sistema.
2. Crear usuario operativo no root.
3. Instalar Docker y Docker Compose plugin.
4. Configurar UFW.
5. Habilitar fail2ban.
6. Preparar DNS del dominio.
7. Clonar o sincronizar el repositorio.

## Estructura recomendada
```text
/opt/bocam/
  erp/
  backups/
  logs/
```

## Archivos operativos clave
- `docker-compose.vps.yml`
- `.env.vps`
- `docker/Caddyfile`
- `scripts/vps/bootstrap-hostinger.sh`
- `scripts/vps/01-start-stack.sh`
- `scripts/vps/02-init-datastores.sh`
- `scripts/vps/03-smoke-test.sh`

## Variables obligatorias
- `APP_DOMAIN`
- `JWT_SECRET`
- `DB_USER`
- `DB_PASSWORD`
- `AUTH_DATABASE_URL`
- `COMPRAS_DATABASE_URL`
- `FINANZAS_DATABASE_URL`
- `CONTROL_OBRA_DATABASE_URL`
- `CONTABILIDAD_DATABASE_URL`
- `PERSONAL_DATABASE_URL`
- `SEGURIDAD_DATABASE_URL`
- `GERENCIA_TECNICA_DATABASE_URL`
- `RABBITMQ_URL`
- `REDIS_URL`

## Orden recomendado de despliegue
1. Infraestructura: postgres, rabbitmq, redis.
2. Tooling de Prisma.
3. Migraciones y RLS.
4. Backends.
5. App shell.
6. Reverse proxy.
7. Smoke tests.

## Resultado esperado
- Acceso por HTTPS.
- APIs internas operativas.
- Bases de datos por modulo creadas.
- Healthchecks en verde.
- Listo para pruebas funcionales y correcciones.
