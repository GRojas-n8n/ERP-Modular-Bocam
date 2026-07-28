## Context

El componente `ConfirmCriticalActionDialog` ya existe en
`packages/ui-core/src/primitives.tsx:388-446` (creado por el change archivado
`selector-proyecto-confirmacion-critica`) y ya se consume en `ComprasView.tsx` (aprobar OC),
`ComparativaDetail.tsx` (firmar evaluación) y `ResidenciaView.tsx` (autorizar/pagar nómina).
El color del proyecto activo (`projectColorDot`) se deriva vía `getProjectColor(projectId).dot`
en `packages/ui-core/src/project-color.ts`. Este change no crea infraestructura nueva — solo
envuelve 2 acciones existentes que ejecutan sin confirmación, y agrega el trigger que falta
para una tercera:

- `PersonalView.tsx:1996-2001` — botón "Revocar" → `handleRevocarCredencial` (línea 632),
  `onClick` directo, sin diálogo.
- `AdminView.tsx:811-817` — botón "Eliminar" → `handleEliminarCategoria` (línea 624),
  `onClick` directo, sin diálogo, y con `catch { /* silencioso */ }` (línea 629) que además
  oculta cualquier error del backend.
- Cancelar OC: `api.cancelarOC` (`api.ts:200`) ya envuelve
  `POST /api/v1/compras/ordenes-compra/:id/cancelar` (`apps/compras/src/main.ts:4339`, ya
  valida que la OC no esté ya cancelada), pero ningún botón de `ComprasView.tsx` lo invoca hoy.

También se detectó que `openspec/specs/confirmacion-accion-critica-proyecto/` no existe en el
árbol de specs vigente pese a estar en el change archivado — este change la restaura como
parte de su delta (ver proposal.md).

## Goals / Non-Goals

**Goals:**
- Las 3 acciones (revocar credencial, eliminar categoría de gasto, cancelar OC) requieren
  confirmar explícitamente citando el nombre del proyecto activo, usando
  `ConfirmCriticalActionDialog` sin modificarlo.
- El error de `handleEliminarCategoria` deja de descartarse en silencio — se notifica al
  usuario igual que ya hace `handleRevocarCredencial` (`notify({ type: 'error', ... })`).
- La capability `confirmacion-accion-critica-proyecto` vuelve a existir en `openspec/specs/`
  con los requirements originales intactos más los 3 nuevos casos.

**Non-Goals:**
- No se extiende la confirmación a los demás `api.delete(...)` detectados durante la
  investigación (insumo, ficha técnica, documento de proveedor/empleado, asignación de
  trazabilidad, calificación de proveedor) — quedan fuera de alcance; ver proposal.md.
- No se modifica `ConfirmCriticalActionDialog` en sí — sus props (`projectName`,
  `projectColorDot`, `variant`, etc.) ya cubren lo que estas 3 acciones necesitan.
- No se cambia ningún contrato de API — los 3 endpoints ya existen y ya validan lo que deben
  validar en el backend (ej. OC ya cancelada → error 400).

## Decisions

**D1 — Cancelar OC usa `variant="destructive"`, sin campo de motivo en esta primera versión.**
Se confirmó leyendo el handler completo (`apps/compras/src/main.ts:4339-4460`) que el endpoint
**no lee `req.body` en ningún punto** — no existe hoy un campo de motivo que capturar ni
persistir. Agregar uno requeriría modificar el endpoint de backend, lo cual excede el alcance
"solo frontend, endpoint ya existente" de este change. Alternativa descartada: agregar motivo
de una vez ya que se está tocando el flujo — se rechaza para no mezclar un cambio de contrato
de API (nuevo campo persistido) con una extensión de patrón puramente de UX; si se decide que
cancelar OC necesita motivo auditable, es un change de backend aparte con su propio spec.

**D2 — Eliminar categoría de gasto mantiene su regla de negocio existente
(`proyectoCostosEstado !== 'CONFIGURACION' || cat.insumos_count > 0` deshabilita el botón)
sin cambios; la confirmación se agrega como paso adicional, no como reemplazo de esa regla.**
El botón ya está deshabilitado si la categoría tiene insumos asociados o el proyecto no está
en fase de configuración (`AdminView.tsx:813`). La confirmación crítica se activa solo cuando
el botón ya está habilitado — no cambia cuándo se puede eliminar, solo agrega el paso de
confirmar antes de ejecutar.

**D3 — La capability restaurada se escribe como `MODIFIED Requirements` sobre el contenido
exacto del spec archivado, no como `ADDED` desde cero.**
Esto preserva el historial real (el requirement de "componente compartido" y "acciones no
destructivas excluidas" ya fueron aprobados una vez) y dispara la actualización correcta al
archivar este change: el requirement de la lista de acciones cubiertas se reemplaza
completo (ahora con 6 acciones en vez de 3), los otros 2 requirements se copian sin cambios.

## Risks / Trade-offs

- [Agregar confirmación a "Eliminar categoría de gasto" podría interpretarse como fricción
  nueva en un flujo de configuración inicial de proyecto (fase única, no repetitiva)] →
  Mitigación: es exactamente el tipo de acción que el patrón busca proteger — eliminar una
  categoría de gasto durante la configuración del presupuesto de un proyecto es difícil de
  deshacer una vez que hay insumos y movimientos encima.
- [Restaurar `confirmacion-accion-critica-proyecto` en specs/ sin que el proceso de archivado
  original explique por qué se perdió, podría repetir el mismo problema al archivar este
  change] → Mitigación: se documenta explícitamente en proposal.md como hallazgo, para que
  quien archive este change lo tenga presente.

## Migration Plan

Sin migración de datos. Ciclo normal: PR contra `main` → `tsc -b` sobre `app-shell` → QA visual
manual de las 3 confirmaciones (con navegador real, no solo tests) → deploy VPS del contenedor
de `app-shell`. Rollback: revertir el PR.

## Open Questions

- ¿Por qué la capability `confirmacion-accion-critica-proyecto` no llegó a `openspec/specs/`
  al archivar el change original? No se investiga a fondo en este change (no bloquea el
  trabajo), pero vale la pena revisar el proceso de archivado si vuelve a pasar.
