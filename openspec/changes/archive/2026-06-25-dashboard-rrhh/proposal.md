## Why

El módulo de RRHH (Personal) no tiene pantalla de entrada contextual. El responsable de RRHH necesita ver al entrar: asistencia del día, estado de nómina, contratos por vencer e incidencias pendientes de atender.

## What Changes

- Vista de RRHH / Personal muestra sección de dashboard como entrada
- `apps/personal` expone `GET /api/v1/personal/dashboard` con KPIs de RRHH

## Capabilities

### New Capabilities

- `dashboard-entrada-rrhh`: Sección de dashboard con KPIs: empleados activos, faltas sin justificar hoy, días para el próximo corte de nómina, contratos por vencer este mes; alertas de faltas injustificadas > 3 días y contratos venciendo en 7 días; actividad reciente de incidencias
- `endpoint-dashboard-rrhh`: `GET /api/v1/personal/dashboard` con métricas de plantilla y nómina del proyecto/tenant activo

### Modified Capabilities

(ninguna)

## Impact

- **`apps/personal/src/main.ts`**: nuevo endpoint `GET /api/v1/personal/dashboard`
- **`apps/app-shell`**: sección de dashboard en la vista de RRHH/Personal
