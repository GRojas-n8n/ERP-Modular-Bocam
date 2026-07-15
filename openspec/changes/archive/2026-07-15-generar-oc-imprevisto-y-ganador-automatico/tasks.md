## 1. Tests que reproducen el bug (primero, en rojo)

- [x] 1.1 Unit test en `apps/compras/src/requisicion-cobertura.test.ts`: caso con
      `detalle_req_id` directo en `GrupoOcEmitido` (texto libre, sin insumo_id) →
      cobertura debe calcularse correctamente.
- [x] 1.2 Integration test en `apps/compras/test/integration/`: `revisar-gt` sobre un
      cuadro con 1 renglón, primera opción aprobada económicamente → verificar
      `es_ganador = true` se marca automáticamente sin llamar a ningún endpoint de
      selección manual. Casos: primera opción aprobada; primera rechazada + segunda
      aprobada; ninguna de las dos + desempate por menor precio.
- [x] 1.3 Integration/E2E test: `convertir-oc` sobre un cuadro `APROBADO_GT` con un
      renglón de texto libre (`detalle_req_id`, sin `insumo_id`) y `es_ganador = true` →
      debe generar la OC (hoy falla con "No hay renglones... con proveedor ganador
      seleccionado" porque el loop excluye renglones sin insumo_id).

## 2. Migración de esquema

- [x] 2.1 `apps/compras/prisma/schema.prisma`: `OrdenCompraItem.insumo_id` → nullable;
      agregar `detalle_req_id String? @db.Uuid`, `descripcion_libre String? @db.Text`,
      `unidad_libre String? @db.VarChar(20)`.
- [x] 2.2 `npx prisma migrate dev` en `apps/compras` — generar y aplicar la migración
      localmente, verificar contra Postgres local.
      → `migrate dev` falló por un error de shadow DB (P3006, ajeno a este change) y
      `migrate deploy` falló por una migración histórica ya marcada failed en el tracking
      local (P3009, también ajena). Se escribió `migration.sql` a mano (mismo patrón que
      otras migraciones aditivas del repo) y se aplicó directo vía psql en el Postgres
      local para desbloquear desarrollo; `prisma generate` corrido después para
      regenerar el client. Pendiente verificar el estado de `_prisma_migrations` en el
      VPS antes del deploy real (tarea 6.2) — si el VPS tiene el mismo historial roto,
      aplicar igual por SQL directo ahí en vez de `migrate deploy`.

## 3. Backend — auto-selección de ganador

- [x] 3.1 `apps/compras/src/main.ts`, endpoint `revisar-gt`: cuando `estadoFinal ===
      'APROBADO_GT'`, agrupar `cuadro.detalles` por (`insumo_id ?? detalle_req_id`) y
      marcar `es_ganador = true` en el proveedor correcto por renglón (regla: primera
      opción aprobada → segunda opción aprobada → menor precio entre aprobados),
      `es_ganador = false` en el resto.

## 4. Backend — soporte de texto libre en convertir-oc

- [x] 4.1 `apps/compras/src/requisicion-cobertura.ts`: `GrupoOcEmitido.detalles` lleva
      `detalle_req_id` directo (no derivado de insumo_id); actualizar
      `requisicionQuedoCubiertaPorLote` para usarlo cuando `insumo_id` es null.
- [x] 4.2 `apps/compras/src/main.ts`, `convertir-oc`: quitar el `continue` que excluye
      renglones sin `insumo_id`; incluir `detalle_req_id`/`descripcion_libre`/`unidad_libre`
      (desde `reqItems` ya cargados) en la creación de `OrdenCompraItem`; ajustar
      `gruposEmitidos` y el payload del evento `compras.oc_creada` para no depender de
      `insumo_id` como única clave.
- [x] 4.3 `apps/compras/src/orden-compra-pdf-payload.ts`: `buildOcPdfPayload` usa
      `descripcion_libre`/`unidad_libre` del item cuando `insumo_id` es nulo.

## 5. Verificación

- [x] 5.1 Tests de la sección 1 en verde (sin modificarlos).
- [x] 5.2 `tsc --noEmit` en `apps/compras` limpio.
- [x] 5.3 Suite completa de integración de `compras` en verde (no solo los tests nuevos).
      → 26/27 en verde (2026-07-14). El único fallo (`especificacion-ofrecida-proveedor`)
      fue un crash de libuv al cerrar handles al correr toda la suite en un mismo loop de
      shell (flake de infraestructura, no de lógica) — verificado en aislado: pasa limpio.
      Ninguna regresión real.

## 6. Cierre y corrección puntual

- [x] 6.1 PR contra main, CI verde, merge.
      → PR #69 mergeado (squash `72eb681`).
- [x] 6.2 Redeploy VPS de `compras`: `prisma migrate deploy` + build + `up -d`, smoke 200.
      → Hecho 2026-07-14: migración aplicada limpiamente (`_prisma_migrations` del VPS
      estaba sano, sin el issue de shadow DB del entorno local); contenedor recreado
      20:02 UTC, healthy.
- [x] 6.3 Script de un solo uso: corregir el cuadro real bloqueado (`CC-1784053191713`,
      `c93661e9-4b18-4309-8962-01b2885e4cbe`) fijando `es_ganador` en el proveedor
      correcto, y verificar que `convertir-oc` genera la OC correctamente para ese caso
      real ya con el fix desplegado.
      → Verificado 2026-07-15 directamente contra la BD de prod (solo lectura): no hizo
      falta script — el caso ya se resolvió por el flujo normal de la app tras el deploy
      de las 20:02 UTC del 2026-07-14. `es_ganador = true` está en el proveedor correcto
      (`40f2979f...`, coincide con `primera_opcion_proveedor_id`, `aprobacion_gt = 'C'`)
      y la OC `OC-AUTO-1784063462446-1` existe, `EMITIDA`, emitida 21:11 UTC ese mismo
      día, con `descripcion_libre` correcta ("Suministro e instalación de 5 equipos de
      aire acondicionado..."). Cuadro en estado `CERRADO`.
