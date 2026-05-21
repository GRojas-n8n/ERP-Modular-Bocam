# BocamOS / Iretum ERP — Estado del Sistema
**Última revisión:** 20 de Mayo 2026  
**Stack:** React 19 · Vite 7 · TypeScript · Express · Prisma · PostgreSQL · RabbitMQ · Redis  
**Producto:** Iretum ERP (SaaS Multi-Tenant para constructoras)  
**VPS:** `72.60.114.12` · SSH `root@72.60.114.12` · Proyecto en `/root/ERP-Modular-Bocam`  
**GitHub:** `https://github.com/GRojas-n8n/ERP-Modular-Bocam`

---

## Resumen Ejecutivo

| Módulo | Tipo | Puerto | Estado | Avance |
|--------|------|--------|--------|--------|
| **auth** | Express + Prisma | 3003 | ✅ COMPLETO | 100% |
| **finanzas** | Express + Prisma | 3004 | ✅ COMPLETO | 100% |
| **contabilidad** | Express + Prisma + Worker SAT | 3008 | ✅ COMPLETO | 100% |
| **auth-middleware** | TypeScript lib | — | ✅ COMPLETO | 100% |
| **event-bus** | TypeScript lib | — | ✅ COMPLETO | 100% |
| **observability** | TypeScript lib | — | ✅ COMPLETO | 100% |
| **tenant-idempotency** | TypeScript lib | — | ✅ COMPLETO | 100% |
| **ui-core** | React lib | — | ✅ COMPLETO | 90% |
| **app-shell** | React 19 + Vite | 3000 | 🔶 EN PROGRESO | 80% |
| **compras** | Express + Prisma | 3005 | 🔶 EN PROGRESO | 60% |
| **seguridad** | Express + Prisma | 3007 | 🔶 EN PROGRESO | 60% |
| **control-obra** | Express + Prisma | 3006 | 🔶 EN PROGRESO | 60% |
| **ventas** | Express + Prisma | 3012 | 🔶 EN PROGRESO | 50% |
| **personal** | Express + Prisma | 3009 | 🔶 EN PROGRESO | 50% |
| **gerencia-tecnica** | Express + Prisma | 3010 | 🔶 EN PROGRESO | 45% |
| **common** | — | — | ⬜ ESQUELETO | 0% |
| **database** | — | — | ⬜ ESQUELETO | 0% |

---

## Docker Stack en VPS (estado actual)

```bash
docker compose -f docker-compose.vps.yml --profile core up -d
# → 11/11 contenedores healthy
```

| Contenedor | Estado |
|------------|--------|
| bocam-vps-postgres | ✅ Healthy |
| bocam-vps-redis | ✅ Running |
| bocam-vps-rabbitmq | ✅ Healthy |
| bocam-vps-auth | ✅ Healthy |
| bocam-vps-finanzas | ✅ Healthy |
| bocam-vps-contabilidad | ✅ Healthy |
| bocam-vps-compras | ✅ Healthy |
| bocam-vps-control-obra | ✅ Healthy |
| bocam-vps-gerencia-tecnica | ✅ Healthy |
| bocam-vps-app-shell | ✅ Healthy |
| bocam-vps-caddy | ✅ Running |

---

## Frontend — app-shell (80%)

### ✅ Lo que está funcionando en producción

**Autenticación y Sesión:**
- Login con JWT real + refresh token rotation (interceptor automático)
- Modo demo (`tenant.id === 'iretum-demo'`) — sin backend, sin sesión expirada
- TenantContext con roles lowercase para filtrado de navegación
- Selector de proyecto activo

**Demo Mode (completamente funcional):**
- Todos los módulos funcionan sin backend con datos de `demoData.ts`
- `api.ts` corregido: 401 sin refresh token no dispara `session-expired`
- `useDashboardData.ts` tiene early-return demo para evitar llamadas al backend
- Demo user tiene todos los roles en lowercase (`['admin', 'gerencia_tecnica', 'compras', ...]`)

