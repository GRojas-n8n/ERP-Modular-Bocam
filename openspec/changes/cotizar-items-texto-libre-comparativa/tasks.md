## 1. Schema (apps/compras)

- [x] 1.1 `ComparativaLinea.insumo_id`: `String @db.Uuid` → `String? @db.Uuid`.
- [x] 1.2 `ComparativaDetalle.insumo_id`: `String @db.Uuid` → `String? @db.Uuid`; agregar
      columna nueva `detalle_req_id String? @db.Uuid`.
- [x] 1.3 Agregar `@@unique([cuadro_id, detalle_req_id])` a `ComparativaLinea` (coexiste con
      `@@unique([cuadro_id, insumo_id])` — Postgres permite múltiples `NULL`).
- [x] 1.4 Generar y aplicar la migración de Prisma (aditiva: relajar NOT NULL + columna
      nueva + índice nuevo, sin backfill). Migración escrita a mano
      (`20260713150000_items_texto_libre_comparativa`) por drift preexistente de la shadow
      DB local; aplicada a dev vía `prisma db push`, se aplicará a producción vía
      `prisma migrate deploy` (DB de prod limpia, sin el drift local).
- [x] 1.5 Regenerar el cliente de Prisma (`npx prisma generate`) para `apps/compras`.

## 2. Reproducir el bug con un test que falle

- [x] 2.1 Test de integración nuevo en
      `apps/compras/test/integration/cotizar-items-texto-libre-comparativa.integration.test.ts`
      (mismo patrón que los tests de integración existentes de comparativas): crear una
      requisición con un ítem sin `insumo_id` (`especificacion_marca_modelo`/
      `descripcion_libre` capturados), `POST /comparativas`, y verificar que existe una
      `ComparativaLinea` para ese ítem (identificada por `detalle_req_id`) — reproduce el
      bug (hoy no se crea ninguna línea).
- [x] 2.2 Confirmar que el test 2.1 falla contra el código actual antes de implementar (con
      el schema ya migrado pero sin tocar los endpoints todavía). Confirmado:
      `AssertionError: Debe existir una línea para el ítem sin insumo_id`.

## 3. Backend — POST /comparativas (creación)

- [x] 3.1 Quitar el `if (!item.insumo_id) continue;` del bloque de auto-populate
      (`apps/compras/src/main.ts`).
- [x] 3.2 El `upsert` de `ComparativaLinea` usa `where: { cuadro_id_insumo_id: ... }` cuando
      `item.insumo_id` existe, o `where: { cuadro_id_detalle_req_id: { cuadro_id, detalle_req_id: item.id_item } }`
      cuando no — `create`/`update` con `insumo_id: item.insumo_id ?? null` y
      `detalle_req_id: item.id_item` siempre poblado.
- [x] 3.3 Test: crear el cuadro de una requisición con un ítem sin `insumo_id` Y uno con
      `insumo_id` — el cuadro se crea con ambas líneas, sin que una afecte a la otra.
- [x] 3.4 Verificar que los tests 2.1, 3.3 pasan.

## 4. Backend — PUT /comparativas/:id/cotizaciones (guardar precios)

- [x] 4.1 Ampliar el tipo del body: `precios: Array<{ insumo_id?: string; detalle_req_id?: string; precio: number; fecha_entrega_estimada?: string }>`.
- [x] 4.2 Cambiar el filtro `if (!p.insumo_id || p.precio === undefined) continue;` por
      `if ((!p.insumo_id && !p.detalle_req_id) || p.precio === undefined) continue;` y crear
      `ComparativaDetalle` con `insumo_id: p.insumo_id ?? null, detalle_req_id: p.detalle_req_id ?? null`.
- [x] 4.3 Test: guardar cotizaciones con un renglón identificado solo por `detalle_req_id`
      (sin `insumo_id`) persiste correctamente el precio.
- [x] 4.4 Test: guardar cotizaciones con una mezcla de renglones (unos por `insumo_id`, otro
      por `detalle_req_id`) persiste todos correctamente, sin regresión en los que sí tienen
      `insumo_id`.
- [x] 4.5 Verificar que los tests 4.3, 4.4 pasan.

## 5. Backend — PUT /comparativas/:id/lineas/:insumoId (marca/especificaciones)

- [x] 5.1 El parámetro de ruta `:insumoId` intenta primero `upsert` por
      `(cuadro_id, insumo_id)`; si la línea no existe con ese `insumo_id` en este cuadro,
      reintentar por `(cuadro_id, detalle_req_id)` usando el mismo valor del parámetro.
      Implementado buscando la línea existente primero (`findFirst` con `OR`) para decidir
      cuál llave usar.
