## Why

El rol real asignado a los usuarios de Finanzas en el sistema es `'finanzas'` (español) — confirmado contra la BD real de producción y ya corregido en `apps/finanzas` (PR #76) y `apps/contabilidad` (17 endpoints, `fix-rol-finance-conciliar-cfdi`). Una investigación de seguimiento encontró que el mismo mismatch (`'finance'` en inglés, un rol que no existe) sigue presente en **4 lugares más**, descubiertos con el mismo `grep -rn "'finance'"` sobre todo el repo:

1. `apps/compras/src/main.ts` — 5 endpoints de solo lectura (detalle de OC, recepciones, documentos y calificaciones de proveedor) excluyen a Finanzas.
2. `apps/asistente/src/routes/alertas-predictivas.ts` — 1 endpoint excluye a Finanzas.
3. `apps/auth/src/main.ts` (`POST /api/v1/auth/switch-project`) — el chequeo `isGlobalRole` que permite cambiar de proyecto activo sin tener acceso explícito registrado no reconoce a Finanzas como rol global.
4. `packages/auth-middleware/src/middleware.ts` (`requireProjectAccess()`) — **el más impactante**: esta función la usa CADA microservicio del monorepo para decidir si un usuario necesita `proyecto_id` explícito o tiene acceso "nivel tenant" (a todos los proyectos). Su lista `tenantLevelRoles` incluye `'finance'` en vez de `'finanzas'`, así que hoy Finanzas es tratado como rol de nivel proyecto (necesita `authorizedProjects` explícito) en vez de nivel tenant como `admin`/`superintendent`/`procurement` — inconsistente con la intención original documentada en el propio comentario del código ("Los roles de nivel Tenant... tienen acceso a todo").

Se agrupan los 4 en un solo change (mismo bug, mismo root cause, descubiertos en la misma investigación) siguiendo el precedente de `fix-rol-finance-conciliar-cfdi` (17 endpoints de un solo archivo en un solo spec), en vez de 4 changes separados por microservicio.

## What Changes

- `apps/compras/src/main.ts`: cambiar `'finance'` → `'finanzas'` en los 5 `requireRoles(...)` (líneas ~1630, 1698, 2175, 2207, 2350).
- `apps/asistente/src/routes/alertas-predictivas.ts`: cambiar `'finance'` → `'finanzas'` en el `requireRoles(...)` de la línea 55.
- `apps/auth/src/main.ts`: cambiar `'finance'` → `'finanzas'` en el arreglo `isGlobalRole` de `POST /api/v1/auth/switch-project` (línea ~729).
- `packages/auth-middleware/src/middleware.ts`: cambiar `'finance'` → `'finanzas'` en `tenantLevelRoles` de `requireProjectAccess()` (línea ~248). Esta función se importa por ruta relativa (`../../../packages/auth-middleware/src`) directamente desde cada microservicio y se recompila como parte del build de cada uno (no hay un `dist/` propio del paquete en uso real) — el fix toma efecto en cuanto cada servicio se reconstruye, sin pasos de build adicionales.
- Limpieza menor (sin cambio de comportamiento real): `packages/auth-middleware/src/middleware.js`, un artefacto compilado obsoleto que quedó comiteado junto al `.ts` (ver gotcha de paquetes compilados junto a fuente) y que no lo usa ningún servicio real (todos importan el `.ts` por ruta relativa), pero contiene el mismo texto `'finance'` — se corrige por consistencia para no dejar una copia divergente del bug en el repo.
- **No** se toca `apps/asistente/src/routes/chat.ts:34` — es un comentario sobre un plan de rollout futuro (`requireRoles('admin')` es el único gate activo hoy), no un bug funcional.
- No es **BREAKING**: solo amplía qué roles pueden acceder (Finanzas gana acceso que hoy le falta), ningún rol pierde acceso existente.

## Capabilities

### New Capabilities
- `control-acceso-rol-finanzas-compras`: los 5 endpoints de solo lectura de OC/proveedores en `compras` reconocen el rol real `'finanzas'`.
- `control-acceso-rol-finanzas-asistente`: el endpoint de alertas predictivas en `asistente` reconoce el rol real `'finanzas'`.
- `control-acceso-rol-finanzas-cambio-proyecto`: `POST /api/v1/auth/switch-project` reconoce a Finanzas como rol global para cambiar de proyecto activo sin acceso explícito previo.
- `control-acceso-rol-finanzas-nivel-tenant`: `requireProjectAccess()` (paquete compartido `auth-middleware`, usado por todos los microservicios) trata a Finanzas como rol de nivel tenant (acceso a todos los proyectos), igual que `admin`/`superintendent`/`procurement`.

### Modified Capabilities
(ninguna — no existía spec previo que cubriera ninguno de estos 4 puntos)

## Impact

- **Código afectado**: `apps/compras/src/main.ts`, `apps/asistente/src/routes/alertas-predictivas.ts`, `apps/auth/src/main.ts`, `packages/auth-middleware/src/middleware.ts` (+ limpieza de `middleware.js`).
- **Tests**: nuevos casos de integración/unitarios que reproducen 403 (o rechazo de acceso) para rol `'finanzas'` antes del fix y confirman 2xx/acceso permitido después, uno por capability.
- **Otros microservicios**: cualquier servicio que use `requireProjectAccess()` (todos, vía `packages/auth-middleware`) se ve afectado positivamente por el fix #4 — un usuario de Finanzas con rol `'finanzas'` pero sin `authorizedProjects` explícito dejará de recibir 403 en rutas protegidas por `requireProjectAccess()` en cualquier servicio, no solo en los 4 archivos tocados directamente.
- **Riesgo de regresión**: bajo — son cambios de un solo string por línea, sin lógica nueva; el guard de "grep de tests en otros servicios que usen el rol viejo" (patrón ya documentado de fixes anteriores de este mismo bug) se aplica antes de cerrar.
