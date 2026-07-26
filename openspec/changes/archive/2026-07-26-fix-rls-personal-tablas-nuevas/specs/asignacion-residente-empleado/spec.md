## ADDED Requirements

### Requirement: Aislamiento de `asignaciones_residente` reforzado por RLS
La tabla `asignaciones_residente` SHALL tener Row-Level Security habilitado y forzado con una única política que exija `tenant_id` coincidente con `current_setting('app.current_tenant_id')` en `USING` y `WITH CHECK`. Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id` que ya existe en el código de `apps/personal/src/main.ts` en los endpoints de asignación/desasignación de residente y en `GET /mis-empleados`.

#### Scenario: Un tenant no puede ver asignaciones residente-empleado de otro tenant
- **WHEN** una consulta ejecuta `findMany` sobre `asignaciones_residente` con `app.current_tenant_id` fijado a un tenant distinto
- **THEN** la consulta retorna 0 filas de ese otro tenant, incluso si la consulta de aplicación no incluyera un `WHERE tenant_id` explícito

#### Scenario: Asignación no puede escribir en otro tenant
- **WHEN** una transacción con `app.current_tenant_id = T1` intenta crear una fila de `asignaciones_residente` con `tenant_id = T2`
- **THEN** la operación es rechazada por `WITH CHECK`
