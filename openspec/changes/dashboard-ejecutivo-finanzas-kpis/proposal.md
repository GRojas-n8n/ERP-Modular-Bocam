## Why

Hallazgo H3 de la certificación M11 (19 nov 2026). Desde M8 (`optimizar-api-y-dashboard-finanzas`),
`GET /api/v1/finanzas/dashboard` responde el contrato estándar de `CLAUDE.md` (`{ kpis, alertas, actividad_reciente }`).
La tarjeta de Finanzas del dashboard ejecutivo seguía leyendo `data.resumenPresupuestal`, que ya no existe, y mostraba
"Error / Sin datos" aunque la respuesta era 200.

## What Changes

- `DashboardView` (dashboard ejecutivo): la tarjeta de Finanzas lee `data.kpis` (`total_autorizado`, `total_ejercido`,
  `total_comprometido`, `porcentaje_ejercido`).
- Prueba `DashboardView.ejecutivo-finanzas-kpis.test.tsx` con la respuesta real del servicio.

## Impact

- `apps/app-shell` únicamente. Sin cambio en el backend.
