## Why

El módulo de Compras no tiene pantalla de entrada contextual. Al abrir `/compras` el usuario ve directamente la lista de requisiciones sin ningún resumen del estado actual. El comprador necesita saber de un vistazo: ¿cuántas reqs esperan mi atención?, ¿hay cotizaciones vencidas?, ¿qué OCs están pendientes de recibir?

## What Changes

- `ComprasView.tsx` muestra una sección de dashboard como entrada (antes de los tabs existentes)
- El microservicio `apps/compras` expone `GET /api/v1/compras/dashboard` con KPIs agregados
- El botón "Enviar Cotización" que ya no aplica a reqs con cuadro en estado terminal se oculta (ya corregido en commit anterior — solo documentar el comportamiento)

## Capabilities

### New Capabilities

- `dashboard-entrada-compras`: Sección de dashboard al entrar a `/compras` con 4 KPI cards (Total REQs, Pendiente aprobación, Lista para cotizar, OCs emitidas), alertas de cotizaciones vencidas y OCs sin confirmar entrega, y tabla de actividad reciente (últimas 5 REQs modificadas)
- `endpoint-dashboard-compras`: `GET /api/v1/compras/dashboard` que retorna KPIs, alertas y actividad reciente del módulo de compras en el proyecto activo

### Modified Capabilities

(ninguna)

## Impact

- **`apps/compras/src/main.ts`**: nuevo endpoint `GET /api/v1/compras/dashboard`
- **`apps/app-shell/src/views/ComprasView.tsx`**: nueva sección de dashboard antes de los tabs
