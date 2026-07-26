## ADDED Requirements

### Requirement: Aislamiento de `config_asistencia_proyecto` reforzado por RLS
La tabla `config_asistencia_proyecto` SHALL tener Row-Level Security habilitado y forzado (`ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`) con una única política que exija `tenant_id` Y `proyecto_id` coincidentes con `current_setting('app.current_tenant_id')` / `current_setting('app.current_proyecto_id')`, combinados con `AND` en `USING` y `WITH CHECK` (nunca dos políticas `CREATE POLICY` separadas — Postgres las combina con `OR`, no con `AND`, dejando pasar filas de otro proyecto o tenant). Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id`/`proyecto_id` que ya existe en el código de `apps/personal/src/main.ts`.

#### Scenario: Sesión de un proyecto no ve el geofencing de otro proyecto del mismo tenant
- **WHEN** una consulta ejecuta `SELECT` sobre `config_asistencia_proyecto` con `app.current_proyecto_id` fijado al proyecto `P1` (mismo `tenant_id` que `P2`)
- **THEN** la fila de `config_asistencia_proyecto` configurada para `P2` no aparece en el resultado, incluso si la consulta de aplicación no incluyera un `WHERE proyecto_id` explícito

#### Scenario: Intento de `UPDATE`/`UPSERT` cruzando proyecto es rechazado por la política, no solo por el código
- **WHEN** una transacción con `app.current_proyecto_id = P1` intenta actualizar o insertar una fila de `config_asistencia_proyecto` con `proyecto_id = P2`
- **THEN** la operación afecta 0 filas por `WITH CHECK`, en vez de escribir silenciosamente en el proyecto equivocado
