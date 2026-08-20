## Estado de cierre de sesión — 2026-08-20

**Grupos 1–6 verificados contra Postgres real con RLS forzado de verdad (no bypass).** Sesión anterior (2026-08-18) dejó el código escrito pero sin ejecutar contra base de datos real. Esta sesión: se levantó Docker Desktop, se aplicaron `3.6`/`4.4` contra la Postgres de desarrollo local, y — crítico — las 4 conexiones bajo prueba se reapuntaron al rol `local_app` (NOSUPERUSER, `rolbypassrls=false`, dueño de las tablas de `finanzas`/`contabilidad`/`compras`/`control_proyectos` en local) en vez del `postgres` de siempre, que es superusuario y bypasea RLS silenciosamente — correr los tests contra `postgres` los habría dejado en verde sin haber probado nada.

**Bug real encontrado y corregido en el camino** (no estaba en el diseño original): `GET /pagos` en modo global hace `include: { presupuesto }` sobre `programa_pagos` (Patrón Global). `presupuestos_asignados` se había dejado a propósito en Patrón Estricto (tarea 3.5 original) — con `current_proyecto_id() IS NULL` esa política nunca hace match, el JOIN vuelve vacío, y Prisma revienta con "Field presupuesto is required" (500), el mismo bug que este change dice corregir. Fix: `rls_presupuestos_select` pasó a Patrón Global (`current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()`); INSERT/UPDATE/DELETE se quedaron estrictos — no hay caso de negocio para escribir un presupuesto sin proyecto activo. Ver comentario actualizado en `apps/finanzas/prisma/rls-policies.sql`, sección 3.

**Bug de sembrado en los propios tests, corregido para poder ejecutarlos bajo RLS real:** los 4 tests de integración del grupo 6 creaban sus datos de prueba con un `PrismaClient` de módulo sin fijar `app.current_tenant_id`/`app.current_proyecto_id` — funcionaba solo porque `postgres` bypasea RLS. Se reescribieron `crearPresupuestoYPago`/`crearAsiento`/`cleanupTenant` (finanzas, contabilidad) y las funciones de seed/cleanup de compras y control-proyectos para usar `createTenantContext(...)` (el mismo mecanismo que usa la app en runtime), en vez de escribir directo con el cliente sin contexto.

**Sigue pendiente, requiere producción real (fuera de alcance local):**
- 1.1 (auditoría de usuarios `procurement` en `UserProjectAccess` — necesita la base de `auth` de producción, no la de desarrollo)
- 7.1–7.6 (deploy vía CI, verificación en navegador contra `iretum.com`, `openspec archive`)

No archivar el change hasta que 7.1–7.6 estén en verde — el cambio no está desplegado.

**Hallazgos no anticipados en el diseño original, corregidos durante la implementación** (detalle en el cuerpo de cada tarea abajo y en design.md → Risks/Trade-offs): función `current_proyecto_id()` de Finanzas sin manejo de excepción (tarea 3.2), filtro de aplicación en `GET /asientos` de Contabilidad que anulaba el modo global antes de llegar a la RLS (tarea 6.3), `presupuestos_asignados` sin Patrón Global rompiendo el JOIN de `GET /pagos` en modo global (tarea 3.5, corregido 2026-08-20 — ver arriba).

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
- [x] 3.6 Aplicado contra Postgres de desarrollo local (`docker exec bocam-postgres psql ... < apps/finanzas/prisma/rls-policies.sql`, con `search_path` al schema `finanzas` — en local cada servicio vive en su propio schema dentro de una sola BD compartida, a diferencia de producción donde cada uno tiene su propia base con tablas en `public`; el script es idempotente, `DROP POLICY IF EXISTS` + `CREATE POLICY`). Falta aplicarlo en staging/producción reales (grupo 7).

## 4. RLS — Contabilidad

