## 1. Preparación

- [x] 1.1 Generar contraseña fuerte para `bocam_app` (mismo mecanismo usado
      para `bocam_admin` en este VPS).
- [x] 1.2 `CREATE ROLE bocam_app LOGIN PASSWORD '...' NOSUPERUSER NOBYPASSRLS
      NOCREATEDB NOCREATEROLE;` en el clúster Postgres del VPS.
- [x] 1.3 Confirmar con `SELECT rolname, rolsuper, rolbypassrls FROM pg_roles
      WHERE rolname = 'bocam_app';` que quedó `f | f`.
- [x] 1.4 Hacer backup/snapshot de `.env` del VPS antes de editar nada
      (`cp .env .env.bak-fix-rls-<fecha>`).

## 2. Canario: compras

- [x] 2.1 `\c bocam_compras` → `REASSIGN OWNED BY bocam_admin TO bocam_app;`
      **Hallazgo adicional**: `REASSIGN OWNED BY` falló
      ("required by the database system") porque `bocam_admin` es el rol
      bootstrap del clúster. Se resolvió con `ALTER DATABASE bocam_compras
      OWNER TO bocam_app` + `ALTER TABLE/SEQUENCE/VIEW ... OWNER TO
      bocam_app` generado dinámicamente por objeto (22 objetos), en vez de
      `REASSIGN OWNED BY`. Aplica igual para el resto de los servicios.
- [x] 2.2 Confirmar ownership: 0 objetos de `public` quedan con
      `relowner = bocam_admin` tras la reasignación.
- [x] 2.3 Editar `COMPRAS_DATABASE_URL` en `.env` del VPS → usuario
      `bocam_app` (mismo host/puerto/nombre de base).
- [x] 2.4 `docker compose -f docker-compose.vps.yml --profile core up -d
      compras` — recrea solo ese contenedor.
- [x] 2.5 Verificar health check del contenedor — healthy, logs sin errores
      de conexión/permiso, `pg_stat_activity` confirma conexión como
      `bocam_app`.
- [x] 2.6 **Hallazgo crítico adicional**: al repetir la prueba de fuga
      cross-proyecto contra producción, la fuga SEGUÍA ocurriendo pese al
      rol restringido. Causa: `rls-policies.sql` de `compras` **nunca se
      había aplicado en producción** — `relrowsecurity=false` y 0 filas en
      `pg_policies` en las 22 tablas. No era solo el bypass del superusuario;
      RLS ni siquiera estaba activado en la base real. Se aplicó
      `rls-policies.sql` completo contra `bocam_compras` (sin errores). Tras
      aplicarlo, se repitió la prueba con 2 OC sintéticas de 2 `proyecto_id`
      distintos vía JWT real firmado con el `JWT_SECRET` del VPS: la sesión
      de proyecto A dejó de ver la OC de proyecto B. Datos de prueba
      eliminados al terminar.
- [x] 2.7 Smoke test con JWT del tenant/proyecto real de producción
      (`8e07a7ac-...`/`dba40757-...`): `requisiciones` devolvió las 2 reales
      existentes, `proveedores` 3, `dashboard` 200 — sin vacíos inesperados
      (Riesgo 1 de `design.md` descartado para este servicio).
- [ ] 2.8 Rollback — no fue necesario, el canario quedó verificado.

## 3. Resto de servicios con políticas RLS

