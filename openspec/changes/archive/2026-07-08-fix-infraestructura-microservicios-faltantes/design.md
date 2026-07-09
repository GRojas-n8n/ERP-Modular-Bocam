## Context

Producción corre 12 microservicios backend + app-shell detrás de un único contenedor
`app-shell` que hace de reverse proxy (nginx) hacia cada servicio por nombre de
contenedor Docker. `docker-compose.vps.yml` y `docker/nginx.qnap.conf` son las dos
únicas fuentes de verdad de "qué está desplegado" y "qué ruta llega a dónde" —
respectivamente. Un servicio puede estar perfectamente implementado (código, tests,
migraciones) y aun así ser inalcanzable si falta en cualquiera de los dos archivos, o
si una variable de entorno de integración B2B nunca se configuró.

## Goals / Non-Goals

**Goals:**
- Detectar y cerrar las brechas puntuales encontradas (ventas, control-proyectos,
  seguridad, GT_URL de compras).
- Dejar un criterio verificable ("checklist de despliegue completo") para que la
  próxima vez que se agregue un microservicio no se repita el patrón.

**Non-Goals:**
- No se automatiza la verificación (no hay CI que corra este checklist todavía).
- No se resuelve el crash-loop de `asistente` (falta `ANTHROPIC_API_KEY`) — es una
  brecha conocida y aceptada, no parte de este change.
- No se migra el `docker/nginx.qnap.conf` a un mecanismo menos propenso a error humano
  (por ejemplo, generarlo desde `docker-compose.vps.yml`) — se deja como mejora futura.

## Decisions

- **GT_URL apunta al contenedor (`http://gerencia-tecnica:3001/...`), no a un
  service-discovery dinámico.** Alternativa considerada: usar Docker DNS con `resolver`
  como ya hace `nginx.qnap.conf` para lazy-resolution — se descartó por ser código de
  aplicación (axios), no nginx; el patrón ya establecido en el repo (`FINANZAS_URL`) usa
  URL fija por variable de entorno, se mantiene consistencia.
- **`ventas` se agrega como servicio nuevo en vez de fusionarse con otro backend.**
  Alternativa: exponer sus rutas desde otro servicio ya desplegado — se descartó porque
  rompería el aislamiento por microservicio (CLAUDE.md: "cada microservicio es
  independiente") y porque `ventas` ya tiene su propia base de datos y Prisma client
  generados esperando este paso.
- **Las bases de datos nuevas (`bocam_ventas`, `bocam_seguridad`) se crean directamente
  en el Postgres compartido del VPS, no en una instancia separada** — sigue el patrón
  existente de "una base de datos por microservicio, mismo servidor Postgres".

## Risks / Trade-offs

- [Riesgo] `nginx.qnap.conf` es un archivo plano mantenido a mano; agregar un
  microservicio requiere editarlo en 2 lugares (`docker-compose.vps.yml` +
  `nginx.qnap.conf`) y es fácil olvidar uno de los dos (como pasó aquí tres veces).
  → Mitigación aplicada: ninguna automatizada todavía; mitigación de proceso: este
  change deja documentado el patrón de verificación (ver Tasks) para revisarlo a mano
  la próxima vez.
- [Riesgo] Los healthchecks de Docker (`docker ps` → `healthy`) no detectan estas
  brechas porque el proceso interno del contenedor arranca bien — el fallo está en la
  capa de red/ruteo externa al contenedor.
  → Mitigación: se verificó cada caso con requests HTTP reales de extremo a extremo
  (`curl` con JWT válido contra `https://iretum.com`), no solo con el estado del
  contenedor.
- [Riesgo] `GT_URL` faltante llevaba tiempo indeterminado sin detectarse (posiblemente
  desde que se implementó la integración) porque el error queda enterrado en un 502
  con `parcial: true`, silencioso para el usuario final.
  → Mitigación: no aplicada en este change (fuera de alcance); queda como brecha
  conocida que otros `*_URL` de integración B2B podrían tener el mismo problema y
  ameritan una auditoría futura.

## Migration Plan

1. Commit + push de `docker-compose.vps.yml` y `docker/nginx.qnap.conf`.
2. En el VPS: `git pull`, rebuild de imágenes afectadas (`workspace-tooling`, `compras`,
   `ventas`, `app-shell`).
3. Crear bases de datos nuevas (`CREATE DATABASE`), aplicar `prisma db push` +
   `rls-policies.sql` por servicio nuevo.
4. Agregar variables de entorno reales al `.env` del VPS (no committeadas).
5. `docker compose up -d --force-recreate` de los servicios afectados.
6. Verificación end-to-end vía curl con JWT real para cada ruta antes fallida.

**Rollback:** revertir el commit de `docker-compose.vps.yml`/`nginx.qnap.conf` y volver
a desplegar; las bases de datos nuevas no afectan a las existentes si se dejan creadas
sin usar (no destructivo).

## Open Questions

- ¿Se debe formalizar un checklist/script de "microservicio nuevo listo para producción"
  que valide automáticamente la presencia en ambos archivos + la base de datos? No
  resuelto en este change.
