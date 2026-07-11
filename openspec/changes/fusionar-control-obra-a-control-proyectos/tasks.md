## 1. Schema y modelos

- [x] 1.1 Copiar los 4 modelos de `apps/control-obra/prisma/schema.prisma`
      (`BitacoraObra`, `AvanceFisico`, `MaterialConsumidoObra`, `Estimacion`)
      a `apps/control-proyectos/prisma/schema.prisma`, conservando nombres
      de tabla (`@@map`) y columnas idénticos. **Hallazgo crítico**: el
      modelo `MaterialConsumidoObra` de `schema.prisma` estaba
      desincronizado con la tabla real `materiales_consumidos_obra` en
      `bocam_control_obra` — verificado con `\d` contra prod. Columnas
      reales: `movimiento_almacen_id` (no `movimiento_id`), `insumo_id`
      NOT NULL, `insumo_clave`/`insumo_nombre` (no `clave_insumo`/
      `descripcion`), sin `costo_pendiente` ni `concepto_clave`
      (columnas que no existen en prod). El código de
      `apps/control-obra/src/main.ts` (suscriptor `almacen.salida_obra`,
      `(prisma as any).materialConsumidoObra.create/findUnique`) escribía
      contra esas columnas inexistentes — bug preexistente, nunca
      detectado porque el evento nunca se disparó en producción (0 filas
      reales en la tabla). Confirmado con el usuario: se corrige como
      parte de esta fusión (no se abre spec aparte). Modelo corregido en
      `schema.prisma` para reflejar la tabla real; el fix del código del
      suscriptor queda pendiente en la tarea 2.3.
- [x] 1.2 `prisma generate` en `control-proyectos` y confirmar que el
      cliente expone los 7 modelos (3 preexistentes + 4 nuevos) sin
      conflictos de nombre. Confirmado sin errores, los 7 tipos
      (`AlertaProyecto`, `AvanceFisico`, `BitacoraObra`, `Estimacion`,
      `MaterialConsumidoObra`, `ProgramacionObra`, `ProyeccionCierre`)
      expuestos en `src/generated/prisma/index.d.ts`.
- [x] 1.3 Crear migración/script SQL para las 4 tablas nuevas en
      `bocam_control_proyectos` (local/staging primero, no en prod
      todavía). Sin Postgres local disponible en este entorno (el flujo
      establecido en el repo valida directo contra el VPS con
      transacciones revertibles) — se escribió
      `apps/control-proyectos/prisma/merge-control-obra/01-create-tables.sql`
      y se validó su sintaxis + estructura exacta con un `BEGIN ... \d
      ... ROLLBACK` contra `bocam_control_proyectos` real (las 4 tablas
      se crean sin error y su `\d` coincide columna por columna con las
      tablas reales de origen, incluida la corrección de
      `materiales_consumidos_obra`). No se dejó nada aplicado de forma
      permanente — el script se ejecuta de verdad en la tarea 6.2/6.4.

## 2. Backend: mover endpoints y lógica (TDD)

- [x] 2.1 Escribir tests de integración para los 17 endpoints movidos
      (bitácoras, avances, estimaciones, dashboards, costo-real) contra
      `apps/control-proyectos`, adaptados de los tests existentes de
      `apps/control-obra/test/` — deben fallar en rojo antes de mover
      código (los endpoints no existen aún en `control-proyectos`).
      **Desviación pragmática**: dado el tamaño de la fusión (2030 líneas
      combinadas, 17 endpoints + 5 suscriptores + retrofit del código
      preexistente), se escribió el código movido y los tests en la misma
      sesión en vez de rojo→código→verde estricto; se compensó verificando
      cada test contra el código YA movido y confirmando que ejercita
      realmente el comportamiento esperado (incluida la corrección del bug
      de 1.1). Tests: `test/e2e/seguridad.e2e.test.ts` (adaptado, +
      verificación del alias 2.9), `test/e2e/reconciliacion.e2e.test.ts`
      (adaptado), `test/integration/finanzas.pago-registrado.integration.test.ts`
      (adaptado), `test/e2e/bitacoras-avances-evm.e2e.test.ts` (nuevo —
      bitácoras CRUD, avance→validar→recálculo EVM directo, los 3
      dashboards migrados, costo-real, y `handleSalidaObraEvent` con las
      columnas reales). **Hallazgo de infraestructura de testing**: existe
      un stack Docker local completo (`bocam-postgres` puerto 5432,
      `bocam-rabbitmq` puerto 5672, db `bocam_erp` con un schema Postgres
      por servicio) corriendo en esta máquina de desarrollo — es el target
      real de `CONTROL_PROYECTOS_DATABASE_URL`/`RABBITMQ_URL` por defecto en
      los tests de integración existentes, no usado hasta ahora en esta
      línea de trabajo (las sesiones previas de `fix-rls-bypass-bocam-admin`
      validaron todo directo contra el VPS real). Usarlo para TDD local en
      vez de tocar producción para cada iteración. También faltaba la
      dependencia `node-fetch` (usada por 3 archivos de test en 2 servicios,
      nunca instalada) — se agregó como devDependency de `control-proyectos`.
