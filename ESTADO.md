# 🗺️ ESTADO DEL PROYECTO — ERP MODULAR BOCAM

> **Actualiza este archivo al terminar cada sesión de trabajo.**
> Al iniciar desde cualquier laptop, haz `git pull` y lee este archivo primero.

---

## ⚙️ DATOS CRÍTICOS DE PRODUCCIÓN (VPS)

| Campo | Valor |
|---|---|
| **IP VPS** | 72.60.114.12 |
| **SSH** | `ssh root@72.60.114.12` |
| **Repo en VPS** | `/root/ERP-Modular-Bocam` |
| **Rama activa VPS** | `main` |
| **Tenant ID Bocam** | `8e07a7ac-8157-4e5d-8499-e985a9fcdbfc` |
| **Admin email** | `admin@bocam.com` |
| **Admin user_id** | `35a359f1-f281-45cc-9592-e1c95be9f451` |
| **DB Name (auth)** | `bocam_auth` |
| **Compose file VPS** | `docker-compose.vps.yml` |
| **Header master endpoints** | `Authorization: Bearer <MASTER_SECRET>` (NO `x-master-secret`) |

---

## 📊 ESTADO CONSOLIDADO (sesión 2026-05-05 inicio)

### 🎯 Microservicios desplegados — 6/6 core healthy

| Módulo | Puerto | Estado | DB |
|---|---|---|---|
| `auth` | 3003 | ✅ healthy | `bocam_auth` (con tenant + admin) |
| `gerencia-tecnica` | 3001 | ✅ healthy | `bocam_gerencia_tecnica` |
| `finanzas` | 3004 | ✅ healthy | `bocam_finanzas` |
| `compras` | 3002 | ✅ healthy | `bocam_compras` |
| `control-obra` | 3005 | ✅ healthy | `bocam_control_obra` |
| `contabilidad` | 3008 | ✅ healthy | `bocam_contabilidad` |
| `app-shell` | 80 (host) | ✅ healthy, sirve frontend + reverse proxy | — |
| `contabilidad-sat-worker` | — | ⏸️ postpuesto (no hay SAT real ni stub) | — |

**Stack completo**: 6 microservicios + 3 infra (postgres, rabbitmq, redis) + app-shell = **10 containers up healthy**. Validados con `restart: unless-stopped` que sobreviven reboot del host (probado).

### Bugs encontrados y arreglados (sesiones 2026-04-30 → 2026-05-04)

1. **Header del cliente master endpoints**: el middleware lee `Authorization: Bearer <secret>`, no `x-master-secret`. Documentado en datos críticos.
2. **`packages/auth-middleware/src/middleware.ts`**: `requireProjectAccess()` rechazaba con 401 las rutas excluidas del JWT middleware previo (faltaba el `securityContext`). Fix: pasa transparente cuando no hay context (route was excluded). Sirve para todos los servicios futuros.
3. **`apps/gerencia-tecnica/src/main.ts`**: código out-of-sync con schema Prisma actual. Fix aplicado: alineado a `unidad_medida`, `costo_base`, `tipo_insumo`, `importe` (calculado en Concepto), `version` a Int, `tenant_id` y `proyecto_id` explícitos en `.create()` (RLS los exige aunque set_config esté activo). Wave 4 cerrada.
4. **`docker/Dockerfile.app-shell`**: el `COPY apps/*/package.json ./apps/` colapsaba paths y rompía resolución de workspaces npm. Cambiado a `COPY . . && npm ci`.
5. **`docker/nginx.qnap.conf`**: refactor a `resolver 127.0.0.11` + `set $upstream` para lazy DNS resolution. Arranca aunque módulos no existan.
6. **`docker-compose.vps.yml` healthchecks**: cambio de `localhost` → `127.0.0.1` explícito (alpine BusyBox-wget prefiere `::1` y crashea sin servicio IPv6).

---

## 🚧 PENDIENTES (no críticos)

### Bloqueador 3: Firewall Hostinger no aplica regla TCP 443

