## Why

Un usuario con rol `gerencia_tecnica` (sin rol `admin`) que entra a Administración → Proyectos —
accesible desde `acceso-proyectos-gt-control-obra` — veía "Error al cargar datos de
administración" en vez de la lista de proyectos, reportado en producción tras el deploy de ese
change. `GET /admin/users` exige rol `admin` exclusivamente; `AdminView.loadAll()` cargaba
usuarios y proyectos con `Promise.all`, así que el 403 de usuarios tumbaba también la carga de
proyectos, aunque ese endpoint sí acepta `gerencia_tecnica`/`control_proyectos`/`control_obra`.

## What Changes

- `AdminView.loadAll()` usa `Promise.allSettled` en vez de `Promise.all`: cada endpoint (usuarios,
  proyectos) se resuelve de forma independiente. El error genérico solo se muestra si AMBOS
  fallan.

## Capabilities

### Modified Capabilities
- `sidebar-acceso-proyectos`: la vista de Proyectos ya no depende de que el usuario también tenga
  acceso a Usuarios para poder ver el listado de proyectos.

## Impact

- `apps/app-shell/src/views/AdminView.tsx` (`loadAll`).
- Sin cambios de backend ni de rutas/roles — el bug era puramente de acoplamiento en el frontend.
