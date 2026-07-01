## 1. Diagnóstico y reproducción del bug

- [x] 1.1 Identificar la race condition: `setState` (currentProjectId) se ejecutaba ANTES de `setTokens` (nuevo JWT), causando re-fetches con token viejo
- [x] 1.2 Confirmar que el selector no aparecía para usuarios con 1 solo proyecto (`projects.length > 1 = false`)
- [x] 1.3 Verificar en VPS DB: solo `admin` y `director` tenían 2 proyectos asignados en `user_project_access`

## 2. Fix TenantContext

- [x] 2.1 En `apps/app-shell/src/context/TenantContext.tsx`, función `setCurrentProjectId`: mover `setState(currentProjectId)` de antes del `try` a después del `catch`
- [x] 2.2 Agregar `return` en el bloque `catch` para no actualizar el estado si el switch falla
- [x] 2.3 Verificar que `user.projects` no se ve afectado por el cambio (solo `currentProjectId` cambia)

## 3. Fix de datos en VPS

- [x] 3.1 Confirmar que existen 2 proyectos en producción (`CIB2026033001` y `CIB2026303002`)
- [x] 3.2 Verificar que `admin` y `director` ya tenían acceso a ambos proyectos
- [x] 3.3 Insertar en `user_project_access`: asignar los 8 usuarios restantes al proyecto `CIB2026303002` (residente, compras, gt, finanzas, control-obra, rrhh, seguridad, calidad) — 8 registros creados
- [x] 3.4 Confirmar con `GET /api/v1/auth/me` que gt@bocam.com ya devuelve 2 proyectos

## 4. Tests retroactivos

- [ ] 4.1 `apps/app-shell/src/context/__tests__/TenantContext.race.test.ts` — test que simula switch-project fallido: verificar que `currentProjectId` NO cambia si `switchProjectApi` lanza
- [ ] 4.2 `apps/app-shell/src/context/__tests__/TenantContext.race.test.ts` — test que simula switch-project exitoso: verificar que el JWT se actualiza ANTES de que `currentProjectId` cambie

## 5. Commit y cierre

- [x] 5.1 Commit `745f561` — incluye `TenantContext.tsx`, `CalidadView.tsx`, `calidad/main.ts`
- [x] 5.2 Deploy en VPS — container app-shell reconstruido y healthy
- [x] 5.3 Verificar end-to-end: `switch-project` devuelve nuevo JWT con `proyecto_id` correcto

## Estado

**Código:** ✅ Completado (commit 745f561, 2026-06-30)
**Datos VPS:** ✅ Completado (2026-07-01, 8 registros insertados)
**Tests retroactivos (tasks 4.x):** ⏳ Pendiente