Reglas en panel: Accept TCP 22/80/443 + Drop Any Any. Sincronizadas. Pero 22/80 abiertos, **443 bloqueado** (timeout). Re-sync o recrear regla. **No bloquea nada hoy** — Caddy con dominio aún no levantado, app-shell sirve por 80 directo. Atender cuando se vaya a configurar TLS+dominio.

### Wave 3 (sat-worker)

Necesita decidir: ¿adapter SAT real (URLs/keys) o stub mock? Mientras tanto, los pagos registrados quedan en RabbitMQ esperando worker. No bloquea operación normal hoy.

### Caddy + dominio (TLS público)

`docker-compose.vps.yml` ya tiene servicio `caddy` definido pero `docker/Caddyfile` no existe en el repo. Cuando se decida dominio: escribir Caddyfile, levantar caddy, eliminar `ports: 80:80` de app-shell para que solo Caddy exponga 80/443.

### ~~Bloqueador 1~~ RESUELTO 2026-05-04 — fix del header
### ~~Bloqueador 2~~ RESUELTO 2026-04-30 — migración a app-shell del compose
### ~~Wave 4 deuda técnica gerencia-tecnica~~ RESUELTO 2026-05-04 EOD

### ~~Bloqueador 1~~ RESUELTO 2026-05-04 — fix del header
### ~~Bloqueador 2~~ RESUELTO 2026-04-30 — migración a app-shell del compose

✅ **nginx nativo del VPS ELIMINADO** (apt purge). `/etc/nginx/` borrado completo.
✅ **`bocam-vps-app-shell` corriendo healthy** desde compose, sirviendo frontend Vite/React + reverse proxy a microservicios via DNS docker.
✅ **Refactor del `docker/nginx.qnap.conf`**: ahora usa `resolver 127.0.0.11` + `set $upstream` para lazy DNS resolution → arranca aunque módulos no existan, devuelve 502 limpio si llega request a un upstream caído.
✅ **`docker-compose.vps.yml` modificado**: `app-shell` expone `ports: 80:80` (temporal hasta Caddy con dominio); todos los healthchecks usan `127.0.0.1` explícito (alpine BusyBox-wget prefiere `::1` y crashea).
✅ **`docker/Dockerfile.app-shell` arreglado**: el `COPY apps/*/package.json ./apps/` colapsaba paths y rompía resolución de workspaces npm. Cambiado a `COPY . . && npm ci`.
✅ **Validado E2E**: `curl http://localhost/api/v1/auth/health` devuelve `{"status":"ok",...}` proxeado a `auth:3003` por DNS docker.

**Implicación arquitectónica resuelta:** Los microservicios docker NO necesitan exponer puertos al host. Toda comunicación pública entra por `app-shell:80` (que mapea host:80) y se enruta internamente vía DNS docker. Cuando se active Caddy con dominio, eliminar `ports: 80:80` de app-shell — Caddy tomará 80/443 y enrutará a `app-shell` por DNS docker.

### Bloqueador 3: Firewall Hostinger no aplica regla TCP 443

Reglas configuradas en panel: Accept TCP 22/80/443 + Drop Any Any. Sincronizadas. Pero test desde laptop muestra 22/80 ABIERTOS y **443 bloqueado** (timeout, drop activo). Re-sync pendiente, posible glitch del panel. Si tras re-sync sigue cerrado: borrar y recrear regla 443. **No bloquea nada hoy** (Caddy con dominio aún no levantado, app-shell sirve por 80 directo).

### ~~Reboot pendiente del VPS~~ RESUELTO 2026-05-01

Aplicado el reboot el 2026-05-01. Validado: containers sobrevivieron limpios (`restart: unless-stopped` funcional). Updates posteriores aplicados al 2026-05-05 (0 pendientes hoy).

---

## 📋 ESTADO ACTUAL (2026-04-29 EOD)

### Lo que SÍ avanzó esta sesión

