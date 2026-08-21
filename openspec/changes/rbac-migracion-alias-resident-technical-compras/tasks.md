## 1. Verificación previa

- [ ] 1.1 Confirmar con grep fresco sobre `apps/*/src` que la lista de 25
      ocurrencias de `resident`/`technical` en `requireRoles(...)` (documentada
      en `design.md`) sigue siendo exhaustiva y no cambió desde la
      investigación (nadie agregó/quitó un `requireRoles` en `compras`,
      `almacen`, `gerencia-tecnica` o `finanzas` mientras tanto).
- [ ] 1.2 Confirmar que `compras` (alias de `procurement`) sigue sin aparecer
      en ningún `requireRoles` del repo — si apareciera, agregar esa línea al
      alcance del paso 3 antes de continuar.

## 2. Tests que reproducen el gap (deben fallar en rojo antes del fix)

- [ ] 2.1 Nuevo test en `packages/roles/src/catalogo.test.ts`: un rol
      `estado: 'alias'` que ya no aparece en `rolesExigidosPorBackend()` SHALL
      fallar la suite (guardián simétrico al de `sin-backend`). Confirmar que
      pasa en verde hoy (ningún alias está huérfano todavía, porque el fix aún
      no quitó las referencias del backend) — este test se queda en verde
      permanentemente tras el fix, no reproduce el bug actual por sí solo.
- [ ] 2.2 Actualizar `apps/auth/src/validation/schemas/admin-users.roles.test.ts`:
      el caso "editar acepta `resident`" debe reescribirse para esperar
      rechazo — confirmar que falla en rojo contra el código actual (hoy
      `resident` sigue siendo `estado: 'alias'` y se acepta al editar).
- [ ] 2.3 Nuevo test en `apps/auth/src/main.ts` (o su suite de integración
      existente para `POST /register` / `POST /admin/users`): un alta sin
      `roles` explícito SHALL crear el usuario con `rol_global: ['residencia']`,
      no `['resident']`. Confirmar que falla en rojo contra el default actual.
- [ ] 2.4 Escribir (sin ejecutar destructivamente) el script
      `apps/auth/scripts/migrar-roles-alias.ts` con su propio smoke test o
      modo `--dry-run` que reporte cuántas filas tocaría, para poder
      verificarlo contra una BD de desarrollo antes de correrlo contra datos
      reales.

## 3. Fix — backend (`requireRoles`)

- [ ] 3.1 `apps/almacen/src/main.ts:216` — quitar `'resident'` (ya incluye
      `'residencia'`).
- [ ] 3.2 `apps/compras/src/main.ts` — quitar `'resident'` de las 19 líneas
      que ya incluyen `'residencia'` (493, 592, 667, 1025, 1113, 1307, 2468,
      3431, 3592, 3728, 4338, 4373, 5346, 5413, 5682, 5784, 5840, 5897, 6384).
- [ ] 3.3 `apps/compras/src/main.ts:4123` — sustituir `'resident'` por
      `'residencia'` (único caso sin el canónico ya presente).
- [ ] 3.4 `apps/gerencia-tecnica/src/main.ts` — quitar `'technical'` de las 4
      líneas que ya incluyen `'gerencia_tecnica'` (269, 435, 519, 1718).
- [ ] 3.5 `apps/finanzas/src/main.ts:1951` — quitar `'technical'` (ya incluye
      `'gerencia_tecnica'`).

## 4. Fix — alta de usuarios y seed

- [ ] 4.1 `apps/auth/src/main.ts:391` — cambiar el default de
      `rol_global: roles || ['resident']` a `['residencia']` en
      `POST /api/v1/auth/register`.
- [ ] 4.2 `apps/auth/src/main.ts:946` — mismo cambio de default en
      `POST /admin/users`.
- [ ] 4.3 `apps/auth/src/validation/schemas/register.schema.ts` — actualizar
      el comentario que documenta el default `roles || ['resident']`.
- [ ] 4.4 `apps/auth/prisma/seed.ts` (líneas 16, 147, 156) — cambiar el rol del
      usuario semilla de `'resident'` a `'residencia'`.

## 5. Fix — migración de datos

- [ ] 5.1 Terminar `apps/auth/scripts/migrar-roles-alias.ts` (patrón de
      `apps/personal/scripts/migrar-config-nomina-proyecto.ts`): recorrer
      usuarios con `resident`, `compras` o `technical` en `rol_global`,
      reescribir esas entradas a `residencia`, `procurement`,
      `gerencia_tecnica` respectivamente, preservando el resto del array y sin
      duplicar si el canónico ya estuviera presente. Loguear conteo por alias.
- [ ] 5.2 Agregar el script `migrar:roles-alias` a `apps/auth/package.json`,
      igual que `migrar:config-nomina` en `apps/personal/package.json`.
- [ ] 5.3 Correrlo contra la BD local/desarrollo dos veces seguidas y
      confirmar que la segunda corrida reporta 0 filas migradas (idempotencia).

## 6. Fix — catálogo

- [ ] 6.1 `packages/roles/src/index.ts` — retirar por completo las entradas
      `resident`, `compras` y `technical` de `ROLES`.

## 7. Verificación

- [ ] 7.1 Los tests de la sección 2 pasan en verde tras el fix (2.1, 2.2, 2.3).
- [ ] 7.2 Suite completa `packages/roles/src/catalogo.test.ts` en verde.
- [ ] 7.3 Suite completa de `apps/auth` (validación + integración tocadas) en
      verde.
- [ ] 7.4 `npx tsc --noEmit` limpio en `packages/roles` y `apps/auth`.
- [ ] 7.5 Grep de confirmación: `resident`, `compras` (como rol) y `technical`
      ya no aparecen en ningún `requireRoles(...)` de `apps/*/src`, salvo en
      comentarios/tests que documenten el retiro.
- [ ] 7.6 Smoke test manual o de integración: login con un usuario cuyo
      `rol_global` haya sido migrado de `resident` a `residencia`, confirmar
      acceso a un endpoint de `apps/compras` antes solo alcanzable por el
      alias.

## 8. Despliegue y cierre

- [ ] 8.1 Branch `fix/rbac-migracion-alias-resident-technical-compras`,
      commits con tests + fix (puede dividirse por sección 3-6, pero el PR se
      revisa como una sola unidad — mismo root cause).
- [ ] 8.2 PR contra `main` referenciando este change de OpenSpec, incluyendo
      el plan de despliegue de `design.md` (orden: código → script de
      migración → verificación de 0 filas con alias).
- [ ] 8.3 Tras merge: desplegar los 5 servicios afectados
      (`auth`, `compras`, `almacen`, `gerencia-tecnica`, `finanzas`), correr
      `migrar:roles-alias` en el VPS, y verificar
      `SELECT count(*) FROM users WHERE rol_global && ARRAY['resident','compras','technical'];`
      = 0.
- [ ] 8.4 Verificación en producción (login real de un usuario migrado) y
      archivar el change (`openspec archive`).
