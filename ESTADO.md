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

## 🚧 BLOQUEADOR ACTIVO (retomar aquí en la próxima sesión)

**Síntoma:** `POST /api/v1/master/tenants` con header `x-master-secret: $MASTER_SECRET` devuelve `401 MASTER_UNAUTHORIZED` aunque:
- `printenv MASTER_SECRET` dentro del contenedor auth = `bocam-master-2026-cambia-esto` (29 chars)
- `grep ^MASTER_SECRET .env` en VPS = mismo valor visualmente
- Bash `${#MASTER_SECRET}` = 29
- Force-recreate del contenedor ya hecho, sigue 401

**Hipótesis principal:** CRLF (`\r`) invisible en `.env` del VPS contaminando la variable. El proceso auth la cargó con `\r` al final, pero el header llega sin `\r` (o viceversa) → string compare falla.

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

### Plan inmediato al regresar (orden estricto)

1. Resolver bloqueador 401 → crear tenant Bocam → crear admin → verificar login.
2. Drop `bocam_ventas` (`docker exec bocam-vps-postgres psql -U bocam_admin -d postgres -c "DROP DATABASE bocam_ventas;"`).
3. **Wave 1** (paralelo, independientes): build + db push + up de `gerencia-tecnica`, `finanzas`, `contabilidad`.
4. **Wave 2**: `compras`, `control-obra` (dependen de finanzas healthy).
5. **Wave 3**: `contabilidad-sat-worker` (necesita variables `SAT_*` y `CONTABILIDAD_BASE_URL` que aún faltan en `.env` — preguntar al regresar si ya tenemos adapter SAT real o usaremos stub).
6. Verificación cross-service (`/health` de los 6).
7. App-shell + Caddy (después).

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

*Última actualización: 2026-04-29 EOD | Sesión: Migración Plan A (DB-per-service). Auth migrado a `bocam_auth`. Bloqueado en 401 master endpoint — retomar con diagnóstico CRLF.*