- [x] 3.1 `gerencia-tecnica`: repetir 2.1–2.7 (variables
      `GERENCIA_TECNICA_DATABASE_URL` / `bocam_gerencia_tecnica`).
      **Hallazgo**: igual que compras, `rls-policies.sql` nunca se había
      aplicado en prod (`relrowsecurity=false`, 0 policies en las 13 tablas).
      Se aplicó — pero el script solo cubre 3 de 13 tablas por diseño
      (`insumos`, `presupuestos_base`, `conceptos`; las otras 10 no tienen
      `tenant_id`/`proyecto_id` en su alcance actual). Ownership reasignado
      (13 tablas, 0 objetos con `relowner=bocam_admin` al terminar).
      `GERENCIA_TECNICA_DATABASE_URL` → `bocam_app`, contenedor healthy.
      Prueba de fuga cross-proyecto en `presupuestos_base` (2 filas
      sintéticas, JWTs reales firmados con `JWT_SECRET` del VPS): proyecto A
      no vio la fila de proyecto B y viceversa. Smoke test con JWT del
      proyecto real (`dba40757-...`): `insumos` y `presupuestos` devolvieron
      200 con payload completo (datos reales visibles, sin vacíos). Datos
      sintéticos eliminados al terminar.
- [x] 3.2 `auth`: repetir 2.1–2.7 (`AUTH_DATABASE_URL` / `bocam_auth`) —
      ⚠️ verificar con especial cuidado: si el login/JWT dependen de una
      consulta sin `proyecto_id` de sesión, confirmar que la policy de auth
      no bloquea el flujo de login antes de considerar el servicio migrado.
      **Hallazgo importante**: `apps/auth/prisma/rls-policies.sql` nunca se
      había aplicado en prod (mismo patrón) Y además tenía 2 bugs latentes
      que lo habrían dejado inconsistente si se aplicaba tal cual:
      (1) usaba el prefijo de schema `auth.` (`auth.tenants`, `auth.users`,
      etc.) pero en producción esas tablas viven en `public` — el script
      habría fallado con "relation does not exist"; (2) faltaban 2 policies
      para operaciones reales del código: `UPDATE` en `refresh_tokens`
      (`main.ts:511`, revoca SIEMPRE el token usado en cada refresh — sin
      la policy, bajo `FORCE RLS` la revocación habría afectado 0 filas SIN
      ERROR, dejando tokens reutilizables indefinidamente — regresión de
      seguridad) y `DELETE` en `user_project_access` (`main.ts:827`,
      resincroniza accesos a proyecto de un usuario — sin la policy habría
      dejado asignaciones obsoletas/duplicadas). Se corrigió el script en
      el repo (quitado el prefijo `auth.`, agregadas `rt_isolation_update`
      y `upa_isolation_delete`) antes de aplicarlo. Verificado con datos
      sintéticos (fila de `refresh_tokens` y de `user_project_access`,
      limpiadas al terminar) que ambas policies nuevas sí permiten la
      operación bajo el tenant correcto. Login real probado (email real +
      password incorrecta → 401 `AUTH_INVALID_CREDENTIALS`, confirma que la
      query bajo RLS encuentra al usuario) y aislamiento cross-tenant
      confirmado directo en BD (`set_config` con tenant real → 1 fila,
      tenant falso → 0 filas). Ownership de las 6 tablas reasignado a
      `bocam_app` (0 objetos con `relowner=bocam_admin` al terminar).
      `AUTH_DATABASE_URL` → `bocam_app`, contenedor recreado y healthy.
