# BocamOS ERP — Estado del Sistema
**Fecha de revisión:** Abril 2026  
**Stack:** React 19 · Vite 8 · TypeScript · Express · Prisma · PostgreSQL · RabbitMQ · Redis

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
| **compras** | Express + Prisma | 3005 | 🔶 EN PROGRESO | 60% |
| **control-obra** | Express + Prisma | 3006 | 🔶 EN PROGRESO | 60% |
| **app-shell** | React 19 + Vite | 3000 | 🔶 EN PROGRESO | 60% |
| **seguridad** | Express + Prisma | 3007 | 🔶 EN PROGRESO | 55% |
| **ventas** | Express + Prisma | 3012 | 🔶 EN PROGRESO | 50% |
| **personal** | Express + Prisma | 3009 | 🔶 EN PROGRESO | 50% |
| **gerencia-tecnica** | Express + Prisma | 3010 | 🔶 EN PROGRESO | 45% |
| **ui-core** | React lib | — | 🔶 EN PROGRESO | 30% |
| **common** | — | — | ⬜ ESQUELETO | 0% |
| **database** | — | — | ⬜ ESQUELETO | 0% |

---

## Backends (Servicios Express)

### ✅ auth — IAM Completo (Puerto 3003)
Módulo de identidad y control de acceso completamente implementado.

**Qué tiene:**
- Login con JWT + refresh token rotation
- Registro de usuarios con bcrypt
- Revocación de tokens
- Matriz de acceso usuario/proyecto (RBAC)
- Schema: Tenant, User, Proyecto, UserProjectAccess, RefreshToken
- Aislamiento multi-tenant con tenant_id en todas las consultas

**Qué falta:** Nada crítico. Listo para producción.

---

### ✅ finanzas — Tesorería Completa (Puerto 3004)
Módulo financiero con el mayor nivel de integración entre módulos.

**Qué tiene:**
- Flujo de caja, compromisos financieros, pagos
- Integración SAT/CFDI con callbacks
- Handlers de eventos: OC de compras, avances de control-obra
- Manejo idempotente de pagos
- 6 archivos de tests de integración + tests e2e

**Qué falta:** Nada crítico. Listo para producción.

---

### ✅ contabilidad — Contabilidad + SAT (Puerto 3008)
El módulo más grande del sistema (main.ts: 105 KB).

**Qué tiene:**
- Catálogo de cuentas, diario contable, mayor
- Integración CFDI con SAT (timbrado y validación)
- Proceso de archivos bancarios (lotes, reconciliación)
- Proceso paralelo: sat-worker.ts (proceso separado)
- Manejo de idempotencia propio
- 12 archivos de tests de integración

**Qué falta:** Nada crítico. Listo para producción.

---

### 🔶 compras — Adquisiciones (Puerto 3005) — 60%
Estructura sólida, falta flujo de aprobación.

**Qué tiene:**
- Endpoints REST: requisiciones, órdenes de compra, proveedores, cuadro comparativo
- Schema: Requisicion, OrdenCompra, Proveedor, CuadroComparativo
- Publicación de eventos al bus (notifica a finanzas y contabilidad)
- 3 archivos de tests de integración

**Qué falta:**
- Flujo de aprobación con máquina de estados (borrador → revisión → aprobado → rechazado)
- Generación de PDF para OC
- Lógica de negocio más allá de CRUD básico
- Validaciones de negocio (límites de aprobación por rol)

---

### 🔶 control-obra — Bitácora y Avance Físico (Puerto 3006) — 60%
Schema bien definido, endpoints incompletos.

**Qué tiene:**
- Schema: BitacoraObra, AvanceFisico, Estimacion
- Publicación de avances validados → finanzas
- Subscripción a eventos de pago de finanzas
- 3 archivos de tests de integración

**Qué falta:**
- Cobertura completa de endpoints (bitácoras, estimaciones, frentes)
- Flujo de firma y aprobación de bitácoras
- Transiciones de estado en estimaciones
- Lógica de cálculo de avance físico

---

### 🔶 seguridad — HSE (Puerto 3007) — 55%
Endpoints básicos presentes, faltan flujos completos.

**Qué tiene:**
- Schema: Incidente, Inspeccion, PermisoTrabajo, Capacitacion
- Endpoints para incidentes e inspecciones con filtros por tipo/severidad
- Publicación de eventos de alertas
- Multi-tenant + RLS

**Qué falta:**
- CRUD completo para permisos de trabajo y capacitaciones
- Manejo de adjuntos (fotos, documentos)
- Flujo de seguimiento de incidentes (investigación → cierre)
- Gestión de capacitaciones y vencimientos

---

### 🔶 ventas — Comercial (Puerto 3012) — 50%
Estructura de servicios creada, implementación pendiente.

**Qué tiene:**
- Estructura: controllers/, services/, routes/
- Schema: Cliente, Cotizacion, Factura
- Endpoints declarados (clientes, cotizaciones, facturas)
- Event bus + observabilidad conectados

