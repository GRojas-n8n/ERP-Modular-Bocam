# Runbook de Operacion

## Proposito
Describir los comandos y validaciones basicas para operar el stack del ERP en el VPS.

## Levantar stack
```bash
docker compose --env-file .env.vps -f docker-compose.vps.yml up -d
```

## Ver estado
```bash
docker compose --env-file .env.vps -f docker-compose.vps.yml ps
```

## Reiniciar servicio puntual
```bash
docker compose --env-file .env.vps -f docker-compose.vps.yml restart finanzas
```

## Ver logs
```bash
docker logs bocam-vps-auth --tail 100
docker logs bocam-vps-finanzas --tail 100
docker logs bocam-vps-compras --tail 100
docker logs bocam-vps-contabilidad --tail 100
```

## Redeploy de cambios
```bash
cd /opt/bocam/erp
git pull origin main
docker compose --env-file .env.vps -f docker-compose.vps.yml up -d --build
```

## Validaciones minimas post deploy
- `docker compose ps` sin contenedores reiniciando en bucle.
- Todos los `/health` responden.
- El dominio responde por HTTPS.
- Login funcional.
- Flujo basico Compras -> Finanzas -> Contabilidad funcional.

## Incidentes comunes
### Un backend no inicia
- Revisar `docker logs`.
- Revisar variables en `.env.vps`.
- Revisar conectividad a Postgres o RabbitMQ.

### Error de base de datos
- Validar existencia de la base del modulo.
- Validar migraciones Prisma.
- Validar RLS y contexto `tenant_id`/`proyecto_id`.

### Error de dominio o TLS
- Revisar DNS.
- Revisar logs del reverse proxy.
- Revisar `APP_DOMAIN`.

## Regla de operacion
Nunca se debe exponer directamente un backend de negocio a internet para saltarse el proxy reverse.
