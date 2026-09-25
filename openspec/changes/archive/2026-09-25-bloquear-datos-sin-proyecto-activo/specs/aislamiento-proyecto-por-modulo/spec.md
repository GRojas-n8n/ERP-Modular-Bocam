## ADDED Requirements

### Requirement: Las rutas project-scoped de Finanzas y Personal SHALL exigir proyecto activo incluso para roles de nivel-tenant
Los roles de nivel-tenant (`admin`, `superintendent`, `finanzas`, `personal_rh`) conservan la exención de asignación explícita de `requireProjectAccess()`, pero SHALL recibir `403 AUTH_PROJECT_REQUIRED` cuando `securityContext.proyectoId` esté vacío en las rutas project-scoped enumeradas:

- Finanzas: `/api/v1/finanzas/suficiencia`, `/presupuestos`, `/movimientos`, `/transferencias-presupuestales`, `/comprometer-fondos`, `/liberar-fondos`, `/proyectos` y `/reportes/pagado-por-concepto`.
- Personal: `/api/v1/personal/cuadrillas`, `/asignaciones`, `/config-nomina`, `/prenominas`, `/asistencia`, `/config-asistencia`, `/mis-empleados`, `/complementos`, `/dashboard` y `/resumen-dashboard`.

El modo global con trazabilidad de las tablas de pago de Finanzas y el catálogo laboral de Personal (empleados, documentos, credenciales) NO SHALL verse afectados: solo pierden el modo global las rutas enumeradas.

#### Scenario: Rol de nivel-tenant sin proyecto llama una ruta de presupuestos de Finanzas
- **WHEN** un usuario `finanzas` o `admin` sin proyecto activo llama `GET /api/v1/finanzas/presupuestos`
- **THEN** el servicio responde `403 AUTH_PROJECT_REQUIRED` sin consultar datos

#### Scenario: Pagos de Finanzas conservan el modo global con trazabilidad
- **WHEN** un usuario `finanzas` sin proyecto activo consulta las tablas de pago cubiertas por el requisito de modo global
- **THEN** continúa recibiendo las filas de todos los proyectos del tenant, cada una con su `proyecto_id`

#### Scenario: Operación de obra de Personal sin proyecto activo
- **WHEN** un usuario `personal_rh` sin proyecto activo llama `GET /api/v1/personal/prenominas`
- **THEN** el servicio responde `403 AUTH_PROJECT_REQUIRED`, mientras `GET /api/v1/personal/empleados` sigue devolviendo el catálogo laboral del tenant
