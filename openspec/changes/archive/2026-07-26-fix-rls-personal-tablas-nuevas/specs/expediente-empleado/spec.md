## ADDED Requirements

### Requirement: Aislamiento de `documentos_empleado` reforzado por RLS
La tabla `documentos_empleado` SHALL tener Row-Level Security habilitado y forzado con una única política que exija `tenant_id` coincidente con `current_setting('app.current_tenant_id')` en `USING` y `WITH CHECK`. Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id` que ya existe en el código de `apps/personal/src/main.ts`, dado que el expediente contiene documentos de identidad (INE, comprobante de domicilio, contratos) con datos personales sensibles.

#### Scenario: Un tenant no puede listar ni descargar documentos de otro tenant
- **WHEN** una consulta ejecuta `SELECT`/`findFirst` sobre `documentos_empleado` con `app.current_tenant_id` fijado a un tenant distinto al dueño del documento
- **THEN** la consulta retorna 0 filas, incluso si el `id_documento`/`empleado_id` coinciden y la consulta de aplicación no incluyera un `WHERE tenant_id` explícito

#### Scenario: Subida de documento no puede escribir en otro tenant
- **WHEN** una transacción con `app.current_tenant_id = T1` intenta crear una fila de `documentos_empleado` con `tenant_id = T2`
- **THEN** la operación es rechazada por `WITH CHECK`
