# Hito 70 - QNAP checklist de primer boot y troubleshooting

## Objetivo

Dejar una guia operativa exacta para la primera corrida real en QNAP y una tabla de diagnostico rapido que evite depender de ensayo y error durante acceso remoto.

## Entregables

### 1. Checklist exacta de primer boot

Se agrego en:

- [`scripts/qnap/README.md`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/README.md)
- [`2026-03-19-Hito-69-QNAP-Perfiles-y-Montaje-Paso-a-Paso.md`](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docs/checkpoints/2026-03-19-Hito-69-QNAP-Perfiles-y-Montaje-Paso-a-Paso.md)

La checklist cubre:

- prerequisitos de NAS
- preparacion de `.env.qnap`
- validacion previa del compose
- orden real del primer boot
- verificacion posterior antes de ampliar a `full`

### 2. Tabla de “si falla X, revisar Y”

Se agrego una tabla de diagnostico rapido para los fallos mas probables:

- compose invalido
- `postgres`, `redis`, `rabbitmq` sin health
- servicios backend caidos
- fallos Prisma
- `app-shell` con errores de proxy
- problemas ARM64
- reinicios del worker SAT

### 3. Comandos de apoyo

Tambien se dejaron comandos concretos para:

- revisar estado de contenedores
- seguir logs por modulo
- medir consumo con `docker stats`

## Criterio de uso recomendado

Para la primera corrida real en el QNAP:

```sh
docker compose -f docker-compose.qnap.yml --env-file .env.qnap --profile core config
STACK_PROFILE=core sh scripts/qnap/01-start-stack.sh
sh scripts/qnap/02-init-datastores.sh
sh scripts/qnap/03-smoke-test.sh
```

Solo despues de eso conviene evaluar:

```sh
STACK_PROFILE=full sh scripts/qnap/01-start-stack.sh
```

## Resultado

El montaje en QNAP ya no depende solo de compose y scripts sueltos; ahora tambien tiene un procedimiento claro de primer boot y una base de troubleshooting rapido para operacion remota.

## Siguiente paso recomendado

Ejecutar la primera corrida real en el TS-832PX y registrar:

- consumo de RAM en `core`
- tiempo de build por imagen
- modulos que fallen por ARM64
- salud del worker SAT
