# Hito 69 - QNAP perfiles de despliegue y montaje paso a paso

## Objetivo

Hacer mas ejecutable el montaje real en QNAP, permitiendo subir el stack por fases en lugar de intentar levantar todo desde el primer minuto.

## Cambios realizados

### 1. Perfiles de despliegue en `docker-compose.qnap.yml`

Se agregaron perfiles:

- `core`
- `full`
- `tools` (ya existente para `workspace-tooling`)

#### `core`

Levanta el nucleo funcional para pruebas internas:

- `auth`
- `gerencia-tecnica`
- `finanzas`
- `compras`
- `control-obra`
- `contabilidad`
- `contabilidad-sat-worker`
- `app-shell`

#### `full`

Amplia el stack con:

- `personal`
- `seguridad`

Esto permite validar primero el flujo operativo principal y luego incorporar modulos adicionales sin castigar de entrada al NAS.

### 2. Arranque por fases

El script [`scripts/qnap/01-start-stack.sh`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/01-start-stack.sh) ahora acepta:

```sh
STACK_PROFILE=core
STACK_PROFILE=full
```

Por defecto usa `core`.

### 3. Dependencias del shell

`app-shell` dejo de depender del arranque inmediato de `personal` y `seguridad`, para permitir un primer despliegue mas pequeno y controlado. Las rutas siguen existiendo en proxy, pero esos modulos se pueden incorporar despues.

## Montaje recomendado en el QNAP

### Fase 1. Preparacion del NAS

1. Actualizar firmware estable de QNAP.
2. Instalar Container Station.
3. Crear carpeta o volumen para:
   - stack del proyecto
   - datos persistentes
   - backups
4. Copiar el repositorio al NAS.
5. Crear `.env.qnap` a partir de `.env.qnap.example`.

### Fase 2. Primer arranque

```sh
STACK_PROFILE=core sh scripts/qnap/01-start-stack.sh
sh scripts/qnap/02-init-datastores.sh
sh scripts/qnap/03-smoke-test.sh
```

## Checklist exacta de primer boot

### Antes de correr nada

1. Verificar que el QNAP ya tiene Container Station operativo.
2. Verificar acceso remoto funcional:
   - VPN o red corporativa
   - SSH habilitado
3. Verificar espacio libre suficiente para imagenes y volumenes.
4. Copiar el repositorio completo al NAS.
5. Crear `.env.qnap` desde `.env.qnap.example`.
6. Reemplazar todos los placeholders `CAMBIA_...`.
7. Confirmar que `QNAP_APP_PORT` no choque con otro servicio del NAS.

### Validacion previa

```sh
docker compose -f docker-compose.qnap.yml --env-file .env.qnap --profile core config
```

Si esta validacion falla, no seguir al arranque.

### Primer boot recomendado

```sh
STACK_PROFILE=core sh scripts/qnap/01-start-stack.sh
sh scripts/qnap/02-init-datastores.sh
sh scripts/qnap/03-smoke-test.sh
```

### Verificacion posterior

1. Entrar al shell por navegador.
2. Confirmar que responden los `/health` del nucleo.
3. Revisar consumo de RAM/CPU del NAS.
4. Confirmar que PostgreSQL y RabbitMQ no estan reiniciando.
5. Solo despues considerar ampliar a `full`.

### Fase 3. Ampliacion

Cuando el nucleo ya este sano:

```sh
STACK_PROFILE=full sh scripts/qnap/01-start-stack.sh
sh scripts/qnap/03-smoke-test.sh
```

## Criterio operativo

- `core` es el punto de entrada recomendado para el TS-832PX
- `full` se usa cuando la empresa ya quiera validar RRHH y Seguridad tambien
- no conviene arrancar todo a ciegas en el primer intento

## Tabla de diagnostico rapido: si falla X, revisar Y

| Si falla X | Revisar Y |
| --- | --- |
| El compose no valida | `.env.qnap`, variables faltantes, YAML roto, perfil equivocado |
| `postgres` no queda healthy | credenciales, volumen persistente, permisos del volumen |
| `rabbitmq` no queda healthy | usuario/password RMQ, volumen, estado de disco |
| `redis` no queda healthy | volumen Redis, memoria/disco disponible |
| Un servicio backend no levanta | `JWT_SECRET`, URL de DB del modulo, `RABBITMQ_URL`, logs del contenedor |
| `compras` o `control-obra` no levantan | que `finanzas` si haya iniciado, `FINANZAS_URL` correcto |
| `app-shell` da error o pantalla vacia | `app-shell` arriba, proxy Nginx, backend principal no disponible |
| Falla `02-init-datastores.sh` | conectividad DB, Prisma, schema del modulo, falta de RAM durante tooling |
| Falla `03-smoke-test.sh` | probar el `/health` puntual y revisar logs del servicio correspondiente |
| Falla solo en QNAP pero no local | compatibilidad ARM64, Prisma engines, dependencias nativas |
| `contabilidad-sat-worker` reinicia | `CONTABILIDAD_BASE_URL`, callback secret, RabbitMQ, build de `sat-worker` |

## Comandos de apoyo recomendados

```sh
docker compose -f docker-compose.qnap.yml --env-file .env.qnap ps
docker compose -f docker-compose.qnap.yml --env-file .env.qnap logs -f finanzas
docker compose -f docker-compose.qnap.yml --env-file .env.qnap logs -f compras
docker compose -f docker-compose.qnap.yml --env-file .env.qnap logs -f contabilidad
docker stats
```

## Cumplimiento arquitectonico

- No se mezclaron datos entre modulos
- Se mantiene la separacion por servicios y contratos de red
- El enfoque por fases reduce riesgo operativo sin deformar la arquitectura SaaS multi-tenant

## Siguiente paso recomendado

Ejecutar la primera corrida real en el NAS y medir consumo de RAM/CPU del perfil `core` antes de ampliar a `full`.
