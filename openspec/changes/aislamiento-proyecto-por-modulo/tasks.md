## Estado de cierre de sesión — 2026-08-18

**24/33 tareas completas.** Código de los grupos 2–6 escrito, tipado limpio (`tsc --noEmit` en `packages/auth-middleware`, `apps/{finanzas,contabilidad,personal,compras,control-proyectos}`) y, donde fue posible ejecutar sin base de datos (middleware — `packages/auth-middleware`), corrido en verde (9/9). Los tests de integración de los 5 servicios están escritos y compilan, pero **no se ejecutaron contra Postgres real** — no había Docker/DB disponible en esta sesión.

**Bloqueado — requiere entorno con base de datos real, no es trabajo de diseño pendiente:**
- 1.1 (auditoría de usuarios `procurement` en `UserProjectAccess`)
- 3.6 / 4.4 (aplicar los `rls-policies.sql` actualizados contra Postgres)
- 6.1–6.4 (ejecutar los tests de integración ya escritos)
- 7.1–7.6 (deploy vía CI, verificación en navegador, `openspec archive`)

**Para retomar:** levantar el stack local/staging, correr `1.1`, aplicar `3.6`/`4.4`, correr los 5 archivos de test de integración nuevos/extendidos (`node -r ts-node/register/transpile-only <archivo>` en cada uno — ver cabecera de cada test para el `DATABASE_URL` esperado), y seguir con el grupo 7. No archivar el change hasta que 7.1–7.6 estén en verde — el cambio no está mergeado a `main` ni desplegado.

**Hallazgos no anticipados en el diseño original, corregidos durante la implementación** (detalle en el cuerpo de cada tarea abajo y en design.md → Risks/Trade-offs): función `current_proyecto_id()` de Finanzas sin manejo de excepción (tarea 3.2), filtro de aplicación en `GET /asientos` de Contabilidad que anulaba el modo global antes de llegar a la RLS (tarea 6.3).

---

## 1. Auditoría previa (bloqueante — antes de tocar código)

- [ ] 1.1 Consultar `UserProjectAccess` en Auth: listar todos los usuarios activos con rol `procurement` y confirmar que tienen asignado explícitamente cada proyecto en el que hoy operan. Documentar el resultado — si algún usuario `procurement` depende del acceso irrestricto actual sin tener `UserProjectAccess` explícito, coordinarlo con el equipo de Compras antes de continuar con la tarea 2.
- [x] 1.2 Con el equipo contable, clasificar cada una de las 4 tablas de `apps/contabilidad/prisma/rls-policies.sql` — resuelto: `asientos_contables`, `movimientos_poliza` y `conciliaciones_bancarias` → Patrón Global; `conciliaciones_fiscales` → Patrón Estricto sin cambio. Decisión documentada en design.md, Open Questions.
- [x] 1.3 Definir qué endpoints exponen el "modo global" — resuelto: se reutiliza el selector de proyecto activo existente (`proyectoId: undefined` → Patrón Global responde consolidado), sin query param ni endpoint nuevo. Roles: los ya tenant-level (`finanzas`, `admin`, `superintendent`), sin roles nuevos. Decisión documentada en design.md, Open Questions.

## 2. Middleware compartido (`packages/auth-middleware`)

- [x] 2.1 En `requireProjectAccess()` (`packages/auth-middleware/src/middleware.ts`), retirar `'procurement'` del array `tenantLevelRoles`.
- [x] 2.2 Agregar `'personal_rh'` al array `tenantLevelRoles`.
- [x] 2.3 Test unitario del middleware: request con rol `procurement` únicamente y sin `proyectoId`/`authorizedProjects` → 403 `AUTH_PROJECT_REQUIRED` (antes pasaba).
- [x] 2.4 Test unitario del middleware: request con rol `procurement`, `proyectoId` fijado y ese proyecto en `authorizedProjects` → pasa sin 403 (comportamiento normal de Compras, sin cambios).
- [x] 2.5 Test unitario del middleware: request con rol `personal_rh` únicamente y sin `proyectoId`/`authorizedProjects` → pasa sin 403 (antes fallaba).
- [x] 2.6 Test de regresión: request con rol `finanzas`, `admin` o `superintendent` sin proyecto activo → sigue pasando sin 403 (sin cambios). Suite completa: 9/9 tests en verde (`npm test` en `packages/auth-middleware`).