1. ✅ **Decisión arquitectónica:** Plan A — DB-per-service. Cada módulo tiene su propia DB (`bocam_auth`, `bocam_finanzas`, etc.). Coherente con la "Soberanía de Datos" declarada en los `schema.prisma`.
2. ✅ **`.env` del VPS actualizado** con las 6 `*_DATABASE_URL`. NOTA: el `.env` no se commitea (gitignore). El backup quedó en `/root/ERP-Modular-Bocam/.env.bak.YYYYMMDD-HHMMSS`.
3. ✅ **Auth migrado a `bocam_auth`:** `prisma db push` exitoso, contenedor healthy, `/health` responde OK.
4. ⚠️ **`bocam_ventas` aún NO eliminada** — esperando verificar que `bocam_auth` quede 100% funcional con tenant + login antes de dropear la vieja.
5. ⚠️ **Las 5 DBs nuevas (`bocam_finanzas`, `bocam_compras`, `bocam_control_obra`, `bocam_contabilidad`, `bocam_gerencia_tecnica`) aún NO existen.** Se crearán automáticamente cuando cada `prisma db push` de su servicio se ejecute (Prisma las crea si no existen y el user tiene permisos — confirmado con `bocam_auth`).
6. ✅ **Firewall Hostinger activado** con reglas Accept TCP 22/80/443 + Drop Any Any. Funcional para 22 y 80, problema con 443 (ver Bloqueador 3).
7. ✅ **Auditoría de seguridad COMPLETA: limpia.** Recibido correo de phishing CVE-2026-31431 ("Copy Fail") con comando `rmmod algif_aead`. Verificado: no se ejecutó. No hay compromiso del VPS — todos los logins SSH son desde IPs propias del usuario, llaves SSH solo las esperadas, sin procesos/crons/binarios sospechosos, sin archivos plantados.
8. ⚠️ **Descubierto nginx nativo no documentado** sirviendo app-shell. Ver Bloqueador 2.

### Hostinger preinstaló Monarx Agent (no es backdoor)

Detectado durante auditoría: hay un proceso `monarx-agent` (PID variable) corriendo y conectado a `100.21.1.170:443` (backend de Monarx Security en AWS). Es **anti-malware preinstalado por Hostinger** en sus VPS. Legítimo. No tomó acción contra el archivo nginx (logs vacíos hoy). Configuración en `/etc/monarx-agent.conf`. Cron de actualización en `/etc/cron.d/monarx-update` (lunes 22:44 UTC).

### Plan inmediato al regresar (orden recomendado)

1. **`git pull`** en VPS y laptop.
2. Verificar containers siguen healthy: `docker ps`.
3. **Wave 4: arreglar `gerencia-tecnica`** — alinear `main.ts` al schema Prisma actual (`unidad → unidad_medida`, `costo → costo_base`, `clase → tipo_insumo`, eliminar `nombre` de PresupuestoBase, agregar campo `importe` a Concepto). Idealmente con tests E2E mínimos antes de reintentar build.
4. **Wave 3: sat-worker** — decidir SAT real o stub. Si stub: implementar mock service. Si real: agregar vars al `.env` y levantar.
5. **Re-sync firewall 443** en panel Hostinger (re-test con `nc -zv 72.60.114.12 443`).
6. **Caddy + dominio**: cuando se decida dominio, levantar caddy del compose, quitar `ports: 80:80` de app-shell (ver Bloqueador 2 cerrado).
7. Aplicar 3 updates `apt` pendientes (cloud-init, docker-ce minor) — no urgentes.

### Cambios al `.env` del VPS hechos en esta sesión

```
AUTH_DATABASE_URL=postgresql://bocam_admin:****@postgres:5432/bocam_auth   (antes: bocam_ventas)
GERENCIA_TECNICA_DATABASE_URL=postgresql://bocam_admin:****@postgres:5432/bocam_gerencia_tecnica   (NUEVO)
FINANZAS_DATABASE_URL=postgresql://bocam_admin:****@postgres:5432/bocam_finanzas   (NUEVO)
COMPRAS_DATABASE_URL=postgresql://bocam_admin:****@postgres:5432/bocam_compras   (NUEVO)
CONTROL_OBRA_DATABASE_URL=postgresql://bocam_admin:****@postgres:5432/bocam_control_obra   (NUEVO)
CONTABILIDAD_DATABASE_URL=postgresql://bocam_admin:****@postgres:5432/bocam_contabilidad   (NUEVO)
```

