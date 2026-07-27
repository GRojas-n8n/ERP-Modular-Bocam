## Why

Los usuarios de iRetum operan simultáneamente sobre varios proyectos vivos (obras) a la vez —
uno hasta 5 o 6 o más — y el indicador de proyecto activo actual en `app-shell` es un dropdown
de texto pequeño en la esquina superior izquierda del header (`Layout.tsx`), sin color propio
por proyecto y sin ninguna confirmación al ejecutar acciones. Esto crea riesgo real de que un
usuario ejecute una acción crítica (aprobar una OC, pagar nómina, firmar una evaluación) creyendo
que está en un proyecto cuando en realidad el contexto activo es otro. El mecanismo de seguridad
de fondo ya es correcto — al cambiar de proyecto el backend reemite un JWT con el scope del
proyecto nuevo (`TenantContext.tsx: setCurrentProjectId` → `switchProjectApi`), así que no hay
fuga de datos entre proyectos — pero la UX actual no impide el error humano de actuar sobre el
proyecto equivocado.

## What Changes

- Reemplazar el indicador de proyecto activo actual (dropdown pequeño, mismo color que el resto
  del chrome) por un indicador persistente y visualmente inconfundible: color propio y estable
  por proyecto (derivado determinísticamente del `id` del proyecto, no configurable a mano),
  visible en todo momento en el header de `app-shell`, no solo como texto.
- Agregar un paso de confirmación explícito antes de ejecutar acciones críticas/irreversibles,
  que muestre el nombre del proyecto activo en el propio texto de la confirmación (ej. "¿Aprobar
  esta Orden de Compra en **Torre Corporativa Norte**?"). Acciones cubiertas inicialmente:
  aprobar/firmar Orden de Compra, autorizar/pagar nómina, firmar evaluación técnica/económica de
  Cuadro Comparativo.
- La confirmación se activa solo para las acciones críticas listadas arriba — el resto de la
  UI (navegación, lectura, formularios no destructivos) no cambia y no gana fricción adicional.
- No se modifica el mecanismo de cambio de proyecto en sí (`setCurrentProjectId`,
  `switchProjectApi`, reemisión de JWT) ni ningún endpoint de backend relacionado con scope de
  proyecto — este change es puramente de UX/frontend en `app-shell`.

## Capabilities

### New Capabilities
- `indicador-proyecto-activo`: indicador persistente y color-coded del proyecto activo en el
  header de `app-shell`, visible en todas las vistas, con color determinístico por proyecto.
- `confirmacion-accion-critica-proyecto`: paso de confirmación explícito (con nombre del
  proyecto activo) requerido antes de ejecutar acciones críticas/irreversibles que puedan
  afectar el proyecto equivocado (aprobar/firmar OC, autorizar/pagar nómina, firmar evaluación
  técnica/económica).

### Modified Capabilities
(ninguna — `navegacion-multi-proyecto-compras` ya cubre el reset de vista de detalle al cambiar
de proyecto en Compras y no cambia de comportamiento con este change)

## Impact

- **Afectado:** `apps/app-shell/src/components/Layout.tsx` (selector de proyecto en header),
  posiblemente un nuevo componente compartido de confirmación en `apps/app-shell/src/components/`.
- **Vistas que ganan el paso de confirmación:** `ComprasView.tsx` (aprobar/firmar OC),
  `PersonalView.tsx` (autorizar/pagar nómina), vista de evaluación técnica/económica en Compras
  (firma de Cuadro Comparativo).
- **No afectado:** `TenantContext.tsx` (lógica de cambio de proyecto y JWT), backend de `auth` y
  demás microservicios — ningún endpoint ni contrato de API cambia.
- **Dependencias:** ninguna nueva librería; color determinístico por proyecto puede resolverse
  con un hash simple del `project.id` sobre una paleta fija, sin estado adicional en backend.
