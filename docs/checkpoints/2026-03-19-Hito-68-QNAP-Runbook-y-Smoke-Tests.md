# Hito 68 - QNAP Runbook, Prisma y Smoke Tests

## Objetivo

Cerrar la capa operativa minima para usar el stack QNAP como preproduccion interna repetible, sin depender de pasos manuales ambiguos.

## Cambios realizados

### 1. Imagen de tooling para Prisma y tareas de workspace

Se agrego [`docker/Dockerfile.tooling`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/Dockerfile.tooling) y el servicio `workspace-tooling` en [`docker-compose.qnap.yml`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker-compose.qnap.yml).

Esto permite ejecutar `prisma generate`, `migrate deploy` y `db push` contra el monorepo completo, usando dependencias de desarrollo, sin contaminar los contenedores runtime.

### 2. Runbook operativo por fases

Se agregaron scripts en [`scripts/qnap/`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/):

- [`01-start-stack.sh`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/01-start-stack.sh)
- [`02-init-datastores.sh`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/02-init-datastores.sh)
- [`03-smoke-test.sh`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/03-smoke-test.sh)
- [`README.md`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/README.md)

El orden operativo queda asi:

1. Infraestructura: `postgres`, `redis`, `rabbitmq`
2. Tooling de workspace
3. Backend por modulos
4. `app-shell`
5. Inicializacion Prisma por modulo
6. Smoke test HTTP

### 3. Estrategia Prisma explicita

Se dejo documentada y automatizada la estrategia real del repo:

- `gerencia-tecnica` usa `prisma migrate deploy`
- `auth`, `compras`, `finanzas`, `control-obra`, `contabilidad`, `personal` y `seguridad` usan `prisma db push`

La razon es objetiva: hoy solo `gerencia-tecnica` tiene carpeta `prisma/migrations` consolidada en el repositorio.

El script soporta `ALLOW_DATA_LOSS=1` para cambios destructivos en esta fase interna controlada, pero no lo activa por defecto.

### 4. Smoke test real por modulo

El smoke test usa exclusivamente endpoints `/health` reales del sistema:

- `/api/v1/auth/health`
- `/api/v1/gerencia-tecnica/health`
- `/api/v1/compras/health`
- `/api/v1/finanzas/health`
- `/api/v1/control-obra/health`
- `/api/v1/personal/health`
- `/api/v1/seguridad/health`
- `/api/v1/contabilidad/health`

## Cumplimiento arquitectonico

- Se mantiene la separacion modular; no se introdujeron joins entre modulos.
- La inicializacion por modulo respeta la soberania de cada schema Prisma.
- No se embebieron credenciales nuevas; todo sigue dependiendo de `.env.qnap`.
- La estrategia es coherente con el uso del QNAP como preproduccion interna, no como SaaS comercial final.

## Uso recomendado

```sh
cp .env.qnap.example .env.qnap
sh scripts/qnap/01-start-stack.sh
sh scripts/qnap/02-init-datastores.sh
sh scripts/qnap/03-smoke-test.sh
```

Si un `db push` posterior requiere aceptar cambios destructivos:

```sh
ALLOW_DATA_LOSS=1 sh scripts/qnap/02-init-datastores.sh
```

## Siguiente paso recomendado

Probar construccion y arranque reales en `linux/arm64` sobre el TS-832PX, especialmente para validar Prisma engines y el `contabilidad-sat-worker`.
