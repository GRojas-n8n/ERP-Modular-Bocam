## ADDED Requirements

### Requirement: Aislamiento de `config_nomina_proyecto` reforzado por RLS
La tabla `config_nomina_proyecto` SHALL tener Row-Level Security habilitado y forzado con una única política que exija `tenant_id` Y `proyecto_id` coincidentes con `current_setting('app.current_tenant_id')` / `current_setting('app.current_proyecto_id')`, combinados con `AND` en `USING` y `WITH CHECK`. Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id`/`proyecto_id` que ya existe en el código de `apps/personal/src/main.ts` (`GET`/`PUT /config-nomina` y la lectura dentro de `calcular`).

#### Scenario: Sesión de un proyecto no ve ni sobreescribe la periodicidad de otro proyecto
- **WHEN** una consulta ejecuta `findFirst`/`upsert` sobre `config_nomina_proyecto` con `app.current_proyecto_id` fijado al proyecto `P1` (mismo tenant que `P2`)
- **THEN** la fila de `config_nomina_proyecto` de `P2` no es visible ni modificable desde la sesión de `P1`, incluso si la consulta de aplicación no incluyera un `WHERE proyecto_id` explícito
