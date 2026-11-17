## 1. Verificación previa

- [x] 1.1 Confirmar con grep fresco sobre `apps/*/src` que la lista de 25
      ocurrencias de `resident`/`technical` en `requireRoles(...)` (documentada
      en `design.md`) sigue siendo exhaustiva y no cambió desde la
      investigación (nadie agregó/quitó un `requireRoles` en `compras`,
      `almacen`, `gerencia-tecnica` o `finanzas` mientras tanto).
- [x] 1.2 Confirmar que `compras` (alias de `procurement`) sigue sin aparecer
      en ningún `requireRoles` del repo — si apareciera, agregar esa línea al
      alcance del paso 3 antes de continuar.
- [x] 1.3 Auditoría exhaustiva (más allá de `requireRoles`) de todo lugar del
      repo donde `resident`/`technical`/`compras` aparecen como valor de rol
      literal: reveló que el alias también leaked al frontend de
      `apps/app-shell` (permiso `isResident`, menú `Layout.tsx`, usuario demo
      de `TenantContext.tsx`) y a ~30 fixtures de test en 6 servicios. Ver
      `proposal.md` (Impact) actualizado con la lista completa.

## 2. Tests que reproducen el gap (deben fallar en rojo antes del fix)

- [x] 2.1 Nuevo test en `packages/roles/src/catalogo.test.ts`: un rol
      `estado: 'alias'` que ya no aparece en `rolesExigidosPorBackend()` SHALL
      fallar la suite (guardián simétrico al de `sin-backend`). **Resultado:**
      falla en rojo hoy contra `compras` — ya está huérfano de backend (nunca
      lo exigió ningún `requireRoles`), reproduciendo ese caso específico del
      bug. `resident`/`technical` aún no aparecen como huérfanos porque el fix
      de la sección 3 todavía no quita sus referencias del backend.
- [x] 2.2 Actualizar `apps/auth/src/validation/schemas/admin-users.roles.test.ts`:
      los casos "no ofrece alias al crear" / "sí acepta alias al editar" se
      reescriben para esperar rechazo de `resident`/`compras`/`technical` en
      ambos casos. **Resultado:** falla en rojo hoy (editar sigue aceptando
      los tres, por diseño previo).
- [x] 2.3 Nuevo test de integración: un alta sin `roles` explícito SHALL crear
      el usuario con `rol_global: ['residencia']`, no `['resident']` — uno en
      `apps/auth/test/integration/validacion-zod-login-register-refresh.integration.test.ts`
      (`POST /register`) y otro en
      `apps/auth/test/integration/validacion-zod-admin-users.integration.test.ts`
      (`POST /admin/users`). **No ejecutado en este entorno** — requiere
      PostgreSQL local (`DATABASE_URL`) y Docker no está disponible aquí;
      pendiente de correr contra una BD real antes de mergear (ver sección 7).
- [x] 2.4 Escribir (sin ejecutar destructivamente) el script
      `apps/auth/scripts/migrar-roles-alias.ts` con su propio smoke test o
      modo `--dry-run` que reporte cuántas filas tocaría, para poder
      verificarlo contra una BD de desarrollo antes de correrlo contra datos
      reales. **Resultado:** escrito (sección 8); verificado que compila y
      tipa correctamente ejecutándolo con `ts-node` sin BD disponible (falla
      limpiamente en la conexión a Postgres, no en TypeScript) — no se pudo
      probar contra datos reales en este entorno (Docker no disponible).

## 3. Fix — backend (`requireRoles`)

- [x] 3.1 `apps/almacen/src/main.ts:216` — quitar `'resident'` (ya incluye
      `'residencia'`).
- [x] 3.2 `apps/compras/src/main.ts` — quitar `'resident'` de las 19 líneas
      que ya incluyen `'residencia'` (493, 592, 667, 1025, 1113, 1307, 2468,
      3431, 3592, 3728, 4338, 4373, 5346, 5413, 5682, 5784, 5840, 5897, 6384).
- [x] 3.3 `apps/compras/src/main.ts:4123` — sustituir `'resident'` por
      `'residencia'` (único caso sin el canónico ya presente).
- [x] 3.4 `apps/gerencia-tecnica/src/main.ts` — quitar `'technical'` de las 4
      líneas que ya incluyen `'gerencia_tecnica'` (269, 435, 519, 1718).
