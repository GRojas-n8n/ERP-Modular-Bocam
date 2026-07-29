## Why

`deploy-vps.yml` ya verifica el contenedor `healthy` y hace un `curl` que solo confirma que `https://iretum.com` responde `200`. Eso no detecta un deploy roto en el sentido que más ha importado hasta ahora en este repo: un bundle de JS que carga pero falla al hidratar, un login que devuelve 200 en el HTML estático pero cuelga contra el backend real, o una vista en blanco por un error de React no capturado — exactamente el tipo de regresión que ya se vio manualmente en sesiones anteriores (ver memoria `patron-verificacion-e2e-local-2026-07-14`, que documenta cómo se verificó un flujo a mano con Playwright). `deploy-vps-backend.yml` no tiene ningún smoke test HTTP: solo espera que los 13 contenedores queden `healthy`, lo cual no prueba que el login o un endpoint de dashboard realmente respondan bien end-to-end tras el deploy. Ya existe `apps/app-shell/playwright.config.ts` con specs `*.e2e.spec.ts`, pero está configurado únicamente para verificación manual local (`baseURL: http://localhost:3000`, servicios levantados a mano) — nada de eso corre automáticamente contra producción hoy.

## What Changes

- Agregar una config de Playwright separada para smoke test contra producción (`apps/app-shell/playwright.smoke.config.ts`), con `baseURL` configurable vía variable de entorno (`https://iretum.com` en CI) en vez del hardcodeado `localhost:3000` de la config existente.
- Agregar un spec de smoke test mínimo (login con un usuario de prueba dedicado + verificar que el dashboard post-login renderiza un elemento clave, sin errores de consola) — no reemplaza la suite E2E local existente, es un archivo nuevo y deliberadamente pequeño.
- Agregar un job al final de `deploy-vps.yml` que instale Playwright y corra ese smoke test contra `https://iretum.com` después del paso de smoke test HTTP (`curl`) existente, y falle el workflow (sin revertir el deploy automáticamente) si el smoke test no pasa.
- `deploy-vps-backend.yml` dispara el mismo job de smoke test al final de su propio flujo (ambos workflows comparten el grupo de concurrencia `deploy-vps` y el mismo dominio real) — se decide en design.md si es un job compartido invocado por ambos workflows o duplicado.
- **BREAKING**: ninguno — es un chequeo adicional, no cambia comportamiento de deploy existente salvo que ahora un deploy puede reportarse como fallido en GitHub Actions aunque el contenedor haya quedado healthy (visibilidad nueva, no un cambio de infraestructura).

## Capabilities

### New Capabilities
- `ci-playwright-smoke-post-deploy`: config y spec de Playwright para smoke test contra producción, más el paso de CI que lo ejecuta automáticamente al final de un deploy exitoso (frontend o backend) y falla el workflow si el flujo crítico (login + carga de dashboard) no funciona contra `https://iretum.com`.

### Modified Capabilities
(ninguna — no cambia el comportamiento de despliegue documentado en `despliegue-completo-microservicios`, solo agrega verificación automática después de que ese proceso ya terminó)

## Impact

- **Nuevo:** `apps/app-shell/playwright.smoke.config.ts`, `apps/app-shell/test/smoke/post-deploy.smoke.spec.ts` (nombre exacto a definir en tasks.md), un step/job nuevo en `.github/workflows/deploy-vps.yml` y `.github/workflows/deploy-vps-backend.yml`.
- **Requiere:** un usuario de prueba dedicado en producción con permisos mínimos de solo lectura para el login del smoke test, y sus credenciales como secret de GitHub (`SMOKE_TEST_USER` / `SMOKE_TEST_PASSWORD`) — decisión de qué usuario y cómo aprovisionarlo se resuelve en design.md, dado que los 13 usuarios reales documentados en memoria (`production-test-users`) son cuentas de negocio reales, no cuentas de servicio para CI.
- **No afecta:** el flujo de deploy existente (SSH, `git pull`, `docker compose build/up`, healthcheck) — el smoke test corre después y solo puede fallar el workflow, no el deploy ya aplicado.
- **Fuera de alcance:** rollback automático si el smoke test falla (el deploy ya se aplicó; un smoke test rojo es una alerta para intervención manual, no un trigger de rollback automatizado) y cobertura de flujos de negocio más allá de login + carga de dashboard (eso es responsabilidad de la suite E2E local existente, no de un smoke test post-deploy que debe ser rápido).
