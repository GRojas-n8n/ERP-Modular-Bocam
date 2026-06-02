# Proposal — Dashboard Ejecutivo Consolidado

## Why

El `DashboardView` actual muestra datos parciales de algunos módulos. No existe una vista
de dirección que consolide los KPIs críticos del negocio en tiempo real: avance de obra
vs presupuesto, estado de nómina, OCs pendientes, incidentes HSE abiertos, documentos
de calidad pendientes. El superintendente y la dirección no tienen un único punto de
monitoreo.

## What Changes

- **MODIFICADO** `DashboardView` para usuarios con roles `superintendent` y `admin` —
  nuevo diseño con secciones por área: Obra, Compras, Personal, Seguridad, Calidad.
- **NUEVOS** endpoints de resumen en cada módulo backend para alimentar el dashboard
  (cada módulo expone un `GET /resumen-dashboard` que consolida sus KPIs principales).
- **NUEVO** layout de cards ejecutivas con `OperationalBanner` y `MetricCard` de `@bocam/ui-core`.

## Capabilities

### New Capabilities

- `dashboard-ejecutivo`: Vista consolidada para superintendent/admin con KPIs en tiempo
  real de todos los módulos: % avance obra, OCs por aprobar, costo comprometido vs
  presupuesto, nóminas pendientes, incidentes HSE abiertos, documentos calidad en revisión.
- `resumen-por-modulo`: Cada módulo expone `GET /resumen-dashboard` autenticado con JWT,
  accesible para superintendent y admin. El frontend llama en paralelo a todos los módulos.

## Impact

- **Frontend:** `DashboardView.tsx` — rediseño completo para roles ejecutivos, sin cambio
  para otros roles.
- **Backend (múltiples módulos):** endpoint `/resumen-dashboard` liviano en compras,
  control-obra, personal, seguridad, calidad.
- **Sin cambios en:** schema, infraestructura, otros flujos.
