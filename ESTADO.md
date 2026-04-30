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
| **Tenant ID Bocam** | ⚠️ Pendiente recrear (ver sección bloqueador) |
| **Admin email** | `admin@bocam.com` (pendiente recrear) |
| **DB Name (auth)** | `bocam_auth` (migrado desde `bocam_ventas` el 2026-04-29) |
| **Compose file VPS** | `docker-compose.vps.yml` |

---

## 🚧 BLOQUEADORES ACTIVOS (retomar aquí en la próxima sesión)

### Bloqueador 1: 401 en endpoints `/api/v1/master/*` de auth

**Síntoma:** `POST /api/v1/master/tenants` con header `x-master-secret: $MASTER_SECRET` devuelve `401 MASTER_UNAUTHORIZED` aunque:
- `printenv MASTER_SECRET` dentro del contenedor auth = `bocam-master-2026-cambia-esto` (29 chars)
- `grep ^MASTER_SECRET .env` en VPS = mismo valor visualmente
- Bash `${#MASTER_SECRET}` = 29
- Force-recreate del contenedor ya hecho, sigue 401
- Probado con `wget` y con `node http.request` directo, mismo resultado

**Hipótesis principal:** CRLF (`\r`) invisible en `.env` del VPS contaminando la variable. El proceso auth la cargó con `\r` al final, pero el header llega sin `\r` (o viceversa) → string compare falla.

### Bloqueador 2: nginx nativo con config vacía (NO hacer reload)

**Descubrimiento NO documentado antes:** existe un `nginx` **nativo del VPS** (no docker) corriendo desde Apr 28, sirviendo el app-shell ya buildeado en `http://localhost:80`. Este nginx **no estaba mencionado en ESTADO.md** y no es parte del `docker-compose.vps.yml` (que define un Caddy en docker que aún no se ha levantado).

**Estado actual del nginx nativo:**
- Servicio activo, healthy, escuchando en :80
- Sirve correctamente el HTML del App Shell desde memoria
- **MIS configs en disco están vacías:** `/etc/nginx/sites-available/bocam-erp` fue truncado a 0 bytes hoy 2026-04-30 15:39 UTC. Causa desconocida (Monarx descartado: sus logs no muestran actividad). Posible accidente humano de sesión previa o script no documentado.
- `nginx -T` no muestra ningún `server { listen 80 ... }` en disco
- **Si nginx hace reload o reinicia, el app-shell se cae.**

**Document root identificado:** `/var/www/bocam-erp/dist/` (index.html + assets ya buildeados están a salvo en disco). Backup defensivo creado en `/root/backup-2026-04-30/dist/`.

**Plan de reconstrucción mañana** (copiar este server block a `/etc/nginx/sites-available/bocam-erp` y `nginx -s reload`):

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /var/www/bocam-erp/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy a auth (puerto interno docker)
    location /api/v1/auth/ {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Master endpoints
    location /api/v1/master/ {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

NOTA: la lista de `location` para los demás módulos (`/api/v1/finanzas/`, `/api/v1/compras/`, etc.) hay que añadirla cuando levantemos cada wave. Para que el reverse proxy a docker funcione, **postgres ya tiene `0.0.0.0:5432` mapeado al host**, pero los módulos NO. Si no exponemos sus puertos al host, nginx nativo no los puede llamar. Decisión arquitectónica: o exponer puertos de cada microservicio al host, **o moverse al Caddy del compose (mismo network docker, no requiere exponer puertos)**. Recomendación: ahora que toca decidir, ir al Caddy del compose (más limpio, no requiere puertos al host).

### Bloqueador 3: Firewall Hostinger no aplica regla TCP 443

Reglas configuradas en panel: Accept TCP 22/80/443 + Drop Any Any. Sincronizadas. Pero test desde laptop muestra 22/80 ABIERTOS y **443 bloqueado** (timeout, drop activo). Re-sync pendiente, posible glitch del panel. Si tras re-sync sigue cerrado: borrar y recrear regla 443.

**Test pendiente para confirmar (ejecutar en VPS al reanudar):**

```bash
cd /root/ERP-Modular-Bocam
echo "=== Local bash ==="
echo -n "$MASTER_SECRET" | xxd | head -3
echo "=== Contenedor PID 1 (auth) ==="
docker exec bocam-vps-auth sh -c 'cat /proc/1/environ | tr "\0" "\n" | grep ^MASTER_SECRET' | xxd | head -3
echo "=== .env raw ==="
grep ^MASTER_SECRET .env | xxd | head -3
```

Si aparece `0d` (= `\r`) al final del valor en cualquier lado:

```bash
sed -i 's/\r$//' .env
docker compose -f docker-compose.vps.yml --profile core up -d --force-recreate auth
sleep 25
# Reintentar create tenant via node http.request (usando process.env.MASTER_SECRET)
```

**Si no es CRLF**, segundo sospechoso: caracteres no-ASCII en el secret, o `MASTER_SECRET` shadowed por algún wrapper. Vector alternativo:
- Agregar `console.log('MS bytes:', Buffer.from(MASTER_SECRET).toString('hex'))` temporalmente en `apps/auth/src/main.ts` antes del middleware y comparar con bytes del header recibido.

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

### Plan inmediato al regresar (orden estricto)

1. **Reconstruir `/etc/nginx/sites-available/bocam-erp`** con el server block del Bloqueador 2. Verificar `nginx -t` antes de `systemctl reload nginx`. Mientras tanto, app-shell sigue sirviéndose desde memoria — no urgente pero hacer ANTES de cualquier reboot del VPS.
2. **Resolver bloqueador 401** → diagnóstico CRLF con `xxd` → `sed -i 's/\r$//' .env` si aplica → force-recreate auth → crear tenant Bocam → crear admin → verificar login.
3. **Re-sync firewall Hostinger** para regla 443 → re-test puerto.
4. **Decisión arquitectónica:** ¿nginx nativo o Caddy del compose?
   - **Recomendación**: migrar a Caddy del compose (mejor aislamiento docker, no requiere exponer puertos al host)
   - Si se mantiene nginx nativo: hay que exponer puertos host de cada microservicio docker (3001, 3002, 3004, 3005, 3008) — antipatrón
5. Drop `bocam_ventas` (`docker exec bocam-vps-postgres psql -U bocam_admin -d postgres -c "DROP DATABASE bocam_ventas;"`).
6. **Wave 1** (paralelo, independientes): build + db push + up de `gerencia-tecnica`, `finanzas`, `contabilidad`.
7. **Wave 2**: `compras`, `control-obra` (dependen de finanzas healthy).
8. **Wave 3**: `contabilidad-sat-worker` (necesita variables `SAT_*` y `CONTABILIDAD_BASE_URL` que aún faltan en `.env` — preguntar al regresar si ya tenemos adapter SAT real o usaremos stub).
9. Verificación cross-service (`/health` de los 6).
10. Caddy/proxy oficial + dominio (después).

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

*Última actualización: 2026-04-30 EOD | Sesión: Migración Plan A + activación firewall Hostinger + auditoría seguridad por phishing CVE-2026-31431 (limpia) + descubrimiento nginx nativo no documentado. 3 bloqueadores documentados con plan de retomada.*
