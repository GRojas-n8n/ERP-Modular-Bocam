## Context

`packages/auth-middleware` declara `"main": "dist/index.js"` en su `package.json`, pero **ningún servicio real lo importa por ese nombre de paquete**. Cada microservicio (`compras`, `asistente` vía sus propias reglas, etc.) importa el middleware por **ruta relativa directa al código fuente**:

```ts
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
```

Y el `tsconfig.json` de cada servicio incluye explícitamente esa carpeta en su propia compilación:

```json
"include": ["src/**/*", "../../packages/auth-middleware/src/**/*", ...]
```

Esto significa que `packages/auth-middleware/dist/` (el que apuntaría `main`) **no existe en ningún entorno real** (confirmado en el contenedor `bocam-vps-compras` en producción) y es irrelevante — cada servicio recompila el `.ts` del middleware como parte de su propio build. Por eso el fix en `middleware.ts` no requiere ningún paso de build adicional del paquete: toma efecto en el próximo build/deploy normal de cada servicio.

Separado de esto, `packages/auth-middleware/src/` tiene comiteados `middleware.js`/`middleware.d.ts`/`index.js`/etc. — artefactos de una compilación vieja (`tsc` corrido alguna vez dentro del paquete) que **no los usa ningún servicio real** (todos importan el `.ts` por ruta relativa, y Node/TS-Node resuelven `.ts` antes que un `.js` sin extensión explícita salvo que alguien importe por el nombre del paquete, cosa que no ocurre en código real, solo en un ejemplo de JSDoc). Es el mismo patrón de riesgo ya documentado como gotcha del proyecto ("paquetes compilados junto a fuente .ts pueden desincronizarse silenciosamente") — inerte hoy, pero se corrige por consistencia ya que está trackeado en git con el mismo bug.

## Goals / Non-Goals

**Goals:**
- Los 4 puntos donde el código compara contra `'finance'` (inglés) deben comparar contra `'finanzas'` (español, el rol real).
- `requireProjectAccess()` debe tratar `'finanzas'` como rol de nivel tenant, igual que `admin`/`superintendent`/`procurement`, en todos los microservicios que lo usan (efecto transitivo, no requiere tocar cada servicio individualmente).

**Non-Goals:**
- No se reorganiza el paquete `auth-middleware` para que su `dist/` sea real ni se cambia el patrón de import relativo — es una decisión de arquitectura preexistente fuera de alcance de un bug-fix.
- No se toca `apps/asistente/src/routes/chat.ts:34` (comentario de rollout futuro, sin lógica activa).
- No se re-audita aquí ningún otro posible mismatch de roles fuera de `'finance'`/`'finanzas'` (ej. `'rh_manager'` vs `'personal_rh'`, ya resuelto aparte).

## Decisions

**Un solo change para los 4 puntos, con un spec por capability/archivo tocado.** Alternativa considerada: 4 changes independientes (uno por microservicio/paquete), siguiendo al pie de la letra la regla de CLAUDE.md "un spec cubre un microservicio". Se descarta por decisión explícita del usuario: es el mismo bug con el mismo root cause, descubierto en una sola investigación (mismo `grep` que ya se usó 2 veces antes para este bug) — el precedente de `fix-rol-finance-conciliar-cfdi` (17 endpoints de un archivo en un solo spec) ya estableció que agrupar por "mismo bug" es aceptable cuando el spec resultante sigue siendo verificable requirement por requirement.

**Test unitario puro para `requireProjectAccess()`, no de integración HTTP.** `packages/auth-middleware/src/middleware.test.ts` ya prueba esta función con mocks de `Request`/`Response` sin levantar ningún servidor ni base de datos (ver el test existente "requireProjectAccess rejects request without active project for project-level roles"). Se añade un caso hermano con `roles: ['finanzas']` en vez de crear un test de integración HTTP nuevo — es la forma más rápida y ya establecida de probar esta pieza específica, y es la única forma de probar el comportamiento en aislamiento del "root fix" sin atarlo a un servicio concreto.

## Risks / Trade-offs

- **[Riesgo] El fix de `requireProjectAccess()` cambia comportamiento en TODOS los microservicios a la vez**, no solo en los 4 archivos tocados directamente → cualquier endpoint protegido por `requireProjectAccess()` en cualquier servicio dejará de exigir `authorizedProjects` explícito a usuarios con rol `'finanzas'`. Mitigación: es exactamente el comportamiento ya documentado como intención en el propio comentario del código (línea 247: "Los roles de nivel Tenant... tienen acceso a todo"); no es una ampliación de alcance sino la corrección de un bug que impedía la intención original. Se verifica con el grep de tests de otros servicios que construyan tokens con rol `'finance'` para no romper ninguna expectativa existente basada en el bug.
- **[Riesgo] La limpieza de `middleware.js` es puramente cosmética** (archivo inerte) → bajo riesgo de que alguien la interprete como el fix real y de por hecho que ya se rebuildeó el paquete. Mitigación: se documenta explícitamente en el proposal que es inerte y por qué.

## Migration Plan

1. Fix en los 4 archivos (compras, asistente, auth, auth-middleware) + limpieza de `middleware.js`.
2. Tests: unitario en `packages/auth-middleware` (rápido, sin DB) + casos de integración en `compras`, `asistente` y `auth` reproduciendo 403→2xx.
3. `grep -rn "roles:\s*\['finance'\]"` sobre todo el repo (patrón ya usado 2 veces) para confirmar que ningún test de otro servicio construye tokens con el rol viejo esperando ese comportamiento específico.
4. Deploy: los 3 servicios (`compras`, `asistente`, `auth`) se reconstruyen normalmente (recompilan también el middleware compartido por la inclusión directa en su `tsconfig.json`); no hay paso de build separado para `packages/auth-middleware`.

**Rollback:** revertir el commit — son cambios de string puros, sin migración de esquema ni datos involucrados.

## Open Questions

Ninguna.
