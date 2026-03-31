# Checkpoint: Stack QNAP de preproduccion interna

**Fecha:** 2026-03-19  
**Responsable:** Codex  
**Estado:** Base de despliegue preparada

---

## 1. Objetivo

Preparar la base real de despliegue del sistema completo en un **QNAP TS-832PX** para uso interno de preproduccion, sin depender de VPS todavia.

---

## 2. Lo que se agrego

### Capa Docker / QNAP

Se agregaron:

- [docker-compose.qnap.yml](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker-compose.qnap.yml)
- [.env.qnap.example](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.env.qnap.example)
- [.dockerignore](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.dockerignore)

### Dockerfiles genericos para monorepo

Se agregaron:

- [docker/Dockerfile.backend](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/Dockerfile.backend)
- [docker/Dockerfile.app-shell](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/Dockerfile.app-shell)
- [docker/backend-entrypoint.sh](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/backend-entrypoint.sh)

### Proxy del shell

Se agrego una configuracion QNAP / monorepo mas completa:

- [docker/nginx.qnap.conf](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/nginx.qnap.conf)

Esta ya enruta:

- `auth`
- `gerencia-tecnica`
- `compras`
- `finanzas`
- `control-obra`
- `personal`
- `seguridad`
- `contabilidad`

---

## 3. Decision tecnica importante

No se uso el patron viejo de `build.context` por app.

Se adopto una estrategia de **build desde la raiz del monorepo**, porque varios modulos backend compilan contra:

- `packages/auth-middleware`
- `packages/event-bus`
- `packages/observability`
- `packages/tenant-idempotency`

Eso hace que el enfoque correcto para QNAP sea:

- contexto raiz
- Dockerfiles genericos por tipo de servicio
- compose del sistema completo

---

## 4. Servicios contemplados en el stack QNAP

### Infraestructura

- `postgres`
- `redis`
- `rabbitmq`

### Aplicacion

- `auth`
- `gerencia-tecnica`
- `compras`
- `finanzas`
- `control-obra`
- `personal`
- `seguridad`
- `contabilidad`
- `contabilidad-sat-worker`
- `app-shell`

---

## 5. Validacion realizada

Se valido sintaxis del compose con:

```powershell
docker compose -f docker-compose.qnap.yml --env-file .env.qnap.example config
```

Resultado:

- el compose resolvio correctamente
- se corrigio el warning de `version:` obsoleta

Avisos residuales observados en la maquina local:

- warning de acceso a `~/.docker/config.json`

Ese warning es del entorno local del CLI Docker y **no invalida** el compose.

---

## 6. Alcance real de este hito

Este hito deja lista la **base de despliegue interna** para el NAS, pero aun no significa que el sistema completo ya este probado fin a fin en ARM64.

Todavia falta validar en ejecucion real:

- build por servicio en `linux/arm64`
- generacion Prisma por modulo dentro del pipeline Docker
- arranque real del `sat-worker`
- flujo de migraciones / `db push`
- comportamiento de memoria en el TS-832PX

---

## 7. Siguiente paso recomendado

El siguiente paso con mas valor ahora es:

1. construir las imagenes QNAP localmente o en el NAS
2. levantar `postgres`, `rabbitmq`, `redis`
3. construir y arrancar primero:
   - `auth`
   - `gerencia-tecnica`
   - `finanzas`
   - `compras`
   - `app-shell`
4. validar login, dashboard y flujo `Compras -> Finanzas`
5. despues incorporar:
   - `control-obra`
   - `personal`
   - `seguridad`
   - `contabilidad`
   - `contabilidad-sat-worker`

---

## 8. Conclusión

El repositorio ya no depende de una idea abstracta de despliegue en QNAP.  
Ahora existe una **capa concreta de preproduccion interna** orientada al TS-832PX, basada en Docker, con stack completo, proxy unificado y estrategia coherente con el monorepo real.
