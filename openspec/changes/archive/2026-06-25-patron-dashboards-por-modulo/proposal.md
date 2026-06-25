## Why

iRetum tiene vistas de módulo sin sección de entrada contextual: al abrir Compras, GT o Finanzas el usuario ve directamente una lista o tab vacío, sin resumen del estado del módulo. Además, varias vistas ya hacen llamadas a APIs de otros microservicios desde el frontend (violando el principio de BD independiente por servicio). Este change establece el patrón arquitectural que todos los dashboards de módulo deben seguir, antes de implementarlos individualmente.

## What Changes

- Cada módulo tiene una **sección de dashboard** como pantalla de entrada de su vista (no ruta separada): al navegar a `/compras`, `/finanzas`, etc., el usuario ve primero los KPIs del módulo antes de cualquier tab
- El frontend de cada módulo hace llamadas **solo a su propio microservicio** — prohibido llamar `/api/v1/otro-servicio/*` desde la vista de un módulo
- Si un módulo necesita datos de otro, el microservicio backend los obtiene vía **evento RabbitMQ** y los almacena en su propia BD — nunca el frontend cruza servicios
- Cada microservicio expone un endpoint `GET /api/v1/{servicio}/dashboard` que agrega los KPIs necesarios para su módulo en una sola llamada
- El dashboard de cada módulo se renderiza con un patrón visual consistente: **4 KPI cards + sección de alertas + tabla de actividad reciente**

## Capabilities

### New Capabilities

- `regla-no-cross-service-frontend`: Restricción arquitectural documentada — el frontend de cada módulo solo llama a su propio microservicio
- `endpoint-dashboard-por-servicio`: Cada microservicio expone `GET /api/v1/{servicio}/dashboard` con KPIs agregados del proyecto activo
- `patron-visual-dashboard`: Componente visual estándar de dashboard: 4 KPI cards + alertas + actividad reciente

### Modified Capabilities

(ninguna — es patrón nuevo, no modifica comportamiento existente)

## Impact

- **Todos los microservicios** deberán implementar `GET /api/v1/{servicio}/dashboard` en sus respectivos changes
- **`apps/app-shell`**: cada vista de módulo incorpora la sección de dashboard al entrar — los changes individuales de dashboard implementan esto
- **Arquitectura**: establece la prohibición de cross-service en frontend; cualquier dato cruzado debe llegar vía RabbitMQ al backend del módulo que lo necesita
- Este change es **solo documentación de patrón y specs** — no genera código directamente; los changes `dashboard-*` lo implementan
