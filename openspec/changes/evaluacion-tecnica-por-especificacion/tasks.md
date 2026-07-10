## 1. Schema

- [x] 1.1 Migración Prisma: nuevo modelo `EvaluacionEspecificacion`
      (`cuadro_id`, `especificacion_id` con `@relation` real hacia
      `EspecificacionDetalleReq`, `proveedor_id`, `evaluacion_tecnica`,
      `comentario_tecnico`, `pregunta_residente`, `respuesta_compras`,
      `creado_por`, `updated_at`), `@@unique([cuadro_id, especificacion_id,
      proveedor_id])`.
- [x] 1.2 Migración Prisma: agregar `cuadro_comparativo_cierre_id String?` y
      `revision_cierre String? @db.VarChar(5)` a `Requisicion`.
- [x] 1.3 Agregar la relación inversa `evaluaciones
      EvaluacionEspecificacion[]` en `EspecificacionDetalleReq`,
      `CuadroComparativo` y `Proveedor` donde corresponda para que Prisma
      genere el client correctamente.

## 2. Backend — rollup de veredicto de renglón

- [x] 2.1 Test unitario: `calcularVeredictoRenglon` — todas `C` → `C`;
      alguna `NC` (sin importar el resto) → `NC`; sin `NC`, alguna `?` →
      `?`; sin `NC`/`?`, alguna `DA` → `DA`; alguna `PENDIENTE` → `PENDIENTE`
      sin importar el resto.
- [x] 2.2 Implementar `calcularVeredictoRenglon(evaluaciones: string[]):
      string` como función pura en `apps/compras/src/`.

## 3. Backend — endpoint de evaluación por característica

- [x] 3.1 Test de integración: `PATCH .../evaluar-especificaciones` guarda
      veredictos por característica×proveedor y recalcula
      `ComparativaDetalle.evaluacion_tecnica` del renglón correspondiente
      dentro de la misma transacción.
- [x] 3.2 Test: marcar `?` sin `pregunta_residente` → 400, no persiste.
- [x] 3.3 Test: dos características del mismo renglón evaluadas distinto
      (una `?` con pregunta, otra `C` sin pregunta) — ambas se guardan
      independientes, sin que una interfiera con la otra.
- [x] 3.4 Implementar `PATCH /api/v1/compras/comparativas/:id/evaluar-especificaciones`
      (mismos roles que el endpoint legacy `evaluar`).

## 4. Backend — restricción del endpoint legacy

- [x] 4.1 Test: `PATCH .../evaluar` sobre un `detalle_id` cuyo insumo SÍ
      tiene especificaciones capturadas → 400
      `EVALUACION_POR_ESPECIFICACION_REQUERIDA`, no modifica el renglón.
- [x] 4.2 Test: `PATCH .../evaluar` sobre un renglón SIN especificaciones →
      sigue funcionando igual que hoy (fallback legacy, sin regresión).
- [x] 4.3 Implementar la validación en `PATCH .../evaluar`
      (`apps/compras/src/main.ts:3019+`).

## 5. Backend — ciclo de revisión a nivel característica

- [x] 5.1 Test: `revision-con-preguntas` con al menos una
      `EvaluacionEspecificacion` en `?` con pregunta → crea revisión
      siguiente, cuadro original a `REVISION_SOLICITADA`.
- [x] 5.2 Test: sin ninguna característica en `?` → 400, no crea revisión.
- [x] 5.3 Test: las `EvaluacionEspecificacion` del cuadro original se clonan
      al cuadro de la revisión nueva — reset a `PENDIENTE`, salvo las `?`
      que heredan `pregunta_residente` (no quedan huérfanas en el
      `SUPERSEDIDO`/`REVISION_SOLICITADA`).
- [x] 5.4 Actualizar `revision-con-preguntas` (`main.ts:5083-5218`) para leer
      la condición de "hay preguntas" desde `EvaluacionEspecificacion` en vez
      de (o además de) `ComparativaDetalle`, y clonar esas filas al crear la
      revisión nueva. (El body `evaluaciones` legacy queda opcional — sigue
      funcionando para renglones sin especificaciones.)
- [x] 5.5 Test: `responder-preguntas` con `{especificacion_id, proveedor_id,
      respuesta_compras}` persiste la respuesta en la fila exacta, sin tocar
      otras características del mismo renglón.
