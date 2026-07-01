## Why

Al cambiar de Centro de Costos en el selector del header, el sistema disparaba re-fetches en todas las vistas ANTES de que el JWT fuera actualizado con el nuevo `proyecto_id`. Esto causaba que las vistas obtuvieran datos del proyecto ANTERIOR incluso después de que la UI mostrara el proyecto nuevo.

Adicionalmente, todos los usuarios de prueba excepto `admin` y `director` solo tenían un proyecto asignado, por lo que el dropdown del selector nunca aparecía (`projects.length > 1` era false).

## What Changes

- **`TenantContext.setCurrentProjectId`:** Se invierte el orden de operaciones — primero se obtiene el nuevo JWT via `switch-project`, luego se actualiza `currentProjectId` en el estado React. Si el switch falla, no se cambia de proyecto (evita mostrar datos del proyecto incorrecto).
- **DB `user_project_access`:** Se asignan los 8 usuarios de prueba al segundo proyecto (`CIB2026303002`) para que el selector sea funcional en pruebas.

## Capabilities

### Fixed

- `selector-centro-costos`: El cambio de proyecto ahora garantiza que el JWT lleva el `proyecto_id` correcto antes de que cualquier vista haga re-fetch.

## Impact

- `apps/app-shell/src/context/TenantContext.tsx` — orden invertido en `setCurrentProjectId`
- `bocam_auth.user_project_access` — 8 registros nuevos (fix de datos en VPS)

## Commit

`745f561` — 2026-06-30

## Nota SDD

*Este change se implementó fuera del flujo SDD estándar (sin spec previo ni tests-first). Se documenta retroactivamente conforme al procedimiento acordado (Opción A).*
