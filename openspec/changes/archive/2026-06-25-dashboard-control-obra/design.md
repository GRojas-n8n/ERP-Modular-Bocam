## Context

Control de obra maneja avance físico por WBS, estimaciones y riesgos. El presupuesto ejercido vive en Finanzas. El avance físico vive en `control-obra`. Para el semáforo WBS se necesitan ambos datos — control-obra obtiene el presupuesto vía HTTP interno a finanzas.

## Goals / Non-Goals

**Goals:** Vista ejecutiva de salud del proyecto para director/CP.
**Non-Goals:** Edición de avance desde el dashboard (solo lectura), detalle por partida individual.

## Decisions

### D1: Semáforo WBS = avance físico local + presupuesto de Finanzas vía HTTP
`control-obra` llama a `finanzas:3004` para obtener `monto_ejercido / monto_autorizado` por capítulo. El avance físico es nativo de control-obra. Ambos datos se combinan en el endpoint `/dashboard`.
