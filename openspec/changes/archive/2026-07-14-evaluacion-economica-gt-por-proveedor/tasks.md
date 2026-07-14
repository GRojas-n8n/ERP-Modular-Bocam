## 1. Backend — schema

- [x] 1.1 Agregado `pregunta_gt` y `respuesta_gt` (`String?`, `@db.Text`) a
      `ComparativaDetalle`.
- [x] 1.2 Migración hand-written (`20260713190000_credito_proveedor_y_pregunta_gt`),
      aplicada con `prisma db push --accept-data-loss` en local.
- [x] 1.3 Comentario de `aprobacion_gt` actualizado documentando el nuevo vocabulario.
- [x] 1.4 Agregado `ofrece_credito`/`dias_credito` al modelo `Proveedor`.

## 2. Backend — reproducir el comportamiento actual con un test que falle

- [x] 2.1-2.5 Cubiertos por `evaluacion-economica-gt-por-proveedor.integration.test.ts`
      (4 casos nuevos) y por la actualización de
      `cuadro-comparativo-dos-etapas.integration.test.ts` al nuevo contrato de
      `evaluar-gt`/`revisar-gt`.
- [x] 2.6 Confirmado: `cuadro-comparativo-dos-etapas.integration.test.ts` falló contra el
      contrato viejo (`revisar-gt debe retornar 200` → recibió 400) antes de actualizar el
      test y de implementar `evaluar-gt`.

## 3. Backend — endpoints

- [x] 3.1 `PATCH /comparativas/:id/evaluar-gt` implementado.
- [x] 3.2 `PATCH .../revisar-gt` modificado: sin `aprobaciones[]`, con gate de
      "todos los proveedores evaluables evaluados" (excluye los rechazados técnicamente,
      fuera del alcance de GT).
- [x] 3.3 `POST /comparativas/:id/revision-con-preguntas-gt` implementado — hereda
      evaluación técnica, nace en `EN_APROBACION_GT`.
- [x] 3.4 `PUT /comparativas/:id/responder-preguntas-gt` implementado.
- [x] 3.5 Endpoints de creación/edición de `Proveedor` extendidos con
      `ofrece_credito`/`dias_credito`.
- [x] 3.6 Verificado: todos los tests de integración pasan (9 casos entre los dos
      archivos, más 60 tests de integración existentes de `apps/compras` sin regresión).

## 4. Frontend — modelo de datos

- [x] 4.1 `CotizacionLinea.aprobacionesGtPorProveedor` agregado.
- [x] 4.2 `normalizeComp` puebla `aprobacionesGtPorProveedor` por proveedor.
- [x] 4.3 `diasSuministro` calculado inline en la sub-fila desde `fecha_entrega_estimada` −
      `comp.fecha_firma`.
- [x] 4.4 `ProveedorComp.ofrece_credito`/`dias_credito` agregado y poblado en
      `normalizeComp`.
- [x] 4.5 Campos `ofrece_credito`/`dias_credito` agregados al formulario de Proveedores en
      `ComprasView.tsx`.

## 5. Frontend — sub-fila de evaluación económica GT (reemplaza showGTPanel)

- [x] 5.1-5.4 Tests creados en `ComparativaDetail.evaluacion-economica-gt.test.tsx`
      (5 casos: render sin modal con costo/días/crédito/controles, guardado por línea
      solo con proveedores evaluables, ocultar guardado individual con "?", guardado
      agregado con revision-con-preguntas-gt, gate del botón de finalizar).
- [x] 5.5 Confirmado que los tests fallaban contra el código con `showGTPanel` antes de
      implementar (mismo patrón TDD que la evaluación técnica inline).
- [x] 5.6 Sub-fila renderizada reutilizando el patrón de
      `evaluacion-tecnica-inline-tabla-comparativa`, con celdas de costo, días de
      suministro y condición de crédito.
- [x] 5.7 Guardado mixto implementado: `handleGuardarLineaGT` (por línea, sin "?") →
      `evaluar-gt`; `handleGuardarEvaluacionGT` (agregado, con "?") →
      `revision-con-preguntas-gt`.
- [x] 5.8 `showGTPanel` y su modal eliminados por completo.
- [x] 5.9 `handleFinalizarGT` (botón "Finalizar Aprobación GT →") deshabilitado mientras
      `todasEvaluadasGT` sea falso.
- [x] 5.10 Verificado: los 5 tests pasan.

## 6. Verificación

- [x] 6.1 `npx tsc -b` en `apps/app-shell` sin errores.
- [x] 6.2 Suite completa `apps/app-shell` (`vitest run`): 26 archivos / 76 tests en verde,
      sin regresión.
- [x] 6.3 Suite de integración de `apps/compras`: todos los archivos en verde (incluye los
      2 relacionados a GT + 60 tests preexistentes sin regresión), `tsc --noEmit` limpio.
- [x] 6.4 Verificación manual en navegador: **pendiente tras el despliegue** — requiere
      sesión real de Gerencia Técnica en producción.
      Verificado localmente con Playwright real usando `admin@alfa.bocam.com`
      (calificaría como GT: `isGT` en `ComparativaDetail.tsx` incluye
      `admin`; no hay usuario seed `gerencia_tecnica` puro para Alfa) contra
      un CuadroComparativo real en EN_APROBACION_GT sembrado vía script
      Prisma de un solo uso (2 renglones: 3 y 2 proveedores, uno de ellos
      con `ofrece_credito=true, dias_credito=30` — script borrado tras
      usarlo). Confirmado: "Crédito 30 días" / "Sin crédito" se muestran
      por proveedor en la sub-fila; guardado individual de línea 1
      (`gt-guardar-linea` → `PATCH .../evaluar-gt`) sin crear revisión;
      guardado de línea 2 y "Finalizar Aprobación GT →" (`gt-finalizar`,
      solo habilitado con `todasEvaluadasGT`) avanzan el cuadro fuera de
      `EN_APROBACION_GT` (confirmado contra `GET /comparativas`).

## 7. Cierre

- [x] 7.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
