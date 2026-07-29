## ADDED Requirements

### Requirement: CI SHALL ejecutar un smoke test de Playwright contra producción tras cada deploy exitoso
Tras un deploy exitoso al VPS, ya sea de frontend (`deploy-vps.yml`) o de backend (`deploy-vps-backend.yml`), el pipeline SHALL invocar un workflow reusable de Playwright que navegue a la URL real de producción, complete un login con credenciales provistas vía secrets, y verifique que el dashboard post-login renderiza contenido reconocible sin errores de consola no capturados.

#### Scenario: Deploy de frontend exitoso seguido de smoke test en verde
- **WHEN** `deploy-vps.yml` completa el healthcheck del contenedor y el smoke test HTTP (`curl`) existente en verde
- **THEN** se invoca el workflow reusable de smoke test de Playwright contra `https://iretum.com`, y si el login y la carga del dashboard tienen éxito, el job termina en verde

#### Scenario: Deploy de frontend exitoso pero smoke test de Playwright falla
- **WHEN** el smoke test de Playwright no logra completar el login o no encuentra el contenido esperado del dashboard tras el login (ej. timeout, selector ausente, error de consola no capturado)
- **THEN** el job de smoke test termina en rojo en GitHub Actions, sin revertir ni bloquear el deploy ya aplicado — es una señal para intervención manual, no un rollback automático

#### Scenario: Deploy de backend exitoso seguido de smoke test
- **WHEN** `deploy-vps-backend.yml` termina de desplegar y todos los servicios modificados quedan `healthy`
- **THEN** se invoca el mismo workflow reusable de smoke test de Playwright contra `https://iretum.com`, cubriendo el caso donde un cambio de backend (ej. `auth`) rompe el login aunque el frontend no haya cambiado

#### Scenario: Deploy que no dispara ningún workflow de deploy
- **WHEN** un pull request se abre o se mergea sin tocar los paths que disparan `deploy-vps.yml` ni `deploy-vps-backend.yml`
- **THEN** el smoke test de Playwright no se ejecuta (no corre en cada PR, solo tras un deploy real a producción)

### Requirement: El smoke test SHALL usar una configuración de Playwright separada de la suite E2E local
El smoke test post-deploy SHALL usar una configuración de Playwright (`apps/app-shell/playwright.smoke.config.ts`) y un directorio de specs (`apps/app-shell/test/smoke/`) independientes de la configuración y specs de la suite E2E local existente (`playwright.config.ts`, `test/e2e/`), con `baseURL` parametrizable vía variable de entorno en vez de un valor de `localhost` hardcodeado.

#### Scenario: baseURL apunta a producción en CI
- **WHEN** el workflow reusable de smoke test corre en GitHub Actions
- **THEN** Playwright usa `baseURL` derivado de una variable de entorno (`SMOKE_BASE_URL`, default `https://iretum.com`), sin requerir editar el archivo de configuración

#### Scenario: La suite E2E local no se ve afectada
- **WHEN** un desarrollador corre la suite E2E local existente (`test/e2e/*.e2e.spec.ts`) contra sus servicios locales
- **THEN** el nuevo archivo de configuración y specs de smoke test no interfieren — ambas suites usan `testDir` y `testMatch` distintos y no se ejecutan juntas por accidente

### Requirement: Las credenciales del smoke test SHALL provenir de secrets, nunca del código versionado
El email y contraseña usados por el smoke test para autenticarse SHALL leerse exclusivamente de secrets de GitHub Actions (`SMOKE_TEST_EMAIL`, `SMOKE_TEST_PASSWORD`) inyectados como variables de entorno en tiempo de ejecución, y el spec SHALL fallar de forma explícita (no en silencio) si esas variables no están definidas.

#### Scenario: Secrets no configurados
- **WHEN** el workflow de smoke test corre sin `SMOKE_TEST_EMAIL` o `SMOKE_TEST_PASSWORD` configurados como secrets del repositorio
- **THEN** el spec falla con un mensaje explícito indicando qué variable de entorno falta, en vez de intentar un login con credenciales vacías o quedarse colgado esperando un selector

#### Scenario: Credenciales nunca aparecen en logs
- **WHEN** el smoke test corre en CI, exitoso o fallido
- **THEN** ningún paso del workflow ni assertion de Playwright imprime el valor de `SMOKE_TEST_EMAIL` o `SMOKE_TEST_PASSWORD` en los logs de GitHub Actions