- [x] 3.5 `apps/finanzas/src/main.ts:1951` — quitar `'technical'` (ya incluye
      `'gerencia_tecnica'`).
- [x] 3.6 (hallazgo durante verificación, no anticipado por la auditoría de
      1.3) `apps/gerencia-tecnica/src/main.ts:1055-1056` —
      `ROLES_FICHAS_UPLOAD`/`ROLES_FICHAS_LECTURA` son arreglos de rol
      reutilizados vía `requireRoles(...ROLES_FICHAS_UPLOAD)` (spread): el
      guardián de `catalogo.test.ts` no resuelve constantes indirectas, solo
      `requireRoles('a', 'b')` y `rolesAutorizados = [...]` literales, así que
      `'resident'` sobrevivía ahí sin que ningún test lo detectara. Quitado de
      ambos arreglos (ya incluían `'residencia'`). **Deuda para otro change:**
      el guardián tiene este punto ciego estructural; no se corrige aquí por
      alcance.

## 4. Fix — alta de usuarios y seed

- [x] 4.1 `apps/auth/src/main.ts:391` — cambiar el default de
      `rol_global: roles || ['resident']` a `['residencia']` en
      `POST /api/v1/auth/register`.
- [x] 4.2 `apps/auth/src/main.ts:946` — mismo cambio de default en
      `POST /admin/users`.
- [x] 4.3 `apps/auth/src/validation/schemas/register.schema.ts` — actualizar
      el comentario que documenta el default `roles || ['resident']`.
- [x] 4.4 `apps/auth/prisma/seed.ts` (líneas 16, 147, 156) — cambiar el rol del
      usuario semilla de `'resident'` a `'residencia'`.

## 5. Fix — frontend (`apps/app-shell`)

- [x] 5.1 `apps/app-shell/src/components/ComparativaDetail.tsx:861` — quitar
      `'resident'` de `isResident` (ya incluye `'residencia'`).
- [x] 5.2 `apps/app-shell/src/components/Layout.tsx` — quitar `'resident'` de
      las líneas 107 y 112 (ya incluyen `'residencia'`); quitar `'compras'`
      de las 6 líneas que ya incluyen `'procurement'` (107, 109, 110, 111,
      114, 115).
- [x] 5.3 `apps/app-shell/src/context/TenantContext.tsx:180` — usuario demo:
      renombrar `'compras'` → `'procurement'` (único lugar frontend donde el
      canónico no está ya presente junto al alias).

## 6. Fix — fixtures de test que usan el alias

- [x] 6.1 Renombrar `'resident'` → `'residencia'` en los 8 archivos de
      `apps/compras/test/integration/` listados en `proposal.md` (Impact) —
      tests positivos, el endpoint ya acepta `residencia` tras la sección 3,
      la aserción esperada no cambia.
- [x] 6.2 Renombrar `'resident'` → `'residencia'` en
      `apps/compras/test/e2e/seguridad.e2e.test.ts`,
      `apps/finanzas/test/e2e/seguridad.e2e.test.ts`,
      `apps/control-proyectos/test/e2e/seguridad.e2e.test.ts` y
      `apps/auth/test/integration/centro-costos-alta.integration.test.ts` —
      tests negativos (esperan 403); confirmado que `residencia` tampoco está
      autorizado en ninguno de los cuatro endpoints, la aserción no cambia.
- [x] 6.3 Renombrar `'resident'` → `'residencia'` en los 3 mocks de
      `apps/app-shell/src/components/ComparativaDetail.{confirmacion-proyecto-firma,evaluacion-especificacion,firma-seleccion}.test.tsx`.
      Verificado en verde con `vitest run` (12 archivos, 29 tests de
      `ComparativaDetail.*`, más suite completa de `app-shell`: 244/245 en
      verde, 1 falla ajena — `InsumosView.catalogo-scroll.test.tsx`, sin
      relación con roles, pasa aislado — flaky preexistente de la corrida
      completa).
- [x] 6.4 No tocar `apps/auth/src/project-access-policy.test.ts` (usa
      `'compras'`/`'residente'` en un contexto de exclusión no relacionado al
      catálogo, confirmado en la auditoría de 1.3 y releído para esta tarea).
      Tampoco `packages/auth-middleware/src/middleware.test.ts:53` (usa
      `'resident'` como string genérico para probar matching de roles, no
      valida contra el catálogo — releído y confirmado, suite en verde tal
      cual).

