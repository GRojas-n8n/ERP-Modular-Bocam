## Why

El rol compras ve todas las requisiciones mezcladas en un solo scroll sin forma de aislar rápidamente las que requieren acción inmediata. Cuando hay muchas reqs en distintos estados, el usuario tiene que leer cada tarjeta para encontrar las que están "listas para cotizar" o "pendientes de aprobación GT", lo que genera fricción operativa y riesgo de omisión.

## What Changes

- Agregar una barra de filtros rápidos (chips) encima de la lista de requisiciones en la pestaña Requisiciones de ComprasView
- Los chips corresponden a los estados del ciclo de cotización ya definidos en `cotizacion-compras-ux`
- Un chip "Todos" muestra la lista completa (estado inicial/por defecto)
- El filtro es exclusivo (solo un chip activo a la vez)
- El filtrado es client-side — no requiere llamadas adicionales al backend

## Capabilities

### New Capabilities

- `filtros-requisiciones-compras`: Barra de chips de filtro rápido en Compras > Requisiciones que permite mostrar solo las reqs en un estado del ciclo de cotización específico

### Modified Capabilities

<!-- ninguna — no cambian requisitos de specs existentes, solo se agrega UX encima -->

## Impact

- **Frontend:** `apps/app-shell/src/views/ComprasView.tsx` — sección tab Requisiciones
- **Sin cambios backend:** filtrado 100% client-side sobre el array `requisiciones` ya cargado
- **Sin cambios a otros roles:** los chips solo se muestran en el tab Requisiciones del rol compras/procurement
