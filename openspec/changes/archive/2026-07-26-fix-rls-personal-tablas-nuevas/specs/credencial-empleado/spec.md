## ADDED Requirements

### Requirement: Aislamiento de `credenciales_empleado` reforzado por RLS
La tabla `credenciales_empleado` SHALL tener Row-Level Security habilitado y forzado con una única política que exija `tenant_id` coincidente con `current_setting('app.current_tenant_id')` en `USING` y `WITH CHECK` (solo `tenant_id` — la credencial, igual que el empleado, no está scoped a un proyecto). Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id` que ya existe en el código de `apps/personal/src/main.ts`.

#### Scenario: Un tenant no puede resolver el token de credencial de otro tenant
- **WHEN** una consulta ejecuta `SELECT ... WHERE token = X` sobre `credenciales_empleado` con `app.current_tenant_id` fijado a un tenant distinto al dueño de esa credencial
- **THEN** la consulta retorna 0 filas, incluso si el `token` es correcto y la consulta de aplicación no incluyera un `WHERE tenant_id` explícito

#### Scenario: Emisión de credencial no puede escribir en otro tenant
- **WHEN** una transacción con `app.current_tenant_id = T1` intenta crear una fila de `credenciales_empleado` con `tenant_id = T2`
- **THEN** la operación es rechazada por `WITH CHECK`, en vez de insertar silenciosamente una credencial cross-tenant
