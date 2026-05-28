# CLAUDE.md — Constitución del Proyecto ERP Modular BOCAM

> **Propiedad Intelectual:** Constructora Bocam, S. A. de C.V.  
> **Clasificación:** Estrictamente Confidencial — Uso Interno Exclusivo.  
> **Propósito:** Este archivo es la fuente de verdad para el asistente de IA sobre cómo está construido el sistema y cómo debe extenderse.  
> **Última revisión:** 2026-05-28 — AdminView ROLES completo (residencia, procurement, superintendent); usuarios de prueba creados en producción.

---

## 0. Proceso de Desarrollo — Spec-Driven Development (NO SALTARSE)

**Todo cambio no trivial requiere spec escrito y aprobado ANTES de tocar código.**

### Umbral: ¿cuándo aplica?

Aplica si el cambio toca **2 o más** de los siguientes:
- Migración de schema Prisma (nueva tabla, campo, índice)
- Endpoint nuevo o modificado en cualquier módulo backend
- Cambio de RBAC (nuevos roles, nuevos `requireRoles`, nuevas reglas de autorización)
- Nueva sección/vista/tab en el frontend
- Cambio en el bus de eventos (nuevo tipo de evento, nuevo subscriber)

No aplica para: correcciones de bug táctico, fix de typo, cambio de un color o label, hotfix urgente de producción.

### Estructura del spec (en `openspec/changes/<nombre-kebab>/`)

```
proposal.md   — Why · What Changes · Capabilities (new/modified) · Impact
design.md     — Context · Goals/Non-Goals · Decisions (Dx) · Risks · Migration Plan
tasks.md      — Checklist exhaustivo: schema → backend → frontend → tests → deploy
specs/<cap>/
  spec.md     — Comportamiento esperado de esa capacidad (criterios de aceptación)
.openspec.yaml — status: draft | in_progress | archived; production_verified
```

### Flujo obligatorio en cada sesión

```
1. Usuario describe el feature
2. Claude escribe proposal.md + design.md + tasks.md (SIN tocar código)
3. Usuario revisa y aprueba (o pide cambios)
4. Claude implementa siguiendo el tasks.md como checklist
5. Al terminar: actualizar .openspec.yaml con status: archived + commits + production_verified
```

**Si el usuario pide implementar algo directamente sin spec, Claude debe responder:**
> "Esto aplica el umbral de spec-first. Antes de codificar, necesito escribir el spec en `openspec/changes/`. ¿Apruebas que lo haga ahora?"

### Ejemplos de cambios pasados con su openspec

| Cambio | Archivo |
|---|---|
| Alertas de OC con error financiero | `openspec/changes/oc-error-finanzas-alert/` |
| Flujo de aprobación dos etapas (Residente + GT) | `openspec/changes/cuadro-comparativo-aprobacion-dos-etapas/` |
| Aprobación de req + tipo IMPREVISTO | `openspec/changes/flujo-cotizacion-req-imprevisto/` |
| Tab Requisiciones del Residente | `openspec/changes/requisiciones-desde-residencia/` |

---

---

## 1. Contexto del Sistema

ERP SaaS Multi-Tenant y Multi-Proyecto para la industria de construcción. Cada módulo es un microservicio independiente escrito en **TypeScript + Express + Prisma + PostgreSQL**, coordinado por un bus de eventos **RabbitMQ**. El sistema abarca los departamentos: Auth, Compras, Finanzas, Control de Obra, Personal, Gerencia Técnica, Contabilidad, Ventas y Seguridad/HSE.

