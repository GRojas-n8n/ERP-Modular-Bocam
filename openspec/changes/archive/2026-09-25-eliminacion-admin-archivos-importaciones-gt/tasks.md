## 1. Modelo de datos (Prisma)

- [x] 1.1 Agregar modelo `LoteImportacion` (`id`, `tenant_id`, `importado_por`,
      `cantidad_registros`, `estado`, `created_at`) en
      `apps/gerencia-tecnica/prisma/schema.prisma` (solo para Explosión de Insumos —
      Composición APU no lo necesita, ver design.md Decision 1)
- [x] 1.2 Agregar columna nullable `lote_importacion_id` (FK a `LoteImportacion`) en `Insumo`
- [x] 1.3 Generar y correr la migración Prisma en entorno local/dev (migración
      `20260828151711_add_lote_importacion_insumos`, aplicada vía `prisma migrate diff` +
      `db execute` + `migrate resolve --applied` por deriva preexistente en el historial de
      migraciones de este servicio — no relacionada con este change)
- [x] 1.4 Verificar que la migración no falla contra una copia de los datos actuales (columnas
      nullable, sin backfill requerido) — confirmado: `prisma migrate diff` post-aplicación
      devuelve "empty migration"

## 2. Restringir DELETE de fichas técnicas a admin

- [x] 2.1 Cambiar `requireRoles(...ROLES_FICHAS_UPLOAD)` por `requireRoles('admin')` en
      `DELETE /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid` (main.ts:1185)
- [x] 2.2 Test: usuario `admin` puede eliminar una ficha técnica (200/204)
- [x] 2.3 Test: usuario `residencia`/`resident` recibe 403 al intentar eliminarla
- [x] 2.4 Test: usuario `procurement`/`gerencia_tecnica` recibe 403 al intentar eliminarla
- [x] 2.5 Actualizar el frontend de gerencia-tecnica para ocultar el botón de eliminar ficha
      técnica a roles distintos de `admin` (`InsumosView.tsx`, panel de fichas técnicas)

## 3. Revertir Catálogo de Conceptos (PresupuestoBase)

- [x] 3.1 Implementar `DELETE /api/v1/gerencia-tecnica/presupuestos/:id` con
      `requireRoles('admin', 'gerencia_tecnica', 'control_proyectos')`
- [x] 3.2 Validar que ningún `Concepto` del presupuesto tenga `SaldoPartida` con
      `monto_comprometido > 0` / `monto_ejercido > 0`, ni `CompraProyectada` asociada;
      responder `409` si las hay (avances/bitácoras de control-proyectos quedan fuera,
      ver design.md)
- [x] 3.3 Borrar en cascada `Capitulo`, `Concepto` y `ConceptoInsumo` del presupuesto — un solo
      `db.presupuestoBase.delete()` basta gracias al `onDelete: Cascade` ya declarado en el
      schema (transitivo a nivel Postgres), sin necesidad de transacción manual
- [x] 3.4 Test: admin, gerencia_tecnica y control_proyectos eliminan un presupuesto sin uso →
      200 y cascada completa
- [x] 3.5 Test: se intenta eliminar un presupuesto con avances registrados → 409
- [x] 3.6 Test: rol no habilitado (ej. superintendent, procurement, control_obra) recibe 403

## 4. Revertir lote de Explosión de Insumos

- [x] 4.1 En `POST /insumos/importar-lote` (main.ts:319), crear un `LoteImportacion` y
      estampar `lote_importacion_id` en cada `Insumo` creado/actualizado por esa llamada;
      incluir `lote_importacion_id` en la respuesta
- [x] 4.2 Implementar `DELETE /api/v1/gerencia-tecnica/insumos/importar-lote/:loteId` con
      `requireRoles('admin', 'gerencia_tecnica', 'control_proyectos')`
- [x] 4.3 Validar que ningún `Insumo` del lote esté referenciado por `ConceptoInsumo`, ni por
      `CompraProyectada`; responder `409` si lo está