`VENTAS_DATABASE_URL` (módulo perfil `full`) sigue apuntando a `bocam_ventas?schema=public` — cuando llegue el turno de `ventas` se reapuntará.

### Variables faltantes en `.env` del VPS (warnings de docker-compose, no bloquean ahora)

- `PERSONAL_DATABASE_URL`, `SEGURIDAD_DATABASE_URL` → perfil `full`, no necesarias para wave 1-3
- `SAT_ADAPTER_BASE_URL`, `SAT_ADAPTER_API_KEY`, `SAT_ADAPTER_TIMEOUT_MS`, `SAT_WORKER_RETRY_DELAY_MS`, `SAT_WORKER_MAX_ATTEMPTS`, `SAT_CALLBACK_SHARED_SECRET`, `CONTABILIDAD_BASE_URL` → necesarias para `contabilidad-sat-worker`. Resolver antes de Wave 3.

---

## 🏗️ INFRAESTRUCTURA BASE

| Servicio | Estado | Notas |
|---|---|---|
| VPS Hostinger | ✅ Activo | Ubuntu, Docker instalado |
| PostgreSQL (Docker) | ✅ Corriendo | `bocam-vps-postgres`, puerto interno |
| RabbitMQ (Docker) | ✅ Corriendo | `bocam-vps-rabbitmq`, credenciales en .env |
| Redis (Docker) | ✅ Corriendo | `bocam-vps-redis`, healthy desde hace 2 semanas |
| Caddy (proxy) | ⬜ Pendiente | Necesita dominio configurado |

---

## 🔐 MÓDULO AUTH (`apps/auth`)

| Tarea | Estado | Notas |
|---|---|---|
| Dockerfile.backend funcional | ✅ Listo | 5 fixes aplicados (ver historial git) |
| Build en VPS | ✅ Exitoso | Imagen `erp-modular-bocam-auth:latest` |
| Prisma db push (schema) | ✅ Aplicado | Tablas creadas en `bocam_ventas` |
| Contenedor corriendo | ✅ Healthy | Puerto 3003 interno |
| Tenant Bocam creado | ❌ Pendiente recrear | DB migrada a `bocam_auth`, vacía. Tenant viejo (`d869d55f-…`) ya no existe. |
| Admin user creado | ❌ Pendiente recrear | Bloqueado por 401 en `/master/*` (ver bloqueador) |
| Login / JWT funcionando | ⚠️ Sin tenant aún | Endpoint responde, pero no hay datos para autenticar |
| `wget` en imagen runner | ✅ Fix aplicado | Necesario para healthcheck |
| `excludeByPrefix` en middleware | ✅ Fix aplicado | Rutas `/master/*` accesibles |
| Migraciones Prisma (archivos) | ⚠️ Pendiente | Usamos `db push`; falta crear migration files |

---

## 📦 MÓDULOS BACKEND (perfil `core`)

| Módulo | Build | DB Push | Corriendo | Verificado |
|---|---|---|---|---|
| `auth` (3003) | ✅ | ✅ | ✅ | ✅ |
| `gerencia-tecnica` (3001) | ⬜ | ⬜ | ⬜ | ⬜ |
| `finanzas` (3004) | ⬜ | ⬜ | ⬜ | ⬜ |
| `compras` (3002) | ⬜ | ⬜ | ⬜ | ⬜ |
| `control-obra` (3005) | ⬜ | ⬜ | ⬜ | ⬜ |
| `contabilidad` (3008) | ⬜ | ⬜ | ⬜ | ⬜ |
| `contabilidad-sat-worker` | ⬜ | ⬜ | ⬜ | ⬜ |
| `app-shell` | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 📦 MÓDULOS BACKEND (perfil `full` — después del core)

