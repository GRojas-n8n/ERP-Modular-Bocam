## Why

Dos bugs distintos, reportados juntos por el usuario administrador durante la prueba
manual del flujo de evaluación técnica del Residente (2026-07-13):

1. **El botón "Registrar Evaluación Técnica →" no incluye el rol `admin`**: a diferencia de
   "🔒 Firmar y Bloquear →" y la sección "Veredicto del Residente" (que sí incluyen
   `roles.includes('admin')`), `showEvalTecnicaBtn`
   (`apps/app-shell/src/components/ComparativaDetail.tsx:818`) solo revisa
   `isResident || isSuperint`. Esto contradice el requirement ya escrito en
   `openspec/specs/cotizacion-compras-ux/spec.md` (consolidado desde PR #37): *"Estas
   mismas acciones SHALL seguir disponibles para el rol admin... sin remover
   compatibilidad existente"*, refiriéndose explícitamente al botón "Registrar Evaluación
   Técnica →". El usuario administrador nunca ve el botón que abre el panel con los
   controles C/NC/DA/? por renglón, en ningún cuadro (catálogo o texto libre) — es un bug
   de permisos, no de datos.

2. **La descripción del ítem se pierde para líneas de texto libre al recargar**: al crear el
   cuadro localmente, `buildLineasFromReq` sí usa `descripcion_libre` de la requisición como
   respaldo. Pero `normalizeComp` (usado al releer el cuadro desde el backend — recarga de
   página, bandeja de pendientes) solo busca `insumo_descripcion` en el catálogo de insumos
   por `insumo_id` — para una línea sin `insumo_id` (texto libre), esto siempre cae a `'—'`,
   perdiendo la descripción real del ítem aunque marca/especificaciones sí se conserven
   (esas sí tienen su propio respaldo, agregado en `marca-especificaciones-cuadro-comparativo`).

## What Changes

- `showEvalTecnicaBtn` incluye `roles.includes('admin')`, igual que `showFirmaBtn` y la
  sección "Veredicto del Residente".
- `normalizeComp` (`ComprasView.tsx`) usa `descripcion_libre`/`unidad_libre` de la
  requisición (vía `detalle_req_id`) como respaldo de `insumo_descripcion`/`insumo_unidad`
  cuando la línea no tiene `insumo_id` — mismo patrón ya usado en `buildLineasFromReq`.
- Sin cambios de backend.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: corrige el requirement ya existente sobre acceso del rol `admin`
  a las acciones de evaluación técnica (bug de implementación, no de spec — la spec ya lo
  pedía).

## Impact

- **Frontend únicamente**: `apps/app-shell/src/components/ComparativaDetail.tsx`
  (`showEvalTecnicaBtn`), `apps/app-shell/src/views/ComprasView.tsx` (`normalizeComp`).
- Bloqueaba por completo la evaluación técnica para el usuario administrador — sin poder
  abrir el panel, no hay forma de probar el resto del flujo (firma, envío a GT) con esa
  cuenta.
