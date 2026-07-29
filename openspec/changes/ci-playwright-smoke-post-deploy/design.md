## Context

`deploy-vps.yml` termina con un `curl -o /dev/null -w "%{http_code}"` contra `https://iretum.com` que solo prueba que el servidor responde `200` — no ejecuta JS, no hace login, no prueba ninguna llamada a la API real. `deploy-vps-backend.yml` no tiene ningún smoke test HTTP, solo espera que los 13 contenedores queden `healthy` vía `docker inspect`. Ninguno de los dos detectaría hoy un deploy que deja el HTML estático sirviendo 200 pero con el bundle de React roto, o un login que cuelga contra un microservicio de `auth` recién desplegado.

Ya existe `apps/app-shell/playwright.config.ts` + `apps/app-shell/test/e2e/*.e2e.spec.ts` para verificación manual local (ver memoria `patron-verificacion-e2e-local-2026-07-14` y skill `run-app-shell`), con `baseURL: http://localhost:3000` fijo y servicios levantados a mano. Ese flujo no es apto para CI tal cual: apunta a local, no a producción, y su suite completa es más pesada de lo que un smoke test post-deploy debería ser (debe ser rápido y cubrir solo el camino crítico).

Se decidió (ver pregunta al usuario) reutilizar una cuenta real ya existente de las 13 documentadas en memoria `production-test-users`, en vez de aprovisionar una cuenta dedicada de solo-CI. Las contraseñas reales de esas cuentas no están en el repo ni en memoria — el usuario deberá configurar el email y contraseña elegidos como secrets de GitHub manualmente; este change no las conoce ni las necesita conocer para implementarse.

## Goals / Non-Goals

**Goals:**
- Detectar automáticamente, tras cada deploy exitoso (frontend o backend), si el flujo login → dashboard se rompió, con una corrida de segundos (no la suite E2E completa).
- Reusar Playwright (ya presente en `apps/app-shell`) en vez de introducir una herramienta nueva.
- Que el smoke test sea independiente del smoke test HTTP (`curl`) existente — se agrega, no lo reemplaza, porque el `curl` sigue siendo la señal más rápida y barata de "el servidor responde".
- Un solo spec de smoke test, compartido por ambos workflows (frontend y backend), dado que ambos deploys terminan afectando la misma app real y el mismo dominio.

**Non-Goals:**
- No aprovisionar una cuenta de servicio dedicada para CI (descartado explícitamente por el usuario en favor de reusar una cuenta real).
- No cubrir flujos de negocio más allá de login + que el dashboard post-login renderice contenido reconocible — eso sigue siendo trabajo de la suite E2E local existente.
- No rollback automático: si el smoke test falla, el deploy ya se aplicó; el workflow solo se reporta en rojo en GitHub Actions para intervención manual.
- No corre en cada PR (a diferencia de `ci-app-shell-build-check` o `ci-rls-coverage-check`) — corre únicamente después de un deploy real a producción, porque necesita el dominio real (`https://iretum.com`) para tener sentido.

## Decisions

**1. Job compartido invocado por ambos workflows (`workflow_call`), no duplicado.**
Se crea `.github/workflows/smoke-test-playwright.yml` como workflow reusable (`on: workflow_call`), invocado como job final tanto desde `deploy-vps.yml` como desde `deploy-vps-backend.yml`. Alternativa considerada: copiar los mismos steps en ambos archivos. Rechazada — ya hay precedente de mantener ambos workflows sincronizados manualmente (comparten el `concurrency.group: deploy-vps`, ver comentarios cruzados en ambos archivos) y duplicar steps de Playwright sería el mismo tipo de drift que ya se evitó con el group compartido.

**2. Credenciales del usuario real vía secrets genéricos, no hardcodeadas.**
El workflow usa `secrets.SMOKE_TEST_EMAIL` y `secrets.SMOKE_TEST_PASSWORD`, sin asumir en el código cuál de los 13 usuarios reales es. El repo no elige el usuario — lo elige quien configure el secret en GitHub. Recomendación (no forzada por el código): evitar `iretum@bocam.com.mx` (rol `admin`, mayor blast radius si el secret se filtra) y preferir un rol operativo acotado como `residencia` o `calidad`. Esta recomendación se documenta en tasks.md como parte del paso de aprovisionamiento manual, no se implementa como validación en código.
Riesgo aceptado explícitamente por el usuario: si `SMOKE_TEST_PASSWORD` se filtra (log de CI, secret mal configurado), compromete una cuenta real de negocio, no una cuenta desechable. Ver Risks.

