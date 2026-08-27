## 1. Auditoría previa (bloqueante — antes de generar la migración de schema)

- [x] 1.1 Contra la base real de `gerencia-tecnica` (`bocam_gerencia_tecnica`, VPS producción, 2026-08-27): **441** insumos activos totales — **394** no ambiguos (un único `proyecto_id` en `concepto_insumos`), **9** ambiguos (más de un `proyecto_id`), **38** huérfanos (sin ninguna referencia en `concepto_insumos`).
- [x] 1.2 (ambiguos + huérfanos) = 47 de 441 = ~10.7% del catálogo activo — **no** es la mayoría. No se pausa: el backfill de mejor esfuerzo (design.md Decision 3) sigue siendo aceptable, sin necesidad de coordinación manual adicional.
- [x] 1.3 Contra la base real de `compras` (`bocam_compras`, VPS producción, 2026-08-27): de los 47 insumos candidatos a archivarse, **0 requisiciones activas** (no `CANCELADA`/`CERRADA`/`ARCHIVADA`) los referencian en `requisiciones_items` — producción solo tiene 4 requisiciones hoy (`APROBADA`×3, `COMPRADA`×1), ninguna toca esos IDs. Riesgo de "Insumo no encontrado en catálogo" en el correo de solicitud de cotización: marginal/nulo en el estado actual de datos.

## 2. Schema y migración

- [x] 2.1 `apps/gerencia-tecnica/prisma/schema.prisma`: agregado `proyecto_id String? @db.Uuid` a `Insumo` (nullable, ver Decision 1), índice `[tenant_id, proyecto_id]` (`idx_insumo_tenant_proyecto`), `@@unique([tenant_id, clave])` → `@@unique([tenant_id, proyecto_id, clave])`.
- [x] 2.2 Migración generada a mano en `prisma/migrations/20260827170324_aislar_insumos_por_proyecto/migration.sql` — **no** vía `prisma migrate dev --create-only`: ese comando falla al reproducir el historial completo contra la shadow DB por un gap preexistente y no relacionado (`20260716120000_add_categoria_predominante_saldo_partida` hace `ALTER TABLE saldo_partidas`, pero ningún migration del historial la crea — la tabla existe en dev/prod pero nunca se creó vía Prisma migration trackeada). No se tocó ese historial (fuera de alcance, sin spec). El SQL de este change se generó con `prisma migrate diff --from-url <dev> --to-schema-datamodel prisma/schema.prisma --script` (compara DB real vs. schema nuevo, sin pasar por la shadow DB) y se revisó manualmente:
  ```sql
  DROP INDEX "insumos_tenant_id_clave_key";
  ALTER TABLE "insumos" ADD COLUMN "proyecto_id" UUID;
  CREATE INDEX "idx_insumo_tenant_proyecto" ON "insumos"("tenant_id", "proyecto_id");
  CREATE UNIQUE INDEX "insumos_tenant_id_proyecto_id_clave_key" ON "insumos"("tenant_id", "proyecto_id", "clave");
  ```
- [x] 2.3 Aplicada contra desarrollo local (SQL directo vía psql, ya que `prisma migrate deploy` también falla por el mismo gap de historial no relacionado — `_prisma_migrations` en dev tampoco está sincronizada con la DB real). Confirmado con prueba real (INSERT + ROLLBACK): dos filas `(tenant_id, proyecto_id=NULL, clave)` idénticas **no colisionan** bajo el nuevo unique constraint — Postgres trata NULL como distinto en constraints únicos, tal como asume design.md.

## 3. Script de backfill (una sola corrida, vía conexión admin)

