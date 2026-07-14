## 1. Reproducir los bugs con tests que fallen

- [x] 1.1 Test de componente nuevo en
      `apps/app-shell/src/components/ComparativaDetail.acceso-admin-evaluacion.test.tsx`:
      un usuario con rol `admin` (sin `residencia` ni `superintendent`) abre un cuadro en
      estado `EN_EVALUACION_TECNICA` — debe ver el botón "Registrar Evaluación Técnica →".
      Reproduce el bug (hoy no lo ve).
- [x] 1.2 Test de componente nuevo en `ComprasView.descripcion-texto-libre.test.tsx`: un
      cuadro con una línea sin `insumo_id` (`detalle_req_id` presente) se normaliza desde
      `GET /comparativas` con la `descripcion_libre` de la requisición correspondiente, no
      `'—'`. Reproduce el bug (hoy siempre cae a `'—'`).
- [x] 1.3 Confirmar que ambos tests fallan contra el código actual antes de implementar.
      Confirmado para ambos.

## 2. Backend

(sin cambios de backend en este change)

## 3. Frontend

- [x] 3.1 `ComparativaDetail.tsx`: agregar `roles.includes('admin')` a `showEvalTecnicaBtn`.
- [x] 3.2 `ComprasView.tsx` (`normalizeComp`): construir `reqItemsMap` desde
      `requisicionesNormalizadas` y usarlo como respaldo de
      `insumo_descripcion`/`insumo_unidad` cuando la línea no tiene `insumo_id`.
- [x] 3.3 Verificar que los tests 1.1, 1.2 pasan. Ambos verdes.

## 4. Verificación

- [x] 4.1 Verificar con `npx tsc -b` en `apps/app-shell` (comando real del build de Docker)
      que no hay errores de tipos. Limpio.
- [x] 4.2 Suite completa de `apps/app-shell` (`vitest run`) en verde: 23/23 archivos, 66/66
      tests, sin regresión (incluye `ComparativaDetail.acceso-residencia.test.tsx` y
      `ComprasView.items-texto-libre.test.tsx`, que tocan el mismo código).
- [x] 4.3 Verificación manual en navegador: abrir con el usuario administrador un cuadro en
      evaluación técnica (catálogo y texto libre) y confirmar que el panel de evaluación
      abre y los botones C/NC/DA/? funcionan; confirmar que la descripción de la línea de
      texto libre se ve correctamente tras recargar.
      Verificado con Playwright real (`admin@alfa.bocam.com`) contra un
      CuadroComparativo real en EN_EVALUACION_TECNICA con una línea de
      texto libre (sin `insumo_id`, `detalle_req_id` → `RequisicionItem`
      con `descripcion_libre` real) sembrado vía script Prisma de un solo
      uso (script y test borrados tras usarlos). Nota: para cuando se hizo
      esta verificación, `evaluacion-tecnica-inline-tabla-comparativa`
      (PR #60) ya había reemplazado el panel modal por una sub-fila
      inline siempre visible — el gate de acceso (`showEvalTecnicaBtn`
      incluye `admin`) es el mismo código que este change agregó, ahora
      aplicado a la sub-fila en vez del modal. Confirmado: admin ve la
      bandeja "Eval. Técnica" (vía rol `superintendent`), la descripción
      de texto libre se muestra correctamente (no "—"), y los botones
      C/NC/DA/? de la sub-fila son operables (clic en "C" revela el
      textarea de comentario).

## 5. Cierre

- [x] 5.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