## 3. RLS — Finanzas (tablas de pago)

- [x] 3.1 Confirmado: no se requiere migración Prisma — ninguno de los 5 `rls-policies.sql` del repo vive dentro de `prisma/migrations/` (0 coincidencias de `CREATE POLICY` en migraciones de los 5 servicios, verificado). Las políticas RLS se aplican como script SQL independiente (`psql -f rls-policies.sql`), igual que el resto de este repo — sin cambio de esquema, no aplica `prisma migrate`.
- [x] 3.2 En `apps/finanzas/prisma/rls-policies.sql`, actualizado `rls_pagos_select/insert/update/delete` (`programa_pagos`) a `tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())`, una sola política combinada por operación. **Hallazgo adicional corregido en la misma tarea:** `current_tenant_id()`/`current_proyecto_id()` en Finanzas eran funciones `sql` puras sin manejo de excepción — un GUC en cadena vacía (`''`, el valor real que llega cuando un rol tenant-level como `finanzas` opera sin proyecto activo) lanzaba un error de cast en vez de evaluar a NULL, lo cual habría roto la rama `IS NULL` del modo global antes de que pudiera evaluarse. Se actualizaron ambas funciones a `plpgsql` con `EXCEPTION WHEN OTHERS THEN RETURN NULL`, igual que ya usa Contabilidad — efecto secundario beneficioso: las tablas que se quedan estrictas también fallan cerrado (0 filas) en vez de tronar. **Nota fuera de alcance:** Compras tiene el mismo patrón sin proteger en su `rls-policies.sql`; no se tocó por estar fuera del alcance de este cambio (ver Non-Goals en design.md) — vale la pena una spec de higiene aparte.
- [x] 3.3 Mismo cambio en `rls_pagos_oc_select/insert` (`pagos_oc`).
- [x] 3.4 Mismo cambio en `rls_detalles_pago_oc_select/insert` (`detalles_pago_oc`), preservando el patrón `EXISTS` contra `pagos_oc`.
- [x] 3.5 Agregados comentarios explícitos de exclusión en `rls_presupuestos_*`, `rls_movimientos_*` y `rls_proyectos_finanzas_*` — se evaluaron y se excluyen a propósito del Patrón Global.
- [ ] 3.6 Aplicar el script `rls-policies.sql` actualizado contra la base de datos de `finanzas` (dev/staging primero).

## 4. RLS — Contabilidad