**Qué falta:**
- Implementación de servicios (están vacíos/stubs)
- Endpoints de creación, actualización y eliminación
- Lógica de negocio: conversión cotización → factura
- Integración con contabilidad para facturación

---

### 🔶 personal — RRHH y Nómina (Puerto 3009) — 50%
Schema definido, motor de nómina ausente.

**Qué tiene:**
- Schema: Empleado, Cuadrilla, AsignacionFrente, PreNomina
- Endpoints básicos (22 KB de main.ts)
- Event bus integrado

**Qué falta:**
- Motor de cálculo de nómina (IMSS, ISR, deducciones)
- Flujo de prenómina → aprobación → dispersión
- Gestión de incidencias (faltas, horas extra, vacaciones)
- Cálculo de finiquito y liquidación

---

### 🔶 gerencia-tecnica — Presupuestos y Catálogo (Puerto 3010) — 45%
El módulo menos desarrollado del backend.

**Qué tiene:**
- Schema: Insumo, Presupuesto, ConceptoPresupuesto
- Endpoints básicos declarados
- Event bus inicializado

**Qué falta:**
- Lógica de cálculo de presupuesto
- Control de versiones de presupuesto
- Flujo de aprobación del presupuesto maestro
- Catálogo de insumos con precios actualizables
- Precios unitarios por región/proveedor

---

## Frontend

### 🔶 app-shell — Shell Multi-Tenant (Puerto 3000) — 60%
La aplicación ya está desplegada en producción. La pantalla de login y el modo demo funcionan.

**Qué tiene:**
- Sistema de layout completo (sidebar, header, panels)
- TenantContext con autenticación JWT real y modo demo
- 9 vistas de módulos conectadas al backend
- Capa de API con axios e interceptores de refresh token
- Build de producción desplegado en VPS (http://72.60.114.12)

**Qué falta:**
- Vistas de detalle para cada entidad (actualmente solo listas)
- Formularios de creación y edición
- Modales de confirmación y diálogos
- Guardas de permisos por rol en la UI
- Paginación, filtros avanzados y búsqueda

---

### 🔶 ui-core — Librería de Componentes (30%)
El bloqueo principal para completar el frontend.

**Qué tiene:**
- Estructura base del paquete
- Exports declarados en index.tsx

**Qué falta:**
- Button, Input, Modal, Table, Form, Pagination
- Select, DatePicker, FileUpload, Badge, Alert
- Componentes de datos: DataTable con ordenamiento, filtros
- Todos los componentes necesarios para formularios de producción

---

## Packages de Infraestructura

| Package | Estado | Descripción |
|---------|--------|-------------|
| **auth-middleware** | ✅ Listo | JWT verify + RBAC + SecurityContext |
| **event-bus** | ✅ Listo | RabbitMQ con reconexión y DLQ |
| **observability** | ✅ Listo | Logs estructurados + correlation ID |
| **tenant-idempotency** | ✅ Listo | Mutaciones idempotentes para pagos |
| **ui-core** | 🔶 30% | Solo esqueleto de componentes |
| **common** | ⬜ Vacío | Sin implementar |
| **database** | ⬜ Vacío | Sin implementar (cada app tiene su Prisma) |

---

## Brechas Críticas del Sistema

### 1. ui-core incompleto (Bloqueante para el frontend)
Sin componentes base, el app-shell no puede construir pantallas de detalle ni formularios.

### 2. Frontend solo lectura
Todas las vistas del app-shell son listas de datos. No hay formularios para crear, editar ni eliminar registros.

### 3. Motor de nómina ausente
El módulo personal tiene el schema correcto pero cero lógica de cálculo (IMSS, ISR, partes proporcionales).

### 4. Flujos de aprobación faltantes
compras, personal y gerencia-técnica no tienen máquinas de estado para los flujos de aprobación (borrador → revisado → aprobado).

### 5. Gestión de archivos
Solo contabilidad procesa archivos bancarios. Compras (PDF de OC), seguridad (fotos de incidentes) y otros módulos no tienen manejo de adjuntos.

### 6. Documentación de API
No hay especificaciones OpenAPI/Swagger en ningún módulo. Necesario para integración frontend-backend.

### 7. Tests incompletos
Solo 4 módulos tienen tests de integración. ventas, personal, gerencia-técnica y seguridad no tienen ningún test.

---

## Plan de Acción Sugerido

**Prioridad Alta (desbloquea todo lo demás):**
1. Completar `ui-core` con componentes base (Button, Input, Table, Modal, Form)
2. Agregar formularios de creación/edición en app-shell para compras y control-obra
3. Implementar flujos de aprobación en `compras`

**Prioridad Media:**
4. Implementar lógica de servicios en `ventas`
5. Completar endpoints en `gerencia-tecnica`
6. Motor de prenómina en `personal`

**Prioridad Normal:**
7. Completar CRUD y adjuntos en `seguridad`
8. Agregar documentación OpenAPI en cada módulo
9. Expandir cobertura de tests a todos los módulos
10. CI/CD con GitHub Actions + deploy automático al VPS

---

*Generado automáticamente por revisión de código — BocamOS ERP Modular*
