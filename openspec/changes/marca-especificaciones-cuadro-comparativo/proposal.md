## Why

Al crear el Cuadro Comparativo, la marca/modelo y la especificación técnica que el Residente
capturó en la requisición (`RequisicionItem.especificacion_marca_modelo` /
`especificacion_detalle`) no llegan al cuadro — Compras ve el panel de "Detalles técnicos"
(marca/especificaciones por línea) vacío y tiene que volver a escribir a mano lo que el
Residente ya especificó. Confirmado en producción (2026-07-13, usuario administrador,
requisición `a9b073fc-a74b-4fc4-9b74-7d6a4e6fc09a`): el ítem tenía
`especificacion_marca_modelo` = "Mirage, United Appliances, Carrier o equivalente..." y
`especificacion_detalle` con el detalle completo de instalación/garantía, pero el cuadro
comparativo se creó sin nada en `marca_modelo_ref`/`especificaciones_requeridas`.

Causa raíz: `POST /api/v1/compras/comparativas` (`apps/compras/src/main.ts:2990-3025`) solo
intenta poblar `especificaciones_requeridas` desde la tabla `EspecificacionDetalleReq` (un
mecanismo aparte, ligado a la evaluación técnica por especificación) — si esa tabla no tiene
filas para el ítem (caso común, no todos los ítems usan ese mecanismo estructurado), el campo
queda `null`. Nunca se usa como respaldo el texto que el Residente ya capturó directamente en
`RequisicionItem`. `marca_modelo_ref` nunca se poblaba desde ningún lado al crear el cuadro.

## What Changes

- Al crear el Cuadro Comparativo, poblar `ComparativaLinea.marca_modelo_ref` desde
  `RequisicionItem.especificacion_marca_modelo` del ítem correspondiente.
- Al crear el Cuadro Comparativo, si `EspecificacionDetalleReq` no tiene filas para el ítem,
  usar `RequisicionItem.especificacion_detalle` como respaldo para
  `ComparativaLinea.especificaciones_requeridas` (sin cambiar la precedencia existente: si
  `EspecificacionDetalleReq` sí tiene filas, esas siguen ganando).
- Compras sigue pudiendo editar ambos campos después desde el panel de "Detalles técnicos"
  ya existente (`PUT /comparativas/:id/lineas/:insumoId`) — sin cambios en ese endpoint.
- Sin cambios de schema (`marca_modelo_ref`/`especificaciones_requeridas` ya existen en
  `ComparativaLinea`).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: agrega el comportamiento de poblar marca/especificaciones al
  crear el cuadro, sin requirement previo específico sobre esto en la spec consolidada.

## Impact

- **Backend**: `apps/compras/src/main.ts` (`POST /comparativas`).
- **Sin cambios de frontend** — el panel de "Detalles técnicos" ya lee y muestra
  `marca_modelo_ref`/`especificaciones_requeridas` (`ComparativaDetail.tsx:566-593`), solo
  llegaban vacíos.
- **Fuera de alcance**: el caso de ítems de requisición sin `insumo_id` (texto libre /
  imprevisto) sigue sin tener línea en el cuadro en absoluto — cubierto por un change aparte
  (ver [[fix-items-texto-libre-cuadro-comparativo]] o el nombre que se le dé), porque implica
  una decisión de diseño de datos distinta.