**3. Config de Playwright separada (`playwright.smoke.config.ts`), no reutilizar `playwright.config.ts` con override de `baseURL`.**
La config existente tiene `testDir: './test/e2e'` y `testMatch: '**/*.e2e.spec.ts'`, pensada para la suite local completa. La nueva config apunta a `testDir: './test/smoke'`, con su propio `testMatch`, `timeout` más corto, y `baseURL` leído de `process.env.SMOKE_BASE_URL` (default `https://iretum.com`) en vez de hardcodeado a `localhost:3000`. Mantiene ambas suites completamente separadas: nunca se corre por accidente la suite E2E local completa contra producción, ni el smoke test contra local.

**4. Instalación de Playwright en el runner de GitHub Actions, no en el VPS.**
El smoke test corre desde el runner de CI (`ubuntu-latest`) igual que el resto de `deploy-vps.yml`/`deploy-vps-backend.yml` (que ya operan por SSH desde el runner), no dentro de un contenedor del VPS. Instala `@playwright/test` + navegador Chromium (`npx playwright install --with-deps chromium`) como paso del job. Alternativa (correr el smoke test dentro de un contenedor en el VPS) rechazada por complejidad — el runner ya tiene acceso a internet saliente hacia `https://iretum.com` igual que cualquier usuario real, no requiere estar en la red del VPS.

**5. El smoke test spec vive en `apps/app-shell` (no en `tests/` a nivel raíz).**
Aunque `tests/` es para E2E/integración entre servicios (CLAUDE.md), este smoke test es específicamente de la SPA (`app-shell`) contra producción — sigue la misma ubicación que la suite E2E local ya existente (`apps/app-shell/test/e2e`), solo en un directorio hermano (`apps/app-shell/test/smoke`) para no mezclarse con ella.

## Risks / Trade-offs

- **[Riesgo] Credenciales de una cuenta real de negocio como secret de GitHub.** → Mitigación parcial: usar un rol operativo, no `admin`; rotar la contraseña si se sospecha filtración; el secret nunca se imprime en logs (Playwright no loggea credenciales por defecto, y el workflow no debe hacer `echo` de los secrets). Riesgo residual aceptado explícitamente por el usuario al elegir esta opción en vez de una cuenta dedicada.
- **[Riesgo] Flakiness de red/timing contra producción real (a diferencia de un entorno local controlado).** → Mitigación: timeout generoso pero acotado (ej. 20s por assertion clave), un solo reintento automático (`retries: 1` en la config de smoke), y que el fallo del smoke test no bloquee reintentar el deploy manualmente — es una señal, no un gate duro sobre el propio deploy (el deploy ya se aplicó cuando el smoke test corre).
- **[Trade-off] No cubre backend individual por microservicio.** El smoke test prueba el flujo completo vía la SPA (que ya cruza frontend + `auth` + el servicio del dashboard que cargue tras login), pero no aísla qué microservicio específico falló si el login funciona pero un dashboard puntual no carga — para ese nivel de detalle sigue siendo necesario revisar logs del VPS manualmente, igual que hoy.
- **[Trade-off] Corre después del deploy ya aplicado, no antes.** Igual que el `curl` existente — es detección, no prevención. Aceptado como Non-Goal (ver arriba): un gate previo requeriría un entorno de staging separado, fuera de alcance de este change.

## Migration Plan

1. Crear `apps/app-shell/playwright.smoke.config.ts` y `apps/app-shell/test/smoke/post-deploy.smoke.spec.ts`.
2. Verificar el spec localmente contra producción real (`SMOKE_BASE_URL=https://iretum.com`, credenciales reales solo en el entorno local de quien lo pruebe, nunca commiteadas) antes de tocar CI.
3. Crear `.github/workflows/smoke-test-playwright.yml` como workflow reusable (`workflow_call`), con inputs para `base_url` y secrets pass-through para email/password.
4. Configurar en GitHub (Settings → Secrets → Actions) `SMOKE_TEST_EMAIL` y `SMOKE_TEST_PASSWORD` — paso manual, fuera del repo, a cargo del usuario (quien conoce las contraseñas reales; no se conocen ni se generan como parte de este change).
5. Agregar el job final a `deploy-vps.yml` que invoca el workflow reusable tras el smoke test HTTP existente.
6. Agregar el mismo job final a `deploy-vps-backend.yml`, tras el paso de "Todos los servicios desplegados quedaron healthy".
7. Provocar un deploy real (push trivial a `apps/app-shell/**`) y confirmar que el job de smoke test aparece y pasa en GitHub Actions.
8. Simular un fallo (ej. apuntar temporalmente `SMOKE_BASE_URL` a una URL que no resuelve, o un selector que no existe) para confirmar que el workflow efectivamente se reporta en rojo, luego revertir la simulación.

## Open Questions

- Elección final de cuál de los 13 usuarios reales usar — la queda a criterio del usuario al configurar los secrets (recomendación: evitar el rol `admin`), no bloquea la implementación de este change.
