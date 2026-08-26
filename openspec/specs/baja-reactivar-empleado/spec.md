## ADDED Requirements

### Requirement: Un usuario personal_rh/admin SHALL poder reactivar un Empleado dado de baja
El sistema SHALL exponer `PATCH /api/v1/personal/empleados/:id/reactivar`, restringido a roles `personal_rh` o `admin`, que revierte un empleado con `estado: 'BAJA'` a `estado: 'ACTIVO'` y limpia `fecha_baja` (`null`). La operación NO SHALL alterar ninguna otra información del empleado (asignaciones históricas, documentos, credencial, historial de nómina).

#### Scenario: Reactivar un empleado dado de baja
- **WHEN** un usuario con rol `personal_rh` envía `PATCH /api/v1/personal/empleados/:id/reactivar` para un empleado con `estado: 'BAJA'`
- **THEN** el empleado queda con `estado: 'ACTIVO'` y `fecha_baja: null`, y la respuesta es 200 con el empleado actualizado

#### Scenario: Reactivar no restaura la cuadrilla anterior
- **WHEN** se reactiva un empleado que había sido dado de baja (y por tanto perdió su `cuadrilla_id`)
- **THEN** el empleado queda `ACTIVO` sin cuadrilla asignada — debe asignarse manualmente de nuevo, igual que un alta nueva

#### Scenario: Rol sin permiso intenta reactivar
- **WHEN** un usuario sin rol `personal_rh` ni `admin` intenta usar el endpoint de reactivación
- **THEN** el sistema responde 403 y no modifica el empleado

### Requirement: La UI de Personal SHALL exponer las acciones de baja y reactivación de un Empleado
La tabla de Empleados (`PersonalView.tsx`) SHALL mostrar un botón "Dar de baja" para cada empleado con `estado: 'ACTIVO'`, y un botón "Reactivar" para cada empleado con `estado: 'BAJA'`. Ambas acciones SHALL requerir confirmación explícita del usuario antes de ejecutarse.

#### Scenario: Dar de baja desde la tabla de empleados
- **WHEN** el usuario hace clic en "Dar de baja" para un empleado activo y confirma la acción
- **THEN** el sistema llama a `PATCH /api/v1/personal/empleados/:id/baja`, y al recibir 200 actualiza el badge de estado del empleado a "BAJA" en la tabla sin recargar la página

#### Scenario: Reactivar desde la tabla de empleados
- **WHEN** el usuario hace clic en "Reactivar" para un empleado dado de baja y confirma la acción
- **THEN** el sistema llama a `PATCH /api/v1/personal/empleados/:id/reactivar`, y al recibir 200 actualiza el badge de estado del empleado a "ACTIVO" en la tabla sin recargar la página

#### Scenario: Cancelar la confirmación no ejecuta la acción
- **WHEN** el usuario hace clic en "Dar de baja" o "Reactivar" pero cancela el diálogo de confirmación
- **THEN** el sistema no envía ninguna petición al backend y el estado del empleado no cambia
