## 1. Config y spec de Playwright para smoke test

- [x] 1.1 Crear `apps/app-shell/playwright.smoke.config.ts`: `testDir: './test/smoke'`, `testMatch: '**/*.smoke.spec.ts'`, `baseURL` desde `process.env.SMOKE_BASE_URL` (default `https://iretum.com`), timeout acotado, `retries: 1`.
- [x] 1.2 Crear `apps/app-shell/test/smoke/post-deploy.smoke.spec.ts`: lee `SMOKE_TEST_EMAIL`/`SMOKE_TEST_PASSWORD` de `process.env`, falla explícitamente con mensaje claro si falta alguna antes de intentar el login.
- [x] 1.3 El spec navega a `/`, completa el formulario de login, espera la redirección al dashboard, y verifica un elemento clave del dashboard (ej. el shell del layout autenticado) visible.
- [x] 1.4 El spec registra listeners de errores de consola/página (`page.on('console')`, `page.on('pageerror')`) y falla si aparece algún error no esperado durante el flujo.
- [x] 1.5 Confirmar que ningún `console.log`/assertion del spec imprime el valor de las credenciales.

## 2. Workflow reusable de smoke test

- [x] 2.1 Crear `.github/workflows/smoke-test-playwright.yml` con `on: workflow_call`, inputs (`base_url`, default `https://iretum.com`) y `secrets: SMOKE_TEST_EMAIL, SMOKE_TEST_PASSWORD` declarados como requeridos.
- [x] 2.2 Steps: checkout, setup Node, `npm ci` en `apps/app-shell`, `npx playwright install --with-deps chromium`, correr `npx playwright test --config=playwright.smoke.config.ts`.
- [x] 2.3 Subir el reporte de Playwright (trace/screenshot on failure) como artifact del workflow run, para poder inspeccionar un fallo sin reproducirlo localmente.

## 3. Integración en los workflows de deploy

- [x] 3.1 Agregar un job final a `.github/workflows/deploy-vps.yml` que invoque `smoke-test-playwright.yml` vía `uses:` + `secrets: inherit`, después del step "Smoke test HTTP" existente.
- [x] 3.2 Agregar el mismo job final a `.github/workflows/deploy-vps-backend.yml`, después del step que confirma que todos los servicios desplegados quedaron `healthy`.
- [x] 3.3 Confirmar que ambos jobs nuevos respetan el `concurrency.group: deploy-vps` ya existente (no deberían necesitar cambiarlo, solo correr como parte del mismo workflow run) — el `concurrency` está declarado a nivel de workflow (no de job) en ambos archivos, así que el job `smoke-test` nuevo hereda el mismo grupo automáticamente sin cambios adicionales. Validado con `js-yaml` que los 3 workflows parsean correctamente.

## 4. Aprovisionamiento de credenciales (manual, fuera del código)

- [x] 4.1 Elegir, junto con el usuario, cuál de los usuarios reales documentados en memoria `production-test-users` se usa para el smoke test (recomendación: evitar el rol `admin`). Decidido: `calidad@bocam.com.mx` (rol `calidad`).
- [x] 4.2 Confirmar que ese usuario puede loguearse y ver un dashboard hoy en `https://iretum.com` (verificación manual, una vez). Confirmado por el usuario: login exitoso con la contraseña nueva.
- [x] 4.3 Configurar `SMOKE_TEST_EMAIL` y `SMOKE_TEST_PASSWORD` como secrets del repositorio en GitHub (Settings → Secrets → Actions) — a cargo del usuario, no se commitea ni se pega en el chat. Verificado vía `gh secret list`: ambos secrets existen en el repo (2026-07-29).

## 5. Verificación

- [ ] 5.1 Correr el smoke test localmente contra `https://iretum.com` con `SMOKE_BASE_URL`/`SMOKE_TEST_EMAIL`/`SMOKE_TEST_PASSWORD` en el entorno local (no en archivos versionados) y confirmar que pasa en verde.
- [x] 5.2 Simular un fallo (ej. selector inexistente o `SMOKE_BASE_URL` inválida) y confirmar que el workflow se reporta en rojo con un mensaje útil; revertir la simulación. Verificado localmente: `SMOKE_BASE_URL=https://example.com` produce timeout explícito en `#login-email-input`, exit code distinto de cero, trace + screenshot generados. Pendiente confirmar el mismo comportamiento corriendo dentro de GitHub Actions (se hace junto con 5.3/5.4).
- [ ] 5.3 Provocar un deploy real (push trivial a `apps/app-shell/**`) y confirmar en GitHub Actions que el job de smoke test corre después del deploy y pasa en verde.
- [ ] 5.4 Provocar un deploy real de backend (push trivial a un `apps/<servicio>/**`) y confirmar que el mismo smoke test corre tras `deploy-vps-backend.yml`.

## 6. Cierre

- [ ] 6.1 Mergear el change a `main`.
- [ ] 6.2 Guardar en memoria el resultado (workflow verificado con deploy real o no) siguiendo el mismo patrón que `fix-cicd-backend-deploy-automatizado-2026-07-29`.
- [ ] 6.3 Archivar el change en OpenSpec.
