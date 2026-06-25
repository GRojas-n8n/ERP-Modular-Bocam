## Why

Los residentes y superintendentes no tienen pantalla de entrada contextual en su módulo. Necesitan ver al entrar: ¿qué OCs llegan hoy o esta semana?, ¿qué evaluaciones técnicas tengo pendientes de completar?, ¿cuántas requisiciones propias están en proceso?

## What Changes

- Vista de Residentes muestra sección de dashboard como entrada
- El microservicio correspondiente expone `GET /api/v1/control-obra/dashboard` (o el servicio asignado al residente) con KPIs del módulo

## Capabilities

### New Capabilities

- `dashboard-entrada-residentes`: Sección de dashboard con KPIs: OCs pendientes de recibir, evaluaciones técnicas asignadas pendientes, mis requisiciones activas, materiales recibidos este mes; alertas de OCs con entrega esperada hoy; actividad reciente de recepciones
- `endpoint-dashboard-residentes`: `GET /api/v1/control-obra/dashboard` (o servicio residente) con KPIs del proyecto activo filtrados por rol

### Modified Capabilities

(ninguna)

## Impact

- **Microservicio de residentes/control-obra**: nuevo endpoint `/dashboard`
- **`apps/app-shell`**: sección de dashboard en la vista del residente
