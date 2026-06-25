## Why

El módulo de Calidad (ISO 9001) no tiene pantalla de entrada contextual. El responsable de calidad necesita ver al entrar: no conformidades abiertas y vencidas, próximas auditorías, y KPIs de calidad del período.

## What Changes

- Vista de Calidad muestra sección de dashboard como entrada
- `apps/calidad` expone `GET /api/v1/calidad/dashboard` con KPIs de calidad del proyecto

## Capabilities

### New Capabilities

- `dashboard-entrada-calidad`: Sección de dashboard con KPIs: NCs abiertas, NCs vencidas (alerta roja), próxima auditoría (días restantes), índice de conformidad del período; alertas de NCs vencidas con CTA; actividad reciente de NCs cerradas
- `endpoint-dashboard-calidad`: `GET /api/v1/calidad/dashboard` con métricas ISO 9001 del proyecto activo

### Modified Capabilities

(ninguna)

## Impact

- **`apps/calidad/src/main.ts`**: nuevo endpoint `GET /api/v1/calidad/dashboard`
- **`apps/app-shell`**: sección de dashboard en la vista de Calidad
