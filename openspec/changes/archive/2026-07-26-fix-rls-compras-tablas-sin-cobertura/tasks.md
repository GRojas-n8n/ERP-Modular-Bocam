## 1. Confirmar el alcance exacto (rojo antes del fix)

- [x] 1.1 Verificar si `apps/compras/prisma/rls-policies.sql` existe hoy en el
      repo; si existe, confirmar que no cubre las 17 tablas (comparar contra
      lo verificado en producción).
      **Hallazgo importante**: el archivo SÍ existía y SÍ declaraba las
      políticas de `cuadros_comparativos`/`comparativas_detalles` (con el
      patrón de funciones `current_tenant_id()`/`current_proyecto_id()`,
      consistente con el resto del archivo) — pero nunca se les agregó
      `ENABLE`/`FORCE ROW LEVEL SECURITY` a esas 2 tablas. No eran políticas
      huérfanas fuera de control de versiones como se sospechaba; era un
      `ALTER TABLE` faltante. Las otras 15 tablas no tenían ninguna
      declaración en absoluto.
- [x] 1.2 Inspeccionar las funciones `current_tenant_id()`/
      `current_proyecto_id()` — confirmadas correctas y ya definidas en el
      propio `rls-policies.sql` (no eran residuo, son el patrón estándar de
      `compras`, distinto pero igual de válido al `current_setting(...)`
      directo usado en `personal`/`finanzas`).
- [x] 1.3 Test de integración HTTP nuevo:
      `apps/compras/test/integration/rls-idor-cuadro-comparativo.integration.test.ts`.
      **No ejecutado contra producción** (decisión explícita del usuario —
      compras tiene datos reales y el test levanta el servidor completo, no
      es una transacción `ROLLBACK`-only) — el IDOR se confirmó con certeza
      suficiente vía lectura directa de código (`main.ts:2510`,
      `findUnique({ where: { id_cuadro: id } })` sin filtro ni verificación
      posterior) + estado real de la BD (RLS deshabilitado). Test queda en el
      repo para correrlo cuando haya entorno local.
- [x] 1.4 Cubierto por el mismo test: `comparativaDetalle` se expone vía el
      `include` del mismo endpoint, no tiene lookup independiente por PK sin
      filtro.

## 2. Mitigación inmediata: RLS en las tablas de la fuga activa

- [x] 2.1 No hizo falta `DROP POLICY` de políticas huérfanas — ver hallazgo de
      1.1. Solo faltaba `ENABLE`/`FORCE ROW LEVEL SECURITY`.
- [x] 2.2 Agregado a `apps/compras/prisma/rls-policies.sql`.
- [x] 2.3 **Aplicado en producción** (`bocam_compras`) inmediatamente tras
      escribirlo, antes de continuar con el resto del change.
- [x] 2.4 Verificado en verde con transacción `BEGIN...ROLLBACK` contra el VPS
      real usando 2 filas reales pre-existentes de distinto tenant: la fila
      del otro tenant pasó de visible a `0 rows`; la propia siguió visible.
- [x] 2.5 Confirmado: con solo RLS (sin el fix de código todavía), el
      endpoint `GET /comparativas/:id` respondía `200` con `data: null` para
      un cuadro de otro tenant — la fuga de datos ya estaba cerrada (RLS hace
      su trabajo), pero la respuesta no era un `404` limpio. Motivó proceder
      con la sección 3 sin demora.

## 3. Fix de raíz en el código

- [x] 3.1 Agregado chequeo explícito `cuadro.tenant_id !== tenantId` (o
      equivalente al idioma "no encontrado" ya usado en cada función) en 17
      de los 30 call sites de `cuadroComparativo` por PK — 6 ya lo tenían
      antes de este change (alguien ya lo había aplicado a los endpoints más
      nuevos), 8 se revisaron y son seguros por construcción (re-fetch de un
      ID ya verificado o recién creado en la misma transacción, o filtran
      `tenant_id` directo en el `where`). Trabajo mecánico delegado a un
      subagente con el patrón exacto especificado, verificado línea por línea
      por mí después (diff completo revisado, varios sitios re-leídos con
      contexto).
      **Hallazgo adicional no cubierto por el subagente**: 3 endpoints
      (`revision-con-preguntas`, `responder-preguntas-gt`,
      `responder-preguntas`) hacían `comparativaDetalle.update({ where: {
      id_detalle: <valor del body> } })` con un `detalle_id` controlado por
      el atacante, sin verificar que perteneciera al cuadro ya validado —
      mismo patrón de IDOR pero de escritura, no cubierto por el audit
      original porque el subagente solo revisó lookups de
      `cuadroComparativo`, no escrituras de `comparativaDetalle`. Corregido a
      mano agregando verificación de membresía contra `cuadro.detalles`
      (mismo patrón que el endpoint `evaluar` que ya lo hacía bien desde
      antes).
