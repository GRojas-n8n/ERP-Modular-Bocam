## Why

El director de proyecto y control de obra necesitan una vista ejecutiva del proyecto: avance físico por capítulo WBS, presupuesto ejercido vs autorizado, riesgos activos y semáforo de estado general. Actualmente no existe ninguna pantalla de resumen ejecutivo.

## What Changes

- Vista de Control de Obra / Director muestra sección de dashboard ejecutivo como entrada
- El microservicio `apps/control-obra` expone `GET /api/v1/control-obra/dashboard` con métricas de avance y riesgo

## Capabilities

### New Capabilities

- `dashboard-entrada-control-obra`: Sección de dashboard con semáforo por capítulo WBS (% avance físico), KPIs: avance físico global, presupuesto ejercido %, semanas transcurridas vs total, riesgos activos; alertas de capítulos con atraso; actividad reciente de estimaciones
- `endpoint-dashboard-control-obra`: `GET /api/v1/control-obra/dashboard` con métricas de avance por WBS, riesgos y presupuesto del proyecto activo

### Modified Capabilities

(ninguna)

## Impact

- **`apps/control-obra/src/main.ts`**: nuevo endpoint `GET /api/v1/control-obra/dashboard`
- **`apps/app-shell`**: sección de dashboard en la vista de Control de Obra
