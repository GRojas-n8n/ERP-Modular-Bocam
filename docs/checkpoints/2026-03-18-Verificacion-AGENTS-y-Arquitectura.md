# Checkpoint: Verificacion de Cumplimiento contra AGENTS.md y Arquitectura de Modulos

**Fecha:** 2026-03-18  
**Objetivo:** Verificar si el sistema actual cumple con `AGENTS.md`, con `Arquitectura de Módulos y Flujo de Datos.md` y con las directivas SSOT en `directives/`.

---

## Resultado ejecutivo

El sistema **cumple bien en el backend transaccional y en la arquitectura modular/event-driven**, pero **no cumple completamente** con las directivas de frontend, white-label y estandarizacion visual definidas en `AGENTS.md`.  
Tambien hay una **brecha de endurecimiento** en la implementacion RLS de varios wrappers de datos, porque aunque el patron es correcto, la inyeccion del contexto sigue usando `executeRawUnsafe`.

Conclusión breve:

- **Cumplimiento alto** en soberanía de datos, JWT centralizado, contexto `tenant_id + proyecto_id`, eventos y contratos inter-módulo.
- **Cumplimiento parcial** en RBAC uniforme endpoint por endpoint.
- **Incumplimiento claro** en white-label frontend, prohibición de CSS custom y uso obligatorio de `@bocam/ui-core`.
- **Cumplimiento parcial** de la visión objetivo, porque la arquitectura contempla un módulo de `Programación` / WBS que todavía no existe como servicio operativo.

---

## Lo que sí cumple

### 1. Soberania de datos y anti-join

La arquitectura real sigue el principio de módulos dueños de su propia base y de integración por HTTP/eventos:

- `Compras` llama a `Finanzas` por HTTP para suficiencia, compromisos y liberaciones en [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts)
- `Control de Obra` llama a `Finanzas` por HTTP para pagos en [apps/control-obra/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/main.ts)
- `Finanzas` y `Contabilidad` se coordinan via EventBus en [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts) y [apps/contabilidad/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/contabilidad/src/main.ts)

No encontré evidencia de joins SQL entre bases o tablas de distintos módulos.

### 2. Mandamiento de la doble jerarquia

Los esquemas transaccionales sí están modelados con `tenant_id` y `proyecto_id`, en línea con `AGENTS.md` y con el MDM:

- [apps/compras/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/prisma/schema.prisma)
- [apps/control-obra/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/prisma/schema.prisma)
- [apps/finanzas/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/prisma/schema.prisma)
- [apps/contabilidad/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/contabilidad/prisma/schema.prisma)

### 3. JWT centralizado y contexto de seguridad

El backend sí valida JWT y extrae contexto de seguridad desde el token, no desde el body:

- [packages/auth-middleware/src/middleware.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/middleware.ts)

Además, `App Shell` ya opera por `Authorization: Bearer <token>` y flujo de refresh:

- [apps/app-shell/src/lib/api.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/lib/api.ts)

### 4. Contexto en eventos y trazabilidad

La plataforma ya propaga `tenant_id`, `proyecto_id` y `correlation_id` por HTTP y EventBus:

- [packages/observability/src/index.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/observability/src/index.ts)
- [packages/event-bus/src/index.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/event-bus/src/index.ts)

Esto sí está alineado con la sección de interoperabilidad del documento arquitectónico.

---

## Incumplimientos y brechas

### 1. Frontend no cumple la directiva de cero CSS custom

`AGENTS.md` prohíbe explícitamente CSS personalizado y pide usar solo Tailwind. El `app-shell` todavía mantiene archivos CSS:

