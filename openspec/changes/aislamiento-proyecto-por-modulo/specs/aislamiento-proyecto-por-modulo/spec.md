## ADDED Requirements

### Requirement: Finanzas SHALL permitir modo global con trazabilidad en tablas de pago
Las políticas RLS de `programa_pagos`, `pagos_oc` y `detalles_pago_oc` en el microservicio `finanzas` SHALL usar el patrón `tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())`, de forma que una sesión sin `proyecto_id` activo en el contexto de base de datos vea las filas de todos los proyectos del tenant, y una sesión con `proyecto_id` activo siga viendo solo las de ese proyecto. Las políticas RLS de `presupuestos_asignados`, `movimientos_presupuestales` y `proyectos_finanzas` NO SHALL cambiar — permanecen en el patrón estricto (`AND proyecto_id = current_proyecto_id()`, sin la rama `IS NULL`).

Cada política SHALL seguir declarándose como una única política PERMISSIVE combinada por tabla (condición de tenant y de proyecto en el mismo `USING`/`WITH CHECK`), nunca como dos políticas separadas — Postgres combina políticas PERMISSIVE múltiples sobre la misma tabla y comando con `OR`, no con `AND`, lo cual abriría una fuga entre proyectos (y, si el `proyecto_id` coincidiera por azar, entre tenants).

#### Scenario: Sesión sin proyecto activo lee pagos de todos los proyectos del tenant
- **WHEN** una consulta a `programa_pagos`, `pagos_oc` o `detalles_pago_oc` se ejecuta con `app.current_tenant_id` fijado y `app.current_proyecto_id` sin fijar (NULL) en la sesión de base de datos
- **THEN** la consulta retorna filas de todos los proyectos del tenant, cada una con su `proyecto_id` original visible en el resultado

#### Scenario: Sesión con proyecto activo sigue viendo solo ese proyecto
- **WHEN** una consulta a `programa_pagos`, `pagos_oc` o `detalles_pago_oc` se ejecuta con `app.current_proyecto_id` fijado a un proyecto específico
- **THEN** la consulta retorna únicamente filas de ese `proyecto_id`, igual que antes de este cambio

#### Scenario: Tablas de presupuesto de Finanzas permanecen estrictas
- **WHEN** una consulta a `presupuestos_asignados`, `movimientos_presupuestales` o `proyectos_finanzas` se ejecuta con `app.current_proyecto_id` sin fijar (NULL) en la sesión de base de datos
- **THEN** la consulta retorna cero filas (comportamiento sin cambios respecto a antes de este cambio) — estas tablas no adoptan el modo global

### Requirement: Personal SHALL exponer el proyecto de cada asignación activa en el listado de empleados
`GET /api/v1/personal/empleados` SHALL incluir, para cada asignación activa (`AsignacionFrente` con `estado = 'ACTIVA'`) de cada empleado en la respuesta, el campo `proyecto_id` de esa asignación, además de `frente_trabajo` que ya se incluye hoy.

#### Scenario: Empleado con una sola asignación activa
- **WHEN** se llama `GET /api/v1/personal/empleados` y un empleado tiene exactamente una `AsignacionFrente` con `estado = 'ACTIVA'`
- **THEN** el objeto de ese empleado en la respuesta incluye un arreglo de asignaciones activas con un elemento, y ese elemento incluye `proyecto_id`

#### Scenario: Empleado con múltiples asignaciones activas simultáneas
- **WHEN** se llama `GET /api/v1/personal/empleados` y un empleado tiene 2 o más `AsignacionFrente` con `estado = 'ACTIVA'` en proyectos distintos (incluyendo asignaciones con `es_prestamo = true`)
- **THEN** el objeto de ese empleado en la respuesta incluye un arreglo con una entrada por cada asignación activa, cada una con su propio `proyecto_id`
