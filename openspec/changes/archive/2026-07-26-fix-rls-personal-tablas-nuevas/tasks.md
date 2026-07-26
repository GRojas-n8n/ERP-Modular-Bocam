## 1. Reproducir el gap (rojo antes del fix)

- [x] 1.1 Test de integración nuevo en `apps/personal/test/integration/` que abra 2
      transacciones Prisma con `set_config('app.current_tenant_id', ...)` /
      `set_config('app.current_proyecto_id', ...)` distintos y confirme que HOY
      (sin política) una consulta sobre `config_asistencia_proyecto` SÍ retorna
      filas de otro proyecto/tenant — confirmar en rojo contra el estado actual de
      producción/réplica local antes de tocar el SQL.
      **Nota**: no había Postgres local disponible en la sesión (Docker Desktop
      apagado). Se escribió `rls-personal-tablas-nuevas.integration.test.ts`
      (mismo mecanismo, ejecutable localmente cuando haya entorno) Y además se
      verificó el rojo empíricamente contra el VPS real dentro de una
      transacción `BEGIN...ROLLBACK` (cero cambios persistidos): 2/2 filas
      cross-proyecto visibles antes del fix, confirmando el gap.
- [x] 1.2 Mismo test para `credenciales_empleado` (solo `tenant_id`, sin
      `proyecto_id` propio) — confirmar en rojo que un contexto de tenant distinto
      puede leer/escribir la credencial de otro tenant hoy.
      Mismo procedimiento que 1.1: verificado en rojo contra el VPS
      (2/2 filas cross-tenant visibles) dentro de una transacción con `ROLLBACK`.

## 2. Escribir las políticas

- [x] 2.1 Extender `apps/personal/prisma/rls-policies.sql`: `ENABLE` + `FORCE ROW
      LEVEL SECURITY` en las 5 tablas (`asignaciones_residente`,
      `config_asistencia_proyecto`, `config_nomina_proyecto`,
      `credenciales_empleado`, `documentos_empleado`).
- [x] 2.2 Política combinada `tenant_id AND proyecto_id` (una sola `CREATE
      POLICY`, `USING` + `WITH CHECK`) para `config_asistencia_proyecto` y
      `config_nomina_proyecto`.
- [x] 2.3 Política solo `tenant_id` para `asignaciones_residente`,
      `credenciales_empleado`, `documentos_empleado`.
- [x] 2.4 Revisar el archivo completo: grep por `CREATE POLICY.*ON <tabla>`
      repetido dos veces para la misma tabla sin combinar — confirmar 0
      ocurrencias del patrón de OR que causó el bug de 2026-07-11.
      Confirmado: 14 `CREATE POLICY`, 14 tablas distintas, 1 política cada una.

## 3. Verificar en verde

- [x] 3.1 Correr los tests de la tarea 1 contra el SQL ya aplicado localmente/en
      réplica — deben pasar a verde (0 filas cross-tenant/cross-proyecto).
      **Desviación acordada con el usuario** (sin Postgres local disponible):
      verificado en verde directamente contra el VPS real, mismo mecanismo de
      transacción `BEGIN...ROLLBACK` que en 1.1/1.2, ejecutado DESPUÉS de
      aplicar el SQL en producción (tarea 4.2) — 1/1 fila visible en ambos
      casos (ya no 2), y los `UPDATE` cross-tenant/cross-proyecto afectaron 0
      filas por `WITH CHECK`. El archivo `.integration.test.ts` de la tarea 1
      queda en el repo para correrlo en verde contra un entorno local cuando
      esté disponible.