- [x] 4.4 Desactivar (`activo: false`) los `Insumo` del lote y marcar el `LoteImportacion`
      como `revertido` (soft-delete, mismo patrón que `DELETE /insumos/:id`)
- [x] 4.5 Test: admin, gerencia_tecnica y control_proyectos revierten un lote sin uso → 200
- [x] 4.6 Test: se intenta revertir un lote con insumos ya usados → 409
- [x] 4.7 Test: rol no habilitado recibe 403

## 5. Revertir Composición APU de un concepto

- [x] 5.1 En `POST /composicion-apu` (main.ts:711) y su variante deprecated (main.ts:825),
      acumular los `concepto_id` tocados (creados o actualizados) e incluirlos como
      `conceptos_afectados` en la respuesta
- [x] 5.2 Implementar `DELETE /api/v1/gerencia-tecnica/composicion-apu/:conceptoId` con
      `requireRoles('admin', 'gerencia_tecnica', 'control_proyectos')`
- [x] 5.3 Responder `404` si el concepto no tiene `ConceptoInsumo` asociados
- [x] 5.4 Test: admin, gerencia_tecnica y control_proyectos eliminan la composición APU de un
      concepto → 200
- [x] 5.5 Test: concepto sin composición → 404
- [x] 5.6 Test: rol no habilitado recibe 403

## 6. Frontend

- [x] 6.1 Agregar botón "Deshacer importación" (visible para `admin`, `gerencia_tecnica` y
      `control_proyectos`) en `InsumosView.tsx` tras importar Catálogo de Conceptos
      (`presupuesto_id`) o Explosión de Insumos/APU (`lote_importacion_id`) — ambos flujos
      del tab Insumos importan insumos+APU en una sola acción, así que comparten un mismo
      botón. **Pendiente**: no se agregó UI para deshacer la Composición APU
      por concepto individual (`conceptos_afectados`) — el endpoint y el dato ya existen
      (tarea 5), pero requeriría una lista de conceptos afectados con acción por fila; se
      deja fuera de esta pasada por alcance/tiempo.
- [x] 6.2 Manejar el `409` de cada endpoint DELETE mostrando el motivo de bloqueo al
      usuario — reutiliza el patrón ya existente en el archivo
      (`err.response?.data?.error?.message`), que ya muestra el mensaje de `createApiError`
      tal cual (incluye los 409 de "en uso")

## 7. Verificación final

- [x] 7.1 Corridos todos los `test:integration:*` de `apps/gerencia-tecnica` con Postgres
      real (Docker local) — 12/12 scripts en verde, incluyendo los 4 nuevos y los 2 que
      esta feature tocaba indirectamente (`aislamiento-insumos-por-proyecto`,
      `importar-lote-insumos-longitud-invalida`, que requirieron agregar RLS + grants para
      la nueva tabla `lotes_importacion`, ver design.md/nota abajo). `tsc --noEmit` limpio
      en `apps/gerencia-tecnica` y en `apps/app-shell`. No se corrieron los tests de eventos
      RabbitMQ (`saldo-partida-evento`, etc. — no están wireados como script npm y no son
      código tocado por este change).
- [x] 7.2 Verificado con los tests de integración reales (no clic manual en navegador):
      `gerencia_tecnica` y `control_proyectos` importan y deshacen Catálogo de Conceptos y
      lote de Explosión de Insumos contra Postgres real — mismo mecanismo de verificación
      usado en otros changes de este repo (ver fix-rls-gerencia-tecnica-tablas-sin-cobertura)
- [x] 7.3 Confirmado por integration test: `residencia`, `resident`, `procurement` y
      `gerencia_tecnica` reciben 403 al intentar `DELETE` de una ficha técnica; solo `admin`
      puede. Frontend: botón oculto a roles distintos de `admin` (`InsumosView.tsx`)