- [x] 3.3 `finanzas`: repetir 2.1–2.7 (`FINANZAS_DATABASE_URL` /
      `bocam_finanzas`). **Hallazgo**: mismo patrón que `auth` — `rls-policies.sql`
      nunca se había aplicado en prod (`relrowsecurity=false`, 0 policies en
      las 7 tablas) Y tenía el mismo bug de prefijo de schema inexistente
      (`finanzas.presupuestos_asignados` etc. — las tablas viven en `public`,
      igual que en `auth`; el script incluso hacía `CREATE SCHEMA IF NOT
      EXISTS finanzas`, lo que habría creado un schema fantasma sin tablas
      dentro). Además el script original solo cubría 3 de 7 tablas
      tenant-scoped: faltaban políticas completas para `cuentas_bancarias`,
      `proyectos_finanzas`, `pagos_oc` y `detalles_pago_oc`. Auditoría de
      `apps/finanzas/src/main.ts` (vía subagente) confirmó operaciones reales
      de UPDATE en `cuentas_bancarias` (edición + soft-delete `activa:false`)
      y UPDATE vía `upsert` en `proyectos_finanzas` (anticipos) — sin policy
      de UPDATE, el `upsert` habría fallado silenciosamente en su rama
      `update` bajo FORCE RLS (0 filas, sin error), dejando anticipos/saldos
      de cuenta desincronizados. `pagos_oc` y `detalles_pago_oc` solo tienen
      `create`/`findMany`/`findFirst` en código, se agregaron políticas de
      SELECT/INSERT. `detalles_pago_oc` no tiene `tenant_id` propio (solo
      `pago_id`) — su policy usa `EXISTS` contra `pagos_oc` para resolver el
      tenant/proyecto vía join. Script corregido en el repo (prefijo quitado,
      4 tablas nuevas cubiertas), aplicado contra `bocam_finanzas` sin
      errores. Ownership de las 8 tablas (incluye `_prisma_migrations`)
      reasignado a `bocam_app` (0 objetos con `relowner=bocam_admin` al
      terminar). `FINANZAS_DATABASE_URL` → `bocam_app`, contenedor recreado y
      healthy (`pg_stat_activity` confirma 3 conexiones como `bocam_app`, 0
      como `bocam_admin` desde la app). Prueba de fuga cross-proyecto con 2
      presupuestos sintéticos de 2 `proyecto_id` distintos del mismo
      `tenant_id` (`set_config` directo vía `bocam_app`): proyecto A no vio
      el presupuesto de proyecto B y viceversa; filas eliminadas al terminar.
      Smoke test con JWT real del proyecto activo
      (`dba40757-.../8e07a7ac-8157-...`) contra `dashboard`, `presupuestos` y
      `cuentas-bancarias`: 200 OK en los tres, payload vacío — verificado
      contra `bocam_admin` (bypass) que las 5 tablas relevantes
      genuinemente tienen 0 filas para ese tenant/proyecto hoy (el módulo de
      Finanzas aún no tiene datos reales cargados en producción), así que no
      es un falso negativo de RLS (Riesgo 1 descartado).
- [ ] 3.4 `control-obra`: repetir 2.1–2.7 (`CONTROL_OBRA_DATABASE_URL` /
      `bocam_control_obra`).
- [x] 3.5 `personal`: repetir 2.1–2.7 (`PERSONAL_DATABASE_URL` /
      `bocam_personal`). **Hallazgo crítico adicional**: `apps/personal/prisma/rls-policies.sql`
      declaraba `cuadrillas`, `asignaciones_frente`, `pre_nominas` y
      `pre_nomina_detalles` con DOS políticas `USING` separadas (una de
      `tenant_id`, otra de `proyecto_id`) sin `FOR` — Postgres combina
      políticas PERMISSIVE múltiples con OR, no con AND, así que esas 4
      tablas no aislaban por proyecto (ni siquiera por tenant, en el peor
      caso) pese a estar "declaradas". Verificado empíricamente contra
      Postgres real con una tabla temporal antes de tocar nada: sesión
      tenant=A/proyecto=P1 veía filas de tenant=A/proyecto=P2 y de
      tenant=B/proyecto=P1. Además, 4 tablas con `tenant_id`/`proyecto_id`
      usadas con `.update`/`.upsert` en `main.ts` (`registros_asistencia`,
      `config_deducciones_empleados`, `nominas_complementarias`,
      `nominas_complementarias_detalle`) no tenían ninguna política — mismo
      patrón de gap que en `finanzas`. Y al aplicar el script corregido
      apareció una política `tenant_isolation` (usando `get_current_tenant_id()`)
      en las 9 tablas que NO estaba en el repo — aplicada manualmente a prod
      fuera de control de versiones en algún momento, sólo aislaba por
      tenant y habría reintroducido el mismo bug de OR al coexistir con la
      política nueva; se eliminó. Se corrigió `rls-policies.sql`: una sola
      política combinada (`AND`, con `WITH CHECK`) por tabla en vez de dos,
      + políticas nuevas para las 4 tablas sin cubrir (`nominas_complementarias_detalle`
      vía `EXISTS` contra `nominas_complementarias`, no tiene `proyecto_id`
      propio). Aplicado contra `bocam_personal` sin errores. Ownership de
      las 9 tablas reasignado a `bocam_app` (0 objetos con
      `relowner=bocam_admin` al terminar). Prueba de fuga cross-tenant Y
      cross-proyecto con datos sintéticos (`empleados`, `cuadrillas`) vía
      `bocam_app`: sesión tenant=A/proyecto=P1 solo vio su propia fila,
      ocultando tenant=B y tenant=A/proyecto=P2; datos eliminados al
      terminar. `PERSONAL_DATABASE_URL` → `bocam_app`, contenedor recreado y
      healthy. Smoke test con JWT real (`recursoshumanos@bocam.com.mx`,
      tenant `8e07a7ac-...`, proyecto `dba40757-...`) contra `dashboard` y
      `empleados`: 200 OK, payload vacío — verificado contra `bocam_admin`
      (bypass) que el módulo Personal genuinamente tiene 0 filas para ese
      tenant/proyecto hoy (Riesgo 1 descartado, no es falso negativo).
