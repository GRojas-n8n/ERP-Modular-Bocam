## Context

El residente opera principalmente con: (1) recepciones de OC (módulo compras), (2) evaluaciones técnicas en cuadros comparativos (módulo compras), (3) requisiciones propias. Los datos de OCs y cuadros viven en la BD de Compras. El microservicio para residentes es `control-obra` (puerto 3005).

## Goals / Non-Goals

**Goals:** Dashboard contextual para el residente con sus pendientes del día.
**Non-Goals:** Avance financiero del proyecto (eso es Control de Obra/Director).

## Decisions

### D1: Dashboard residente filtra por userId
A diferencia de otros dashboards que filtran por proyecto, el dashboard de residentes también filtra por `userId` para mostrar "mis evaluaciones" y "mis requisiciones" — no las de todo el proyecto.

### D2: OCs por recibir vienen de Compras vía HTTP interno
`control-obra` llama a `compras:3002` para obtener OCs en estado `EMITIDA` o `PARCIALMENTE_RECIBIDA` — son datos que el residente necesita ver para programar recepciones.
