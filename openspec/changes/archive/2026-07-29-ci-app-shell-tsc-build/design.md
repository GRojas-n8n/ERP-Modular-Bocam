## Context

`app-shell` es un workspace npm (`apps/app-shell`) que depende de `packages/ui-core` vía project references de TypeScript. El build de producción (`docker/Dockerfile.app-shell`) corre `npm run build -w app-shell`, cuyo script `build` ejecuta `tsc -b && vite build`. `tsc -b` resuelve las referencias de proyecto y usa caché incremental (`.tsbuildinfo`); un `tsc --noEmit` corrido suelto contra un solo `tsconfig.json` no reproduce ese mismo grafo de resolución y puede no detectar errores que sí rompen el build real (caso PR #52).

El único workflow de CI que corre en PRs es `backend-e2e.yml`. No tiene ningún paso que toque `apps/app-shell` ni `packages/ui-core` — el frontend queda completamente sin validar hasta que `deploy-vps.yml` intenta construir la imagen Docker, ya después de mergear a `main`.

## Goals / Non-Goals

**Goals:**
- Que un PR que rompe el build de TypeScript de `app-shell` falle en CI, antes de mergear.
- Usar el mismo comando (`tsc -b`) que usa el Dockerfile de producción, para que "CI en verde" implique "el build de Docker no va a fallar por TypeScript".
- Que el paso corra solo cuando es relevante (cambios en `apps/app-shell/**` o `packages/ui-core/**`), para no alargar el pipeline en PRs que no tocan frontend.

**Non-Goals:**
- No se agrega `docker compose build app-shell` completo a CI en este change — es más lento y requiere pasos adicionales (instalar Docker Buildx, cachear capas). Si `tsc -b` demuestra no ser suficiente, es un follow-up separado.
- No se agregan tests de Vitest/Playwright de `app-shell` — eso es el smoke-test post-deploy, un change distinto.
- No se toca `packages/ui-core` en sí ni su configuración de build.

## Decisions

**1. Job nuevo dentro de `backend-e2e.yml` vs. workflow nuevo dedicado.**
Se opta por un **workflow nuevo** (`frontend-build.yml`) en vez de agregar un job a `backend-e2e.yml`.
- Alternativa considerada: agregar un step/job a `backend-e2e.yml`. Rechazada porque ese workflow ya monta Postgres/RabbitMQ y corre suites largas de backend — mezclar un chequeo de frontend ahí acopla dos dominios que no comparten infraestructura ni dueño, y ralentiza el feedback de PRs que solo tocan backend (tendrían que esperar un job de frontend que no les aplica, aunque corra en paralelo igual añade ruido a la matriz de checks).
- Un workflow separado con su propio `paths:` filter (`apps/app-shell/**`, `packages/ui-core/**`) solo se dispara cuando es relevante, igual que ya hace `deploy-vps.yml` para el mismo alcance de archivos.

**2. Comando exacto: reusar el script `build` del workspace, no reinventar el comando `tsc -b`.**
El step ejecuta `npm run build -w app-shell` (el mismo script que usa el Dockerfile), no una invocación manual de `tsc -b` con flags propios. Así el chequeo de CI y el build de producción quedan garantizados a ejecutar literalmente el mismo comando — si alguien cambia el script `build` en `package.json` (agrega un flag, cambia el orden), CI lo sigue reflejando sin mantenimiento paralelo.
- Alternativa: invocar `npx tsc -b apps/app-shell` directamente en el workflow. Rechazada porque duplica lógica que ya vive en `package.json` y puede desincronizarse del script real (el mismo tipo de gap que este change busca cerrar).
- Riesgo: el script `build` de `app-shell` también corre `vite build`, que es más lento que solo `tsc -b` y no es estrictamente necesario para detectar errores de tipos. Se acepta el costo (build de Vite de un SPA es de segundos, no minutos) a cambio de la garantía de "mismo comando que producción". Si el tiempo de CI se vuelve un problema, se puede separar `tsc -b` como script propio (`typecheck:build`) reusado por ambos.

**3. `paths:` filter igual al de `deploy-vps.yml`.**
Se reusa la misma lista de paths (`apps/app-shell/**`, `packages/ui-core/**`, `docker/Dockerfile.app-shell`) que ya usa `deploy-vps.yml` para decidir cuándo el frontend cambió, evitando definir un criterio distinto que pueda divergir.

## Risks / Trade-offs

- **[Riesgo] `tsc -b` usa caché incremental (`.tsbuildinfo`) — en un runner de CI limpio (sin caché previo) el build es siempre "frío", lo cual es en realidad más estricto que el build local de un dev con caché tibia, no menos.** → No requiere mitigación; es el comportamiento deseado (falso-negativo por caché es el problema original, no el nuevo).
- **[Riesgo] Un workflow nuevo con `paths:` filter puede no dispararse en un PR que modifica algo relevante fuera de esa lista (ej. un `tsconfig.json` raíz compartido).** → Mitigación: la lista de paths ya está validada porque es la misma que usa `deploy-vps.yml` en producción hace tiempo; si esa lista tuviera un gap, ya afectaría también al deploy real, así que es un riesgo preexistente y no introducido por este change.
- **[Trade-off] Este check no reemplaza un `docker build` real — errores específicos del entorno de imagen (versión de Node distinta, dependencias nativas) seguirían sin detectarse en CI.** → Aceptado como Non-Goal; el incidente original (PR #52) fue puramente de tipos de TypeScript, que sí queda cubierto.

## Migration Plan

1. Crear `.github/workflows/frontend-build.yml` con el job de `tsc -b` (vía `npm run build -w app-shell`).
2. Verificar en una rama de prueba que el workflow se dispara correctamente con un cambio en `apps/app-shell/**` y que falla si se introduce un error de tipos deliberado.
3. Mergear a `main`. No requiere rollback especial: si el workflow da falsos positivos, se puede desactivar quitando el trigger o el archivo sin afectar `backend-e2e.yml` ni `deploy-vps.yml`.
4. Actualizar la memoria `gap-ci-no-valida-build-app-shell.md` marcándola resuelta una vez mergeado y verificado con un PR real.

## Open Questions

- Ninguna bloqueante. Posible follow-up (fuera de alcance): evaluar si conviene además correr `docker compose build app-shell` en CI para PRs que tocan `docker/Dockerfile.app-shell` directamente (cambios al Dockerfile no son detectados por `tsc -b`).