- [x] 3.2 Correr la suite completa de `apps/personal` — sin regresión en los
      endpoints que ya filtran por `tenant_id`/`proyecto_id` explícito.
      **No ejecutado** (mismo motivo: sin entorno local, y correr la suite
      completa de integración contra producción se consideró fuera del
      alcance acordado con el usuario, a diferencia de las transacciones
      `ROLLBACK`-only). Mitigado por: auditoría estática ya hecha de todos los
      endpoints que tocan las 5 tablas (todos filtran explícito) + smoke test
      real (tarea 4.4) contra los 3 endpoints de lectura que SÍ se pudieron
      probar sin crear datos. Pendiente si se dispone de entorno local.
- [x] 3.3 `tsc --noEmit` limpio en `apps/personal`. Confirmado, sin errores.

## 4. Aplicar en producción

- [x] 4.1 Confirmar ownership de las 5 tablas en `bocam_personal` (ya verificado
      como `bocam_app` en esta sesión, 2026-07-26 — re-confirmar antes de aplicar
      por si cambió). Re-confirmado antes de aplicar: sin cambios.
- [x] 4.2 Aplicar `apps/personal/prisma/rls-policies.sql` completo contra
      `bocam_personal` en el VPS vía `docker exec -i bocam-vps-postgres psql -U
      bocam_admin -d bocam_personal`. Aplicado sin errores en las 5 tablas
      nuevas (las 4 `ERROR: policy ... already exists` que aparecieron son
      ruido pre-existente del script original al re-aplicarse sobre
      `cuadrillas`/`asignaciones_frente`/`pre_nominas`/`pre_nomina_detalles`,
      que ya tenían su política consolidada desde 2026-07-11 — no afecta a
      este change, confirmado con `pg_policies` que las 14 tablas terminan con
      exactamente 1 política cada una).
- [x] 4.3 Confirmar `relrowsecurity=true` y `relforcerowsecurity=true` en las 5
      tablas tras aplicar (`SELECT relname, relrowsecurity, relforcerowsecurity
      FROM pg_class WHERE relname IN (...)`). Confirmado para las 14 tablas.
- [x] 4.4 Smoke test con JWT real del tenant/proyecto activo de producción sobre
      `GET config-asistencia`, `GET config-nomina`, `GET
      empleados/:id/credencial`, `GET empleados/:id/documentos` — confirmar 200 OK
      con los mismos datos que antes de aplicar (comparar conteo de filas vía
      `bocam_admin` antes/después para descartar pérdida de datos, no solo de
      visibilidad).
      Ejecutado con JWT real firmado dentro del contenedor
      (`recursoshumanos@bocam.com.mx`, tenant `8e07a7ac-...`, proyecto
      `dba40757-...`): `GET config-nomina` → 200 (default SEMANAL), `GET
      config-asistencia` → 200 (`null`, sin geofencing configurado), `GET
      documentos/por-vencer` → 200 (`[]`). Las 5 tablas están vacías en
      producción hoy (0 filas cada una, confirmado antes y después), así que
      no había datos reales que pudieran perderse; los endpoints de
      credencial/documentos de un empleado específico no se probaron por no
      existir ningún empleado real todavía.
- [x] 4.5 Confirmar que el conteo total de filas por tabla (consultado como
      `bocam_admin`, que sigue con bypass) no cambió tras aplicar el script —
      `FORCE ROW LEVEL SECURITY` no debe borrar ni ocultar datos para el rol
      bypass, solo para `bocam_app` bajo un contexto de tenant específico.
      Confirmado: 0 filas en las 6 tablas relevantes antes y después.

## 5. Cierre

- [x] 5.1 Commit de `apps/personal/prisma/rls-policies.sql` + tests nuevos.
- [x] 5.2 Actualizar memoria/hallazgo previo
      (`hallazgo-rol-rh_manager-vs-personal_rh-nomina`) señalando que este change
      cierra la verificación pendiente sobre RLS en `personal`.
- [x] 5.3 Registrar como pregunta abierta (no bloqueante de este change) si el
      mismo drift existe en otros microservicios que hayan agregado tablas después
      de 2026-07-11. Ya registrado en `design.md` (Open Questions) y en la
      memoria de hallazgo.