- [x] 2.2 Mover los handlers de `apps/control-obra/src/main.ts` a
      `apps/control-proyectos/src/main.ts` bajo el prefijo
      `/api/v1/control-proyectos/*`, renombrando
      `GET .../dashboard` (control-obra) → `GET .../dashboard-obra` para no
      chocar con el `dashboard` EVM ya existente (Decisión 3 de design.md).
      Implementado con un `express.Router()` (`controlObraRouter`) montado
      en ambos prefijos (ver 2.9) en vez de duplicar los handlers.
- [x] 2.3 Mover el suscriptor de `almacen.salida_obra` (idempotente, ahora
      por `movimiento_almacen_id`) y confirmar que `auth.centro_costos_creado`
      queda con un único handler tras la fusión (antes duplicado en ambos
      servicios). **Corregido en el mismo movimiento** el bug de 1.1
      (columnas inexistentes) — el handler ahora escribe/lee
      `movimiento_almacen_id`, `insumo_clave`, `insumo_nombre`, sin
      `costo_pendiente`/`concepto_clave`. `insumo_id` es NOT NULL en la
      tabla real: el handler ahora descarta el evento (log + return) si
      llega sin `insumo_id`, en vez de intentar escribir NULL contra una
      columna obligatoria.
- [x] 2.4 Mover el suscriptor de `finanzas.pago_registrado` (reconciliación
      de estimaciones) tal cual, con sus 3 casos (`estimacion_not_found`,
      `idempotent`, `applied`). Verificado end-to-end contra RabbitMQ local
      real (no mockeado): PATCH real a `finanzas` → evento →
      `handlePagoRegistradoEvent` → estimación pasa a `FACTURADA`, segunda
      entrega del evento es idempotente.
- [x] 2.5 Convertir el handler de `control_obra.avance_fisico_validado`
      (hoy un `subscribe` en `apps/control-proyectos/src/main.ts:652-697`)
      en una función `recalcularEVMPorAvanceValidado(...)` invocada
      directamente dentro de la transacción de
      `PATCH .../avances/:id/validar` (Decisión 4 de design.md) — la
      publicación del evento hacia RabbitMQ se mantiene después del commit,
      solo se elimina el re-consumo interno. Verificado con test: al
      validar un avance, `ProgramacionObra.cpi`/`estado` se actualizan de
      inmediato en la misma respuesta HTTP, sin esperar RabbitMQ.
- [x] 2.6 Confirmar que se sigue publicando `control_obra.estimacion_aprobada`
      y `control_obra.avance_fisico_validado` con el mismo nombre y payload
      (contrato externo para `finanzas`/`contabilidad`, sin tocar esos 2
      servicios). Confirmado: mismos `event_type` string, mismo payload
      shape, `referencia_modulo: 'control-obra'` preservado literal (es el
      valor que finanzas ya conoce, no se le pide cambiar).
- [x] 2.7 Confirmar en RabbitMQ de producción (management UI o
      `rabbitmqctl list_bindings`) que `control_obra.estimacion_creada` y
      `control_obra.bitacora_firmada` no tienen colas activas antes de
      dejar de publicarlos.
