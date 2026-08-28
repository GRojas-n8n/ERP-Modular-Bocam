## Why

Hoy la gestión de Proyectos solo es accesible desde el módulo Administración. Los usuarios de Gerencia Técnica y de Control de Obra trabajan diariamente con proyectos específicos pero deben salir a Administración para consultarlos/darlos de alta, y el rol `control_obra` ni siquiera tiene visibilidad del ítem "Proyectos" en el menú hoy. Esto genera fricción de navegación y un gap de permisos para ese rol.

## What Changes

- Agregar un subItem "Proyectos" al grupo de menú "Gerencia Técnica" que navegue a la vista existente de gestión de Proyectos (reutilizando `AdminView.tsx`, sin nuevo endpoint).
- Agregar un subItem "Proyectos" al grupo de menú "Control de Obra" con el mismo comportamiento.
- Sumar el rol `control_obra` a los roles permitidos para ver "Proyectos" (tanto en el subItem existente de Administración como en el nuevo subItem de Control de Obra).
- Ajustar el manejo de navegación del sidebar para permitir que un subItem de un grupo distinto a "Administración" navegue correctamente a `view='admin', sub='proyectos'` sin romper el resaltado de sección activa.
- No se crea ningún endpoint nuevo ni se duplica el modelo de Proyecto en otros microservicios — la fuente de verdad sigue siendo `auth`.

## Capabilities

### New Capabilities
- `sidebar-acceso-proyectos`: puntos de entrada al módulo Proyectos desde los grupos de menú "Gerencia Técnica" y "Control de Obra", incluyendo la visibilidad del rol `control_obra`.

### Modified Capabilities
(ninguna — no existe un spec previo de navegación del sidebar en `openspec/specs/`; se confirmó vía `ls openspec/specs` que no hay ninguna capability llamada sidebar/navegación/menú existente)

## Impact

- **Frontend:** `apps/app-shell/src/components/Layout.tsx` (definición de `ALL_NAV_ITEMS`, roles permitidos, manejo de navegación de subItems).
- **Sin impacto backend:** no se modifica `apps/auth` ni `apps/gerencia-tecnica`; se reutiliza el endpoint `GET/POST/PATCH /api/v1/auth/admin/proyectos` ya existente.
- **Permisos:** el rol `control_obra` gana visibilidad sobre la pantalla de Proyectos (antes no la tenía en ningún lado).