- [x] 5.6 Actualizar `responder-preguntas` (`main.ts:5221-5271`) para operar
      sobre `EvaluacionEspecificacion` en vez de `ComparativaDetalle`. (El
      body `respuestas` legacy queda opcional, ambos caminos coexisten.)
- [x] 5.7 Confirmar (test o inspección) que `nueva-revision`
      (`main.ts:4754-4868`) sigue funcionando sin cambios — no forma parte
      de este change.

## 6. Backend — cierre de Requisición

- [x] 6.1 Test: firmar un cuadro con `requisicion_id` asociado → la
      `Requisicion` queda con `cuadro_comparativo_cierre_id` y
      `revision_cierre` correctos, `codigo` sin cambios.
- [x] 6.2 Test: firmar un cuadro con `requisicion_id` huérfano (campo
      obligatorio en schema, sin FK — no corresponde a ninguna Requisicion
      real) → no falla, `updateMany` no encuentra nada y continúa.
- [x] 6.3 Implementar el registro en `firmar`, sin modificar la lógica de
      validación de bloqueo existente.

## 7. Frontend — evaluación por característica

- [x] 7.1 Rediseñar la sección de evaluación en `ComparativaDetail.tsx` como
      una matriz por partida — reutiliza las sub-filas de especificación que
      ya existían (para `AnotacionEspecificacion`, 10.2-10.3) en vez de
      construirlas desde cero: cada celda [característica × proveedor]
      ahora tiene botones C/NC/DA/? propios (`EVAL_BTN_ACTIVE`), amarrados a
      `EvaluacionEspecificacion`. El badge de veredicto de renglón
      (calculado) ya se mostraba ahí mismo, sin cambios. Renglones sin
      especificaciones mantienen los botones directos de siempre en el
      modal legacy (`showEvalPanel`), ahora filtrado explícitamente para
      excluir renglones con especificaciones (evita exponer una acción que
      el backend rechazaría).
- [x] 7.2 Textarea obligatorio de `pregunta_residente` al marcar `?` en una
      celda característica×proveedor — aparece inline en la celda, con
      botones Guardar/Cancelar; "Guardar" queda deshabilitado sin texto.
- [x] 7.3 Vista de Compras: dentro de la misma celda, si hay
      `pregunta_residente` sin `respuesta_compras` y el cuadro es una
      revisión en `BORRADOR`, aparece textarea + botón "Responder" que
      llama `PUT .../responder-preguntas` con `respuestas_especificacion`.
      Banner "Enviar dudas y crear revisión" para el Residente, visible
      cuando hay al menos una característica en `?` con pregunta.
- [x] 7.4 Test (RTL): marcar `?` en una característica sin pregunta bloquea
      el guardado (botón deshabilitado); con pregunta, el botón se habilita
      y guardar refleja el estado.
- [x] 7.5 Test (RTL): renglón sin especificaciones sigue evaluándose vía el
      modal legacy con sus botones directos; el renglón con especificaciones
      no aparece en ese modal (usa la matriz en su lugar).

## 8. Verificación

- [x] 8.1 Ejecutar todos los tests nuevos (backend unitarios + integración,
      frontend RTL) y confirmar que pasan; `tsc --noEmit` limpio en
      `apps/compras` y `apps/app-shell`. 20/20 unit tests + 15/15
      integración (incluye los 5 de `envio-oc-correo-proveedores`, sin
      regresión cruzada) + 23/23 vitest (suite completa de app-shell) + tsc
      limpio en ambos módulos.
- [x] 8.2 Confirmar que `nueva-revision` y el flujo de firma/bloqueo
      existente no tienen regresión — `nueva-revision` no fue tocado
      (verificado por inspección, tarea 5.7); la validación de bloqueo de
      `firmar` no cambió, solo se le agregó el registro final en
      Requisición (probado en 6.1/6.2).
- [ ] 8.3 Verificación manual en navegador: evaluar un renglón con 2+
      especificaciones, marcar una `?`, confirmar que se crea la revisión
      siguiente y Compras puede responder esa característica específica.
      **PENDIENTE** — requiere backend completo levantado con datos reales;
      no hay navegador automatizado disponible en este entorno.
