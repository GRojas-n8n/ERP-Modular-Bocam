# Proposal — Sidebar de Navegación Contextual por Rol

## Why

El sidebar izquierdo (240px) está subutilizado: los usuarios operativos con 1–2 módulos
asignados ven 2–3 items en el nav y el resto del panel queda vacío. Cada módulo duplica
su propio sistema de navegación horizontal (barra de tabs) dentro del área de contenido,
consumiendo ~60px de altura y fragmentando la experiencia en dos sistemas de navegación
independientes.

Adicionalmente, existe un gap de navegación actual: usuarios con rol `residencia` o
`gerencia_tecnica` pueden operar endpoints de evaluación y aprobación en Compras (los
backends ya aceptan esos roles), pero la barra lateral no les da acceso al módulo Compras.

## What Changes

Mover toda la sub-navegación de cada módulo (actualmente barras de tabs horizontales)
al sidebar izquierdo como items secundarios indentados bajo el módulo activo. El área
`<main>` queda libre de controles de navegación y dedicada 100% al contenido.

Corregir simultáneamente el gap RBAC de navegación: `residencia`, `resident` y
`gerencia_tecnica` pasan a poder acceder a Compras con visibilidad filtrada de sub-items.

## Capabilities

| # | Tipo | Descripción |
|---|------|-------------|
| 1 | NUEVA | Sub-navegación contextual en sidebar — sub-items indentados bajo el módulo activo, filtrados por rol del usuario |
| 2 | MODIFICADA | `Layout.tsx` — `ALL_NAV_ITEMS` recibe `subItems[]`; sidebar renderiza sub-items cuando el módulo padre está activo; auto-selección de primera sección accesible al navegar a un módulo |
| 3 | MODIFICADA | `App.tsx` — gestiona `currentSubView` junto a `currentView`; pasa ambos al Layout y a las vistas |
| 4 | MODIFICADA | `ComprasView` — recibe `activeSubView` como prop, elimina barra de tabs interna; roles `residencia`/`gerencia_tecnica`/`superintendent` ven solo sus sub-items relevantes |
| 5 | MODIFICADA | `InsumosView`, `ResidenciaView`, `ControlObraView`, `PersonalView`, `SeguridadView`, `AdminView` — cada una recibe `activeSubView` como prop y elimina su barra de tabs interna |
| 6 | CORREGIDA | Compras nav item ahora incluye roles `residencia`, `resident`, `gerencia_tecnica`, `superintendent` con sub-items filtrados por rol |

## Impact

- **Archivos afectados (frontend):** `Layout.tsx`, `App.tsx`, 7 vistas
- **Sin cambio:** backends, endpoints, `api.ts`, `TenantContext.tsx`, `@bocam/ui-core`, demoData
- **Riesgo:** Bajo — cambio puramente de presentación. La lógica de negocio dentro de cada
  vista no cambia, solo se elimina el renderizado del tab bar y se lee `activeSubView` del
  prop en lugar del estado local.
