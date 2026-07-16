## Context

`ComparativaDetail.tsx` es un componente controlado: el `comp` que recibe
por props es la fuente de verdad, y `onUpdate(updated)` (implementado en
`ComprasView.tsx` como `updateComparativa`) solo hace `setComparativas`
local — **no llama a ningún endpoint**. El único guardado real de
proveedores/líneas/precios ocurre en `handleEnviarEvaluacion`, que hace
`PUT /api/v1/compras/comparativas/:id/cotizaciones` seguido de `PATCH
.../enviar-evaluacion`, y solo se dispara si `showEnviarEvalBtn` es
`true`, lo que exige `comp.estado === 'BORRADOR'`.

`grep -rn "EN_PROCESO" apps/compras/src/` no devuelve nada: el backend de
`compras` nunca setea ni lee ese valor. Es un estado que solo existe en el
tipo `EstadoComparativa` del frontend y en 2 lugares que lo escriben
(`handleAddProveedorFromCatalog`, `handleAddLinea`).

## Goals / Non-Goals

**Goals:**
- Que agregar un proveedor o una línea manualmente no bloquee "Enviar a
  Evaluación Técnica" en la misma sesión de edición.

**Non-Goals:**
- No se elimina el valor `'EN_PROCESO'` del tipo `EstadoComparativa` ni de
  los demás lugares que lo toleran (`locked`, sección de partidas,
  `showAutorizarLegacyBtn`) — tras este fix queda inalcanzable desde el
  frontend, pero removerlo del todo es un refactor de tipos/UI sin
  relación directa con el bug reportado, y el proyecto prohíbe
  refactorizar legacy sin spec propio.
- No se cambia el modelo de guardado (sigue sin haber un "Guardar
  borrador" intermedio — todo se persiste junto al enviar a evaluación).

## Decisions

- **Quitar la mutación en vez de ampliar el gate**: la alternativa
  (cambiar `showEnviarEvalBtn` a `estado === 'BORRADOR' || estado ===
  'EN_PROCESO'`) también arreglaría el síntoma, pero dejaría una bandera
  local que miente sobre el estado real del cuadro (el backend sigue
  pensando que está en `BORRADOR`). Quitar la mutación es la corrección
  real: el estado local debe reflejar el estado real hasta que algo lo
  persista.

## Risks / Trade-offs

- **[Riesgo] Ninguno relevante** — el cambio reduce comportamiento
  incorrecto (un estado fantasma) sin agregar ninguno nuevo. `locked` y
  las demás condiciones que ya toleraban ambos valores siguen
  funcionando igual con solo `BORRADOR`.

## Migration Plan

1. Test RTL que reproduce el bug: montar `ComparativaDetail` en
   `modo="compras"` con `estado: 'BORRADOR'`, simular clic en "Agregar
   proveedor" + selección de un proveedor del catálogo, y verificar que
   el payload de `onUpdate` NO cambia `estado`. En rojo contra el código
   actual (`estado` llega como `'EN_PROCESO'`).
2. Fix: quitar `estado: 'EN_PROCESO'` de ambos handlers.
3. Test en verde. `npm run build` en `app-shell` limpio.
4. PR, merge, redeploy VPS de `app-shell`.

**Rollback**: revertir el commit — sin cambios de esquema ni de API.

## Open Questions

(ninguna)