- [x] 4.1 Confirmado: no se requiere migración Prisma, mismo motivo que la tarea 3.1.
- [x] 4.2 Actualizadas en `apps/contabilidad/prisma/rls-policies.sql` las políticas de `asientos_contables`, `conciliaciones_bancarias` y `movimientos_poliza` a Patrón Global (`OR current_proyecto_id() IS NULL`); `conciliaciones_fiscales` documentada explícitamente como excluida, sin cambio.
- [x] 4.3 Confirmado: `cuentas_contables` no se tocó — sigue sin `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, catálogo compartido incluso entre tenants, sección 3 del archivo intacta.
- [ ] 4.4 Aplicar el script actualizado contra la base de datos de `contabilidad` (dev/staging primero).

## 5. Personal — trazabilidad de asignación por proyecto en la API

- [x] 5.1 Agregado `proyecto_id` y `es_prestamo` al `select` del include de `asignaciones` en `GET /api/v1/personal/empleados` (`apps/personal/src/main.ts`), junto al `frente_trabajo` existente. `tsc --noEmit` limpio.
- [x] 5.2 Decidido: el frontend resuelve el nombre del proyecto con la lista que ya tiene en `TenantContext` (regla "no cross-service en frontend" + evitar una llamada B2B extra a Auth por cada `GET /empleados`) — el endpoint solo expone `proyecto_id`, sin nombre resuelto.
- [x] 5.3 Test de integración escrito (`apps/personal/test/integration/listado-empleados-incluye-frente-residente.integration.test.ts`, `testAsignacionIncluyeProyectoId`): empleado con una asignación activa → la respuesta incluye `proyecto_id`. `tsc --noEmit` limpio; **no ejecutado contra Postgres real en esta sesión** (sin Docker/DB disponible) — pendiente correr antes de fusionar.
- [x] 5.4 Test de integración escrito (mismo archivo, `testEmpleadoConMultiplesAsignacionesActivas`): empleado con 2 asignaciones activas simultáneas en proyectos distintos, una con `es_prestamo: true` → la respuesta trae ambas, cada una con su `proyecto_id`. `tsc --noEmit` limpio; **no ejecutado contra Postgres real** — mismo pendiente que 5.3.

## 6. Tests de integración cruzados (aislamiento real)

- [x] 6.1 Finanzas: test escrito (`apps/finanzas/test/integration/rls-pagos-modo-global.integration.test.ts`, `testConProyectoActivoSigueEstricto`) — con proyecto activo, `GET /pagos` solo retorna pagos de ese proyecto. `tsc --noEmit` limpio; no ejecutado contra Postgres real en esta sesión.
- [x] 6.2 Finanzas: test escrito (mismo archivo, `testSinProyectoActivoConsolidaTodoElTenant`) — sin proyecto activo, `GET /pagos` consolida ambos proyectos del tenant (cada fila con su `proyecto_id`) y sigue excluyendo un tenant distinto. Este test ejercita directamente el fix de `current_proyecto_id()` de la tarea 3.2. Mismo pendiente de ejecución real.
- [x] 6.3 Contabilidad: test escrito (`apps/contabilidad/test/integration/rls-asientos-scope.integration.test.ts`, `testGetAsientosSinProyectoActivoConsolidaTenant`). **Hallazgo adicional corregido en la misma tarea:** `GET /api/v1/contabilidad/asientos` filtraba `proyecto_id: proyectoId` explícitamente en el `where` de Prisma (era el fix original del incidente de libro contable expuesto) — con `proyectoId` vacío en modo global, ese filtro de aplicación habría bloqueado la consulta a 0 filas antes de que la RLS Patrón Global pudiera actuar. Se cambió a `...(proyectoId ? { proyecto_id: proyectoId } : {})`, dejando que la RLS resuelva el aislamiento cuando no hay proyecto activo. El dashboard de Contabilidad (`GET /dashboard`) NO se tocó — es una vista de proyecto activo por diseño, no debe volverse global. `tsc --noEmit` limpio; test no ejecutado contra Postgres real en esta sesión.
- [x] 6.4 Tests escritos: `apps/compras/test/integration/rls-aislamiento-cross-proyecto-mismo-tenant.integration.test.ts` (rol `procurement` con proyecto A activo/autorizado no puede leer una requisición del proyecto B por URL manipulada) y `apps/control-proyectos/test/integration/rls-aislamiento-cross-proyecto-mismo-tenant.integration.test.ts` (rol `residencia`, misma prueba sobre una estimación). `tsc --noEmit` limpio en ambos; no ejecutados contra Postgres real en esta sesión.

## 7. Verificación en entorno real y cierre

- [ ] 7.1 Desplegado vía CI (push a `main`). Confirmar migraciones aplicadas en `_prisma_migrations` real de `finanzas` y `contabilidad`.
- [ ] 7.2 Verificado en navegador: un usuario con rol `procurement` y sin `authorizedProjects` para el proyecto piloto ya no puede acceder a sus datos (antes sí podía).
- [ ] 7.3 Verificado en navegador: un usuario con rol `finanzas` sin proyecto activo seleccionado ve pagos consolidados de todos los proyectos reales del tenant, cada uno trazable a su proyecto de origen.
- [ ] 7.4 Verificado en navegador: un usuario con rol `personal_rh` sin proyecto activo ve el listado completo de empleados, y para un empleado con 2+ asignaciones reales, la respuesta muestra ambos proyectos.
- [ ] 7.5 Actualizar memoria del proyecto con el resultado (confirmado y corregido, o hallazgos adicionales encontrados durante la implementación).
- [ ] 7.6 `openspec archive aislamiento-proyecto-por-modulo` tras verificación en producción.
