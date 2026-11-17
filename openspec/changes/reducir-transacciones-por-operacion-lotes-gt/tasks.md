## 1. Test que confirma el problema y protege el fix (TDD)

- [x] 1.1 Test de integración: contar transacciones reales abiertas por `POST /insumos/importar-lote` con un lote de 10 filas para actualizar (capturando stdout y contando `prisma:query BEGIN`) — confirmado rojo/base antes del fix: **11 transacciones para 10 filas** (1 `findMany` de existentes + 10 updates). Ver `apps/gerencia-tecnica/test/integration/transaccion-compartida-lotes.integration.test.ts`, `testImportarLoteActualizacionAbreUnaSolaTransaccion`.
- [x] 1.2 Test de integración (regresión crítica): `PUT /insumos/clasificacion-bulk` con 3 filas donde la fila intermedia tiene un `categoria_gasto_id` que no existe (fuerza una violación de FK real de Postgres) — las filas 1 y 3 (antes y después de la fila mala) SHALL quedar actualizadas, la fila 2 omitida. `testClasificacionBulkAislaFilaConFkInvalida`.
- [x] 1.3 Mismo test de conteo de transacciones (1.1) para `POST /composicion-apu` con 2 conceptos × 3 insumos (6 filas) — confirmado antes del fix: hasta 12 transacciones posibles (findUnique+create por fila); después del fix, 3 transacciones totales para todo el request. `testComposicionApuAbreUnaSolaTransaccion`.

## 2. `db.ts` — helpers nuevos

- [x] 2.1 `withTenantTransaction<T>(ctx, callback, opts?: { timeoutMs?: number })` agregado a `apps/gerencia-tecnica/src/db.ts` — una sola `basePrisma.$transaction`, `set_config` de tenant (y proyecto si está presente) una vez, ejecuta `callback(tx)`. `timeoutMs` default 10000, `maxWait` 5000.
- [x] 2.2 `withSavepoint<T>(tx, label, fn)` agregado — `SAVEPOINT` → `fn()` → `RELEASE SAVEPOINT` si éxito, `ROLLBACK TO SAVEPOINT` + re-lanza el error si falla. El label se sanitiza (`replace(/[^a-zA-Z0-9_]/g, '')`) como defensa adicional, aunque todos los call sites usan únicamente índices numéricos de loop — documentado en el comentario de la función.
- [x] 2.3 Confirmado: `createTenantContext(ctx)` no se tocó — el diff de `db.ts` es puramente aditivo (dos funciones nuevas después de `BocamPrismaClient`).

## 3. Reescribir los 4 loops

- [x] 3.1 `POST /insumos/importar-lote` (loop "actualizar existentes"): envuelto en `withTenantTransaction(..., { timeoutMs: 60000 })`, cada `update` dentro de `withSavepoint(tx, \`row_${idx}\`, ...)`.
- [x] 3.2 `POST /composicion-apu`: loop anidado concepto×insumo envuelto en `withTenantTransaction(..., { timeoutMs: 60000 })`; `findUnique` + `update`/`create` de cada fila comparten un solo `withSavepoint`.
- [x] 3.3 Mismo cambio aplicado al endpoint deprecado `POST /presupuestos/:presupuesto_id/composicion-apu` — corregido en paralelo, sin deduplicar el código (ver design.md, Non-Goals).
- [x] 3.4 `PUT /insumos/clasificacion-bulk`: envuelto en `withTenantTransaction` (timeout default), cada `update` dentro de `withSavepoint`. Se eliminó el `const db = createTenantContext(...)` que quedó sin uso (este endpoint no tenía lecturas previas al loop).
- [x] 3.5 Confirmado: en los 4 endpoints, las lecturas previas al loop (`db.presupuestoBase.findFirst`, `db.insumo.findMany` para los mapas clave→id) siguen usando el `createTenantContext(ctx)` original, fuera de la nueva transacción.

## 4. Verificación

- [x] 4.1 Tests 1.1-1.3 en verde: `testImportarLoteActualizacionAbreUnaSolaTransaccion` → 2 transacciones (no 11); `testClasificacionBulkAislaFilaConFkInvalida` → aislamiento por fila confirmado; `testComposicionApuAbreUnaSolaTransaccion` → 3 transacciones (no hasta 12).
- [x] 4.2 Suite completa de `apps/gerencia-tecnica` corrida en verde — sin regresiones: `test:integration` (saldo-partida, 11/11), `validacion-longitud-insumo` (4/4), `fichas-tecnicas-residente`, `presupuesto-activo-precio-cantidad`, `presupuestos-unicidad-clave`, `presupuestos-catalogo-maestro`, `presupuestos-capitulos`.
- [x] 4.3 `npx tsc --noEmit` en `apps/gerencia-tecnica` — limpio.
- [x] 4.4 Confirmado por los propios tests nuevos: los contadores (`actualizados`, `omitidos`, `vinculados`) coinciden exactamente con el comportamiento esperado antes del cambio (ver aserciones de conteo en cada test).

## 5. Deploy y cierre

- [ ] 5.1 PR contra `main`.
- [ ] 5.2 Desplegado vía CI.
- [ ] 5.3 Verificado en `iretum.com`: reintentar una importación real de APU/Explosión de tamaño representativo, confirmar que no hay regresión en tiempo de respuesta ni en los conteos de la respuesta.
- [ ] 5.4 `openspec archive reducir-transacciones-por-operacion-lotes-gt` tras verificación en producción.