- [x] 3.6 `seguridad`: repetir 2.1–2.7 (`SEGURIDAD_DATABASE_URL` /
      `bocam_seguridad`). **Hallazgo**: mismo bug de políticas separadas
      (OR en vez de AND) que en `personal` (3.5), en las 5 tablas
      (`incidentes`, `inspecciones_seguridad`, `permisos_trabajo`,
      `capacitaciones`, `registros_capacitacion`) — corregido a una sola
      política combinada por tabla. Además `epp_registros`
      (`tenant_id`+`proyecto_id`, usada con `.update` en `main.ts` vía
      `registroEPP`) no tenía ninguna política — agregada. A diferencia de
      `personal`, no había política huérfana fuera de control de versiones.
      Aplicado contra `bocam_seguridad` sin errores, ownership de las 6
      tablas reasignado (0 objetos con `relowner=bocam_admin` al terminar).
      Prueba de fuga con 3 incidentes sintéticos (tenant A/proyecto P1,
      tenant A/proyecto P2, tenant B/proyecto P1) vía `bocam_app`: sesión
      A/P1 solo vio su propia fila; datos eliminados al terminar.
      `SEGURIDAD_DATABASE_URL` → `bocam_app`, contenedor recreado y healthy.
      Smoke test con JWT real (`seguridad@bocam.com.mx`, tenant
      `8e07a7ac-...`, proyecto `dba40757-...`) contra `dashboard` e
      `inspecciones`: 200 OK, payload vacío — verificado contra
      `bocam_admin` que el módulo genuinamente tiene 0 filas para ese
      tenant/proyecto hoy (Riesgo 1 descartado).
