# QNAP Runbook Scripts

## Orden recomendado

1. `cp .env.qnap.example .env.qnap`
2. Ajustar secretos y puertos reales en `.env.qnap`
3. Elegir el modo de arranque segun memoria disponible:
   - `STACK_PROFILE=shell-min sh scripts/qnap/01-start-stack.sh`
   - `STACK_PROFILE=finanzas-dev sh scripts/qnap/01-start-stack.sh`
   - `STACK_PROFILE=compras-dev sh scripts/qnap/01-start-stack.sh`
   - `STACK_PROFILE=control-obra-dev sh scripts/qnap/01-start-stack.sh`
   - `STACK_PROFILE=contabilidad-dev sh scripts/qnap/01-start-stack.sh`
   - `STACK_PROFILE=core sh scripts/qnap/01-start-stack.sh`
4. `STACK_PROFILE=<modo> sh scripts/qnap/02-init-datastores.sh`
5. `STACK_PROFILE=<modo> sh scripts/qnap/03-smoke-test.sh`
6. Cuando el nucleo ya este estable, ampliar con `STACK_PROFILE=full sh scripts/qnap/01-start-stack.sh`

## Variables utiles

- `COMPOSE_FILE`: override de compose, default `docker-compose.qnap.yml`
- `ENV_FILE`: override de entorno, default `.env.qnap`
- `STACK_PROFILE`: `core`, `full`, `shell-min`, `insumos-dev`, `finanzas-dev`, `compras-dev`, `control-obra-dev`, `contabilidad-dev`, `personal-dev` o `seguridad-dev`
- `BASE_URL`: override del shell para smoke test, default `http://localhost:18080`
- `ALLOW_DATA_LOSS=1`: solo para `02-init-datastores.sh` cuando un `db push` requiera cambios destructivos en esta fase interna controlada
- `START_TOOLING=1`: levanta `workspace-tooling` en segundo plano; por default queda apagado para ahorrar RAM en QNAP

## Notas

- `gerencia-tecnica` usa `prisma migrate deploy` porque es el unico modulo con carpeta `prisma/migrations`.
- El resto de modulos hoy se inicializan con `prisma db push` porque no tienen historial de migraciones consolidado en repo.
- `02-init-datastores.sh` ahora inicializa solo los esquemas necesarios para el `STACK_PROFILE` activo.
- El smoke test usa exclusivamente endpoints `/health` reales del sistema.
- El smoke test respeta `STACK_PROFILE` y valida solo los modulos del modo actual.
- `app-shell` depende solo de `auth` para permitir corridas parciales; las rutas hacia modulos no levantados responderan error si se intentan usar.
- `core` levanta: `auth`, `gerencia-tecnica`, `finanzas`, `compras`, `control-obra`, `contabilidad`, `contabilidad-sat-worker` y `app-shell`.
- `full` agrega: `personal` y `seguridad`.
- `shell-min` levanta: `auth` y `app-shell`.
- `insumos-dev` levanta: `auth`, `gerencia-tecnica` y `app-shell`.
- `finanzas-dev` levanta: `auth`, `finanzas` y `app-shell`.
- `compras-dev` levanta: `auth`, `finanzas`, `compras` y `app-shell`.
- `control-obra-dev` levanta: `auth`, `finanzas`, `control-obra` y `app-shell`.
- `contabilidad-dev` levanta: `auth`, `contabilidad` y `app-shell`.
- `personal-dev` levanta: `auth`, `personal` y `app-shell`.
- `seguridad-dev` levanta: `auth`, `seguridad` y `app-shell`.

## Checklist de primer boot

1. Confirmar que el NAS ya tiene:
   - Container Station instalado
   - volumen/carpeta persistente definida
   - acceso remoto por VPN o red corporativa
2. Confirmar que el repo ya esta copiado al NAS completo, no parcial.
3. Crear `.env.qnap` y reemplazar todos los `CAMBIA_...`.
4. Validar compose:
   - `docker compose -f docker-compose.qnap.yml --env-file .env.qnap --profile core config`
5. Arrancar nucleo:
   - `STACK_PROFILE=shell-min sh scripts/qnap/01-start-stack.sh`
6. Inicializar esquemas:
   - `STACK_PROFILE=shell-min sh scripts/qnap/02-init-datastores.sh`
7. Correr smoke test:
   - `STACK_PROFILE=shell-min sh scripts/qnap/03-smoke-test.sh`
8. Revisar uso de RAM/CPU antes de subir a `full`.

## Si falla X, revisar Y

| Si falla X | Revisar Y |
| --- | --- |
| `docker compose ... config` falla | Sintaxis de `docker-compose.qnap.yml`, variables faltantes en `.env.qnap`, comillas o espacios rotos |
| `postgres` no llega a healthy | `DB_USER`, `DB_PASSWORD`, `DB_NAME`, volumen persistente, permisos del volumen |
| `rabbitmq` no llega a healthy | `RMQ_USER`, `RMQ_PASSWORD`, volumen de RabbitMQ, puerto interno 5672 no bloqueado |
| `redis` no llega a healthy | volumen Redis, estado del contenedor, falta de espacio en disco |
| un backend no arranca | `JWT_SECRET`, URL de DB del modulo, `RABBITMQ_URL`, logs del contenedor |
| `workspace-tooling` no corre Prisma | repo incompleto en NAS, `package-lock.json` desalineado, falta de RAM durante build |
| `prisma generate` falla | schema faltante, engine Prisma incompatible, build ARM64, variable `DATABASE_URL` mal formada |
| `migrate deploy` o `db push` falla | credenciales DB, schema incompatible, cambios destructivos; evaluar `ALLOW_DATA_LOSS=1` solo con backup |
| `app-shell` abre pero API responde 502/504 | servicio backend caido, rutas Nginx, nombre del servicio en compose, contenedor no iniciado |
| `03-smoke-test.sh` falla en un modulo | probar `curl` directo al `/health`, revisar logs del modulo y dependencias (`finanzas`, `postgres`, `rabbitmq`) |
| `contabilidad-sat-worker` cae en loop | `CONTABILIDAD_BASE_URL`, `SAT_CALLBACK_SHARED_SECRET`, `RABBITMQ_URL`, path real de `sat-worker.js` |
| build falla solo en QNAP | compatibilidad `linux/arm64`, dependencias nativas Node, engines de Prisma |
