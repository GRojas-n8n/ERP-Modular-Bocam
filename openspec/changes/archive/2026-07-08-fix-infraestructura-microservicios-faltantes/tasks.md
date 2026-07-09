## 1. Diagnóstico

- [x] 1.1 Detectar que `bocam-vps-asistente` crash-looping y revisar el resto de
      contenedores en el VPS (`docker ps`) — todos `healthy` salvo asistente
- [x] 1.2 Detectar que no existe service block `ventas` en `docker-compose.vps.yml`
      pese a que `nginx.qnap.conf` ya enruta `/api/v1/ventas`
- [x] 1.3 Detectar que `bocam_seguridad` y `bocam_ventas` no existen como bases de
      datos en el Postgres del VPS (`SELECT datname FROM pg_database`)
- [x] 1.4 Detectar que `docker/nginx.qnap.conf` no tiene `location /api/v1/control-proyectos`
      pese a que el contenedor corre sano
- [x] 1.5 Detectar que `compras` no tiene `GT_URL` configurado — cae al default
      `http://localhost:3001` (el propio contenedor) causando 502 en catálogo de
      insumos, presupuesto activo y saldo de partida

## 2. Fix: seguridad (base de datos faltante)

- [x] 2.1 Crear base de datos `bocam_seguridad`
- [x] 2.2 Aplicar `prisma db push --schema apps/seguridad/prisma/schema.prisma`
- [x] 2.3 Aplicar `apps/seguridad/prisma/rls-policies.sql`
- [x] 2.4 Agregar `SEGURIDAD_DATABASE_URL` real al `.env` del VPS (backup de `.env`
      previo tomado antes de editar)
- [x] 2.5 Recrear contenedor `seguridad` y verificar `docker inspect` → healthy
- [x] 2.6 Verificar con curl + JWT real: `GET /api/v1/seguridad/incidentes` →
      pasó de error de conexión a `403 AUTH_PROJECT_REQUIRED` (esperado, sin
      proyecto activo en ese momento)

## 3. Fix: ventas (microservicio nunca desplegado)

- [x] 3.1 Crear base de datos `bocam_ventas`
- [x] 3.2 Aplicar `prisma db push --schema apps/ventas/prisma/schema.prisma`
- [x] 3.3 Aplicar `apps/ventas/prisma/rls-policies.sql`
- [x] 3.4 Agregar service block `ventas` a `docker-compose.vps.yml` (puerto 3012,
      mismo patrón que los demás backends: `PORT`, `JWT_SECRET`, `DATABASE_URL`,
      `VENTAS_DATABASE_URL`, `RABBITMQ_URL`, healthcheck, `depends_on` postgres+rabbitmq)
- [x] 3.5 Build + deploy del contenedor `ventas`, verificar `healthy`
- [x] 3.6 Verificar con curl + JWT real: `GET /api/v1/ventas/clientes` → `200 {"success":true,"data":[]}`

## 4. Fix: control-proyectos (sin ruta nginx)

- [x] 4.1 Agregar `location = /api/v1/control-proyectos/health` y
      `location /api/v1/control-proyectos` a `docker/nginx.qnap.conf`
- [x] 4.2 Rebuild + redeploy de `app-shell`
- [x] 4.3 Verificar con curl + JWT real: `GET /api/v1/control-proyectos/health` →
      `200 {"status":"ok","service":"control-proyectos","port":"3013"}`

## 5. Fix: GT_URL de compras

- [x] 5.1 Agregar `GT_URL: http://gerencia-tecnica:3001/api/v1/gerencia-tecnica` al
      service block de `compras` en `docker-compose.vps.yml`
- [x] 5.2 Agregar dependencia `gerencia-tecnica: condition: service_healthy` a
      `compras` para evitar condición de carrera al arrancar
- [x] 5.3 Rebuild + redeploy de `compras`, verificar `docker exec ... printenv GT_URL`
- [x] 5.4 Verificar con curl + JWT real: `GET /api/v1/compras/catalog/insumos` →
      `200` con el insumo real (`AFG004 — SOLVENTE DIELECTRICO`) que antes no
      aparecía ("Insumo no encontrado en catálogo" en la UI)

## 6. Cierre

- [x] 6.1 Commits: `e052e8a` (control-proyectos), `32411dd` (GT_URL), commits de
      despliegue de seguridad/ventas de la misma sesión (`14a7cc6`, `08dd1e1`)
- [x] 6.2 Sincronizar el checkout de git del VPS con lo pusheado (evitar drift entre
      lo desplegado por scp/ssh directo y lo committeado)

## Nota sobre tests

**No se escribieron tests automatizados para este change.** La verificación se hizo
100% manual contra producción real (`curl` con JWT válido vía `https://iretum.com`,
consultas SQL directas para confirmar bases de datos/variables). Es infraestructura de
despliegue (docker-compose, nginx, variables de entorno) — no hay lógica de aplicación
nueva que unit-testear; el "test" apropiado sería un script de verificación de
despliegue (ver Open Questions en design.md), pendiente para un change futuro.
