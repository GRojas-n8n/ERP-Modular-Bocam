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
| **Tenant ID Bocam** | `d869d55f-4017-41e4-9680-65eaa44bdcf0` |
| **Admin email** | `admin@bocam.com` |
| **DB Name** | `bocam_ventas` (en postgres Docker) |
| **Compose file VPS** | `docker-compose.vps.yml` |

---

## 🏗️ INFRAESTRUCTURA BASE

| Servicio | Estado | Notas |
|---|---|---|
| VPS Hostinger | ✅ Activo | Ubuntu, Docker instalado |
| PostgreSQL (Docker) | ✅ Corriendo | `bocam-vps-postgres`, puerto interno |
| RabbitMQ (Docker) | ✅ Corriendo | `bocam-vps-rabbitmq`, credenciales en .env |
| Redis (Docker) | ⬜ No levantado | Necesario para personal/seguridad |
| Caddy (proxy) | ⬜ Pendiente | Necesita dominio configurado |

---

## 🔐 MÓDULO AUTH (`apps/auth`)

| Tarea | Estado | Notas |
|---|---|---|
| Dockerfile.backend funcional | ✅ Listo | 5 fixes aplicados (ver historial git) |
| Build en VPS | ✅ Exitoso | Imagen `erp-modular-bocam-auth:latest` |
| Prisma db push (schema) | ✅ Aplicado | Tablas creadas en `bocam_ventas` |
| Contenedor corriendo | ✅ Healthy | Puerto 3003 interno |
| Tenant Bocam creado | ✅ Creado | ID: `d869d55f-4017-41e4-9680-65eaa44bdcf0` |
| Admin user creado | ✅ Creado | `admin@bocam.com` |
| Login / JWT funcionando | ✅ Verificado | Access + refresh token OK |
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

*Última actualización: 2026-04-29 | Sesión: VPS auth deployment completo*
