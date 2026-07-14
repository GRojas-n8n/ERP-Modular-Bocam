## Why

Los campos `primera_opcion_proveedor_id`/`segunda_opcion_proveedor_id` y sus
dropdowns ya existen (`CuadroComparativo`, endpoint `PUT .../seleccion`,
`ComparativaDetail.tsx:1418-1464`), pero la 2ª opción se guarda "desnuda" —
sin validar que pertenezca al cuadro ni que esté libre de renglones NC/?,
y sin usarse en ningún punto del flujo de firma. Además la selección de
proveedor vive en una sección separada, arriba del cuadro, desconectada del
veredicto y del botón de firma — el Residente puede llegar al botón "Firmar"
sin haber guardado ninguna selección (el botón no lo valida, solo el backend
lo rechaza después con un 400 confuso).

## What Changes

- `PUT .../seleccion` valida `segunda_opcion_proveedor_id` igual que la
  primera: SHALL pertenecer al cuadro, y SHALL ser distinto de
  `primera_opcion_proveedor_id`.
- `POST .../firmar` valida que, si hay `segunda_opcion_proveedor_id`, esa
  opción tampoco tenga renglones `NC` ni `?` — mismo criterio que ya aplica
  a la primera opción.
- Frontend: la sección "Recomendación del Residente" (1ª/2ª opción) se
  reubica para quedar junto al "Veredicto del Residente", inmediatamente
  antes del botón de firma — un solo bloque: seleccionar 1ª/2ª opción →
  escribir veredicto → firmar.
- Frontend: `showFirmaBtn` exige que `primera_opcion_proveedor_id` ya esté
  guardado — cierra el hueco donde el botón de firma podía habilitarse sin
  selección guardada, adelantando el error al momento correcto.

## Capabilities

### New Capabilities
(ninguna — extiende comportamiento de una capability ya existente sin
spec propio en `openspec/specs/`)

### Modified Capabilities
(ninguna en `openspec/specs/` — mismo caso que `evaluacion-tecnica-por-especificacion`,
el flujo de firma nunca se documentó ahí)

## Impact

- **Backend (`apps/compras`)**: `PUT .../seleccion` (`main.ts:4574-4631`) y
  `POST .../firmar` (`main.ts:4634-4751`).
- **Frontend (`apps/app-shell`)**: reubicación de sección en
  `ComparativaDetail.tsx`, ajuste de `showFirmaBtn`/`veredictoListo`.
- Sin cambios de schema — los campos ya existen.