| Módulo | Build | DB Push | Corriendo | Verificado |
|---|---|---|---|---|
| `personal` (3006) | ⬜ | ⬜ | ⬜ | ⬜ |
| `seguridad` (3007) | ⬜ | ⬜ | ⬜ | ⬜ |
| `ventas` (3012) | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 🌐 FRONTEND & PROXY

| Tarea | Estado | Notas |
|---|---|---|
| `app-shell` build | ⬜ Pendiente | Necesita URL de servicios |
| Caddyfile configurado | ⬜ Pendiente | Necesita dominio |
| Dominio DNS apuntando al VPS | ⬜ Pendiente | Hostinger DNS |
| HTTPS automático (Caddy) | ⬜ Pendiente | Depende del dominio |

---

## 🔧 FIXES APLICADOS AL CÓDIGO (historial)

| Commit | Fix | Impacto |
|---|---|---|
| `3a89414` | Copiar archivos Prisma generados a dist | Sin esto, `Cannot find module './generated/prisma'` |
| `cbb25e8` | COPY node_modules del builder en runner | Sin esto, `Cannot find module 'express'` (npm v10 bug) |
| `3cee82e` | Remover COPY de node_modules/.prisma | Sin esto, error porque engine va al output custom |
| main | `./node_modules/.bin/prisma generate` | Sin esto, npm descargaba prisma@7 (requiere Node 22) |
| main | `excludeByPrefix: true` en auth middleware | Sin esto, rutas `/master/*` bloqueadas por JWT |
| main | `wget` en runner stage de Dockerfile | Sin esto, healthcheck falla (unhealthy) |

---

## 📋 PRÓXIMOS PASOS (en orden)

1. **Ahora:** Build y db push de `gerencia-tecnica`, `finanzas`, `compras`, `control-obra`, `contabilidad`
2. Verificar que todos los módulos core levantan sin errores
3. Build de `app-shell`
4. Configurar Caddyfile con dominio o IP
5. Levantar perfil completo con `--profile core`
6. Crear archivos de migración Prisma formales (`prisma migrate dev`) para producción real
7. Módulos `full`: personal, seguridad, ventas
8. Setup nueva laptop de trabajo (clonar repo, copiar .env, instalar herramientas)

---

## 💻 REGLAS DE TRABAJO ENTRE LAPTOPS

```
ANTES de empezar a trabajar en cualquier laptop:
  1. git pull
  2. Leer este archivo (ESTADO.md)
  3. Verificar en qué rama estás: git branch

AL TERMINAR cualquier sesión de trabajo:
  1. Actualizar este archivo con lo que cambió
  2. git add ESTADO.md
  3. git commit -m "estado: [descripcion de lo que se hizo]"
  4. git push

REGLA DE ORO:
  - Cambios de CÓDIGO → laptop personal o trabajo, luego push, luego VPS hace git pull + rebuild
  - Cambios de CONFIGURACIÓN VPS (.env, docker) → directo en VPS via SSH
  - NUNCA editar .env en el repo (está en .gitignore por seguridad)
  - NUNCA hacer force push sin avisar
```

---

## 🖥️ SETUP LAPTOP DE TRABAJO (pendiente)

- [ ] Instalar Node 20 LTS
- [ ] Instalar Docker Desktop (amd64)
- [ ] Instalar Git
- [ ] `git clone git@github.com:[repo] .`
- [ ] Copiar `.env` desde laptop personal (NO via git)
- [ ] `npm install`
- [ ] Verificar que `npm run build -w @bocam/auth` compila sin errores

---

*Última actualización: 2026-05-05 inicio sesión | Estado: 6/6 microservicios core healthy + 3 infra + app-shell = 10 containers up 18h continuos. Sesión 2026-05-04 EOD cerró Wave 4 (gerencia-tecnica alineado al schema). Pendientes no críticos: firewall 443, Wave 3 sat-worker, Caddy+dominio.*