**Vistas implementadas con formularios slide-panel:**

| Vista | Tabs / Secciones | Formularios |
|-------|-----------------|-------------|
| Dashboard | KPIs + movimientos + requisiciones + OC | — |
| Compras | Requisiciones · Catálogo · Almacén | Nueva Requisición · Agregar Insumo · Registro de Movimiento (Ingreso/Egreso/Traspaso) |
| Compras → Comparativa | Multi-proveedor A/B/C · Tabla precios · Ganador por renglón · Autorizar→OC | Dentro de la vista de detalle |
| Gerencia Técnica | Insumos · Presupuestos | Nuevo Insumo · Nuevo Presupuesto |
| Control de Obra | Bitácoras · Avances · Estimaciones | Nueva Bitácora · Registrar Avance · Nueva Estimación |
| Personal / RH | Empleados · Cuadrillas · Prenómina | Alta Empleado · Nueva Cuadrilla · Calcular Prenómina |
| Seguridad / HSE | Incidentes · Inspecciones · Permisos · Capacitaciones · **EPP** | Nuevo Incidente · Nueva Inspección · Nuevo Permiso · Nueva Capacitación |
| Finanzas | Dashboard · Pagos · Movimientos | — |
| Ventas | Clientes · Cotizaciones · Facturas | Nueva Cotización |

**Almacén (nuevo — Mayo 2026):**
- Sub-vista Inventario: tabla con stock actual/mínimo, semáforo AGOTADO/BAJO/OK, búsqueda
- Sub-vista Movimientos: filtrable por INGRESO / EGRESO / TRASPASO
- Banner de alerta automático si hay items bajo mínimo o agotados
- Slide panel adaptativo: campos cambian según tipo de movimiento

**Comparativa de Cotizaciones (nuevo — Mayo 2026):**
- Botón "Iniciar comparativa" en tarjetas APROBADAS dentro de Requisiciones
- Hasta 3 proveedores con colores A=azul / B=violeta / C=teal
- Tabla: precio por renglón con subtotal automático por proveedor
- Selección de ganador por renglón (botones A/B/C)
- Fila de totales por proveedor + total comprometido del ganador
- Autorizar → OC: agrupa renglones por ganador, genera OC independiente por proveedor
- Vista de OC generadas con total comprometido consolidado
- Estado: BORRADOR → EN_PROCESO → AUTORIZADA

**ui-core (90%):**
- Button, Input, Select, Textarea, FormField, Card, CardHeader, CardContent, CardTitle, CardDescription
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableContainer
- SectionBadge, SideSheet, cn (classnames helper)
- SlidePanel + SubmitButton (wrapper de SideSheet con colores: sky/emerald/violet/amber/indigo/red/blue)

**demoData.ts — datos disponibles:**
- `DEMO_INSUMOS` (15 items: MATERIALES/EQUIPOS/MANO_OBRA/SUBCONTRATOS)
- `DEMO_REQUISICIONES` (6 items, estados variados)
- `DEMO_COMPARATIVAS` (2 comparativas: 1 EN_PROCESO con 3 renglones, 1 AUTORIZADA con OC)
- `DEMO_INVENTARIO` (8 items: 2 agotados, 2 bajo mínimo, 4 OK)
- `DEMO_MOVIMIENTOS_ALMACEN` (10 movimientos: INGRESO/EGRESO/TRASPASO)
- `DEMO_RESUMEN_FINANCIERO`, `DEMO_PAGOS`
- `DEMO_BITACORAS`, `DEMO_AVANCES`, `DEMO_ESTIMACIONES`
- `DEMO_EMPLEADOS` (8), `DEMO_CUADRILLAS` (4), `DEMO_PRENOMINAS`
- `DEMO_INCIDENTES`, `DEMO_INSPECCIONES`, `DEMO_PERMISOS`, `DEMO_CAPACITACIONES`
- `DEMO_CLIENTES`, `DEMO_COTIZACIONES`, `DEMO_FACTURAS`

---

## Backends (Servicios Express)

