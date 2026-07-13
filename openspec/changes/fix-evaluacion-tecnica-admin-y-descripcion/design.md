## Context

Ambos bugs son pequeños, acotados y en archivos ya muy trabajados esta sesión
(`ComparativaDetail.tsx`, `ComprasView.tsx`). No requieren discusión de diseño extensa —
se documentan aquí solo por consistencia con el resto de la sesión (spec → test → fix).

## Goals / Non-Goals

**Goals:**
- El usuario administrador puede abrir el panel de evaluación técnica y usar los controles
  C/NC/DA/? por renglón, igual que un usuario con rol `residencia`.
- Una línea de texto libre conserva su descripción real (no `'—'`) tras recargar la página
  o verla desde cualquier bandeja (Compras, Eval. Técnica, Aprob. GT).

**Non-Goals:**
- No se audita el resto de los `show*Btn` por inconsistencias similares de rol — se
  corrige puntualmente el caso reportado (`showEvalTecnicaBtn`). Si aparece otro caso, se
  atiende aparte.
- No se agrega una "clave" equivalente para líneas de texto libre (`insumo_clave` sigue
  siendo `'—'` — no hay concepto de clave de catálogo para un ítem sin catálogo).

## Decisions

### D1: `showEvalTecnicaBtn` incluye `admin`, mismo patrón que `showFirmaBtn`

```ts
const showEvalTecnicaBtn = (isResident || isSuperint || roles.includes('admin')) && comp.estado === 'EN_EVALUACION_TECNICA';
```

### D2: `normalizeComp` usa un mapa de ítems de requisición como respaldo

Se construye `reqItemsMap` (id de ítem → `{ descripcion_libre, unidad_libre }`) a partir de
`requisicionesNormalizadas` (ya disponible en el mismo `fetchData`, en scope antes de
`normalizeComp`). Para una línea sin `insumo_id`, se usa
`reqItemsMap.get(d.detalle_req_id)` como respaldo, mismo criterio de precedencia que
`buildLineasFromReq` (`info?.descripcion ?? item.descripcion_libre ?? '—'`).

## Risks / Trade-offs

- **[Riesgo]** Ninguno significativo — ambos cambios son aditivos/de respaldo, no alteran
  comportamiento existente para líneas con `insumo_id` ni para roles que ya tenían acceso.

## Migration Plan

Sin cambios de backend/schema. Despliegue normal de frontend.
