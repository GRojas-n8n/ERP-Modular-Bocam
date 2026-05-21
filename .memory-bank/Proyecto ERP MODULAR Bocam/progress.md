# Progress — Iretum ERP (BocamOS)

## Estado al 2026-05-20

### Backends (microservicios Express + Prisma)

| Módulo | Puerto | Estado | Avance |
|--------|--------|--------|--------|
| auth | 3003 | ✅ COMPLETO | 100% |
| finanzas | 3004 | ✅ COMPLETO | 100% |
| contabilidad | 3008 | ✅ COMPLETO | 100% |
| auth-middleware | lib | ✅ COMPLETO | 100% |
| event-bus | lib | ✅ COMPLETO | 100% |
| observability | lib | ✅ COMPLETO | 100% |
| tenant-idempotency | lib | ✅ COMPLETO | 100% |
| compras | 3005 | 🔶 EN PROGRESO | 60% |
| control-obra | 3006 | 🔶 EN PROGRESO | 60% |
| seguridad | 3007 | 🔶 EN PROGRESO | 60% |
| ventas | 3012 | 🔶 EN PROGRESO | 50% |
| personal | 3009 | 🔶 EN PROGRESO | 50% |
| gerencia-tecnica | 3010 | 🔶 EN PROGRESO | 45% |
| common | — | ⬜ ESQUELETO | 0% |
| database | — | ⬜ ESQUELETO | 0% |

### Frontend — app-shell (80%) y ui-core (90%)

**ui-core** — Biblioteca de componentes completa:
- Button, Input, Select, Textarea, FormField
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableContainer
- SectionBadge, SideSheet, cn helper
- SlidePanel + SubmitButton (colores: sky/emerald/violet/amber/indigo/red/blue)

**Vistas implementadas (modo demo completamente funcional):**
- Dashboard — KPIs, movimientos, requisiciones, OC
- Compras — Requisiciones (con comparativa) · Catálogo de Insumos · Almacén
- Gerencia Técnica — Insumos · Presupuestos
- Control de Obra — Bitácoras · Avances · Estimaciones
- Personal / RH — Empleados · Cuadrillas · Prenómina
- Seguridad / HSE — Incidentes · Inspecciones · Permisos · Capacitaciones · EPP
- Finanzas — Dashboard · Pagos · Movimientos
- Ventas — Clientes · Cotizaciones · Facturas

**Funcionalidades principales completadas:**
- Login JWT + refresh token rotation con interceptor automático
- Demo mode (`iretum-demo` tenant) — cero backend, todos los módulos funcionales
- TenantContext con roles lowercase + selector de proyecto activo
- Módulo Almacén (Mayo 2026): Inventario con semáforo stock + Movimientos INGRESO/EGRESO/TRASPASO
- Comparativa de cotizaciones (Mayo 2026): hasta 3 proveedores, ganador por renglón, Autorizar→OC

### Infraestructura VPS

**Contenedor** | **Estado**
---|---
bocam-vps-postgres | ✅ Healthy
bocam-vps-redis | ✅ Running
bocam-vps-rabbitmq | ✅ Healthy
bocam-vps-auth | ✅ Healthy
bocam-vps-finanzas | ✅ Healthy
bocam-vps-contabilidad | ✅ Healthy
bocam-vps-compras | ✅ Healthy
bocam-vps-control-obra | ✅ Healthy
bocam-vps-gerencia-tecnica | ✅ Healthy
bocam-vps-app-shell | ✅ Healthy
bocam-vps-caddy | ✅ Running

11/11 contenedores healthy. Acceso: `ssh root@72.60.114.12`

---

## Historial de Sesiones

### 2026-03-15 a 2026-03-18 (Hitos 1–25)
- Infraestructura base: RLS multi-tenant, JWT RBAC, event-bus RabbitMQ
- Backends completos: auth, finanzas, contabilidad con 18+ archivos de tests
- Saga Compras→Finanzas, Estimaciones→Finanzas, reconciliación CFDI/SAT
- Observabilidad, idempotencia, correlation IDs

### 2026-05-18
- Login rediseñado: split-screen con branding izquierdo + formulario minimalista
- `VITE_DEFAULT_TENANT_ID` parametrizado (antes hardcodeado)

### 2026-05-19
- Fix crítico demo mode: redirect loop resuelto (api.ts + useDashboardData.ts)
- Tab EPP en SeguridadView.tsx
- ComprasView reescritura: Tab Requisiciones + Tab Catálogo
- Git sync VPS→GitHub→local resuelto (HEAD.lock conflicts)

### 2026-05-20
- Tab Almacén en Compras: Inventario + Movimientos adaptativo
- Comparativa de cotizaciones: ComparativaDetail.tsx como componente separado
- SlidePanel.tsx: colores red y blue añadidos
- Icons.tsx: IconArrowLeft añadido
- ESTADO_DEL_SISTEMA.md completamente reescrito
- 11/11 contenedores Docker en VPS healthy

---

## Brechas Conocidas

1. **Endpoints de Almacén y EPP** — El frontend llama `/api/v1/compras/almacen/*` y `/api/v1/seguridad/epp` que no existen en el backend
2. **Motor de Nómina** — personal tiene schema pero cero lógica de cálculo (IMSS, ISR)
3. **Tests** — solo auth, finanzas y contabilidad tienen cobertura completa
4. **Adjuntos** — solo contabilidad procesa archivos; compras/seguridad sin manejo de archivos
5. **CI/CD** — deploy manual al VPS, sin GitHub Actions

## Próximos Pasos

- [ ] Phase 2: Sistema de notificaciones (visual + auditivo)
- [ ] Phase 3: Módulo RESIDENCIA (estimaciones, asistencia QR móvil)
- [ ] Phase 3: Módulo CALIDAD (control versiones docs, ISO-9001)
- [ ] Backend: endpoints Almacén e EPP
- [ ] Backend: motor de nómina IMSS/ISR
- [ ] Dependencias externas: logo isotipo, OPUS presupuesto, datos proyecto real Bocam
