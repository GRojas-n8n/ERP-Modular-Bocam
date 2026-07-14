## Context

Investigación de código (2026-07-14) confirmó la cadena completa:

- `ComparativaDetalle.valor_ofrecido_spec String? @db.Text` — columna ya existe en
  `apps/compras/prisma/schema.prisma:406`, comentada como "Lo que el proveedor ofrece
  (texto libre de Compras)".
- Ya es settable vía `PATCH /comparativas/:id/evaluar` (`apps/compras/src/main.ts:3303`,
  `3391-3393`) — pero ese endpoint es el de EVALUACIÓN del Residente (`requireRoles('resident',
  'residencia', ...)`), no el de CAPTURA de cotización de Compras. No hay ningún input en
  el frontend que llame a ese endpoint con este campo — nunca se ha usado en la práctica.
- El endpoint correcto para capturar datos de cotización por (renglón, proveedor) es
  `PUT /comparativas/:id/cotizaciones` (`apps/compras/src/main.ts:3151`), que ya recibe
  `precio` y `fecha_entrega_estimada` por item — pero no `especificacion_ofrecida`.
- En el frontend, `CotizacionLinea.valor_ofrecido_spec` (`ComparativaDetail.tsx:86`) es un
  `string` único por renglón — inconsistente con `precios`/`fechasEntrega`
  (`Record<proveedor_id, valor>`) — y **nunca se asigna** en `normalizeComp`
  (`ComprasView.tsx:559-605`), así que el único lugar que lo lee
  (`ComparativaDetail.tsx:2266-2267`, modo Residente) siempre renderiza el placeholder
  vacío `—`.

## Goals / Non-Goals

**Goals:**
- Que Compras pueda escribir, por (renglón, proveedor), qué especificación/marca/modelo
  está ofreciendo ese proveedor — en la misma pantalla donde ya captura precio.
- Que el Residente vea ese dato durante la evaluación técnica, por proveedor (no
  colapsado a un solo valor).

**Non-Goals:**
- No se captura por característica individual (`EvaluacionEspecificacion`) — el usuario
  decidió explícitamente alcance por renglón × proveedor, reutilizando el campo existente.
  Si en el futuro se requiere granularidad por característica, será un change aparte que sí
  necesitará una columna nueva en `EvaluacionEspecificacion`.
- No se agrega edición posterior a `BORRADOR` — mismo ciclo de vida que precio/fecha de
  entrega hoy (editable solo mientras el cuadro no se envió a evaluación).
- No se toca la lectura de PDF por IA (`apps/asistente`) — la extracción automática de
  especificaciones desde el PDF del proveedor queda fuera de alcance; Compras sigue
  transcribiendo manualmente (igual que hace hoy con el precio cuando no viene de PDF, o
  como complemento a la extracción automática de precio que si existe).

## Decisions

- **Reusar la columna `valor_ofrecido_spec` existente** en vez de crear una nueva: ya
  tiene el nombre y el propósito correctos, ya es `@db.Text` (sin límite de longitud útil
  para especificaciones largas), y ya está expuesta (aunque sin uso real) en el contrato
  del endpoint de evaluación. Cero migración de Prisma.
- **Nombre del campo en el payload de captura**: `especificacion_ofrecida` (nombre nuevo,
  claro para Compras) en vez de reusar `valor_ofrecido_spec` en el body del PUT
  `.../cotizaciones` — evita confusión con el nombre de columna interno y es más
  descriptivo del acto de "esto es lo que el proveedor ofrece", igual que ya se hace con
  `precio` (no `precio_ofertado`) en ese mismo payload.
- **Frontend: `Record<proveedor_id, string>`** para el estado editable (nombrado
  `especOfrecida` en `CotizacionLinea`, no reusar el nombre roto `valor_ofrecido_spec`) —
  mismo patrón que `precios`/`fechasEntrega`, evita repetir el bug de colapsar a un solo
  proveedor que ya se corrigió una vez para evaluación técnica (PR #59) y para aprobación
  GT (`evaluacion-economica-gt-por-proveedor`).
- **Ubicación del input**: en la misma celda de Compras donde ya están precio y fecha de
  entrega (`ComparativaDetail.tsx` ~línea 2232-2260), como tercer campo — no una columna
  nueva en la tabla, para no romper el layout existente ni requerir scroll horizontal
  adicional más allá del ya existente.
- **Sin validación de longitud mínima/obligatoriedad**: es un campo opcional de texto
  libre, igual que `comentario_tecnico` — Compras lo llena cuando tiene la información del
  proveedor (PDF, correo, etc.), no se bloquea el envío a evaluación si falta.

## Risks / Trade-offs

- **[Riesgo] Compras podría no llenar el campo de todos modos** (es opcional, como hoy
  puede dejar `fecha_entrega_estimada` vacía) → Mitigación: fuera de alcance forzarlo por
  ahora; es una mejora de UX que habilita la captura, no una garantía de que se use. Si en
  producción se sigue reportando el mismo problema tras este change, será una señal de que
  hace falta hacerlo obligatorio (otro change).
- **[Riesgo] Cuadros ya `EN_EVALUACION_TECNICA` o posteriores no podrán recibir esta
  información retroactivamente** (mismo candado que ya aplica a precio/fecha) →
  Mitigación: ninguna en este change — es el mismo comportamiento ya aceptado para los
  otros dos campos del mismo formulario.

## Migration Plan

1. Test de integración en `apps/compras` que reproduce el comportamiento esperado: PUT
   `.../cotizaciones` con `especificacion_ofrecida` en un item → se persiste en
   `valor_ofrecido_spec` de `ComparativaDetalle`; sin el campo → sigue siendo `null`
   (compatibilidad con requests existentes sin el campo nuevo).
2. Backend: aceptar y persistir el campo.
3. Frontend: capturar (`handleUpdateEspecOfrecida`, input junto a precio/fecha), enviar
   (payload de `handleEnviarEvaluacion`), cargar (`normalizeComp` × 3 call sites), mostrar
   (celda modo Residente, keyed por proveedor).
4. Test Playwright E2E: Compras captura especificación ofrecida por 2 proveedores en un
   renglón → envía a evaluación → Residente ve ambos valores correctamente separados por
   proveedor (no colapsados).
5. `tsc -b` de `app-shell` limpio.

**Rollback**: revertir el commit — no hay migración de esquema que revertir por separado.

## Open Questions

(ninguna — alcance y flujo confirmados con el usuario: por renglón × proveedor, captura
de Compras al armar el cuadro en estado BORRADOR)
