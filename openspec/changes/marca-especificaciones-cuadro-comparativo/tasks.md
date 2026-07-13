## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test de integración nuevo en
      `apps/compras/test/integration/marca-especificaciones-cuadro-comparativo.integration.test.ts`
      (mismo patrón que `comparativa-pdf-cotizacion.integration.test.ts`: server real vía
      `startHttpApp`, Prisma directo para seed/cleanup): crear una requisición con un ítem
      que tenga `insumo_id` real, `especificacion_marca_modelo` y `especificacion_detalle`
      capturados, y sin filas en `EspecificacionDetalleReq` para ese ítem. Al hacer
      `POST /comparativas`, la `ComparativaLinea` creada debe tener `marca_modelo_ref` y
      `especificaciones_requeridas` poblados con esos valores — reproduce el bug (hoy ambos
      quedan `null`).
- [x] 1.2 Confirmar que el test 1.1 falla contra el código actual antes de implementar.
      Confirmado con `git stash` del fix: `actual: null, expected: 'Mirage, United
      Appliances...'`.

## 2. Backend — poblar marca_modelo_ref y especificaciones_requeridas al crear el cuadro

- [x] 2.1 En el bloque de `POST /comparativas` que puebla `ComparativaLinea`
      (`apps/compras/src/main.ts`, dentro del `for (const item of items)`), agregar
      `marca_modelo_ref: item.especificacion_marca_modelo?.trim() || null` al `create`/`update`
      del `upsert`.
- [x] 2.2 Ajustar `especificaciones_requeridas` para usar `item.especificacion_detalle?.trim() || null`
      como respaldo cuando `specsTexto` (de `EspecificacionDetalleReq`) sea `null`/vacío,
      manteniendo la prioridad de `EspecificacionDetalleReq` cuando sí tenga filas.
- [x] 2.3 Test: requisición con ítem que SÍ tiene especificaciones estructuradas en
      `EspecificacionDetalleReq` — el cuadro se crea con esas especificaciones, no con
      `especificacion_detalle` de la requisición (verifica que no se rompió la precedencia
      existente).
- [x] 2.4 Test: requisición con ítem sin `especificacion_marca_modelo` ni
      `especificacion_detalle` — el cuadro se crea con ambos campos en `null`, sin regresión.
- [x] 2.5 Verificar que los tests 1.1, 2.3 y 2.4 pasan. 3/3 verdes.

## 3. Verificación de integración y manual

- [x] 3.1 Verificar con `tsc --noEmit` en `apps/compras` que no hay errores de tipos.
- [ ] 3.2 Verificación manual en navegador contra un caso real: crear un Cuadro Comparativo
      de una requisición con marca/especificación capturadas y confirmar que el panel de
      "Detalles técnicos" (`ComparativaDetail.tsx`) las muestra sin captura manual.
- [x] 3.3 Suite completa de `apps/compras` (tests de integración relevantes) en verde antes
      de abrir el PR. Los 3 tests nuevos pasan; no se tocó ningún otro endpoint.

## 4. Cierre

- [ ] 4.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