- [ ] 3.2 Confirmar los tests de la tarea 1.3/1.4 en verde — pendiente de
      correr (requiere entorno local o desplegar y probar contra prod, ver
      nota de la sección 5).
- [ ] 3.3 Correr la suite de tests existente de `compras` — no ejecutado, sin
      entorno local disponible en esta sesión.
- [x] 3.4 `tsc --noEmit` limpio en `apps/compras` (confirmado 2 veces, tras el
      fix del subagente y tras mis 3 fixes adicionales).

## 4. Auditar y clasificar las tablas restantes

- [x] 4.1 Auditadas las 15 tablas restantes (no 13 — error aritmético en el
      conteo original del proposal; 17 tablas totales − 2 ya tratadas en la
      sección 2 = 15, no 13). Todas sus escrituras/lecturas por PK en
      `main.ts` ya filtran `tenant_id` explícito o dependen de un padre
      (`cuadroComparativo`) ya verificado — **con una excepción real
      encontrada**: `GET /ordenes-compra/:id/recepciones` hacía
      `recepcionOC.findMany({ where: { orden_id: id } })` sin `tenant_id`, un
      leak de listado (no solo defensa en profundidad — ningún otro chequeo
      en ese handler específico validaba el tenant del `orden_id`).
- [x] 4.2 Corregido: se agregó `tenant_id: tenantId` directo al `where` de esa
      consulta (no requería el patrón de verificación de padre, la tabla
      tiene su propio `tenant_id`).
- [x] 4.3 Extendido `rls-policies.sql` con las 15 tablas restantes — patrón
      estándar del archivo (`current_tenant_id()`/`current_proyecto_id()`),
      `tenant_id AND proyecto_id` combinados con `AND` donde aplica
      `proyecto_id` propio, solo `tenant_id` para
      `documentos_proveedor`/`solicitudes_cotizacion_proveedores`/
      `anotaciones_especificacion` (no tienen `proyecto_id` propio).

## 5. Aplicar el resto en producción y cerrar

- [x] 5.1 Aplicado contra `bocam_compras` — 22 tablas totales con RLS
      forzado y 1 política cada una (confirmado por conteo, sin errores
      reales; solo ruido de idempotencia esperado en las 5 tablas que ya
      tenían RLS desde 2026-07-10/11).
- [x] 5.2 Confirmado `relrowsecurity=true`/`relforcerowsecurity=true`/1
      política en las 22 tablas.
- [x] 5.3 Smoke test con JWT real (`iretum@bocam.com.mx`, tenant real, rol
      `admin`) sobre `GET /proveedores`, `GET /comparativas/:id` (propio y
      cross-tenant) — datos propios intactos, cross-tenant ya bloqueado.
- [x] 5.4 Confirmado conteo de filas de las 17 tablas originalmente sin RLS
      vía `bocam_admin` (bypass) — datos reales confirmados en varias
      (`cuadros_comparativos`=32, `comparativas_detalles`=36,
      `solicitudes_cotizacion`=11, `comparativas_lineas`=12,
      `comparativas_proveedores_archivos`=15,
      `solicitudes_cotizacion_proveedores`=29, `alertas_oc_error`=2), sin
      pérdida de datos.
- [x] 5.5 Commit de `rls-policies.sql` + cambios de código + test nuevo.
- [x] 5.6 Actualizar memoria del hallazgo
      (`hallazgo-rls-drift-compras-gerencia-tecnica-2026-07-26`) marcando
      `compras` como resuelto.

**Pendiente fuera del alcance verificable en esta sesión**: desplegar el fix
de código a producción (`bocam-vps-compras`) requiere rebuild + restart del
contenedor — el usuario confirmó proceder; ver el mensaje de cierre de la
sesión para el resultado del despliegue. Las tareas 3.2/3.3 (verificación de
tests) quedan pendientes de un entorno con Postgres local.
