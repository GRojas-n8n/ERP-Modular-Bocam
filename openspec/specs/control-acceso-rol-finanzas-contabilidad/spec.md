# control-acceso-rol-finanzas-contabilidad Specification

## Purpose

Todas las rutas protegidas del microservicio de contabilidad (asientos,
cuentas, dashboard, reportes contables, conciliación de CFDI,
conciliaciones fiscales y conciliaciones bancarias) verifican el rol
real `'finanzas'` (español) asignado a los usuarios de Finanzas del
sistema, no un nombre en inglés inexistente.

## Requirements

### Requirement: Los endpoints protegidos del microservicio de contabilidad SHALL verificar el rol real 'finanzas'
Todas las rutas protegidas de `apps/contabilidad/src/main.ts` SHALL verificar que `securityContext.roles` incluya `'finanzas'` (español, el rol real asignado a los usuarios de Finanzas), no `'finance'` (inglés, un rol que no existe en el sistema). Esto aplica a: asientos contables, cuentas, dashboard, reportes (balanza de comprobación, estado de resultados, balance general, libro diario), conciliación de CFDI, conciliaciones fiscales (monitoreo SAT, reintentar, validar, validar externo) y conciliaciones bancarias (conciliar, validar/ejecutar archivo, lote).

#### Scenario: Usuario con rol finanzas conciliar CFDI de un asiento
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi` con datos
  válidos
- **THEN** la respuesta no es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas consulta asientos, cuentas y dashboard
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `GET /api/v1/contabilidad/asientos`, `GET
  /api/v1/contabilidad/cuentas` o `GET /api/v1/contabilidad/dashboard`
- **THEN** ninguna de las respuestas es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas genera reportes contables
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `GET /api/v1/contabilidad/reportes/balanza-comprobacion`,
  `GET /api/v1/contabilidad/reportes/estado-resultados`,
  `GET /api/v1/contabilidad/reportes/balance-general` o
  `GET /api/v1/contabilidad/reportes/libro-diario`
- **THEN** ninguna de las respuestas es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas opera conciliaciones fiscales (SAT)
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `GET /api/v1/contabilidad/conciliaciones-fiscales/monitoreo/sat-pendientes`,
  `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/reintentar-sat`,
  `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat` o
  `POST /api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat-externo`
- **THEN** ninguna de las respuestas es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas opera conciliaciones bancarias
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `POST /api/v1/contabilidad/asientos/:id/conciliar-banco`,
  `POST /api/v1/contabilidad/conciliaciones-bancarias/archivo/validar`,
  `POST /api/v1/contabilidad/conciliaciones-bancarias/archivo/ejecutar` o
  `POST /api/v1/contabilidad/conciliaciones-bancarias/lote`
- **THEN** ninguna de las respuestas es 403 por motivo de rol

#### Scenario: Usuario con el rol inexistente 'finance' (sin 'finanzas', 'admin' ni 'superintendent') no puede acceder
- **WHEN** un usuario cuyo `roles` es `['finance']` (rol en inglés que no
  existe en el sistema) envía cualquiera de las peticiones anteriores
- **THEN** la respuesta es 403 con el código de error de autorización que
  ya usa `requireRoles` en este servicio
