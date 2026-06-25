## Why

El módulo de Gerencia Técnica no tiene pantalla de entrada contextual. El gerente técnico necesita saber al entrar: ¿qué cuadros esperan mi firma o aprobación?, ¿cuántas evaluaciones técnicas están en curso?, ¿hay algo vencido o bloqueado?

## What Changes

- `GTView.tsx` (o la vista equivalente del módulo GT) muestra sección de dashboard como entrada
- `apps/gerencia-tecnica` expone `GET /api/v1/gerencia-tecnica/dashboard` con KPIs del módulo

## Capabilities

### New Capabilities

- `dashboard-entrada-gt`: Sección de dashboard al entrar al módulo GT con KPIs: cuadros pendientes de su revisión, cuadros en evaluación técnica, cuadros aprobados este mes, y monto total comprometido en cuadros aprobados
- `endpoint-dashboard-gt`: `GET /api/v1/gerencia-tecnica/dashboard` con KPIs, alertas (cuadros esperando más de N días) y actividad reciente

### Modified Capabilities

(ninguna)

## Impact

- **`apps/gerencia-tecnica/src/main.ts`**: nuevo endpoint `GET /api/v1/gerencia-tecnica/dashboard`
- **`apps/app-shell`**: sección de dashboard en la vista de Gerencia Técnica
