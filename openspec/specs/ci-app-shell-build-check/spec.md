# ci-app-shell-build-check Specification

## Purpose
TBD - created by archiving change ci-app-shell-tsc-build. Update Purpose after archive.
## Requirements
### Requirement: CI valida el build de TypeScript de app-shell en cada PR
El sistema de CI SHALL ejecutar el mismo comando de build de TypeScript que usa `docker/Dockerfile.app-shell` (`tsc -b` vía el script `build` del workspace `app-shell`) en cada pull request que modifique `apps/app-shell/**`, `packages/ui-core/**` o `docker/Dockerfile.app-shell`, y SHALL fallar el check si el comando termina con código de salida distinto de cero.

#### Scenario: PR con error de tipos en app-shell
- **WHEN** un pull request modifica un archivo dentro de `apps/app-shell/**` e introduce un error de TypeScript que `tsc -b` detecta (ej. una propiedad no-nula usada como si pudiera ser `undefined`)
- **THEN** el check de CI correspondiente falla y el PR queda bloqueado para merge hasta corregir el error

#### Scenario: PR con error de tipos en ui-core consumido por app-shell
- **WHEN** un pull request modifica `packages/ui-core/**` de forma que rompe la compilación de un componente consumido por `apps/app-shell` vía project references
- **THEN** el check de CI falla, igual que si el error estuviera directamente en `apps/app-shell`

#### Scenario: PR sin cambios en app-shell ni ui-core
- **WHEN** un pull request solo modifica archivos dentro de un microservicio backend (ej. `apps/compras/**`) sin tocar `apps/app-shell/**`, `packages/ui-core/**` ni `docker/Dockerfile.app-shell`
- **THEN** el workflow de build de `app-shell` no se dispara para ese PR

#### Scenario: PR que compila correctamente
- **WHEN** un pull request modifica `apps/app-shell/**` y `tsc -b` no reporta errores
- **THEN** el check de CI pasa en verde y no bloquea el merge

