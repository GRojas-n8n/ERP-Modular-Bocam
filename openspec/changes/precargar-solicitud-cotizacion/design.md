## Context

`solicitudesMap` (`Record<string, SolicitudCotizacion>`) es estado local de
`ComprasView.tsx`, poblado exclusivamente por `loadSolicitud(reqId)` — llamado desde
`handleOpenSolicitudPanel` y `openComparativa`. `fetchData` (el `useEffect` inicial que
carga requisiciones/comparativas/etc.) nunca lo toca. La tarjeta de requisición usa
`solicitudesMap[req.id]` tanto para el botón "Crear Cuadro Comparativo" como para el badge
"N/M respuestas".

No existe un endpoint de listado batch para Solicitud de Cotización (solo
`GET /requisiciones/:reqId/solicitud-cotizacion`, uno por requisición) — construir uno
nuevo es una opción, pero implica tocar el backend para un problema que se resuelve
igual de bien orquestando llamadas en paralelo desde el frontend, como ya se hace hoy
para otras entidades en `fetchData`.

## Goals / Non-Goals

**Goals:**
- El botón y el badge de respuestas reflejan el estado real sin requerir una acción manual
  previa del usuario en la sesión actual.

**Non-Goals:**
- No se crea un endpoint batch en el backend — N llamadas en paralelo (una por requisición
  `APROBADA`) es aceptable al volumen actual de requisiciones activas por proyecto.
- No se cambia el comportamiento de `handleOpenSolicitudPanel`/`openComparativa` — siguen
  usando `solicitudesMap[req.id] ?? loadSolicitud(...)` como caché, ahora con más chance de
  ya estar precargado.

## Decisions

### D1: Precarga en paralelo, fire-and-forget, solo para requisiciones APROBADA

Tras `setRequisiciones(requisicionesNormalizadas)`, disparar
`Promise.allSettled(aprobadas.map(r => loadSolicitud(r.id)))` sin esperar el resultado
(`fetchData` no bloquea su propio `finally`/`setLoading(false)` por esto) — cada
`loadSolicitud` ya actualiza `solicitudesMap` por su cuenta vía `setSolicitudesMap`, causando
un re-render incremental conforme van llegando las respuestas, igual que el patrón ya usado
para `pendientesEval`/`pendientesGT` con `Promise.allSettled` en el mismo `fetchData`.

**Alternativa descartada**: endpoint batch `GET /solicitudes-cotizacion?requisicion_ids=...`.
Se descarta por ahora — más cambio (backend + frontend) para un volumo de llamadas que no es
un problema real de performance hoy; documentar como opción futura si el número de
requisiciones `APROBADA` simultáneas crece mucho.

## Risks / Trade-offs

- **[Riesgo]** N llamadas HTTP adicionales en paralelo al cargar la vista Compras, una por
  cada requisición `APROBADA`. **[Mitigación]** Mismo patrón ya usado para
  `pendientes-evaluacion`/`pendientes-gt`; el volumen de requisiciones `APROBADA` activas
  simultáneamente es bajo en la operación real de Bocam.

## Migration Plan

Sin cambios de backend/schema. Despliegue normal de frontend.