### ✅ auth — IAM Completo (Puerto 3003)
- Login con JWT + refresh token rotation
- Registro de usuarios con bcrypt
- Revocación de tokens
- Matriz de acceso usuario/proyecto (RBAC)
- Schema: Tenant, User, Proyecto, UserProjectAccess, RefreshToken
- Aislamiento multi-tenant con tenant_id en todas las consultas
- **Endpoint clave:** `POST /api/v1/auth/switch-project` para cambiar proyecto activo

### ✅ finanzas — Tesorería Completa (Puerto 3004)
- Flujo de caja, compromisos financieros, pagos
- Integración SAT/CFDI con callbacks
- Handlers de eventos: OC de compras, avances de control-obra
- Manejo idempotente de pagos
- 6 archivos de tests de integración

### ✅ contabilidad — Contabilidad + SAT (Puerto 3008)
- Catálogo de cuentas, diario contable, mayor
- Integración CFDI con SAT (timbrado y validación)
- Proceso de archivos bancarios (lotes, reconciliación)
- sat-worker.ts (proceso separado)
- 12 archivos de tests de integración

### 🔶 compras — Adquisiciones (Puerto 3005) — 60%
**Tiene:** Endpoints REST: requisiciones, órdenes de compra, proveedores, comparativas. Schema: Requisicion, OrdenCompra, Proveedor, CuadroComparativo. Publicación de eventos al bus.

**Falta:** Endpoints de almacén (`/api/v1/compras/almacen/inventario`, `/api/v1/compras/almacen/movimientos`) — el frontend ya los llama, el backend no los tiene aún. Flujo completo de comparativa vía API (el frontend tiene `/api/v1/compras/comparativas/:id/convertir-oc`).

### 🔶 control-obra — Bitácora y Avance Físico (Puerto 3006) — 60%
**Tiene:** Schema bien definido, endpoints de bitácoras, avances, estimaciones. Publicación avances→finanzas.

**Falta:** Flujo de firma y aprobación, transiciones de estado en estimaciones.

### 🔶 seguridad — HSE (Puerto 3007) — 60%
**Tiene:** Endpoints para incidentes, inspecciones, permisos, capacitaciones. Multi-tenant + RLS.

**Falta:** Endpoint `/api/v1/seguridad/epp` (el frontend ya lo llama). Manejo de adjuntos, flujo de seguimiento de incidentes.

### 🔶 ventas — Comercial (Puerto 3012) — 50%
**Tiene:** Estructura controllers/services/routes. Schema: Cliente, Cotizacion, Factura.

**Falta:** Implementación de servicios (stubs vacíos), lógica de negocio, integración con contabilidad.

### 🔶 personal — RRHH y Nómina (Puerto 3009) — 50%
**Tiene:** Schema: Empleado, Cuadrilla, AsignacionFrente, PreNomina. Endpoints básicos.

**Falta:** Motor de cálculo de nómina (IMSS, ISR), flujo prenómina → aprobación → dispersión.

### 🔶 gerencia-tecnica — Presupuestos y Catálogo (Puerto 3010) — 45%
**Tiene:** Schema: Insumo, Presupuesto, ConceptoPresupuesto. Endpoints básicos.

**Falta:** Lógica de cálculo, control de versiones, catálogo de insumos con precios actualizables.

---

## Brechas Actuales

### 1. Endpoints de Almacén y EPP (Backend faltante)
El frontend llama `/api/v1/compras/almacen/inventario`, `/api/v1/compras/almacen/movimientos` y `/api/v1/seguridad/epp` — ninguno existe en el backend todavía. En modo real los módulos de Almacén y EPP no cargarán datos.

### 2. Motor de Nómina Ausente
El módulo personal tiene el schema correcto pero cero lógica de cálculo (IMSS, ISR, partes proporcionales, deducciones).

### 3. Tests incompletos
Solo auth, finanzas y contabilidad tienen tests completos. ventas, personal, gerencia-técnica y seguridad no tienen ningún test.