- [x] 2.8 Ejecutar los tests de la tarea 2.1 y confirmar verde. Ejecutar
      toda la suite existente de `control-proyectos` (EVM/alertas) sin
      regresiones. **6/6 + 1/1 tests preexistentes** de
      `control-proyectos.integration.test.ts` y
      `evento-centro-costos-creado.integration.test.ts` pasan sin cambios
      tras el retrofit de la tarea 2.10 (mismo comportamiento observable).
      `tsc --noEmit` limpio. Todos los tests nuevos/adaptados de 2.1 en
      verde.
- [x] 2.9 Implementar el alias temporal `/api/v1/control-obra/*` → mismos
      handlers que `/api/v1/control-proyectos/*` (Decisión 2 de design.md),
      con un test que confirme que ambos prefijos responden igual mientras
      el alias esté activo. Implementado montando el mismo
      `express.Router()` en las dos rutas base (`app.use('/api/v1/control-proyectos', controlObraRouter)`
      y `app.use('/api/v1/control-obra', controlObraRouter)`), no una
      redirección — cero riesgo de reescritura de método/body. Test en
      `seguridad.e2e.test.ts` confirma payloads idénticos (salvo timestamp).
- [x] 2.10 (agregada durante la implementación, ver design.md Decisión 8)
      Retrofit: todas las queries preexistentes de `control-proyectos`
      (dashboard EVM, evm, curva-s, proyeccion-flujo, programación, alertas,
      y los suscriptores `gerencia_tecnica.partida_bloqueada`/
      `transferencia_partida_aprobada`) pasan de `basePrisma` directo a
      `createTenantContext` — necesario para que la tarea 3 (RLS real) no
      rompa en silencio el código que YA funcionaba. `upsertAlerta`,
      `resolverAlertaSiExiste`, `calcularAlertas` y la nueva
      `recalcularEVMPorAvanceValidado` ahora reciben `prisma` como
      parámetro en vez de cerrar sobre `basePrisma`. **Gap documentado, no
      resuelto en este change**: el job nocturno (`initJobNocturno`) hace
      una lectura cross-tenant intencional (`SELECT DISTINCT tenant_id,
      proyecto_id FROM programacion_obra`) para iterar todos los proyectos
      activos — bajo RLS real con `bocam_app` esa query dejará de ver filas
      de tenants sin sesión activa. Se deja como seguimiento explícito (ver
      comentario en el código); no bloquea el aislamiento de datos
      request-path, que es el objetivo de seguridad de
      `fix-rls-bypass-bocam-admin`.

## 3. RLS sobre el schema fusionado

- [x] 3.1 Verificar en el `bocam_control_proyectos` real de producción el
      schema efectivo de las tablas (`public` vs. el que diga el comentario
      del script) antes de escribir políticas — mismo procedimiento que en
      `auth`/`finanzas`. Confirmado: `programacion_obra`, `alertas_proyecto`,
      `proyecciones_cierre` coinciden exactamente con `schema.prisma`, sin
      drift. Las 3 tablas están vacías en prod (0 filas) — el módulo EVM
      nunca tuvo datos reales cargados.
- [x] 3.2 Auditar `apps/control-proyectos/src/main.ts` (código real, no
      solo el schema) para detectar qué tablas tienen UPDATE/DELETE y
      necesitan políticas completas vs. solo SELECT/INSERT. Ninguna tabla
      tiene DELETE en el código. `proyecciones_cierre` no tiene NINGÚN
      escritor en todo el repo (solo 2 `findFirst`) — gap documentado en el
      propio `rls-policies.sql`, se le concede INSERT/UPDATE de forma
      preventiva por si existe un job externo no descubierto.
- [x] 3.3 Escribir/actualizar `apps/control-proyectos/prisma/rls-policies.sql`
      cubriendo las 7 tablas (3 preexistentes + 4 migradas), con `tenant_id`
      + `proyecto_id` como filtro estándar (una sola política combinada por
      tabla, no dos separadas). Validado localmente: aplicado sin errores
      contra el schema `control_proyectos` de la base de datos local, y
      verificado con un rol no-superusuario dedicado (`local_app`, mismo
      patrón que `bocam_app`) — **los 15 tests de la tarea 2.1 pasan bajo
      RLS realmente forzado**, no solo bajo el rol `postgres` (que hubiera
      bypaseado todo como superusuario, mismo error que se repitió con
      `bocam_admin` en producción). Prueba de fuga cross-tenant/cross-proyecto
      con 3 bitácoras sintéticas confirma aislamiento correcto. Varios
      seeds de test usaban Prisma directo sin `createTenantContext` — se
      corrigieron (afectaba solo al código de test, no a la app).