- [apps/app-shell/src/main.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/main.tsx#L3)
- [apps/app-shell/src/index.css](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/index.css)
- [apps/app-shell/src/App.css](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/App.css)

`index.css` funciona como capa base de Tailwind, pero **sigue siendo CSS custom**.  
`App.css` es todavía más claramente ajeno a la directiva y parece remanente de plantilla.

### 2. Frontend no cumple todavía la directiva white-label

`AGENTS.md` prohíbe hardcodear `"Bocam CRM"` o branding fijo y exige que el Shell renderice branding desde configuración del tenant.

Todavía hay branding fijo visible:

- [apps/app-shell/src/components/Layout.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/Layout.tsx#L76)
- [apps/app-shell/src/components/Layout.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/Layout.tsx#L78)
- [apps/app-shell/src/views/LoginView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/LoginView.tsx#L73)
- [apps/app-shell/src/views/LoginView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/LoginView.tsx#L185)
- [apps/app-shell/src/components/Icons.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/Icons.tsx)

Además, el login sigue con tenants de desarrollo hardcodeados:

- [apps/app-shell/src/views/LoginView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/LoginView.tsx#L36)

### 3. Frontend no cumple la directiva de usar `@bocam/ui-core` como design system central

`AGENTS.md` indica que no deben construirse componentes desde cero y que deben importarse desde `@bocam/ui-core`.  
Hoy sí existe el paquete [packages/ui-core/package.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/package.json), pero no encontré consumo real del paquete en `app-shell`.

El shell sigue renderizando botones, layout, iconografía y formularios con componentes locales:

- [apps/app-shell/src/components/Layout.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/Layout.tsx)
- [apps/app-shell/src/views/LoginView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/LoginView.tsx)
- [apps/app-shell/src/components/Icons.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/Icons.tsx)

### 4. RLS runtime cumple en intención, pero no en el estándar más seguro de implementación

Los wrappers de datos sí activan contexto RLS, pero varios módulos lo hacen con `SET LOCAL ...` vía `executeRawUnsafe` interpolado:

- [apps/compras/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/db.ts)
- [apps/finanzas/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/db.ts)
- [apps/control-obra/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/db.ts)
- [apps/contabilidad/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/contabilidad/src/db.ts)
- [apps/personal/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/src/db.ts)
- [apps/seguridad/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/src/db.ts)

`Auth` es el ejemplo más sano aquí, porque usa `set_config` parametrizado:

- [apps/auth/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/db.ts)

No parece haber un exploit directo obvio porque el contexto viene del JWT verificado, pero **sí hay desalineación** con el estándar de código defensivo que pide `AGENTS.md`.

### 5. La visión arquitectónica contempla `Programación`, pero el módulo no existe todavía como servicio operativo

El documento de arquitectura define `Programación` como módulo departamental y el flujo `PresupuestoBaseLiberado -> WbsAprobado`, pero en `apps/` no existe hoy un servicio equivalente.

Evidencia documental:

- [Arquitectura de Módulos y Flujo de Datos.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/Arquitectura%20de%20M%C3%B3dulos%20y%20Flujo%20de%20Datos.md)
- [directives/Visión Arquitectónica.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/directives/Visi%C3%B3n%20Arquitect%C3%B3nica.md)

Evidencia de backlog pendiente:

- [docs/checkpoints/2026-03-15-Hito-1-RLS-Infra.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docs/checkpoints/2026-03-15-Hito-1-RLS-Infra.md)
- [docs/checkpoints/2026-03-15-Hito-4-JWT-Auth.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docs/checkpoints/2026-03-15-Hito-4-JWT-Auth.md)

Esto no rompe el sistema actual, pero sí significa que el cumplimiento contra la arquitectura objetivo es **parcial**, no total.

### 6. Persisten restos heredados de headers manuales de tenant/proyecto en infraestructura frontend

Aunque el Shell ya opera con JWT, `nginx.conf` todavía reenvía `x-tenant-id` y `x-proyecto-id`:

- [apps/app-shell/nginx.conf](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/nginx.conf#L25)
- [apps/app-shell/nginx.conf](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/nginx.conf#L37)

Y el cliente todavía limpia llaves legacy en storage:

- [apps/app-shell/src/lib/api.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/lib/api.ts#L49)

No es una fuga activa, pero sí evidencia de transición incompleta frente a la regla de identidad centralizada.

---

## Cumplimiento por eje

### AGENTS.md

- Anti-join / soberanía de datos: **Cumple**
- JWT y contexto desde token: **Cumple**
- Doble jerarquía `tenant_id + proyecto_id`: **Cumple**
- Cero credenciales en runtime de producción: **Cumple mayormente en código productivo**
- Código defensivo estricto en capa DB: **Cumplimiento parcial**
- Frontend sin CSS custom: **No cumple**
- White-label sin branding fijo: **No cumple**
- Uso obligatorio de `@bocam/ui-core`: **No cumple**

### Arquitectura de Módulos y Flujo de Datos

- Separación modular: **Cumple**
- Comunicación HTTP/eventos: **Cumple**
- Flujo Compras -> Finanzas -> Contabilidad: **Cumple y está bastante maduro**
- Flujo Control de Obra -> Finanzas -> Contabilidad: **Cumple y está bastante maduro**
- Tolerancia a fallos por asíncronía: **Cumple razonablemente**
- Módulo Programación / WBS operativo: **No cumple todavía**

### Directives SSOT

- Visión arquitectónica general: **Cumplimiento alto**
- MDM (`tenant_id`, `proyecto_id`, entidades dueñas): **Cumplimiento alto**
- RBAC uniforme endpoint por endpoint: **Cumplimiento parcial**

---

## Veredicto

El sistema **sí está alineado con la arquitectura SaaS multi-tenant / multi-proyecto en su núcleo backend**.  
No sería correcto decir que “incumple la arquitectura” de forma general.

Pero tampoco sería correcto afirmar que “cumple totalmente con AGENTS.md”, porque hoy todavía hay **tres incumplimientos claros y vigentes**:

1. `app-shell` mantiene CSS custom.
2. `app-shell` mantiene branding hardcodeado en lugar de white-label completo.
3. `app-shell` todavía no está centralizado sobre `@bocam/ui-core`.

Y hay **dos brechas estructurales relevantes**:

1. Los wrappers RLS de varios módulos deben migrar de `executeRawUnsafe` a una forma parametrizada homogénea como `auth`.
2. El módulo `Programación` sigue siendo una pieza definida en la arquitectura, pero aún no materializada en `apps/`.

---

## Siguiente paso recomendado

Orden de trabajo recomendado para quedar realmente alineados con `AGENTS.md` y con la arquitectura:

1. Normalizar los wrappers `createTenantContext()` para eliminar `executeRawUnsafe`.
2. Limpiar `app-shell` de branding fijo y moverlo a configuración de tenant real.
3. Retirar `App.css` y cerrar la deuda de CSS custom.
4. Empezar la migración de componentes del shell a `@bocam/ui-core`.
5. Formalizar o implementar el módulo `Programación` si se quiere cerrar cumplimiento contra la arquitectura objetivo.

---

*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. - Estrictamente Confidencial.*
