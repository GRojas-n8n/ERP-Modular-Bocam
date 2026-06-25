## ADDED Requirements

### Requirement: Endpoint /dashboard por microservicio
Cada microservicio SHALL exponer `GET /api/v1/{servicio}/dashboard` protegido por auth-middleware que retorna en una sola respuesta todos los KPIs necesarios para la sección de entrada del módulo correspondiente. El endpoint usa `securityContext.proyectoId` para filtrar datos del proyecto activo.

#### Scenario: Dashboard retorna datos del proyecto activo
- **WHEN** usuario autenticado hace `GET /api/v1/compras/dashboard`
- **THEN** el sistema retorna 200 con KPIs calculados para el `proyecto_id` del token JWT, en tiempo < 500ms

#### Scenario: Proyecto sin actividad
- **WHEN** el proyecto no tiene datos aún en el módulo
- **THEN** todos los KPIs retornan 0 o arrays vacíos — nunca 404 ni 500

#### Scenario: Estructura mínima de respuesta
- **WHEN** cualquier microservicio responde su `/dashboard`
- **THEN** el response incluye al menos: `kpis: {}` (objeto con métricas numéricas), `alertas: []` (items que requieren atención), `actividad_reciente: []` (últimos N eventos del módulo)
