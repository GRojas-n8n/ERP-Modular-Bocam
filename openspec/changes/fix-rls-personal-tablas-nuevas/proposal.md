## Why

`fix-rls-bypass-bocam-admin` (archivado 2026-07-11/12) cerró la cobertura de Row-Level
Security en las 9 tablas que existían entonces en `personal`. Desde entonces, dos
features (`asignacion-residente-empleado`/`expediente-empleado` y `asistencia-qr-segura`,
ambas desplegadas 2026-07-26) agregaron 5 tablas nuevas — `asignaciones_residente`,
`config_asistencia_proyecto`, `config_nomina_proyecto`, `credenciales_empleado`,
`documentos_empleado` — que nunca recibieron su `rls-policies.sql`. Verificado hoy en
producción (`bocam-vps-postgres`, base `bocam_personal`): las 5 tienen
`relrowsecurity=false`, sin ninguna política. Dos de ellas contienen datos sensibles
(`credenciales_empleado` = tokens de credencial QR de asistencia, `documentos_empleado` =
expediente digital del empleado). El rol de conexión (`bocam_app`) sigue sin
`BYPASSRLS`/`SUPERUSER` y las 9 tablas originales siguen protegidas — no reapareció el bug
de 2026-07-11, pero sí regresó la convención de "toda tabla con `tenant_id` lleva RLS".

Hoy cada endpoint de `apps/personal/src/main.ts` que toca estas 5 tablas ya filtra
`tenant_id`/`proyecto_id` explícitamente en el `where` de Prisma (auditado línea por
línea), así que no hay fuga activa confirmada — esto es cerrar una brecha de defensa en
profundidad antes de que un futuro endpoint la exponga, no un incidente en curso.

## What Changes

- Extender `apps/personal/prisma/rls-policies.sql` para habilitar y forzar RLS en las 5
  tablas nuevas, con la política combinada correcta (una sola `CREATE POLICY` con `AND`
  en `USING`/`WITH CHECK`, nunca dos políticas separadas — ese fue el bug de OR de
  2026-07-11).
  - `config_asistencia_proyecto`, `config_nomina_proyecto`: política `tenant_id AND
    proyecto_id` (tienen `proyecto_id` propio).
  - `asignaciones_residente`, `credenciales_empleado`, `documentos_empleado`: política
    solo `tenant_id` (comparten empleado entre proyectos, igual que `empleados`).
- Aplicar el script en producción (`bocam-vps-postgres`, base `bocam_personal`).
  Ownership ya es `bocam_app` en las 5 tablas — no requiere `REASSIGN`/`ALTER OWNER`.
- Agregar tests de integración de aislamiento cross-tenant/cross-proyecto: al menos una
  tabla con `proyecto_id` propio y una sin él, siguiendo el mismo patrón empírico usado
  en `fix-rls-bypass-bocam-admin` (2 contextos vía `set_config` directo, no solo vía
  endpoints HTTP — el gap es a nivel de política de Postgres, no de código de aplicación).

## Capabilities

### New Capabilities
(ninguna — este change no agrega comportamiento nuevo, cierra una brecha de aislamiento
de datos en capacidades ya existentes)

### Modified Capabilities
- `asistencia-qr-segura`: el aislamiento de `config_asistencia_proyecto` y
  `credenciales_empleado` pasa de depender 100% del filtro de aplicación a estar también
  reforzado por RLS a nivel de base de datos.
- `credencial-empleado`: `credenciales_empleado` gana RLS por `tenant_id`.
- `expediente-empleado`: `documentos_empleado` gana RLS por `tenant_id`.
- `asignacion-residente-empleado`: `asignaciones_residente` gana RLS por `tenant_id`.
- `periodicidad-pago-proyecto`: `config_nomina_proyecto` gana RLS por `tenant_id AND
  proyecto_id`.

## Impact

- **Código**: `apps/personal/prisma/rls-policies.sql` (extendido), nuevo test de
  integración en `apps/personal/test/integration/`.
- **Infra**: aplicar SQL contra `bocam_personal` en el VPS de producción vía
  `docker exec bocam-vps-postgres psql`. No requiere cambio de rol de conexión, no
  requiere reiniciar el contenedor `personal` (RLS se evalúa por conexión, no
  requiere redeploy de la app).
- **Sin cambios de API ni de contrato**: los endpoints ya filtran por tenant/proyecto;
  RLS es una capa adicional, no debería cambiar ninguna respuesta observable si el
  filtro de aplicación sigue siendo correcto.