**Producto en producción:** [iretum.com](https://iretum.com) — SaaS hospedado en VPS Ubuntu (Hostinger), `72.60.114.12`, proyecto en `/root/ERP-Modular-Bocam`. Reverse proxy: Caddy 2 (HTTPS automático).

---

## 2. Stack Tecnológico y Decisiones de Diseño

| Capa | Tecnología | Por qué se eligió |
|---|---|---|
| Runtime | Node.js (ESM via ts-node) | Ecosistema maduro, mismo lenguaje en frontend y backend |
| Lenguaje | TypeScript `strict: true` + `verbatimModuleSyntax: true` | Cero ambigüedad de tipos en fronteras de módulo; `verbatimModuleSyntax` garantiza que los imports de tipo se eliminen en compilación y no contaminen el bundle |
| Framework HTTP | Express.js | Minimalista, sin magia implícita; facilita razonar sobre el ciclo de vida de un request |
| ORM | Prisma (schema por módulo, output en `src/generated/prisma`) | Un schema por microservicio = cada equipo puede migrar su BD sin coordinar; typesafety en queries |
| Base de Datos | PostgreSQL con RLS | RLS aplica aislamiento multi-tenant a nivel de motor, no solo en código de aplicación — una capa extra de seguridad que no se puede "olvidar" |
| Bus de Eventos | RabbitMQ — Topic Exchange `bocam.events` | Desacoplamiento asíncrono entre módulos; Topic Exchange permite routing flexible por `modulo.entidad_accion` |
| Cache / Queue alt. | Redis | Módulos simples que solo necesitan TTL o contadores no deben arrastrar toda la complejidad de AMQP |
| Autenticación | JWT (jsonwebtoken) + bcryptjs | Stateless — el token lleva `tenant_id`, `proyecto_id`, `roles` y `limite_aprobacion`; los módulos no necesitan base de datos de sesiones |
| Contenedores | Docker Compose (profiles: `core` / `full` / `sat` / `tools`) | Profiles permiten activar solo los servicios necesarios por ambiente |
| Reverse Proxy | Caddy 2 | HTTPS automático vía Let's Encrypt sin configuración manual; config declarativa y mínima |
| Monorepo | pnpm workspaces — `apps/`, `packages/` | Packages compartidos sin publicar a npm; instalación determinista y rápida |
| Frontend | React 19 + Vite 7 + TypeScript + Tailwind CSS v4 | React 19 concurrent features; Vite 7 con Rolldown para builds ultrarrápidos |

---

## 3. Packages Internos Compartidos

Siempre importa desde la ruta relativa `../../../packages/<pkg>/src`. **Nunca copiar su lógica dentro de un módulo.**

### `@bocam/auth-middleware`
```typescript
import { createAuthMiddleware, requireRoles, requireProjectAccess, requireEnv } from '../../../packages/auth-middleware/src';
```
- `createAuthMiddleware({ jwtSecret, excludePaths })` — Valida JWT y puebla `req.securityContext`.
- `requireProjectAccess()` — Middleware que garantiza que el `proyecto_id` del token esté presente.
- `requireRoles(...roles)` — Middleware que verifica que el usuario tenga al menos uno de los roles indicados.
- `requireEnv('VAR')` — Lanza excepción si la variable de entorno no está definida.

### `@bocam/event-bus`
```typescript
import { BocamEvent, createEventBus } from '../../../packages/event-bus/src';
const eventBus = createEventBus('nombre-modulo');
```
- `eventBus.connect()` — Conecta a RabbitMQ. Llamar en `startServer()`.
- `eventBus.publish(event)` — Publica evento. Ver § 7 para el shape obligatorio.
- `eventBus.subscribe(routingKey, handler)` — Suscribe un handler a un patrón de routing key.

### `@bocam/observability`
```typescript
import { buildEventContext, buildForwardHeaders, createObservabilityMiddleware, logError, logInfo, logWarn } from '../../../packages/observability/src';
```
- `createObservabilityMiddleware('modulo')` — Inyectar como segundo `app.use()`, después de `express.json()`.
- `logInfo / logWarn / logError(req, modulo, accion, mensaje, extras)` — Logging estructurado JSON. **Nunca usar `console.log` para eventos de negocio.**
- `buildForwardHeaders(req, overrides)` — Propaga `Authorization` y headers de correlación a llamadas downstream.
- `buildEventContext(req)` — Construye el objeto `context` estándar a partir de `req.securityContext`.

### `@bocam/tenant-idempotency`
```typescript
import { applyTerminalMutationInContext, buildTerminalHttpResponse, logTerminalState } from '../../../packages/tenant-idempotency/src';
```
- Patrón para handlers de eventos y endpoints de reconciliación. Garantiza que una mutación sea idempotente mediante el ciclo: `load → notFoundResult → idempotentResult → apply`.
- `buildTerminalHttpResponse` — Construye la respuesta HTTP estándar para estados terminales (`applied` / `idempotent`).

### `@bocam/ui-core` — Design System Frontend
Importar SIEMPRE desde el alias de workspace, no con rutas relativas:
```typescript
import { Button, Card, EmptyStatePanel, SideSheet, FormField, Input, Select, Textarea,
         MetricCard, BudgetHealthCard, OperationalBanner, ProgressRing, cn,
         formControlClassName } from '@bocam/ui-core';
```

**Componentes disponibles (verificados desde `packages/ui-core/src/`):**

| Componente | Props clave | Notas |
|---|---|---|
| `Button` | `variant` (`primary`/`outline`/`ghost`/`destructive`), `size` (`sm`/`md`/`icon`) | Base de todos los botones |
| `Card` + `CardHeader` + `CardTitle` + `CardContent` | children | Layout contenedor estándar |
| `EmptyStatePanel` | `title` (required), `icon?`, `description?`, `action?` | ⚠️ El prop es `title`, NO `message` |
| `SideSheet` | `isOpen` (required), `onClose`, `title?`, `description?`, `topSlot?`, `maxWidthClassName?` | Drawer lateral con Escape key handler y body overflow lock |
| `FormField` | `label` (required), `required?`, `hint?` | Envuelve Input/Select/Textarea con label y hint |
| `Input` | Extiende `InputHTMLAttributes` | Aplicar `formControlClassName` si se usa sin FormField |
| `Select` | Extiende `SelectHTMLAttributes` | Idem |
| `Textarea` | Extiende `TextareaHTMLAttributes` | Idem |
| `MetricCard` | `value`, `label`, `icon?`, `trend?`, `trendTone?` | Cards de KPI para dashboards |
| `BudgetHealthCard` | `title`, `currentValue`, `items[]` | Card financiera con ProgressRing |
| `ProgressRing` | `percentage`, `valueLabel?`, `colorClassName?`, `size?` | SVG circular con animación |
| `OperationalBanner` | `title`, `tone?` (`dark`/`neutral`), `badge?`, `actions?` | Banner hero de dashboards |
| `BrandMark` | `label`, `logoUrl?` | Avatar/logo del tenant |
| `cn(...values)` | — | Utility de classnames (equivalente a clsx) |
| `formControlClassName` | — | String de clases base para inputs; usar cuando se necesita consistencia sin el componente |

**`SlidePanel` y `SubmitButton` son componentes locales del app-shell** (`apps/app-shell/src/components/SlidePanel.tsx`), NO de `@bocam/ui-core`. Son thin wrappers que añaden el gradiente de color y el estado `loading`:

```typescript
// ✅ Importar desde la ruta local en app-shell
import { SlidePanel, SubmitButton } from '../components/SlidePanel';

// SlidePanel props
interface SlidePanelProps {
  isOpen: boolean;      // ⚠️ NO "open"
  onClose: () => void;
  title: string;
  subtitle?: string;
  accentColor?: 'sky' | 'emerald' | 'violet' | 'amber' | 'indigo' | 'red' | 'blue'; // default: 'sky'
  children: React.ReactNode;
}

// SubmitButton props
interface SubmitButtonProps {
  label: string;         // ⚠️ NO children
  loading?: boolean;
  color?: string;        // mismos valores que accentColor
  onClick?: () => void;
}
```

**Convención de `accentColor` / `color` en SlidePanel y SubmitButton:**

| Color | Uso semántico |
|---|---|
| `sky` | Acciones neutras / consulta |
| `emerald` | Creación / alta |
| `violet` | Edición / actualización |
| `amber` | Advertencia / revisión |
| `red` | Eliminación / incidente |
| `blue` | Autorización / OC |
| `indigo` | Módulo Residencia |

---

## 4. Reglas de Oro (Tolerancia Cero)

Estas reglas nunca tienen excepciones. El incumplimiento bloquea cualquier PR.

1. **Sin JOINs cruzados entre módulos.** Cada módulo es dueño exclusivo de su base de datos. Si necesitas datos de otro módulo, llama su API REST o consume un evento.

2. **`tenant_id` en TODA tabla.** Maestras y transaccionales.

3. **`proyecto_id` en toda tabla transaccional.** Requisiciones, estimaciones, nóminas, incidentes, órdenes de compra, etc.

4. **RLS habilitado en PostgreSQL.** El motor rechaza consultas sin contexto de seguridad.

5. **`tenant_id` y `proyecto_id` provienen SIEMPRE del JWT, nunca del body del request.**
   ```typescript
   // ✅ Correcto
   const { tenantId, proyectoId, userId } = req.securityContext;
   // ❌ Prohibido
   const { tenant_id, proyecto_id } = req.body;
   ```

6. **Todo acceso a BD pasa por `createTenantContext`.** Nunca instanciar `PrismaClient` directamente en un route handler.

7. **Todo evento publicado lleva `tenant_id` y `proyecto_id`.** Un evento sin contexto es inválido.

---

## 5. Estructura de Carpetas por Módulo

```
apps/<modulo>/
  prisma/
    schema.prisma          # Schema aislado del módulo
  src/
    main.ts                # Entry point: Express + EventBus
    db.ts                  # createTenantContext, runAsSystem, disconnectDb
    types.ts               # Tipos, enums, helpers de respuesta
    generated/prisma/      # Output de prisma generate (no editar)
  package.json
  tsconfig.json
  .env                     # Credenciales locales (nunca commitear)
```

---

## 6. Patrón de Ruta Estándar

Cada route handler sigue este esqueleto exacto:

```typescript
app.METHOD('/api/v1/<modulo>/<recurso>', requireRoles('rol1', 'rol2'), async (req: Request, res: Response) => {
  try {
    // 1. Extraer contexto del token — nunca del body
    const { tenantId, proyectoId, userId } = req.securityContext;

    // 2. Toda lógica de BD dentro de createTenantContext
    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.<model>.findMany({ ... })
    );

    // 3. Respuesta estándar
    res.json({ success: true, data });
  } catch (error: any) {
    logError(req, '<modulo>', '<modulo>.<recurso>.error', 'Descripción del error', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### Reglas de respuesta HTTP

| Situación | Status | Body |
|---|---|---|
| Éxito | `200` / `201` | `{ success: true, data: ... }` |
| Validación fallida | `400` | `{ success: false, message: '...' }` |
| No autenticado | `401` | Manejado por middleware |
| Sin permiso (rol) | `403` | Manejado por `requireRoles` |
| No encontrado | `404` | `{ success: false, message: '...' }` |
| Conflicto/duplicado | `409` | `{ success: false, message: '...' }` |
| Presupuesto insuficiente | `422` | `{ success: false, message: 'PRESUPUESTO_INSUFICIENTE: ...' }` |
| Error downstream | `502` | `{ success: false, message: '...' }` |
| Error interno | `500` | `{ success: false, message: error.message }` |

---

## 7. Patrón de Eventos (Bus de Mensajes)

### Estructura obligatoria de `BocamEvent`

```typescript
await eventBus.publish({
  event_type: 'modulo.entidad_accion',          // snake_case, namespaced por módulo
  timestamp: new Date().toISOString(),
  context: buildEventContext(req),               // Siempre usar buildEventContext
  payload: {
    id_entidad: '...',
    // ... datos de negocio mínimos
  },
});
```

### Naming de eventos (convención)

```
<modulo>.<entidad>_<pasado>
```
Ejemplos: `compras.oc_creada`, `finanzas.fondos_comprometidos`, `seguridad.incidente_reportado`, `personal.prenomina_autorizada`, `contabilidad.cfdi_sat_validado`

### Degradación elegante

Los eventos son **best-effort**. Si el bus no está disponible, el módulo continúa:

```typescript
try {
  await eventBus.publish({ ... });
} catch (_) {
  /* EventBus offline — degradación elegante. La operación principal ya fue confirmada. */
}
```

### Suscripción a eventos en `startServer()`

```typescript
export async function startServer() {
  return app.listen(PORT, async () => {
    await eventBus.connect();
    await eventBus.subscribe('finanzas.fondos_comprometidos', handleFondosComprometidosEvent);
    // ...
  });
}
```

---

## 8. Patrón de Idempotencia en Handlers de Eventos

Cuando un handler de evento aplica una mutación crítica, usar `applyTerminalMutationInContext` para garantizar que reintento = seguro:

```typescript
// 1. load   → cargar el estado actual de BD
// 2. notFoundResult  → la entidad no existe → retornar resultado notFound
// 3. idempotentResult → la entidad ya está en el estado destino → retornar sin mutar
// 4. apply  → aplicar la mutación y retornar el resultado
const result = await applyTerminalMutationInContext({
  context: { tenantId, proyectoId, userId },
  runInContext: createTenantContext,
  load: async (prisma) => ({ oc: await prisma.ordenCompra.findUnique({ where: { id_orden } }) }),
  notFoundResult: async (loaded) => loaded.oc ? null : { status: 'oc_not_found' },
  idempotentResult: async (loaded) => loaded.oc?.estado === 'EMITIDA' ? { status: 'idempotent' } : null,
  apply: async (loaded, prisma) => { /* mutación */ return { status: 'applied' }; },
});
```

Siempre loguear cada rama con `logTerminalState`.

---

## 9. Schema Prisma — Convenciones

```prisma
model MiEntidad {
  id_entidad   String   @id @default(uuid()) @db.Uuid
  tenant_id    String   @db.Uuid           // OBLIGATORIO en toda tabla
  proyecto_id  String   @db.Uuid           // OBLIGATORIO en tablas transaccionales
  codigo       String   @db.VarChar(50)    // Código legible (ej. REQ-2026-001)
  estado       String   @default("BORRADOR")
  created_at   DateTime @default(now())

  @@unique([tenant_id, codigo])
  @@index([tenant_id, proyecto_id])         // Índice compuesto siempre
  @@map("nombre_tabla_plural")              // snake_case plural
}
```

- IDs siempre UUID (`@db.Uuid`).
- Decimales monetarios: `Decimal @db.Decimal(18, 4)`. Al serializar en JSON: `Number(campo.toNumber())`.
- Campos de auditoría recomendados: `creado_por`, `aprobado_por`, `fecha_cierre`, `cerrado_por`.
- Los campos que referencian entidades de otro módulo son solo UUID (nunca `@relation`): `insumo_id`, `solicitante_id`, `empleado_id`.

---

## 10. Row-Level Security (RLS) en PostgreSQL

El aislamiento multi-tenant se aplica en **dos capas**:
1. **Aplicación** — `createTenantContext` llama a `set_app_context(tenantId, proyectoId)` antes de cada transacción.
2. **Motor de BD** — Las políticas RLS rechazan a nivel SQL cualquier query sin contexto válido.

### Funciones base (`.devcontainer/init-db/01-rls-setup.sql`)

```sql
-- Establece el contexto para la sesión actual (llamado por createTenantContext)
SELECT set_app_context('<tenant_uuid>', '<proyecto_uuid>');

-- Las políticas usan estas funciones para filtrar filas
get_current_tenant_id()   -- retorna UUID o NULL si no hay contexto
get_current_proyecto_id() -- retorna UUID o NULL si no hay contexto
```

### Patrón de política en cada tabla protegida

```sql
ALTER TABLE mi_tabla ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON mi_tabla
  USING (tenant_id = get_current_tenant_id());
```

### Regla de RLS

**Nunca deshabilitar RLS en una tabla de negocio**, ni siquiera para scripts de migración o seeds de desarrollo. Para operaciones de sistema (seeds, migraciones) usar `runAsSystem` de `db.ts`, que eleva el contexto de forma controlada y auditada.

---

## 11. Roles y RBAC

Los roles viven en el JWT (`req.securityContext.roles: string[]`).

| Rol | Descripción |
|---|---|
| `admin` | Administrador de tenant — acceso total al tenant |
| `superintendent` | Superintendencia / Dirección — lectura global + aprobaciones ejecutivas |
| `procurement` | Procura y Compras — emitir OC, gestionar proveedores |
| `finance` | Finanzas — aprobar suficiencia, ejecutar pagos |
| `resident` | Residente de frente — solo su obra asignada, captura de avances |
| `hse_manager` | Seguridad/HSE — autorizar permisos de trabajo de alto riesgo |
| `control_obra` | Control de Obra — bitácoras, avances, estimaciones |
| `residencia` | Módulo Residencia — estimaciones, nómina de cuadrilla, asistencia QR |
| `personal_rh` | Personal / RH — empleados, cuadrillas, prenóminas |
| `contabilidad` | Contabilidad — asientos, CFDI, conciliación bancaria |
| `gerencia_tecnica` | Gerencia Técnica — insumos, presupuestos maestros |
| `ventas` | Ventas — clientes, cotizaciones, facturas |
| `seguridad_hse` | Seguridad HSE — incidentes, inspecciones, EPP, capacitaciones |

### Límites de Autoridad Financiera

El campo `limite_aprobacion_financiera` del usuario (en el JWT como `limite_aprobacion`) se cruza en los módulos de Compras y Finanzas para escalar automáticamente al siguiente nivel jerárquico si el monto supera el límite.

---

## 12. Comunicación Síncrona entre Módulos

Cuando un módulo necesita datos de otro **en tiempo real**, usa HTTP REST con el token propagado:

```typescript
const FINANZAS_URL = process.env.FINANZAS_URL || 'http://localhost:3004/api/v1/finanzas';

const resp = await axios.get(`${FINANZAS_URL}/suficiencia`, {
  params: { monto: montoTotal },
  headers: buildForwardHeaders(req, { Authorization: req.headers.authorization || '' }),
});
```

**Regla:** el módulo consumidor maneja los errores downstream con status `502` y, si aplica, deja el registro en estado intermedio para reconciliación posterior.

URLs de inter-módulo configuradas en `docker-compose.vps.yml`:
```
FINANZAS_URL=http://finanzas:3004/api/v1/finanzas   # usado por: compras, control-obra
AUTH_URL=http://auth:3003/api/v1/auth               # usar solo si se requiere validación extra de identidad
```

---

## 13. Integraciones Externas

### SAT / CFDI (módulo `contabilidad`)

El módulo `contabilidad` se integra con un **adaptador externo SAT** para validación y timbrado de CFDI. Esta integración está encapsulada en el servicio auxiliar `contabilidad-sat-worker`.

**Variables de entorno requeridas** (activar con profile `sat`):
```
SAT_ADAPTER_BASE_URL=<url del adaptador PAC>
SAT_ADAPTER_API_KEY=<api key del adaptador>
SAT_CALLBACK_SHARED_SECRET=<secret para verificar webhooks del SAT>
SAT_ADAPTER_TIMEOUT_MS=30000
SAT_WORKER_RETRY_DELAY_MS=5000
SAT_WORKER_MAX_ATTEMPTS=3
```

**Activación en VPS:**
```bash
docker compose -f docker-compose.vps.yml --profile sat up -d contabilidad-sat-worker
```

**Sin el profile `sat`**, el worker no arranca y el módulo contabilidad opera en modo sin-timbrado (registra asientos pero no genera CFDI). Esto es el comportamiento normal en desarrollo y staging.

**Eventos del flujo SAT:**
```
contabilidad.solicitud_validacion_sat  → (worker envía al adaptador PAC)
contabilidad.cfdi_sat_validado         → callback del adaptador → contabilidad actualiza asiento
contabilidad.cfdi_conciliado           → reconciliación manual o automática
```

**Regla:** El secret `SAT_CALLBACK_SHARED_SECRET` nunca se hardcodea. El endpoint de callback verifica la firma HMAC de cada petición entrante. No modificar la lógica de verificación sin revisar con el equipo de contabilidad.

### Infraestructura de Producción

| Recurso | Detalle |
|---|---|
| Dominio | `iretum.com` y `www.iretum.com` → Caddy → `app-shell:80` |
| SSL | Let's Encrypt automático vía Caddy (renovación automática) |
| VPS | Hostinger Ubuntu, IP `72.60.114.12` |
| Compose file producción | `docker-compose.vps.yml --profile core` |
| Acceso SSH | `ssh -i bocam_vps_key root@72.60.114.12` |
| Acceso alternativo | Hostinger browser console (VNC web) |

---

## 14. Variables de Entorno

Cada módulo define su `.env` local. Variables obligatorias comunes:

```
DATABASE_URL=postgresql://...
JWT_SECRET=<mínimo 32 chars>
PORT=<número único por módulo>
RABBITMQ_URL=amqp://...          # o REDIS_URL si usa Redis
```

Variables de integración entre módulos (configurar en docker-compose):
```
FINANZAS_URL=http://finanzas:3004/api/v1/finanzas
AUTH_URL=http://auth:3003/api/v1/auth
```

Usar siempre `requireEnv('JWT_SECRET')` para variables críticas. Aplicar `.trim()` a secretos para evitar trailing `\n` de docker-compose.

---

## 15. Health Check (Obligatorio en Todo Módulo)

```typescript
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: '<modulo>', version: '1.0.0', timestamp: new Date().toISOString() });
});
```

Excluir `/health` del middleware de autenticación vía `excludePaths`.

---

## 16. Puertos de Módulos

> ⚠️ Tabla verificada contra `docker-compose.vps.yml`. Los puertos anteriores en este documento tenían errores — gerencia-tecnica era 3001, no 3008.

| Módulo | Puerto | Notas |
|---|---|---|
| `gerencia-tecnica` | 3001 | |
| `compras` | 3002 | |
| `auth` | 3003 | |
| `finanzas` | 3004 | |
| `control-obra` | 3005 | |
| `personal` | 3006 | |
| `seguridad` | 3007 | |
| `contabilidad` | 3008 | incluye `contabilidad-sat-worker` (profile `sat`) |
| `ventas` | 3012 | skeleton funcional; sin lógica de negocio ni integraciones aún |
| `app-shell` | 80 (interno) | expuesto en producción vía Caddy en 443 |

Infraestructura (no son módulos de negocio):

| Servicio | Puerto |
|---|---|
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ AMQP | 5672 |
| Caddy HTTP | 80 |
| Caddy HTTPS | 443 |

---

## 17. Reglas de Negocio Inquebrantables de iretum.com

Estas reglas definen el comportamiento del sistema en producción. **No modificar sin aprobación del equipo.**

### 17.1 Demo Mode

El tenant `iretum-demo` es el tenant de demostración pública. Cualquier vista que acceda a datos de negocio **debe** verificar primero:

```typescript
const isDemo = tenant?.id === 'iretum-demo';
if (isDemo) {
  // Usar demoData.ts — NO llamar al backend
  return;
}
```

El `demoData.ts` (`apps/app-shell/src/lib/demoData.ts`) es la única fuente de datos para el tenant demo. **Nunca conectar `iretum-demo` a endpoints reales.**

### 17.2 API Client — Archivo Intocable

`apps/app-shell/src/lib/api.ts` contiene la lógica central de autenticación del frontend:

- **JWT refresh automático**: cuando una llamada devuelve 401, el interceptor intenta renovar el token con `/api/v1/auth/refresh` antes de reintentar. Las llamadas concurrentes durante el refresh se encolan y se resuelven con el token nuevo.
- **Claves de localStorage**: `iretum_access_token` y `iretum_refresh_token`. Cambiar estas claves sin migrar los tokens activos forzará logout de todos los usuarios en producción.
- **Evento de sesión expirada**: `window.dispatchEvent(new CustomEvent('iretum:session-expired'))`. `TenantContext.tsx` escucha este evento para forzar el logout en la UI.
- **Sin `x-tenant-id` manual**: el tenant viaja en el JWT, nunca como header separado.

**No alterar los interceptores de axios en `api.ts` sin probar exhaustivamente el flujo 401 → refresh → reintento.**

### 17.3 Routing de Producción — Caddy

El archivo `docker/Caddyfile` define el routing en producción:

```
iretum.com, www.iretum.com {
    reverse_proxy app-shell:80
    encode gzip zstd
}
```

**Todo el tráfico de usuario pasa por el frontend (app-shell).** Los microservicios backend **no** están expuestos públicamente; solo son alcanzables dentro de la red Docker `bocam-vps-network`. El frontend llama a los backends a través del mismo host (Caddy hace reverse proxy de `/api/v1/...` hacia el servicio correspondiente si se configura, o el frontend llama internamente). **No exponer puertos de microservicios al exterior.**

### 17.4 Todos los Endpoints bajo `/api/v1/`

El prefijo `/api/v1/` es fijo e inmutable. No crear endpoints fuera de esta ruta ni sin la versión. La versión se incrementará a `/api/v2/` solo cuando exista breaking change real, y ambas versiones coexistirán durante un período de transición.

### 17.5 Flujo de Autorización Financiera

Cuando un monto supera el `limite_aprobacion` del usuario en el JWT:
1. El módulo (Compras o Finanzas) rechaza con `422` indicando que se requiere escalación.
2. El frontend muestra el flujo de "requiere autorización superior".
3. El superior autoriza con su propio JWT (con mayor `limite_aprobacion`).

**Nunca omitir la validación de límite** para acelerar un flujo de desarrollo. En demo mode se puede simular con `limite_aprobacion: Infinity`.

### 17.6 Eventos SAT — Idempotencia Crítica

Los callbacks del SAT pueden llegar duplicados (reintentos del adaptador PAC). El handler de `contabilidad.cfdi_sat_validado` **debe** usar `applyTerminalMutationInContext` para garantizar que el segundo callback no duplique el asiento. Esta es una regla de cumplimiento fiscal — una doble contabilización es un error legal.

### 17.7 Campos `tenant_id` y `proyecto_id` en Decimales

Al serializar `Decimal` de Prisma en respuestas JSON, siempre convertir:
```typescript
Number(campo.toNumber())  // ✅ correcto
campo                     // ❌ Prisma Decimal no es serializable a JSON directamente
```

---

## 18. Código Intocable (No Modificar Sin Revisión)

Los siguientes archivos tienen lógica crítica que afecta a todos los módulos o a la seguridad del sistema:

| Archivo | Razón |
|---|---|
| `packages/auth-middleware/src/middleware.ts` | Valida JWT y popula `req.securityContext`. Un cambio incorrecto rompe la autenticación de todos los módulos simultáneamente. |
| `packages/auth-middleware/src/types.ts` | El shape de `SecurityContext` es la interfaz central. Cambios requieren actualizar todos los módulos. |
| `packages/event-bus/src/index.ts` | La conexión al topic exchange `bocam.events`. Cambios en el exchange name rompen todos los suscriptores. |
| `apps/app-shell/src/lib/api.ts` | Lógica de JWT refresh (ver § 17.2). |
| `apps/app-shell/src/context/TenantContext.tsx` | Gestión del estado de sesión global en el frontend. |
| `docker/Caddyfile` | Routing de producción en iretum.com (ver § 17.3). |
| `.devcontainer/init-db/01-rls-setup.sql` | Funciones `set_app_context`, `get_current_tenant_id`, `get_current_proyecto_id`. Si se renombran, `createTenantContext` deja de funcionar. |

---

## 19. Deuda Técnica Conocida y Zonas de Riesgo

Estas brechas son conocidas y documentadas. No son bugs — son trabajo pendiente con impacto conocido. **Antes de implementar algo en estas áreas, leer el diagnóstico completo en `docs/checkpoints/2026-05-26-Fase0-Diagnostico-Brownfield.md`.**

| Prioridad | Módulo | Descripción | Impacto si se ignora |
|---|---|---|---|
| 🔴 CRÍTICO | `personal` | Motor de cálculo IMSS/ISR/retenciones ausente — valores se capturan directo desde `req.body` sin validar | Nómina real con montos incorrectos → problemas fiscales SAT |
| ~~🟠 ALTO~~ ✅ RESUELTO | `compras` | Saga distribuida OC: alerta automática implementada. Tabla `AlertaOcError`, path síncrono + asíncrono, endpoint `GET /alertas/oc-error`, 5/5 tests integración. Migración en producción. ~~**DT-001 pendiente:**~~ ✅ **DT-001 resuelta** — migración registrada en `_prisma_migrations` del VPS (2026-05-26). | — |
| 🟠 ALTO | `auth` | `MASTER_SECRET` sin audit log ni rate limiting en `POST /api/v1/master/tenants` | Brecha de aislamiento multi-tenant si el secreto se filtra |
| 🟡 MEDIO | `seguridad` | Degradación silenciosa del EventBus — todos los `eventBus.publish()` con `catch` vacío. Incidentes HSE pueden guardarse sin que el evento llegue a otros módulos | Pérdida de eventos en accidentes laborales reportables al STPS |
| 🟡 MEDIO | `gerencia-tecnica` | Sin congelación real de versiones de presupuesto — editar `costo_base` de un insumo después de OCs emitidas corrompe reportes de desviación retroactivamente | Reportes presupuestales incorrectos |
| 🟡 BAJO | `ventas` | Módulo skeleton: sin lógica de negocio, sin integración con Control de Obra ni Contabilidad | No apto para datos reales — solo demo |
| 🟡 BAJO | `compras` | IVA hardcodeado al 16% (`montoTotal = subtotal * 1.16`) — sin configurabilidad por tenant | No aplica a tasas reducidas (0% fronteras, servicios exentos) |

### Módulos con 0% de cobertura de tests

`personal`, `gerencia-tecnica`, `seguridad`, `ventas` — cualquier refactor en estos módulos es sin red de seguridad. Añadir tests antes de modificar lógica existente.

---

## 20. GitFlow y Conventional Commits

```
feature/BOCAM-<ID>-descripcion-corta
bugfix/BOCAM-<ID>-descripcion-corta
```

```
feat(compras): [BOCAM-42] agregar endpoint de reconciliación financiera
fix(auth): [BOCAM-17] trim trailing newline en JWT_SECRET
```

---

## 21. Checklist Pre-PR (Obligatorio)

- [ ] ¿Toda consulta a BD pasa por `createTenantContext`?
- [ ] ¿`tenant_id` y `proyecto_id` se leen del JWT, no del body?
- [ ] ¿Hay `@@index([tenant_id, proyecto_id])` en tablas transaccionales del schema?
- [ ] ¿Los eventos publicados incluyen `buildEventContext(req)` como `context`?
- [ ] ¿Los handlers de eventos usan `applyTerminalMutationInContext` si mutan estado crítico?
- [ ] ¿Los errores de negocio usan `logError/logWarn` en lugar de `console.error`?
- [ ] ¿El módulo exporta `startServer()` además de `app` para permitir pruebas?
- [ ] ¿Todos los endpoints protegidos validan roles con `requireRoles()`?
- [ ] ¿Existe el endpoint `/health` excluido del middleware JWT?
- [ ] ¿Las credenciales van en `.env` y no están hardcodeadas?
- [ ] ¿Los `Decimal` de Prisma se serializan con `Number(campo.toNumber())`?
- [ ] ¿El demo mode (`iretum-demo`) usa `demoData.ts` y NO llama al backend?
- [ ] ¿Los nuevos componentes de UI frontend usan `@bocam/ui-core` o los wrappers locales establecidos (no crear nuevos primitivos de forma aislada)?