### 4. Gestión de Archivos
Solo contabilidad procesa archivos bancarios. Compras (PDF de OC), seguridad (fotos de incidentes) y otros módulos no tienen manejo de adjuntos.

### 5. CI/CD
Deploy manual al VPS. No hay GitHub Actions configurado.

---

## Phase 2 — Plan de Continuación (Frontend UI)

**✅ Completado:**
- [x] Catálogo de Insumos en Compras (Tab Catálogo)
- [x] Almacén en Compras (Tab Almacén: Inventario + Movimientos INGRESO/EGRESO/TRASPASO)
- [x] Tab EPP en Seguridad HSE
- [x] Comparativa de cotizaciones (dentro de Requisiciones → tarjetas APROBADAS)
- [x] Demo mode completamente funcional

**🔶 Pendiente Phase 2:**
- [ ] Sistema de notificaciones (visual + auditivo)

**🔶 Phase 3:**
- [ ] RESIDENCIA module: estimaciones, aprobación nómina, asistencia QR móvil
- [ ] CALIDAD module: control versiones documentos, cartas satisfacción, ISO-9001

**⚠️ Dependencias externas:**
- [ ] Logo isotipo "i" cubo azul (en laptop del trabajo)
- [ ] Archivo OPUS para importer de presupuesto
- [ ] Registrar primer proyecto real + datos en tenant Bocam

---

## Comandos de Operación

```bash
# SSH
ssh root@72.60.114.12

# Ver estado
docker compose -f docker-compose.vps.yml --profile core ps

# Rebuild solo app-shell (más rápido)
docker compose -f docker-compose.vps.yml --profile core build --no-cache app-shell
docker compose -f docker-compose.vps.yml --profile core up -d

# Rebuild completo
docker compose -f docker-compose.vps.yml --profile core build --no-cache
docker compose -f docker-compose.vps.yml --profile core up -d

# Logs
docker logs bocam-vps-app-shell --tail 50
docker logs bocam-vps-auth --tail 50
```

---

## Historial de Sesiones

### Sesión 2026-05-18
- Login rediseñado (split-screen): panel branding izquierdo + formulario minimalista derecho
- VITE_DEFAULT_TENANT_ID parametrizado (antes hardcodeado)
- Conflicto de merge resuelto en LoginView.tsx

### Sesión 2026-05-19
- Fix crítico: demo mode causaba redirect loop al login
  - `api.ts`: 401 sin refresh token no dispara `iretum:session-expired`
  - `useDashboardData.ts`: early-return demo antes de llamar APIs
  - `TenantContext.tsx`: roles demo en lowercase para que filtro de nav funcione
- Tab EPP en `SeguridadView.tsx` (entregas, estado, urgencia, renovación)
- `ComprasView.tsx` reescritura completa:
  - Tab Requisiciones con formulario slide-panel + autocomplete de insumos
  - Tab Catálogo con chips de categoría + búsqueda en tiempo real
- Git sync: VPS → GitHub → local (HEAD.lock resueltos)

### Sesión 2026-05-20
- **Tab Almacén en Compras**: Inventario + Movimientos (INGRESO/EGRESO/TRASPASO)
  - Banner de alerta stock, semáforo AGOTADO/BAJO/OK
  - Slide panel adaptativo por tipo de movimiento
  - `DEMO_INVENTARIO` (8 items) + `DEMO_MOVIMIENTOS_ALMACEN` (10 registros)
- **Comparativa de cotizaciones** dentro de Requisiciones
  - `ComparativaDetail.tsx`: nuevo componente separado
  - Hasta 3 proveedores con color A/B/C
  - Precios por renglón, subtotales, ganador por renglón
  - Autorizar → OC: genera OC por proveedor ganador
  - `DEMO_COMPARATIVAS`: 2 comparativas (EN_PROCESO + AUTORIZADA)
- `SlidePanel.tsx`: soporte para colores red y blue
- `Icons.tsx`: IconArrowLeft agregado
- 11/11 contenedores Docker en VPS healthy