- [x] 3.1 Script escrito en `apps/gerencia-tecnica/scripts/backfill-proyecto-id-insumos.ts`, siguiendo el patrón ya usado en `apps/personal/scripts/migrar-config-nomina-proyecto.ts`: para cada `Insumo` con `proyecto_id NULL`, resuelve vía `ConceptoInsumo.insumo_id` (distinct `proyecto_id`). Usa `adminPrisma` de `src/db.ts` (bypass RLS, sancionado para scripts de mantenimiento).
- [x] 3.2 Caso no ambiguo: `insumo.update({ data: { proyecto_id } })`.
- [x] 3.3 Caso ambiguo o sin referencias: `insumo.update({ data: { activo: false } })` — `proyecto_id` se queda `NULL`.
- [x] 3.4 Corrido contra desarrollo local con fixtures que cubren los tres casos (insertados y limpiados manualmente vía psql, ver detalle abajo). Resultado confirmado fila por fila:
  - `TEST-UNICO` (1 referencia en `concepto_insumos`) → `proyecto_id` asignado correctamente, `activo` sin cambio.
  - `TEST-AMBIGUO` (2 referencias, proyectos distintos) → `proyecto_id` sigue `NULL`, `activo = false`.
  - `INS-E2E-001` (preexistente, 0 referencias) → `proyecto_id` sigue `NULL`, `activo = false`.
  Log del script: `Insumos legacy procesados: 3 | Asignados: 1 | Archivados (ambiguos): 1 | Archivados (huérfanos): 1` — coincide exactamente con lo esperado. Fixtures de prueba eliminados y `INS-E2E-001` restaurado a `activo = true` tras la verificación (no forma parte de este change).
- [ ] 3.5 Documentar aquí el resultado real de la corrida en producción cuando se ejecute (grupo 10.3).

## 4. RLS

- [x] 4.1 `apps/gerencia-tecnica/prisma/rls-policies.sql`: `rls_insumos_tenant` → `rls_insumos_context`, patrón `tenant_id = get_current_tenant_id() AND (get_current_proyecto_id() IS NULL OR proyecto_id = get_current_proyecto_id())` — mismo patrón que `rls_presupuestos_tenant`. Comentario de la tabla y `COMMENT ON POLICY` actualizados.
- [x] 4.2 Aplicado contra Postgres de desarrollo local. `rls-policies.sql` de este servicio no se había aplicado nunca contra el dev local antes de esta sesión (todas las políticas se crearon desde cero, no solo la de insumos). Probado con el rol `local_app` (NOSUPERUSER, `rolbypassrls=false`, ya existente de `aislamiento-proyecto-por-modulo`) — se le otorgó `GRANT SELECT/INSERT/UPDATE/DELETE` sobre `insumos` (sin reasignar ownership de las 15 tablas del schema, solo lo necesario). Tres casos verificados contra Postgres real, sin bypass:
  1. Con proyecto A activo (`set_config app.current_proyecto_id`): `SELECT` solo retorna el insumo de A, no el de B.
  2. Sin proyecto activo: `SELECT` retorna A y B consolidados, cada uno con su `proyecto_id`.
  3. Con proyecto A activo, `UPDATE` sobre el insumo de B: `UPDATE 0` — bloqueado por la política, no por lógica de aplicación.
  Fixtures de prueba (`RLS-TEST-A`/`RLS-TEST-B`) eliminados tras la verificación; los `GRANT` a `local_app` se dejaron (útiles para los tests de integración del grupo 8).

## 5. Endpoints de escritura — estampar proyecto_id

- [x] 5.1 `POST /api/v1/gerencia-tecnica/insumos` (`main.ts:289`): agregado `proyecto_id: proyectoId` al `data` de `db.insumo.create()`.
- [x] 5.2 `POST /api/v1/gerencia-tecnica/insumos/importar-lote` (`main.ts:386`): agregado `proyecto_id: proyectoId` a cada objeto de `nuevos.map(...)` dentro de `db.insumo.createMany()`. La comparación de duplicados (`existentes`/`claveAId`, `main.ts:374-377`) no se tocó — sigue funcionando porque la RLS ya acota `existentes` al proyecto activo automáticamente (verificado en el análisis, confirmado además por el test de integración 8.5).
- [x] 5.3 `PATCH /api/v1/gerencia-tecnica/insumos/:id` (`main.ts:435-469`): confirmado sin cambio necesario — el `data` del `update` no reasigna `proyecto_id`, y el `findFirst` previo (`main.ts:445`) ya devuelve 404 si el `id` pertenece a otro proyecto (filtrado por RLS antes de llegar al código de aplicación).
- [x] 5.4 `DELETE /api/v1/gerencia-tecnica/insumos/:id` (`main.ts:475+`): confirmado sin cambio necesario, mismo motivo que 5.3. `npx tsc --noEmit` en verde tras 5.1/5.2.