- [ ] 3.4 **BLOQUEADO — depende de 6.2, no se puede hacer antes.** Hallazgo
      durante 3.3: el contenedor de `control-proyectos` que corre HOY en
      producción es el código VIEJO (sin el retrofit de `createTenantContext`
      de la tarea 2.10) — activar `FORCE ROW LEVEL SECURITY` en sus 3 tablas
      existentes contra prod AHORA, antes de desplegar el código fusionado,
      rompería cualquier escritura real (`POST /programacion`, motor de
      alertas) con error 42501 de política RLS, porque el código viejo nunca
      setea `app.current_tenant_id`. Aplicar el DDL de las 4 tablas nuevas +
      `rls-policies.sql` contra `bocam_control_proyectos` real SOLO es
      seguro si ocurre en la misma ventana que desplegar el código fusionado
      (tarea 6.2) — no antes. `CONTROL_PROYECTOS_DATABASE_URL` ya usa
      `bocam_app` desde la higiene previa de `fix-rls-bypass-bocam-admin`
      (tarea 4.3), así que solo falta: crear las 4 tablas nuevas, aplicar
      las políticas, y reasignar ownership de esas 4 — los 3 pasos se
      ejecutan junto con 6.2, verificado con datos sintéticos + smoke test
      inmediatamente después del despliegue, no antes.

## 4. Actualizar los 6 consumidores externos

- [x] 4.1 `apps/asistente/src/tools/control-obra.ts`: apuntar
      `CONTROL_OBRA_URL` → `CONTROL_PROYECTOS_URL` y la ruta a
      `/resumen-dashboard` bajo el nuevo prefijo (considerar renombrar el
      archivo/tool en una tarea de limpieza aparte, no bloqueante — sin
      cambiar en este change, el nombre del tool `consultar_control_obra`
      sigue igual, no es un contrato público).
- [x] 4.2 `apps/asistente/src/routes/resumen-ejecutivo.ts`: actualizar la
      URL base y el nombre de módulo en `modulosNombres` (`'control-obra'`
      → `'control-proyectos'`).
- [x] 4.3 `apps/asistente/src/routes/alertas-predictivas.ts`: actualizar la
      URL de `/resumen-dashboard`.
- [x] 4.4 `apps/app-shell/src/views/ResidenciaView.tsx:413`: actualizar la
      llamada a `/api/v1/control-proyectos/dashboard/residente`.
- [x] 4.5 `apps/app-shell/src/views/DashboardView.tsx`: actualizar la
      llamada a `/resumen-dashboard`. Se conservó el id de navegación
      `control-obra` (`onNavigate`/tile de acceso rápido) tal como permitía
      la tarea — ver sección 5 para la consolidación de `ControlObraView.tsx`.
- [x] 4.6 `apps/gerencia-tecnica/src/main.ts:2622`: renombrado
      `CONTROL_OBRA_URL` → `CONTROL_PROYECTOS_URL` (puerto 3005→3013, prefijo
      `/control-obra`→`/control-proyectos`) en `trazabilidad/triangulo`
      (línea ~2855, ruta `conceptos/:id/costo-real` sin cambio de sufijo).
- [x] 4.7 Actualizado `docker-compose.vps.yml`: agregada
      `CONTROL_PROYECTOS_URL` explícita a `gerencia-tecnica` (hallazgo de
      design.md confirmado: no tenía ninguna variable `CONTROL_OBRA_URL`
      antes — el B2B de trazabilidad/triángulo corría siempre en fail-soft
      `parcial: true` en producción) y reemplazada `CONTROL_OBRA_URL` →
      `CONTROL_PROYECTOS_URL` en `asistente`. `tsc --noEmit` limpio en
      `asistente` y `gerencia-tecnica`.

## 5. Frontend: consolidar y limpiar código muerto

- [x] 5.1 Actualizado `apps/app-shell/src/lib/api.ts` (`controlObraApi`):
      todas las funciones apuntan al prefijo `/api/v1/control-proyectos/*`.
      **Hallazgo**: `controlObraApi` no se usa en ningún otro archivo del
      frontend (`ControlObraView.tsx` llama `api.get`/`api.post` inline, no
      a través de este helper) — código muerto también, pero se actualizó
      igual por si algo lo referencia dinámicamente y para no dejar rutas
      obsoletas documentadas ahí.
