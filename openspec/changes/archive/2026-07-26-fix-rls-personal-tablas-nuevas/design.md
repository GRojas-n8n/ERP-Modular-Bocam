## Context

`apps/personal/prisma/rls-policies.sql` cubre 9 tablas desde el change
`fix-rls-bypass-bocam-admin` (archivado 2026-07-11/12): `empleados`, `cuadrillas`,
`asignaciones_frente`, `pre_nominas`, `pre_nomina_detalles`, `registros_asistencia`,
`config_deducciones_empleados`, `nominas_complementarias`, `nominas_complementarias_detalle`.
Ese change dejó dos lecciones que aplican aquí:

1. Postgres combina políticas PERMISSIVE múltiples sobre la misma tabla/comando con
   `OR`, no con `AND` — declarar `tenant_id` y `proyecto_id` como dos `CREATE POLICY`
   separadas reintroduce fuga cross-proyecto/cross-tenant. Siempre una sola política
   con `AND` explícito.
2. `empleados` usa política solo-`tenant_id` porque un empleado se comparte entre
   proyectos del mismo tenant (no tiene `proyecto_id` propio). El mismo criterio
   aplica a `asignaciones_residente`, `credenciales_empleado` y `documentos_empleado`
   — ninguna tiene `proyecto_id` propio, todas cuelgan de `empleado_id`.

Verificado hoy en producción (`bocam-vps-postgres`, `bocam_personal`): las 5 tablas
nuevas están en `public`, con ownership ya en `bocam_app` (no requieren `REASSIGN`/
`ALTER OWNER`, a diferencia del trabajo original de 2026-07-11 que sí tuvo que migrar
ownership). `bocam_app` sigue sin `BYPASSRLS`/`SUPERUSER`.

## Goals / Non-Goals

**Goals:**
- Habilitar y forzar RLS en las 5 tablas nuevas con el patrón correcto (una política,
  `AND` explícito donde aplica `proyecto_id`).
- Verificar con un test de integración real (2 contextos vía `set_config` directo,
  no solo vía endpoints HTTP) que el aislamiento ocurre a nivel de política de
  Postgres, no solo por el filtro de aplicación.
- Aplicar en producción sin downtime del contenedor `personal` (RLS se evalúa por
  conexión/transacción, no requiere rebuild ni restart).

**Non-Goals:**
- No se toca el filtro de aplicación existente en `apps/personal/src/main.ts` — ya
  filtra correctamente por `tenant_id`/`proyecto_id` en todos los endpoints
  auditados; este change es puro backstop de base de datos.
- No se audita RLS en otros microservicios — el mismo drift (tablas nuevas sin
  política desde 2026-07-11) podría existir en otros servicios que hayan agregado
  tablas después de esa fecha, pero eso queda fuera de alcance de este change
  (ver Open Questions).
- No se cambia el rol de conexión (`bocam_app`) ni su ownership — ya están
  correctos.

## Decisions

**Una sola política combinada por tabla, no dos.** Igual que las 9 tablas
existentes: `CREATE POLICY <nombre> ON <tabla> USING (tenant_id::text = ... AND
proyecto_id::text = ...) WITH CHECK (...)` para las tablas con `proyecto_id`
propio; solo `tenant_id` para las que no.

**Ninguna tabla nueva requiere el patrón "hija sin tenant_id propio via EXISTS"**
(como `nominas_complementarias_detalle` → `nominas_complementarias`). Las 5 tablas
nuevas tienen `tenant_id` directo, así que ninguna necesita `EXISTS` contra un
padre.

**Test de integración usa `set_config` directo, no JWTs HTTP.** El gap es a nivel
de política de Postgres (¿existe la política y bloquea correctamente?), no de
código de aplicación (ya está probado que filtra). Un test que solo llame al
endpoint HTTP no distinguiría "RLS ausente pero filtro de app correcto" de "RLS
presente" — ambos devuelven el resultado correcto vía HTTP hoy. El test debe abrir
una transacción Prisma, fijar `app.current_tenant_id`/`app.current_proyecto_id` a
un valor synthetic, e intentar leer/escribir filas de otro tenant/proyecto
directamente, confirmando 0 filas / 0 filas afectadas — mismo patrón usado en
`fix-rls-bypass-bocam-admin` tasks.md 3.5-3.8.