- [x] 5.2 Test: editar marca/especificaciones de una línea identificada solo por
      `detalle_req_id` (pasando ese id como `:insumoId` en la URL) persiste correctamente.
- [x] 5.3 Verificar que el test 5.2 pasa, sin regresión en el caso con `insumo_id` real.

## 5b. Correcciones de tipos por el cambio de nullability (no eran el foco del change, pero rompían la compilación)

- [x] 5b.1 `convertir-oc`: excluir `ComparativaDetalle` sin `insumo_id` al agrupar
      ganadores por proveedor (documentado como Non-Goal — conversión a OC para líneas de
      texto libre queda para un change de seguimiento).
- [x] 5b.2 Evaluación técnica (`evaluar-veredicto`): guardar el veredicto (`evaluacion_tecnica`,
      `comentario_tecnico`) sigue funcionando igual para líneas sin `insumo_id` (está keyed
      por `id_detalle`, no por `insumo_id`); se omite solo la creación/resolución de
      `AclaracionComparativa` (pregunta "?") para esas líneas — Non-Goal documentado.

## 6. Backend — GET /comparativas y GET /comparativas/:id

- [x] 6.1 Confirmado por lectura de código: `GET /comparativas/:id` ya es agnóstico a
      `insumo_id` nulo (usa `l.detalle_req_id` como llave de los joins con specs/reqItems) —
      sin cambios necesarios, `tsc --noEmit` confirma que el nullable no rompe nada ahí.
- [x] 6.2 Cubierto indirectamente por los tests 3.3/4.4 (leen `ComparativaLinea`/`ComparativaDetalle`
      con `detalle_req_id` poblado directo de Prisma) — no se agregó un test HTTP dedicado
      al listado por no haber lógica adicional que probar más allá de lo que Prisma ya
      serializa automáticamente.

## 7. Frontend (apps/app-shell)

- [x] 7.1 `normalizeComp` (`ComprasView.tsx`): agrupar `detalles` por
      `d.insumo_id ?? d.detalle_req_id` en vez de solo `d.insumo_id`, para no colapsar
      varias líneas sin catálogo del mismo cuadro en un solo grupo.
- [x] 7.2 `buildLineasFromReq` (`ComprasView.tsx`): incluir `detalle_req_id: item.id` en la
      línea local construida (ya existe `insumo_id: item.insumo_id ?? ''` — cambiar a
      `item.insumo_id ?? null` para reflejar el nullable real).
- [x] 7.3 Payload de `handleEnviarEvaluacion` (`ComparativaDetail.tsx`): enviar
      `detalle_req_id` junto a (o en vez de) `insumo_id` cuando la línea no tenga
      `insumo_id`. También se corrigieron 6 puntos más en `ComparativaDetail.tsx` que usaban
      `linea.insumo_id`/`ld.insumo_id` como llave de `detallesTecnicos`/`especsMap` (panel de
      Detalles técnicos y matriz de especificaciones) — con `insumo_id` nulo colapsaban en la
      llave `"null"`. Se agregó el helper `lineaDetalleKey()`.
- [x] 7.4 Test: componente `ComprasView` — un cuadro con una línea sin `insumo_id` y otra con
      `insumo_id` se normalizan como dos líneas distintas (no colapsan). Confirmado que
      falla sin el fix (`git stash` del cambio) antes de implementar.
- [x] 7.5 Verificar con `tsc --noEmit` en `apps/app-shell` y `apps/compras` que no hay
      errores de tipos. Ambos limpios.

## 8. Verificación de integración y manual

- [ ] 8.1 Verificación manual en navegador contra un caso real: la requisición de la prueba
      de producción (`a9b073fc-a74b-4fc4-9b74-7d6a4e6fc09a`, ítem "Mini Split..." sin
      `insumo_id`) — crear el cuadro, subir un PDF o capturar precio manual, confirmar que
      persiste y se ve al recargar.
- [x] 8.2 Suite completa de `apps/compras` (tests de integración relevantes) y
      `apps/app-shell` (`vitest run`) en verde antes de abrir el PR. app-shell: 18/18
      archivos, 55/55 tests. compras: 8 suites de integración relevantes (incluyendo
      `cuadro-comparativo-dos-etapas` y `convertir-oc`, que toca directamente el código
      modificado) todas en verde, sin regresión.

## 9. Cierre

- [ ] 9.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
