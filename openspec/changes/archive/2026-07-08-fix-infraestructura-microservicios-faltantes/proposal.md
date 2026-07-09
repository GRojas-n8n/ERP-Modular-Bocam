## Why

Durante la preparación de pruebas de campo en vivo (2026-07-08) se detectaron cuatro
brechas de despliegue en producción que dejaban módulos con código, tests y migraciones
ya listos completamente inalcanzables o parcialmente rotos: un microservicio jamás
desplegado (`ventas`), un microservicio corriendo sin ruta de entrada (`control-proyectos`),
un microservicio sin base de datos (`seguridad`), y una integración backend-to-backend
que apuntaba a `localhost` en vez del contenedor correcto (`compras` → `gerencia-tecnica`).
Ninguna de las cuatro había sido detectada porque los contenedores mismos reportaban
`healthy` — el fallo ocurría en la capa de enrutamiento/configuración, no en el proceso.

## What Changes

- Se agrega el service block de `ventas` a `docker-compose.vps.yml` (puerto 3012, mismo
  patrón que los demás backends) — el servicio nunca había tenido contenedor propio pese
  a que `nginx.qnap.conf` ya enrutaba `/api/v1/ventas` hacia él.
- Se agrega la base de datos `bocam_ventas` (schema Prisma + políticas RLS).
- Se agrega la `location /api/v1/control-proyectos` faltante en `docker/nginx.qnap.conf`
  — el contenedor corría sano pero las peticiones del frontend caían al `index.html` del
  SPA en vez de llegar al backend.
- Se agrega la base de datos `bocam_seguridad` (schema Prisma + políticas RLS) y la
  variable `SEGURIDAD_DATABASE_URL` real en el `.env` del VPS (nunca se había configurado).
- Se agrega `GT_URL` al servicio `compras` en `docker-compose.vps.yml`, apuntando a
  `http://gerencia-tecnica:3001/...` en vez de caer al default `http://localhost:3001`
  (el propio contenedor de compras) — esto rompía silenciosamente el catálogo de insumos,
  el presupuesto activo, y el control de saldo por partida vistos desde Compras/Residencia.

## Capabilities

### New Capabilities
- `despliegue-completo-microservicios`: Todo microservicio con código, tests y migraciones
  listos debe tener (a) contenedor desplegado en `docker-compose.vps.yml`, (b) ruta de
  entrada en el reverse proxy, y (c) base de datos propia inicializada — antes de darse
  por "listo para producción".

### Modified Capabilities
(ninguna — no hay specs de negocio existentes que describan este comportamiento; es la
primera vez que se documenta la garantía de despliegue completo)

## Impact

- `docker-compose.vps.yml` — service block de `ventas`, variable `GT_URL` en `compras`
- `docker/nginx.qnap.conf` — location `/api/v1/ventas`, location `/api/v1/control-proyectos`
- VPS: bases de datos `bocam_ventas` y `bocam_seguridad` creadas (schema + RLS)
- VPS: `.env` — `SEGURIDAD_DATABASE_URL` agregada (secreto, no committeado)

## Nota SDD

*Este change se implementó y desplegó fuera del flujo SDD estándar (sin spec previo,
sin tests-first) por presión de tiempo durante pruebas de campo en vivo con usuarios
reales. Se documenta retroactivamente al cierre de la sesión, conforme al mismo
procedimiento ya usado en `fix-tenant-race-condition` (2026-06-30).*
