## Why

El change `selector-proyecto-confirmacion-critica` (archivado) resolvió el riesgo de que un
usuario con varios proyectos abiertos ejecutara una acción crítica creyendo estar en un
proyecto distinto al real, exigiendo confirmar citando el nombre exacto del proyecto activo.
Cubrió 3 acciones: aprobar/firmar OC, autorizar/pagar nómina, firmar evaluación
técnica/económica. La investigación de este change confirmó que otras 3 acciones igual de
irreversibles ejecutan hoy sin ningún paso de confirmación, cada una con su propio
comportamiento:

- **Revocar credencial de empleado** (`PersonalView.tsx:632`, `handleRevocarCredencial`): el
  botón "Revocar" (línea 1996-2001) llama la función directamente en `onClick`, sin diálogo
  de por medio — un clic revoca el acceso QR del empleado de inmediato.
- **Eliminar categoría de gasto** (`AdminView.tsx:624`, `handleEliminarCategoria`): mismo
  patrón — `onClick` llama `api.delete(...)` directo, y además el error se descarta en
  silencio (`catch { /* silencioso */ }`), así que si falla, el usuario no se entera de nada.
- **Cancelar Orden de Compra**: el backend ya expone
  `POST /api/v1/compras/ordenes-compra/:id/cancelar` (`apps/compras/src/main.ts:4339`) y el
  cliente HTTP ya lo envuelve (`api.ts:200`, `cancelarOC`), pero **no existe ningún botón o
  flujo en el frontend que lo invoque hoy** — a diferencia de las otras dos acciones, este
  caso no es "modal sin cuidado" sino "funcionalidad de backend sin UI". Extender el patrón
  aquí implica construir el trigger y la confirmación juntos, no solo agregar un paso a algo
  que ya existe.

Además, se detectó que la capability `confirmacion-accion-critica-proyecto` — definida y
archivada como parte de `selector-proyecto-confirmacion-critica`
(`openspec/changes/archive/selector-proyecto-confirmacion-critica/specs/confirmacion-accion-critica-proyecto/spec.md`)
— **no quedó presente en `openspec/specs/`** (solo `indicador-proyecto-activo` sobrevivió el
archivado, que corresponde a un change distinto y anterior, `mostrar-nombre-proyecto-header`).
Este change restaura esa capability en `openspec/specs/` a la vez que la extiende, para que
no vuelva a perderse en un futuro archivado.

## What Changes

- Agregar confirmación crítica (mismo componente `ConfirmCriticalActionDialog` de `ui-core`,
  con el nombre del proyecto activo) a:
  - Revocar credencial de empleado (`PersonalView.tsx`).
  - Eliminar categoría de gasto (`AdminView.tsx`) — y dejar de descartar el error en
    silencio: mostrar notificación si el `delete` falla, igual que ya hace
    `handleRevocarCredencial`.
- Construir el trigger de "Cancelar Orden de Compra" en `ComprasView.tsx` (no existe hoy) que
  invoque `api.cancelarOC`, envuelto desde el inicio en `ConfirmCriticalActionDialog` —
  variante `destructive`, citando el nombre del proyecto activo y el código de la OC.
- Restaurar en `openspec/specs/confirmacion-accion-critica-proyecto/spec.md` los requirements
  ya aprobados del change archivado (confirmación con nombre de proyecto, componente
  compartido, exclusión de acciones no destructivas) y extenderlos con las 3 acciones nuevas.
- **NO** se auditan ni se agregan confirmaciones a los demás `api.delete(...)` encontrados
  durante la investigación (eliminar insumo, ficha técnica, documento de proveedor/empleado,
  asignación de trazabilidad, calificación de proveedor) — quedan fuera de alcance de este
  change; si se decide extender el patrón a ellos, requieren su propio spec según regla de
  CLAUDE.md de no tocar legacy sin spec dedicado.
- **NO** se modifica el mecanismo de cambio de proyecto activo ni el JWT — igual que el
  change original, esto es puramente UX/frontend más un endpoint de UI nuevo (cancelar OC ya
  existe en backend).

## Capabilities

### New Capabilities
(ninguna — se extiende una capability existente)

### Modified Capabilities
- `confirmacion-accion-critica-proyecto`: se restaura en `openspec/specs/` (faltaba) y se
  amplía la lista de acciones cubiertas para incluir revocar credencial de empleado, eliminar
  categoría de gasto, y cancelar Orden de Compra.

## Impact

- **Afectado:** `apps/app-shell/src/views/PersonalView.tsx` (revocar credencial),
  `apps/app-shell/src/views/AdminView.tsx` (eliminar categoría de gasto),
  `apps/app-shell/src/views/ComprasView.tsx` (nuevo trigger de cancelar OC).
- **No afectado:** `packages/ui-core/src/primitives.tsx` (`ConfirmCriticalActionDialog` ya
  existe y es genérico, no requiere cambios); ningún endpoint de backend nuevo (cancelar OC
  ya existe; revocar credencial y eliminar categoría ya existen).
- **Dependencias:** ninguna nueva librería.
