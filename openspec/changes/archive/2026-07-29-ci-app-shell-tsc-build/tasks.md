## 1. Workflow de CI

- [x] 1.1 Crear `.github/workflows/frontend-build.yml`: trigger en `pull_request` con `paths` = `apps/app-shell/**`, `packages/ui-core/**`, `docker/Dockerfile.app-shell` (misma lista que usa `deploy-vps.yml`).
- [x] 1.2 Job que hace checkout, `actions/setup-node@v4` (Node 20, cache npm), `npm ci`, y luego `npm run build -w app-shell` (ejecuta `tsc -b && vite build`, el mismo script que usa el Dockerfile de producción).
- [x] 1.3 Confirmar que el job falla (exit code distinto de 0) cuando `tsc -b` reporta errores, sin pasos adicionales que enmascaren el código de salida.

## 2. Verificación

- [x] 2.1 Introducir un error de tipos deliberado en `apps/app-shell/src/` y confirmar que `npm run build -w app-shell` (el comando exacto del workflow) falla con código distinto de cero — verificado localmente (`error TS2322`, `npm error code 2`, `vite build` no llega a correr por el `&&`). Revertido sin dejar rastro en el working tree.
- [x] 2.2 Confirmar que el mismo comando pasa en verde sin el error — verificado localmente (`✓ built in ...`) antes y después del probe.
- [x] 2.3 Confirmado en GitHub Actions con el PR #96 (que solo toca `openspec/` y `.github/workflows/frontend-build.yml`, ninguno de los paths vigilados): el check `Frontend Build (app-shell)` no aparece en `gh pr checks`, solo corre `backend-e2e` (pasó en verde, 2m28s).

## 3. Cierre

- [x] 3.1 Mergear el change a `main` — PR #96 (squash-merge, commit 4a01e9e).
- [x] 3.2 Actualizar la memoria `gap-ci-no-valida-build-app-shell.md` marcando el gap como resuelto, referenciando este change.
- [x] 3.3 Archivar el change en OpenSpec (`openspec/changes/archive/`).
