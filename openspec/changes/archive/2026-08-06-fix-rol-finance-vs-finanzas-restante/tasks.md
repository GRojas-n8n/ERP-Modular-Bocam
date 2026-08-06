## 1. Test unitario de requireProjectAccess (rojo primero)

- [x] 1.1 En `packages/auth-middleware/src/middleware.test.ts`, agregar el caso `requireProjectAccess allows tenant-level access for role finanzas` (hermano del test existente `requireProjectAccess rejects request without active project for project-level roles`): `securityContext.roles: ['finanzas']`, `proyectoId: ''`, `authorizedProjects: []` → debe llamar a `next()` sin responder 403.
- [x] 1.2 Correr `npm test -w @bocam/auth-middleware` y confirmar que el nuevo caso falla en rojo (403) contra el código actual. Confirmado.

## 2. Test de integración en compras (rojo primero)

- [x] 2.1 Agregar un test de integración en `apps/compras/test/integration/` (`rbac-rol-finanzas.integration.test.ts`) que reproduzca 403 con rol `'finanzas'` en los 5 endpoints listados en la spec `control-acceso-rol-finanzas-compras` antes del fix. Confirmado en rojo (403 en el primer endpoint).

## 3. Test de integración en asistente (rojo primero)

- [x] 3.1 Agregar un test de integración en `apps/asistente/test/integration/` (`rbac-rol-finanzas-alertas-predictivas.integration.test.ts`) que reproduzca 403 con rol `'finanzas'` en `GET /api/v1/asistente/alertas-predictivas` antes del fix. Confirmado en rojo.

## 4. Test de integración en auth (rojo primero)

- [x] 4.1 Agregar un test de integración en `apps/auth/test/integration/` (`rbac-rol-finanzas-switch-project.integration.test.ts`) que reproduzca 403 al hacer `POST /api/v1/auth/switch-project` con `rol_global: ['finanzas']` y sin `proyectos_acceso` explícito para el proyecto destino, antes del fix. Confirmado en rojo.

## 5. Fix

- [x] 5.1 `packages/auth-middleware/src/middleware.ts`: cambiar `'finance'` → `'finanzas'` en `tenantLevelRoles` (línea ~248).
- [x] 5.2 `packages/auth-middleware/src/middleware.js`: mismo cambio, por consistencia (artefacto inerte, no usado por servicios reales — ver `design.md`).
- [x] 5.3 `apps/compras/src/main.ts`: cambiar `'finance'` → `'finanzas'` en los 5 `requireRoles(...)` (líneas 1630, 1698, 2175, 2207, 2350).
- [x] 5.4 `apps/asistente/src/routes/alertas-predictivas.ts`: cambiar `'finance'` → `'finanzas'` (línea 55).
- [x] 5.5 `apps/auth/src/main.ts`: cambiar `'finance'` → `'finanzas'` en el arreglo de `isGlobalRole` (línea 729).
- [x] 5.6 `grep -rn "roles:\s*\['finance'\]"` y `grep -rn "rol_global:\s*\['finance'\]"` sobre `apps/**/test/**/*.ts` — sin resultados, ningún test depende del rol viejo. Único `'finance'` restante en todo `apps/**/src`: el comentario de `chat.ts:34`, fuera de alcance (ver proposal).

## 6. Verificación en verde

- [x] 6.1 Correr `npm test -w @bocam/auth-middleware` y confirmar el caso de la sección 1 en verde. 4/4 tests OK.
- [x] 6.2 Correr los tests de integración de las secciones 2, 3 y 4 y confirmar verde. Los 3 en verde (compras: 5/5 endpoints; asistente: 200; auth: 200).
- [x] 6.3 Suite completa: `npm test -w @bocam/auth` (24/24 unit tests OK) + `tsc --noEmit` limpio en `compras`, `asistente` y `auth` (sin script `test` unificado en compras/asistente para correr la suite completa localmente, per gotcha ya documentado del repo).

## 7. Cierre

- [x] 7.1 Commit directo a `main` (`932fc55`), sin PR.
- [x] 7.2 Verificado en VPS real: el push (al tocar `packages/auth-middleware/**`) disparó automáticamente `deploy-vps-backend.yml`, que reconstruyó los 13 microservicios por seguridad (regla ya documentada del workflow: un cambio en un package compartido reconstruye todos). Run [31058488514](https://github.com/GRojas-n8n/ERP-Modular-Bocam/actions/runs/31058488514) exitoso (13m52s) + smoke test Playwright en verde. Verificado además por línea de comandos contra los contenedores reales: `bocam-vps-compras` (0 `'finance'`, 53 `'finanzas'` en `main.js`; middleware compartido recompilado con `'finanzas'` en `tenantLevelRoles`), `bocam-vps-asistente` (0 `'finance'`, 3 `'finanzas'` en `alertas-predictivas.js`), `bocam-vps-auth` (0 `'finance'`, `'finanzas'` presente en `main.js`).
- [x] 7.3 Archivar el change en OpenSpec una vez verificado en VPS real.