## 6. Endpoints de lectura — exponer proyecto_id para trazabilidad

- [x] 6.1 `GET /api/v1/gerencia-tecnica/insumos` (`main.ts:96`): agregado `proyecto_id: i.proyecto_id` al mapeo de respuesta.
- [x] 6.2 `GET /api/v1/gerencia-tecnica/insumos/explosion` (`main.ts:148`): agregado `proyecto_id: i.proyecto_id` al mapeo de respuesta.
- [x] 6.3 Confirmado a nivel de código: `grep` de `adminPrisma|basePrisma` en `main.ts` no arroja resultados — **todo** acceso a `Insumo` en el archivo pasa por `db.insumo.*`, donde `db` es siempre `createTenantContext({ tenant_id, proyecto_id })` del request (verificado puntualmente en composición APU ~L743). Sin cliente que bypasee RLS, los endpoints listados (composición APU, fichas, dashboard/KPIs, categoría "en uso", clasificación bulk, categoría individual, trazabilidad) quedan acotados solo por `rls_insumos_context` sin cambio de código. **Confirmado además con tests de integración reales bajo RLS forzada** (grupo 8, tests 8.1-8.6) — no solo lectura de código.

## 7. Frontend

- [x] 7.1 `InsumosView.tsx:1591` decía "Catálogo **maestro** de insumos" (implica alcance tenant-wide) — corregido a "Catálogo de insumos **del proyecto**", consistente con el copy de la pestaña hermana ("Conceptos de obra · Presupuesto base del proyecto", línea 1584). El otro texto revisado ("Catálogo consolidado de insumos · OPUS", línea 2698) describe la vista previa del archivo importado, no el alcance de datos de la app — no aplica. `npx tsc --noEmit` en `app-shell` en verde.
- [x] 7.2 Confirmado: `RequisicionesTab.tsx:219` hace un único `GET /insumos/explosion` sin parámetro de proyecto — ya depende del contexto de sesión (JWT → `req.securityContext`), igual que el resto de la app. Sin cambios de contrato.

## 8. Tests de integración

Todos corridos en verde contra Postgres real. 8.1-8.6 en `test/integration/aislamiento-insumos-por-proyecto.integration.test.ts`, corridos con la app conectada como `local_app` (NOSUPERUSER, `rolbypassrls=false`, vía `GERENCIA_TECNICA_DATABASE_URL` sobreescrita al inicio del archivo) — mismo mecanismo que `aislamiento-proyecto-por-modulo`, para que la RLS aplique de verdad y no quede en verde por bypass silencioso del `postgres` de `.env`. 8.7 en archivo separado, contra el cliente admin normal (matching cómo corre el script real).

- [x] 8.1 `GET /insumos` con rol `gerencia_tecnica` y proyecto activo `A`: solo retorna insumos de `A`, aunque exista un insumo activo de `B` del mismo tenant. **Verde.**
- [x] 8.2 `GET /insumos/explosion` con rol `technical`: mismo aislamiento, y `cantidad_presupuestada` calculada correctamente (concepto.cantidad × composición.cantidad) para el insumo del proyecto activo. **Verde.**
- [x] 8.3 `GET /insumos` con rol `admin` sin proyecto activo (`proyectoId: ''`): retorna insumos de ambos proyectos `A` y `B`, cada uno con su `proyecto_id`. **Verde.**
- [x] 8.4 `POST /insumos` con proyecto activo `A` y una `clave` que ya existe en el proyecto `B`: crea el insumo en `A` sin conflicto — confirmado que coexisten 2 filas con la misma clave, una por proyecto. **Verde.**
- [x] 8.5 `POST /insumos/importar-lote`: los insumos creados quedan con `proyecto_id` del proyecto activo de la sesión. **Verde.**
- [x] 8.6 Regresión: `PATCH`/`DELETE` sobre un insumo de otro proyecto por `id` conocido → 404 en ambos casos, mismo patrón que `rls-aislamiento-cross-proyecto-mismo-tenant` de Compras/Control de Proyectos; confirmado además que el insumo de B no se vio afectado (activo/costo_base sin cambio). **Verde.**
- [x] 8.7 `test/integration/backfill-proyecto-id-insumos.integration.test.ts`: `runBackfill()` (función exportada de `scripts/backfill-proyecto-id-insumos.ts`, refactorizado para ser testeable sin invocar el CLI completo) contra datos de prueba con los tres casos de Decision 3 — único → asignado; ambiguo → archivado (`proyecto_id` NULL, `activo=false`); huérfano → archivado. El test snapshotea y restaura cualquier fila ajena al tenant de prueba con `proyecto_id NULL` (el script opera sobre toda la tabla, igual que en producción) para no afectar otros fixtures de la base local compartida. **Verde**, sin efectos colaterales confirmados (`INS-E2E-001` intacto tras la corrida).