**Cobertura mínima de test**: una tabla con `proyecto_id` propio
(`config_asistencia_proyecto`, elegida por tener ambos SELECT y UPSERT en el
código real) y una sin él (`credenciales_empleado`, elegida por ser la más
sensible — token de credencial). Las otras 3 siguen el mismo patrón ya probado
por las dos elegidas; no se requiere un test por tabla para confirmar el
mecanismo genérico (mismo criterio de cobertura usado en el change original: se
probó explícitamente un representante por tipo de escenario, no las 26 tablas
una por una).

## Risks / Trade-offs

**[Riesgo] Aplicar `FORCE ROW LEVEL SECURITY` sobre una tabla con datos ya
existentes podría exponer 0 filas donde antes (sin RLS) se veían todas, si
`app.current_tenant_id`/`app.current_proyecto_id` no estuvieran bien seteados en
algún code path.** → Mitigación: `createTenantContext` en `apps/personal/src/db.ts`
ya fija los 3 `set_config` en toda transacción de este servicio (confirmado
leyendo el archivo); no hay código en `main.ts` que consulte estas 5 tablas fuera
de `createTenantContext`. Smoke test con JWT real de un tenant/proyecto con datos
existentes en al menos una de las 5 tablas, comparando contra `bocam_admin`
(bypass) antes y después de aplicar, igual que el "Riesgo 1" del change original.

**[Riesgo] `documentos_empleado`/`credenciales_empleado` ya tienen datos reales en
producción (expedientes/credenciales emitidas desde 2026-07-26).** → Mitigación:
aplicar el `ALTER TABLE ... FORCE ROW LEVEL SECURITY` no borra ni modifica datos,
solo cambia la visibilidad por conexión; verificar con `bocam_admin` que el
conteo total de filas no cambia tras aplicar (solo cambia lo que ve `bocam_app`
bajo un contexto de tenant específico).

**[Trade-off] No se audita el resto de microservicios en este change**, aunque el
mismo patrón de drift (tabla nueva sin política) es plausible en cualquier
servicio que haya agregado tablas después de 2026-07-11. Se documenta como
pregunta abierta en vez de expandir el alcance de este bug-fix puntual.

## Migration Plan

1. Extender `apps/personal/prisma/rls-policies.sql` con las 5 tablas nuevas.
2. Escribir el test de integración de aislamiento (rojo contra el estado actual:
   sin política, la fuga cross-tenant/cross-proyecto debe reproducirse primero).
3. Aplicar el script contra `bocam_personal` en el VPS
   (`docker exec -i bocam-vps-postgres psql -U bocam_admin -d bocam_personal <
   apps/personal/prisma/rls-policies.sql`).
4. Confirmar test en verde contra Postgres real (no solo local/CI) antes de cerrar
   la tarea, igual que el resto de tablas de `personal`.
5. Smoke test con JWT real del tenant/proyecto activo de producción sobre
   `config-asistencia`, `config-nomina`, `empleados/:id/credencial`,
   `empleados/:id/documentos` — confirmar 200 OK con los mismos datos que antes de
   aplicar.
6. Rollback: `ALTER TABLE <tabla> NO FORCE ROW LEVEL SECURITY;
   ALTER TABLE <tabla> DISABLE ROW LEVEL SECURITY;` por tabla si algo bloquea
   tráfico legítimo — no requiere tocar ownership ni el rol de conexión.

## Open Questions

- ¿Existe el mismo drift (tablas nuevas post-2026-07-11 sin RLS) en otros
  microservicios (`compras`, `gerencia-tecnica`, `finanzas`, etc.)? No auditado en
  este change — candidato a un change de auditoría aparte si se confirma el
  patrón aquí.
