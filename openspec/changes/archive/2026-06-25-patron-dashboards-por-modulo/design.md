## Context

iRetum es un monorepo con microservicios independientes (una BD por servicio, sin JOINs cruzados). El frontend es un SPA React con vistas por módulo. El problema actual: algunas vistas llaman APIs de múltiples servicios directamente, y no hay dashboard de entrada en ningún módulo. Este change define el patrón que los 8 changes de dashboard individuales deben seguir.

## Goals / Non-Goals

**Goals:**
- Definir la estructura visual estándar de dashboard: 4 KPI cards + alertas + actividad reciente
- Definir la regla de no-cross-service en frontend (norma de arquitectura)
- Definir el contrato del endpoint `/dashboard` que cada microservicio debe exponer
- Servir como referencia para todos los changes `dashboard-*`

**Non-Goals:**
- Implementar código en este change — los changes individuales lo hacen
- Definir los KPIs específicos de cada módulo — cada change de dashboard los define
- Crear un dashboard "global" o "ejecutivo" — cada módulo tiene el suyo

## Decisions

### D1: Dashboard como sección, no como ruta separada
**Decisión:** El dashboard es la sección visible al entrar al módulo, antes de los tabs. Ruta `/compras` → muestra dashboard + tabs (Requisiciones, Catálogo, etc.).
**Razón:** Evita una ruta extra `/compras/dashboard` que el usuario tendría que memorizar. El dashboard es la puerta de entrada natural al módulo.

### D2: Un endpoint `/dashboard` por microservicio
**Decisión:** Cada microservicio implementa `GET /api/v1/{servicio}/dashboard` que retorna todos los KPIs en una sola llamada.
**Razón:** Minimiza el número de requests al entrar a un módulo. Un fetch → dashboard completo. Alternativa descartada: N endpoints separados por KPI (más flexible pero más requests y más complejidad en frontend).

### D3: Prohibición de cross-service en frontend
**Decisión:** La vista de un módulo SOLO puede llamar a su propio microservicio. Si necesita datos de otro módulo, el backend los proyecta vía evento RabbitMQ a su propia BD.
**Razón:** Mantiene el aislamiento de microservicios. Si Finanzas cayera, Compras no se rompe. Alternativa descartada: BFF (Backend for Frontend) — añade una capa extra que el proyecto no necesita ahora.

### D4: Patrón visual consistente entre módulos
**Decisión:** Todos los dashboards usan el mismo layout: fila de 4 `<StatCard>` en la parte superior, sección colapsable de alertas (solo si hay alertas), tabla de actividad reciente.
**Razón:** Consistencia de UX — el usuario que conoce el dashboard de Compras entiende inmediatamente el de Finanzas. Se implementa con componentes compartidos en `packages/ui-core` o como patrón en cada vista.

## Risks / Trade-offs

- **[Riesgo] Datos desactualizados vía RabbitMQ** → Si un evento se pierde, el módulo muestra datos stale. Mitigación: TTL corto en caché + botón de refresh manual en el dashboard.
- **[Trade-off] Duplicación de datos** → Algunos datos se almacenan en dos BDs (ej: count de OCs en Finanzas). Aceptable — es el costo del aislamiento de microservicios; la fuente de verdad sigue siendo el servicio origen.

## Open Questions

- ¿Los StatCards son componentes de `packages/ui-core` o se definen localmente en cada vista? → Decisión de cada change de dashboard; preferible reutilizar si ya existen en ui-core.
- ¿El endpoint `/dashboard` requiere autenticación con `proyecto_id`? → Sí, todos los endpoints usan `securityContext` del auth-middleware existente.
