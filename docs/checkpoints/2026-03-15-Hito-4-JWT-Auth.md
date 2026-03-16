# 🏁 Checkpoint: Hito 4 — Autenticación JWT Real y RBAC
 
**Fecha:** 2026-03-15
**Estado:** ✅ OPERATIVO — Login JWT verificado, aislamiento de tenant confirmado, seed sembrado, RLS aplicado
**Responsable:** Antigravity (Arquitecto AI)

---

## 🚀 1. Resumen del Hito
Se ha reemplazado **por completo** el sistema de autenticación simulado (headers manuales `x-tenant-id`, `x-proyecto-id`) por un flujo de **JWT Real con firma criptográfica**, cumpliendo con la directiva de la Visión Arquitectónica: *"Gestión de Identidad Centralizada (SSO)"*.

### Antes (Inseguro) ❌
```
Frontend → Header: x-tenant-id: uuid → Backend confía ciegamente
```

### Ahora (Seguro) ✅
```
Frontend → POST /auth/login → JWT firmado → Authorization: Bearer <token>
Backend → Verifica firma → Extrae tenant_id del payload verificado → RLS
```

---

## 🏗️ 2. Componentes Creados

### A. `apps/auth/` — Microservicio de Autenticación (Puerto 3003)
- **Schema Prisma:** Tenant, Proyecto, User, UserProjectAccess, RefreshToken
- **Endpoints:** login, register, refresh, me, switch-project
- **Seguridad:** bcrypt (cost-factor 12), SHA-256 para refresh tokens, rotación obligatoria
- **RLS Policies:** Aislamiento completo por tenant_id

### B. `packages/auth-middleware/` — Middleware JWT Compartido
- `createAuthMiddleware()`: Verificación de firma + extracción de SecurityContext
- `requireRoles()`: Control de acceso por rol (RBAC)
- `requireProjectAccess()`: Verificación de acceso a centros de costos
- Tipos exportados: `SecurityContext`, `JwtPayload`, `AuthMiddlewareOptions`

### C. Módulos Actualizados
- **Gerencia Técnica:** `main.ts` ahora usa `req.securityContext` del JWT verificado
- **Compras:** `main.ts` reemplazó `contextHandler` de headers por JWT middleware
- **App Shell:** Login real, API client con Bearer token + auto-refresh en 401

---

## 📝 3. Archivos Críticos

| Archivo | Rol |
|:---|:---|
| `apps/auth/src/main.ts` | Servicio de autenticación completo |
| `apps/auth/prisma/schema.prisma` | Modelo de identidad (Users, Tokens, RBAC) |
| `apps/auth/prisma/seed.ts` | 4 usuarios de prueba con roles diferenciados |
| `apps/auth/prisma/rls-policies.sql` | Políticas RLS para tablas de auth |
| `packages/auth-middleware/src/middleware.ts` | Middleware JWT compartido |
| `packages/auth-middleware/src/types.ts` | Contratos de seguridad |
| `apps/app-shell/src/views/LoginView.tsx` | Pantalla de login |
| `apps/app-shell/src/lib/api.ts` | Cliente API con Bearer + auto-refresh |
| `apps/app-shell/src/context/TenantContext.tsx` | Auth context real |

---

## 🛠️ 4. Guía de Activación (VERIFICADA ✅)

> **NOTA:** Estos pasos ya fueron ejecutados el 2026-03-15. Solo repetir si se recrea el entorno.

### Paso 1: Instalar dependencias
```bash
cd apps/auth && npm install
cd ../../packages/auth-middleware && npm install
```

### Paso 2: Docker (si no está corriendo)
```bash
docker-compose up -d
```

### Paso 3: Crear schema separado + sincronizar tablas
```bash
# Crear el schema 'auth' (soberanía de datos por módulo)
docker exec -i bocam-postgres psql -U postgres -d bocam_erp -c "CREATE SCHEMA IF NOT EXISTS auth;"

# Sincronizar tablas (usa db push, NO migrate dev — evita conflictos con otros módulos)
cd apps/auth
npx prisma generate
npx prisma db push
```

### Paso 4: Aplicar RLS (PowerShell)
```powershell
Get-Content "apps\auth\prisma\rls-policies.sql" | docker exec -i bocam-postgres psql -U postgres -d bocam_erp
```

### Paso 5: Sembrar usuarios
```bash
cd apps/auth && npx prisma db seed
```

### Paso 6: Iniciar servicios
```bash
# Terminal 1: Auth Service
cd apps/auth && npm run dev      # Puerto 3003

# Terminal 2: Gerencia Técnica
cd apps/gerencia-tecnica && npm run dev  # Puerto 3001

# Terminal 3: Compras
cd apps/compras && npm run dev   # Puerto 3002

# Terminal 4: App Shell
cd apps/app-shell && npm run dev # Puerto 5173
```

---

## 📋 Credenciales de Prueba

| Email | Password | Rol | Acceso |
|:---|:---|:---|:---|
| admin@alfa.bocam.com | Admin.2026 | admin, superintendent | Todo el Tenant Alfa |
| residente@alfa.bocam.com | Res.2026 | resident | Solo Proyecto GDL |
| comprador@alfa.bocam.com | Comp.2026 | procurement | Todo el Tenant Alfa |
| admin@beta.bocam.com | Admin.2026 | admin | Todo el Tenant Beta |

---

## 🔍 5. Próximos Pasos

- [ ] Compilar `packages/auth-middleware` o configurar path aliases en tsconfig
- [ ] Implementar Módulo de **Finanzas** (desbloquea validación presupuestal en Compras)
- [ ] Implementar Módulo de **Programación** (WBS/EDT, consume evento PresupuestoBaseLiberado)
- [ ] Configurar SSH y Git en el Host de Producción

---
*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. — Estrictamente Confidencial.*