- [x] 4.1 Confirmado: no se requiere migración Prisma, mismo motivo que la tarea 3.1.
- [x] 4.2 Actualizadas en `apps/contabilidad/prisma/rls-policies.sql` las políticas de `asientos_contables`, `conciliaciones_bancarias` y `movimientos_poliza` a Patrón Global (`OR current_proyecto_id() IS NULL`); `conciliaciones_fiscales` documentada explícitamente como excluida, sin cambio.
- [x] 4.3 Confirmado: `cuentas_contables` no se tocó — sigue sin `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, catálogo compartido incluso entre tenants, sección 3 del archivo intacta.
- [x] 4.4 Aplicado contra Postgres de desarrollo local, mismo mecanismo que 3.6. Falta staging/producción (grupo 7).

## 5. Personal — trazabilidad de asignación por proyecto en la API

- [x] 5.1 Agregado `proyecto_id` y `es_prestamo` al `select` del include de `asignaciones` en `GET /api/v1/personal/empleados` (`apps/personal/src/main.ts`), junto al `frente_trabajo` existente. `tsc --noEmit` limpio.
- [x] 5.2 Decidido: el frontend resuelve el nombre del proyecto con la lista que ya tiene en `TenantContext` (regla "no cross-service en frontend" + evitar una llamada B2B extra a Auth por cada `GET /empleados`) — el endpoint solo expone `proyecto_id`, sin nombre resuelto.
- [x] 5.3 Test de integración escrito y **corrido en verde contra Postgres real** (`apps/personal/test/integration/listado-empleados-incluye-frente-residente.integration.test.ts`, `testAsignacionIncluyeProyectoId`): empleado con una asignación activa → la respuesta incluye `proyecto_id`.
- [x] 5.4 Corrido en verde contra Postgres real (mismo archivo, `testEmpleadoConMultiplesAsignacionesActivas`): empleado con 2 asignaciones activas simultáneas en proyectos distintos, una con `es_prestamo: true` → la respuesta trae ambas, cada una con su `proyecto_id`. `personal` no tiene RLS declarada (fuera del alcance de este change), así que corrió contra la conexión normal, sin necesidad de `local_app`.

## 6. Tests de integración cruzados (aislamiento real)

- [x] 6.1 Finanzas: **corrido en verde contra Postgres real con RLS forzado** (`apps/finanzas/test/integration/rls-pagos-modo-global.integration.test.ts`, `testConProyectoActivoSigueEstricto`, conexión `local_app`) — con proyecto activo, `GET /pagos` solo retorna pagos de ese proyecto.
- [x] 6.2 Finanzas: corrido en verde bajo RLS real (mismo archivo, `testSinProyectoActivoConsolidaTodoElTenant`) — sin proyecto activo, `GET /pagos` consolida ambos proyectos del tenant (cada fila con su `proyecto_id`) y sigue excluyendo un tenant distinto. Ejercita el fix de `current_proyecto_id()` de la tarea 3.2. **Este test destapó el bug real de `presupuestos_asignados` documentado arriba** (500 por el JOIN a `presupuesto` bloqueado en modo global) — corregido en `rls-policies.sql` sección 3, luego el test pasó.
- [x] 6.3 Contabilidad: corrido en verde bajo RLS real (`apps/contabilidad/test/integration/rls-asientos-scope.integration.test.ts`, `testGetAsientosSinProyectoActivoConsolidaTenant`). **Hallazgo previo (sesión 2026-08-18) confirmado correcto ahora bajo RLS real:** `GET /api/v1/contabilidad/asientos` filtraba `proyecto_id: proyectoId` explícitamente en el `where` de Prisma — con `proyectoId` vacío en modo global, ese filtro de aplicación habría bloqueado la consulta a 0 filas antes de que la RLS Patrón Global pudiera actuar. Ya estaba corregido a `...(proyectoId ? { proyecto_id: proyectoId } : {})`; el test contra Postgres real con RLS forzado confirma que el fix funciona de verdad, no solo que compila.
- [x] 6.4 Corridos en verde contra Postgres real con RLS forzado: `apps/compras/test/integration/rls-aislamiento-cross-proyecto-mismo-tenant.integration.test.ts` (rol `procurement` con proyecto A activo/autorizado no puede leer una requisición del proyecto B por URL manipulada — 404 real confirmado) y `apps/control-proyectos/test/integration/rls-aislamiento-cross-proyecto-mismo-tenant.integration.test.ts` (rol `residencia`, misma prueba sobre una estimación — 404 real confirmado). El `rls-policies.sql` de `compras` no estaba aplicado en la BD local (a diferencia de `finanzas`/`contabilidad`); se aplicó como parte de esta verificación.

**Nota de entorno (para reproducir):** en local, cada servicio vive en su propio *schema* dentro de una sola Postgres compartida (`bocam_erp`), no en bases separadas como en producción. La conexión de aplicación normal (`postgres`) es superusuario con `rolbypassrls=true` — corre los tests en verde sin haber probado nada de RLS. Existe un rol `local_app` (NOSUPERUSER, `NOBYPASSRLS`) ya creado; se le reasignó ownership de las tablas de `finanzas`/`contabilidad`/`compras`/`control_proyectos`/`personal` (`ALTER TABLE ... OWNER TO local_app`) y se le fijó contraseña. Los tests del grupo 6 (y 5.3/5.4) se corrieron con `DATABASE_URL="postgresql://local_app:<password>@localhost:5432/bocam_erp?schema=<servicio>"` para que la RLS aplicara de verdad — replicando en local exactamente lo que `openspec/changes/archive/2026-07-11-fix-rls-bypass-bocam-admin` ya exige en producción (`bocam_app`, no-superusuario).

## 7. Verificación en entorno real y cierre

- [ ] 7.1 Desplegado vía CI (push a `main`). Confirmar migraciones aplicadas en `_prisma_migrations` real de `finanzas` y `contabilidad`.
- [ ] 7.2 Verificado en navegador: un usuario con rol `procurement` y sin `authorizedProjects` para el proyecto piloto ya no puede acceder a sus datos (antes sí podía).
- [ ] 7.3 Verificado en navegador: un usuario con rol `finanzas` sin proyecto activo seleccionado ve pagos consolidados de todos los proyectos reales del tenant, cada uno trazable a su proyecto de origen.
- [ ] 7.4 Verificado en navegador: un usuario con rol `personal_rh` sin proyecto activo ve el listado completo de empleados, y para un empleado con 2+ asignaciones reales, la respuesta muestra ambos proyectos.
- [ ] 7.5 Actualizar memoria del proyecto con el resultado (confirmado y corregido, o hallazgos adicionales encontrados durante la implementación).
- [ ] 7.6 `openspec archive aislamiento-proyecto-por-modulo` tras verificación en producción.