- [x] 3.7 `calidad`: repetir 2.1–2.7 (`CALIDAD_DATABASE_URL` /
      `bocam_calidad`). **Hallazgo**: a diferencia de los demás servicios,
      `calidad` no tenía `rls-policies.sql` — solo 2 de sus 6 tablas
      (`documentos`, `versiones_documento`) tenían política, embebida en la
      migración inicial (`get_current_tenant_id()`), fuera de un archivo
      rastreado como los demás módulos. Las otras 4
      (`no_conformidades`, `acciones_correctivas`, `auditorias_internas`,
      `hallazgos_auditoria`) no tenían ninguna, pese a usarse con `.update`
      en `main.ts`. Auditoría de `apps/calidad/src/db.ts` confirmó que
      `createCalidadContext` fija `app.current_proyecto_id` a `''` SIEMPRE
      — el módulo es de alcance corporativo (proyecto_id es opcional/nullable,
      filtrado a nivel de aplicación cuando aplica, no vía RLS) — por lo que
      las políticas correctas para las 6 tablas son solo por `tenant_id`, no
      tenant+proyecto (una política con proyecto_id habría devuelto 0 filas
      siempre). Se creó `apps/calidad/prisma/rls-policies.sql` nuevo
      cubriendo las 6 tablas, reemplazando las 2 políticas embebidas.
      Aplicado sin errores, ownership reasignado (0 objetos con
      `relowner=bocam_admin` al terminar). Prueba de fuga cross-tenant con 2
      documentos sintéticos vía `bocam_app`: sesión tenant A solo vio su
      propio documento; datos eliminados al terminar. `CALIDAD_DATABASE_URL`
      → `bocam_app`, contenedor recreado y healthy. Smoke test con JWT real
      (`calidad@bocam.com.mx`, tenant `8e07a7ac-...`) contra `documentos` y
      `no-conformidades`: 200 OK, payload vacío — verificado contra
      `bocam_admin` que el módulo genuinamente tiene 0 filas para ese tenant
      hoy (Riesgo 1 descartado).
- [x] 3.8 `ventas`: repetir 2.1–2.7 (`VENTAS_DATABASE_URL` / `bocam_ventas`).
      Único de los 4 servicios de esta sesión sin hallazgos — `rls-policies.sql`
      ya usaba el patrón correcto (una política combinada `tenant_id AND
      proyecto_id` con `WITH CHECK`), cubría las 3 tablas reales del schema
      y no había políticas huérfanas en prod. Ownership de las 3 tablas
      reasignado a `bocam_app` (0 objetos con `relowner=bocam_admin` al
      terminar). Prueba de fuga cross-tenant con 2 clientes sintéticos vía
      `bocam_app`: sesión tenant A solo vio su propio cliente; datos
      eliminados al terminar. `VENTAS_DATABASE_URL` → `bocam_app`,
      contenedor recreado y healthy. Smoke test con JWT real
      (`ofertas@bocam.com.mx`, tenant `8e07a7ac-...`) contra `clientes` y
      `cotizaciones`: 200 OK, payload vacío — verificado contra
      `bocam_admin` que el módulo genuinamente tiene 0 filas para ese tenant
      hoy (Riesgo 1 descartado).

## 4. Servicios sin políticas RLS (higiene de privilegio, menor urgencia)

- [x] 4.1 `contabilidad`: `REASSIGN OWNED BY` + `CONTABILIDAD_DATABASE_URL` +
      restart + smoke test básico (sin políticas RLS que verificar, solo
      confirmar que el servicio sigue funcionando con el rol restringido).
      Confirmado: sin `rls-policies.sql` (gap fuera de alcance, documentado
      en design.md). Ownership reasignado vía ownership dinámico por objeto
      (0 objetos con `relowner=bocam_admin` al terminar). Contenedor
      recreado y healthy, sin errores de conexión en logs.
- [x] 4.2 `almacen`: ídem (`ALMACEN_DATABASE_URL`). Mismo resultado:
      ownership reasignado, contenedor healthy sin errores.
- [x] 4.3 `control-proyectos`: ídem (`CONTROL_PROYECTOS_DATABASE_URL`).
      Mismo resultado: ownership reasignado, contenedor healthy sin
      errores.

## 5. Cierre

- [ ] 5.1 Confirmar que los 12 `<SERVICIO>_DATABASE_URL` del `.env` del VPS
      usan `bocam_app`, ninguno usa `bocam_admin`.
- [ ] 5.2 Confirmar que `bocam_admin` sigue existiendo y con acceso completo
      (no se modificó ni se revocó) — sigue siendo la cuenta de operación
      manual.
- [ ] 5.3 Actualizar `ESTADO_DEL_SISTEMA.md`/memoria del proyecto con el
      cierre de este hallazgo.
