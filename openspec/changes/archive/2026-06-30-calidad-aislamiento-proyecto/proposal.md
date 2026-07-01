## Why

El módulo Calidad fue diseñado originalmente como módulo tenant-level: todos sus endpoints filtraban únicamente por `tenant_id`, sin considerar `proyecto_id`. Esto violaba el principio de aislamiento por Centro de Costos — un usuario podía ver NCs, Auditorías y Documentos de TODOS los proyectos del tenant mezclados.

La auditoría de aislamiento confirmó que todos los demás módulos (Compras, GT, Finanzas, Control Obra, Contabilidad, Personal, Control Proyectos) ya filtraban correctamente por `{ tenant_id, proyecto_id }`. Calidad era la única brecha.

## What Changes

- **Backend `apps/calidad/src/main.ts`:** 11 endpoints actualizados para filtrar y crear registros con `proyecto_id` extraído del JWT (no del body).
- **Frontend `apps/app-shell/src/views/CalidadView.tsx`:** `currentProjectId` agregado a los deps de `useCallback` en todos los fetches; re-fetch automático al cambiar CC.
- **Sub-componentes:** `NoConformidadesView` y `AuditoriasView` reciben `currentProjectId` como prop.

## Capabilities

### Fixed

- `calidad-por-proyecto`: NC, Auditorías y Documentos ahora están aislados por Centro de Costos. Cambiar de CC muestra datos del proyecto seleccionado, no del tenant completo.

## Impact

- `apps/calidad/src/main.ts` — 11 endpoints modificados
- `apps/app-shell/src/views/CalidadView.tsx` — deps de useCallback + props a sub-componentes

## Commit

`745f561` — 2026-06-30

## Nota SDD

*Este change se implementó fuera del flujo SDD estándar (sin spec previo ni tests-first). Se documenta retroactivamente conforme al procedimiento acordado (Opción A).*