**Cierra 6.3**: los 6 tests de 8.1-8.6 corrieron contra la app real bajo RLS forzada (no bypass), confirmando en la práctica — no solo por lectura de código — que los endpoints de lectura/escritura quedan acotados por `rls_insumos_context` sin necesitar cambios adicionales.

## 9. Verificación

- [x] 9.1 Las 12 suites de `apps/gerencia-tecnica/test/integration/` corridas individualmente contra Postgres real, todas en verde, sin regresiones: `saldo-partida` (11/11), `saldo-partida-evento`, `fichas-upload-multer`, `fichas-tecnicas-residente`, `evento-centro-costos-creado`, `movimientos-partida` (4/4), `partida-comprometida-evento`, `presupuesto-activo-precio-cantidad`, `presupuestos-capitulos`, `presupuestos-catalogo-maestro`, `presupuestos-unicidad-clave`, `transferencia-partida` (5/5), `ventas-a-obra`, además de las 2 nuevas de este change (grupo 8).
- [x] 9.2 `npx tsc --noEmit` en `apps/gerencia-tecnica` y `apps/app-shell` — ambos en verde (corrido varias veces durante la implementación, última vez tras el grupo 8).
- [x] 9.3 Confirmado sin test cruzado adicional: `enviarCorreosSolicitudCotizacion` (`apps/compras/src/main.ts:103-128`) no se tocó (fuera de alcance, ver design.md Non-Goals) y depende solo de `GET GT_URL/insumos` con el JWT de la sesión — exactamente el endpoint ya probado en 8.1 (aísla por proyecto) y 8.4/8.5 (un insumo recién creado queda con `proyecto_id` correcto y es recuperable). Un insumo creado después de este change es no-legacy por definición, así que el `insumoById.get(it.insumo_id)` de esa función lo encuentra igual que antes. El fallback "Insumo no encontrado en catálogo" (`main.ts:141`) solo aplicaría a insumos legacy archivados por el backfill — riesgo ya evaluado como marginal/nulo en la tarea 1.3.

## 10. Deploy y cierre

- [ ] 10.1 PR contra `main` (branch `feat/gt-<numero>-aislamiento-insumos-proyecto` — confirmar número de issue con el usuario).
- [ ] 10.2 Aplicar la migración de schema + `rls-policies.sql` actualizado contra las bases reales, vía el mecanismo ya establecido (`scripts/ci/apply-rls-as-admin.sh` / workflow `deploy-vps-rls-apply.yml`, usados en `aislamiento-proyecto-por-modulo`).
- [ ] 10.3 Correr el script de backfill (grupo 3) contra producción — una sola vez. Documentar el resultado real (tarea 3.5).
- [ ] 10.4 Desplegado vía CI — confirmar workflows de build+deploy backend y frontend en verde.
- [ ] 10.5 Verificado en `iretum.com`: el Gerente Técnico confirma que la pantalla de Insumos ahora muestra solo el catálogo de su proyecto activo. Si algún insumo esperado no aparece (candidato a archivado por ambigüedad/huérfano), reimportarlo vía Explosión/APU en el proyecto correspondiente.
- [ ] 10.6 `openspec archive aislamiento-insumos-por-proyecto-gt` tras verificación en producción.
