## Why

La evaluación económica de Gerencia Técnica (GT) hoy es un aprobar/rechazar binario y por
renglón — colapsa al primer `ComparativaDetalle` visto en vez de evaluar cada proveedor
(mismo bug ya corregido en la evaluación técnica del Residente vía PR #59), y no muestra
costo ni días de suministro por proveedor, la información que GT necesita para decidir. El
usuario pidió (2026-07-13) que GT evalúe con el mismo vocabulario C/NC/DA/? que ya usa el
Residente, por proveedor, viendo costo, días de entrega y condiciones de crédito, y que un
"?" de GT genere una nueva revisión sin obligar al Residente a re-evaluar lo técnico.

## What Changes

- `aprobacion_gt` deja de ser binario (`APROBADO`/`RECHAZADO`) y pasa a `C`/`NC`/`DA`/`?`
  (mismo vocabulario y semántica que `evaluacion_tecnica`), evaluado por
  `(línea, proveedor)` — no por línea agregada. Sin migración destructiva: mismo patrón ya
  usado por `evaluacion_tecnica` (columna `String` sin enum de base de datos) —
  `APROBADO`/`RECHAZADO` quedan como valores legacy de solo lectura, mapeados en frontend a
  `C`/`NC` respectivamente; las escrituras nuevas usan siempre `C`/`NC`/`DA`/`?`.
- El panel de GT muestra, por cada renglón y proveedor, el costo cotizado y los días de
  suministro estimados (calculados desde `fecha_entrega_estimada`) — información ausente
  hoy en el panel.
- El catálogo de Proveedores gana dos campos nuevos: `ofrece_credito` (booleano) y
  `dias_credito` (número, solo aplica si `ofrece_credito`) — atributo fijo del proveedor,
  junto a `estatus_credito`/`limite_credito` que ya existen ahí. El panel de GT muestra
  esta condición de crédito por cada proveedor participante en el renglón, para que GT
  decida a quién comprar considerando no solo precio y plazo de entrega sino también las
  condiciones de pago.
- Cuando GT marca "?" en cualquier proveedor y redacta una pregunta, se crea una nueva
  revisión del cuadro (mismo mecanismo A→B→C... ya usado por el Residente) — pero, a
  diferencia del "?" del Residente, esta nueva revisión **hereda la evaluación técnica ya
  aprobada** y nace lista para retomarse directo en evaluación económica, sin reiniciar el
  ciclo completo a `BORRADOR` ni pedir al Residente re-evaluar.
- El gate de `APROBADO_GT` (que habilita generar OC) exige que todos los proveedores de
  todos los renglones estén evaluados por GT sin `PENDIENTE`/`?` — mismo patrón que el gate
  de firma del Residente.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: el requirement sobre cómo Gerencia Técnica aprueba/rechaza el
  cuadro comparativo se reemplaza por evaluación C/NC/DA/? por proveedor con costo/días
  visibles, y se agrega el requirement de revisión con preguntas de GT que hereda la
  evaluación técnica.

## Impact

- **Backend** (`apps/compras/src/main.ts`, `apps/compras/prisma/schema.prisma`):
  `aprobacion_gt` cambia de enum binario a `C`/`NC`/`DA`/`?`; nuevos campos
  `pregunta_gt`/`respuesta_gt` en `ComparativaDetalle` (análogos a
  `pregunta_residente`/`respuesta_compras`); modificación de `revisar-gt` para aceptar
  evaluaciones por `detalle_id`; nuevo endpoint (o extensión) para la revisión-con-pregunta
  de GT que clona el cuadro preservando el estado de evaluación técnica en vez de
  reiniciar a `BORRADOR`.
- **Frontend** (`apps/app-shell/src/components/ComparativaDetail.tsx`,
  `apps/app-shell/src/views/ComprasView.tsx`): rediseño del panel/vista de GT para mostrar
  costo, días y crédito por proveedor y capturar C/NC/DA/? por proveedor; el formulario de
  alta/edición de Proveedores (dentro de `ComprasView.tsx`, junto a
  `estatus_credito`/`limite_credito`) gana los campos `ofrece_credito`/`dias_credito`.
- No afecta el flujo de evaluación técnica del Residente salvo por la herencia de sus datos
  hacia la nueva revisión de GT.