## 7. Fix — catálogo

- [x] 7.1 `packages/roles/src/index.ts` — retirar por completo las entradas
      `resident`, `compras` y `technical` de `ROLES`. Los 7 tests de
      `catalogo.test.ts` pasan en verde, incluido el guardián nuevo de 2.1.

## 8. Fix — migración de datos

- [x] 8.1 Terminar `apps/auth/scripts/migrar-roles-alias.ts` (patrón de
      `apps/personal/scripts/migrar-config-nomina-proyecto.ts`): recorre
      usuarios con `resident`, `compras` o `technical` en `rol_global`,
      reescribe esas entradas a `residencia`, `procurement`,
      `gerencia_tecnica` respectivamente, preservando el resto del array y sin
      duplicar si el canónico ya estuviera presente. Loguea conteo por alias.
- [x] 8.2 Agregar el script `migrar:roles-alias` a `apps/auth/package.json`,
      igual que `migrar:config-nomina` en `apps/personal/package.json`.
- [x] 8.3 Corrido contra la BD local (Docker, `bocam-postgres`) dos veces
      seguidas. Primera corrida: 1 usuario migrado (`residente@alfa.bocam.com`,
      que ya traía `['resident', 'residencia']` en BD — el script depuró
      correctamente sin duplicar). Segunda corrida: 0 usuarios migrados,
      confirmando idempotencia.

## 9. Verificación

- [x] 9.1 Los 3 tests de la sección 2 pasan en verde tras el fix, incluido 2.3
      corrido contra Postgres real (Docker): "register: sin roles explícitos,
      el default es residencia" y el equivalente de `admin/users` POST, ambos
      `ok`.
- [x] 9.2 Suite completa `packages/roles/src/catalogo.test.ts` en verde (7/7).
- [x] 9.3 Todas las suites verificadas en verde, incluidas las de BD real
      (Docker disponible en esta corrida):
      `packages/roles`, `apps/auth` (unitaria + 3 integration: login/register/
      refresh 10/10, admin-users 6/6, centro-costos-alta 4/4),
      `packages/auth-middleware`, `apps/app-shell` (vitest completo, 244/245 —
      1 falla ajena a este cambio, ver 6.3), `apps/compras` (8 integration +
      1 e2e, todas `ok`), `apps/finanzas` (e2e seguridad, 12/12),
      `apps/control-proyectos` (e2e seguridad, 3/3).
- [x] 9.4 `npx tsc --noEmit` limpio en `packages/roles`, `apps/auth`,
      `apps/compras`, `apps/almacen`, `apps/gerencia-tecnica`,
      `apps/finanzas`, `apps/control-proyectos`, `apps/app-shell`.
- [x] 9.5 Grep de confirmación repetido tras el fix: `resident`/`technical`
      ya no aparecen como valor de rol en ningún lugar del repo salvo
      comentarios/tests que documentan el retiro (ver lista final en el
      commit); `compras` como rol solo sobrevive en el test explícitamente
      no relacionado de 6.4.
- [x] 9.6 Cubierto por 8.3 + 9.1 + 9.3: el usuario semilla
      `residente@alfa.bocam.com` fue migrado de `['resident', 'residencia']` a
      `['residencia']` por el script de 8.3, y las suites de integración de
      `apps/compras` (que usan exactamente `roles: ['residencia']` contra
      endpoints que antes también aceptaban `resident`) pasan en verde contra
      la BD real — no se hizo un login manual adicional por ser redundante con
      esta evidencia.

## 10. Despliegue y cierre

- [x] 10.1 Branch `fix/rbac-migracion-alias-resident-technical-compras`,
      commits con tests + fix.
- [x] 10.2 PR contra `main` referenciando este change de OpenSpec:
      https://github.com/GRojas-n8n/ERP-Modular-Bocam/pull/103
- [ ] 10.3 Tras merge: desplegar los servicios afectados (`auth`, `compras`,
      `almacen`, `gerencia-tecnica`, `finanzas`, `app-shell`), correr
      `migrar:roles-alias` en el VPS, y verificar
      `SELECT count(*) FROM users WHERE rol_global && ARRAY['resident','compras','technical'];`
      = 0.
- [ ] 10.4 Verificación en producción (login real de un usuario migrado) y
      archivar el change (`openspec archive`).