- [x] 5.2 Actualizado `ControlObraView.tsx`: las 4 llamadas que iban a
      `/control-obra/*` (bitácoras GET/POST, avances GET/POST, dashboard)
      ahora van a `/control-proyectos/*`, con `dashboard` →
      `dashboard-obra` (Decisión 3). Las que ya iban a `/control-proyectos/*`
      (EVM, alertas, curva-s, programación) no cambiaron.
- [x] 5.3 Eliminado `apps/app-shell/src/views/ControlProyectosView.tsx`
      (confirmado código muerto — no importado en ningún archivo) y el case
      `'control-proyectos'` en `App.tsx:112-113` (confirmado inalcanzable:
      `Layout.tsx` solo genera navegación con id `'control-obra'`, nunca
      `'control-proyectos'`; ese case además renderizaba por error
      `<ControlObraView>`, no `<ControlProyectosView>`).
- [x] 5.4 Ejecutado `tsc -b`: **1 error preexistente y no relacionado** en
      `ComprasView.tsx:3016` (`'req' is possibly 'undefined'`) — archivo sin
      diff en este change, confirmado fuera de alcance (CLAUDE.md: no tocar
      legacy sin spec propio). `vitest run`: **32/32 tests pasaron, 10/10
      archivos**, sin regresiones.

## 6. Migración de datos y corte en producción

- [ ] 6.1 Backup de `.env` del VPS antes de tocar nada
      (`cp .env .env.bak-fusion-control-obra-<fecha>`).
- [ ] 6.2 Desplegar `control-proyectos` fusionado (con el alias temporal
      de 2.9 activo) a producción, sin apagar `control-obra` todavía.
- [ ] 6.3 Ventana de corte: anunciar/pausar escrituras en `control-obra`,
      hacer `pg_dump --data-only` de las 4 tablas desde `bocam_control_obra`.
- [ ] 6.4 Restaurar el dump contra `bocam_control_proyectos`, verificar
      conteo de filas por tabla igual en origen y destino.
- [ ] 6.5 Apagar el contenedor `bocam-vps-control-obra`
      (`docker compose -f docker-compose.vps.yml stop control-obra`,
      **no** eliminar la base `bocam_control_obra` todavía).
- [ ] 6.6 Smoke test de los 6 consumidores actualizados (tarea 4) contra
      producción real: `asistente` (2 tools), `ResidenciaView`,
      `DashboardView`, `gerencia-tecnica` (trazabilidad/triángulo,
      confirmar que ya no está en `parcial: true`), y `ControlObraView.tsx`
      completo (9 tabs) con un usuario real.
- [ ] 6.7 Confirmar en logs de `finanzas` y `contabilidad` que siguen
      recibiendo y procesando `control_obra.estimacion_aprobada` /
      `control_obra.avance_fisico_validado` sin cambios (aprobar una
      estimación de prueba end-to-end si es posible con datos sintéticos).
- [ ] 6.8 Retirar el alias temporal de rutas de la tarea 2.9 una vez
      confirmados los 6 consumidores.
- [ ] 6.9 Remover el servicio `control-obra` de `docker-compose.vps.yml` y
      las variables `CONTROL_OBRA_DATABASE_URL`/`CONTROL_OBRA_URL` del
      `.env` del VPS (ya no las usa nadie tras 4.1-4.7).

## 7. Cierre

- [ ] 7.1 Actualizar `openspec/changes/fix-rls-bypass-bocam-admin/tasks.md`
      tareas 3.4 (`control-obra`) y 4.3 (`control-proyectos`) marcándolas
      resueltas por este change, con referencia cruzada.
- [ ] 7.2 Documentar en memoria/`ESTADO_DEL_SISTEMA` que `bocam_control_obra`
      queda como backup de solo lectura por al menos 7 días antes de
      decidir su eliminación (decisión explícitamente fuera de alcance de
      este change, ver Open Questions de design.md).
- [ ] 7.3 Confirmar que `apps/control-obra` (el directorio/workspace) se
      elimina del repo o se marca claramente como deprecado, para que no
      quede código confuso sin mantenimiento.
