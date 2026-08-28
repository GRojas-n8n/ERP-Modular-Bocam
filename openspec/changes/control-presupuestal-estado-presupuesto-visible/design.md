## Context

`buildControlPresupuestal()` (`apps/gerencia-tecnica/src/main.ts` ~2043-2086) busca un `presupuestoBase` con `estado IN ('APROBADO','LIBERADO','CONGELADO')`. Al importar Catálogo de Obra se crea el presupuesto sin `estado` explícito → default `BORRADOR` (`schema.prisma` ~117-139, enum ~327-333). El handler HTTP (~2196-2207) traduce la ausencia de presupuesto activo en 404 `GT_NO_PRESUPUESTO` sin distinguir "no existe" de "existe pero no aprobado". El frontend (`InsumosView.tsx` tab Control Presupuestal, ~840) y el widget de `ComprasView.tsx` interpretan cualquier 404 como "sin presupuesto activo".

## Goals / Non-Goals

**Goals:**
- Que un presupuesto en `BORRADOR`/`EN_REVISION` sea comunicado explícitamente al usuario en vez de una tabla vacía sin contexto.
- Dar un camino directo (CTA) para aprobar el presupuesto desde la misma pantalla de Control Presupuestal cuando el usuario tiene el permiso.
- No cambiar el comportamiento para presupuestos ya aprobados (regresión cero en el camino feliz).

**Non-Goals:**
- No se cambia el flujo de aprobación en sí (`handleAprobarPresupuesto` / `PATCH .../aprobar` se reutiliza tal cual).
- No se automatiza la aprobación del presupuesto al importar (eso requeriría una decisión de negocio aparte — un presupuesto BORRADOR debe poder revisarse antes de aprobarse).
- No se toca el widget de Compras más allá del mensaje informativo (Compras no aprueba presupuestos de GT).

## Decisions

1. **Nuevo código de error en vez de cambiar el status HTTP**: se mantiene 404 pero con `error: "GT_PRESUPUESTO_PENDIENTE_APROBACION"` + `presupuesto_id` + `estado` cuando exista un presupuesto no aprobado, en vez de `GT_NO_PRESUPUESTO`. Alternativa descartada: devolver 200 con `partidas: []` y una bandera — se descarta porque el contrato actual del endpoint ya usa 404 para "no hay datos que mostrar" y cambiar a 200 rompería el chequeo `response.ok` que hoy usa el frontend para decidir "no hay presupuesto".
2. **CTA de aprobación solo en GT, no en Compras**: el botón de aprobar se agrega únicamente en `InsumosView.tsx` (donde ya vive `handleAprobarPresupuesto` y el rol tiene permiso); el widget de `ComprasView.tsx` solo cambia el texto informativo, sin botón, evitando cruzar responsabilidades de permisos entre módulos.
3. **Determinar "existe pero no aprobado" con una segunda query, no relajando el filtro de estado**: `buildControlPresupuestal()` primero intenta la query actual (estados aprobados); si no hay resultado, hace una segunda query liviana (`select id, estado`) solo por `proyecto_id` para saber si existe alguno en `BORRADOR`/`EN_REVISION` y así completar la respuesta 404 enriquecida. Evita tener que reescribir toda la lógica de agregación para el caso "sin datos".

## Risks / Trade-offs

- [Riesgo] Un frontend antiguo (caché de build previo) que no reconozca el nuevo código de error seguiría mostrando el mensaje genérico de "sin presupuesto activo" → Mitigación: el código sigue siendo 404, así que el fallback actual sigue funcionando; el nuevo mensaje es una mejora progresiva, no rompe el comportamiento previo.
- [Riesgo] Confundir a un usuario sin permiso de aprobar con un CTA que le falla → Mitigación: el botón de aprobar se muestra solo si el rol del usuario tiene permiso de aprobación (mismo check que ya usa `handleAprobarPresupuesto`).

## Migration Plan

Cambio de contrato aditivo (nuevo código de error, campos adicionales en el 404), sin migración de datos. Deploy directo de `gerencia-tecnica` y `app-shell`; no requiere coordinación de orden estricto entre ambos gracias al fallback descrito arriba.
