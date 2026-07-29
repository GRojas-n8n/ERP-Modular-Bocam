## Why

El único workflow de CI que corre en cada PR (`backend-e2e.yml`) valida los microservicios backend pero nunca compila `app-shell` (el frontend). El build real de producción usa `tsc -b` vía `docker/Dockerfile.app-shell` (modo build de proyectos compuestos), que es más estricto que un `tsc --noEmit` suelto. Esto ya causó un incidente real: el PR #52 pasó CI en verde y aun así `docker compose build app-shell` falló en el VPS con 3 errores de TypeScript, detectados solo hasta el momento del deploy. Sin este chequeo en CI, cualquier PR que toque `apps/app-shell` o `packages/ui-core` puede volver a romper el build de Docker sin que nadie lo note antes de mergear.

## What Changes

- Agregar un paso de type-check `tsc -b` para `app-shell` al workflow de CI que corre en cada PR, usando el mismo comando que ejecuta el Dockerfile de producción (`npm run build -w app-shell` o el `tsc -b` equivalente), no `tsc --noEmit`.
- El paso debe fallar el PR si `tsc -b` reporta errores, igual que ya ocurre hoy con los `tsc --noEmit` de los microservicios backend en `backend-e2e.yml`.
- Alcance mínimo: solo el paso de TypeScript build de `app-shell` (y sus dependencias de workspace como `packages/ui-core`, que comparte el mismo build de proyectos compuestos). Un `docker build` completo de la imagen queda fuera de este change (ver Impact).

## Capabilities

### New Capabilities
- `ci-app-shell-build-check`: chequeo de CI que ejecuta `tsc -b` sobre `app-shell` (y sus referencias de proyecto en `packages/ui-core`) en cada pull request, replicando el comando real que usa `docker/Dockerfile.app-shell` para que un build roto de TypeScript falle el PR antes de mergear a `main`.

### Modified Capabilities
(ninguna — no existe spec previo para este chequeo de CI)

## Impact

- **Afecta:** `.github/workflows/backend-e2e.yml` (o un workflow nuevo dedicado a frontend si se prefiere separar del job backend) — se agrega un job/step nuevo.
- **No afecta:** código de `app-shell` en sí, `packages/ui-core`, ni el flujo de deploy (`deploy-vps.yml`), que seguirá haciendo su propio `docker compose build app-shell` post-merge sin cambios.
- **Fuera de alcance:** correr `docker compose build app-shell` completo en CI (más lento, requiere registry o build multi-stage en el runner) — se deja como posible follow-up si `tsc -b` solo no es suficiente para prevenir regresiones futuras del mismo tipo.
- **Dependencias:** ninguna nueva; usa Node/npm ya presentes en el runner de `backend-e2e.yml`.
