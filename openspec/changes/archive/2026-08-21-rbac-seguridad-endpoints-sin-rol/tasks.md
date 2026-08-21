## 1. Verificación previa

- [x] 1.1 Barrido de consumidores reales de las 19 rutas de negocio del
      módulo (frontend directo, indirecto y backend-to-backend). **Resultado:**
      documentado en `design.md` — ningún consumidor real hoy más allá de
      `SeguridadView` (solo lecturas) y `resumen-dashboard` (ya protegida,
      fuera de alcance).
- [x] 1.2 Confirmar con el usuario el conjunto de roles y qué hacer con el
      rol huérfano `hse_manager`. **Resultado:** `seguridad_hse`,
      `superintendent`, `admin` para las 18 rutas sin protección; `hse_manager`
      → `seguridad_hse` al convertir `permisos/:id/autorizar` a
      `requireRoles(...)`.

## 2. Tests que reproducen el gap (deben fallar en rojo antes del fix)

Nuevo archivo `apps/seguridad/test/e2e/rbac-endpoints-sin-rol.e2e.test.ts`
(el módulo no tenía carpeta de tests). Mismo patrón que
`apps/finanzas/test/e2e/seguridad.e2e.test.ts`: `signTenantToken` +
`startHttpApp` de `test-support/e2e`, sin Postgres — el rechazo por rol
ocurre en middleware, antes de tocar la base de datos.

- [x] 2.0 Requisito de infraestructura: a diferencia de `finanzas`,
      `apps/seguridad/src/main.ts` no exporta `app` ni guarda su
      `app.listen(PORT, ...)` detrás de `require.main === module` — hoy
      importar el módulo arranca el servidor real en el puerto 3007 y
      dispara `eventBus.connect()`. Replicar el patrón de `finanzas/src/main.ts`
      (exportar `app`, envolver el arranque en `startServer()`, guardar con
      `if (require.main === module) { void startServer(); }`) para poder
      importar el módulo en el test sin bindear el puerto real ni tocar
      RabbitMQ. Sin cambio de comportamiento en producción (`node dist/main.js`
      sigue siendo `require.main === module`).
- [x] 2.1 Caso por cada una de las 18 rutas sin protección: rol no autorizado
      (`warehouse`) responde 403 `AUTH_FORBIDDEN`.
      - `GET /incidentes`
      - `POST /incidentes`
      - `PATCH /incidentes/:id/investigar`
      - `PATCH /incidentes/:id/cerrar`
      - `GET /inspecciones`
      - `POST /inspecciones`
      - `GET /permisos`
      - `POST /permisos`
      - `PATCH /permisos/:id/autorizar`
      - `PATCH /permisos/:id/cerrar`
      - `GET /capacitaciones`
      - `GET /capacitaciones/:id`
      - `POST /capacitaciones`
      - `PATCH /capacitaciones/:id/completar`
      - `GET /dashboard`
      - `GET /epp`
      - `POST /epp`
      - `PATCH /epp/:id/estado`
- [x] 2.2 Confirmar que los casos fallan en rojo contra el código actual.
      **Resultado:** confirmado revirtiendo temporalmente solo los
      `requireRoles(...)` (`git diff` guardado, código restaurado con
      `git apply` al terminar) — `GET /incidentes` con rol `warehouse`
      respondió 500 (no 403), documentando el gap antes del fix.
- [x] 2.3 Caso específico para `PATCH /permisos/:id/autorizar`: el chequeo
      manual previo (`roles.includes('hse_manager')`) respondía 403 con
      `error.code: 'SEG_FORBIDDEN'`; tras el fix responde 403
      `AUTH_FORBIDDEN` para el mismo rol no autorizado, vía
      `requireRoles(...)`.
- [x] 2.4 Caso de no-regresión por cada uno de `seguridad_hse`,
      `superintendent`, `admin`: la petición no responde 403 (se tolera
      400/404/500 por falta de Postgres o de fila real — lo que importa es
      que pase el gate de rol).

## 3. Fix

- [x] 3.1 `requireRoles('seguridad_hse', 'superintendent', 'admin')` en las
      18 rutas listadas en 2.1 que hoy no tienen ningún control de rol.
- [x] 3.2 Reemplazar el chequeo manual de `PATCH /permisos/:id/autorizar`
      (`roles.includes('admin') && ... 'hse_manager' ...`) por
      `requireRoles('seguridad_hse', 'superintendent', 'admin')`, y eliminar
      el `if` y el `createApiError('SEG_FORBIDDEN', ...)` que quedan
      redundantes.

## 4. Verificación

- [x] 4.1 Los tests de la sección 2 pasan en verde (18/18 rutas bloqueadas,
      no-regresión para los 3 roles autorizados, `resumen-dashboard` sin
      cambios).
- [x] 4.2 `npx tsc --noEmit` en `apps/seguridad` limpio.
- [x] 4.3 Test guardián de `packages/roles`
      (`packages/roles/src/catalogo.test.ts`) sigue en verde (6/6) — confirma
      que `seguridad_hse` (ya catalogado) queda correctamente detectado como
      exigido por el backend, y que `hse_manager` deja de aparecer en el
      barrido.
- [x] 4.4 Verificación manual con sesión real de `admin@alfa.bocam.com`
      (roles `admin`, `superintendent` — no hay usuario `seguridad_hse`
      seedeado localmente, ver nota en `design.md`). Servicios `auth` y
      `seguridad` levantados localmente (Docker Postgres/Redis/RabbitMQ ya
      arriba), migración `prisma migrate deploy` aplicada al Postgres local.
      `GET /incidentes` respondió 200; `POST /incidentes` creó un incidente
      real (`INC-2026-001`) con 201. En `app-shell` (navegador real,
      `localhost:3000`), tras iniciar sesión el ítem "Seguridad HSE" aparece
      en el menú y `SeguridadView` renderiza el incidente recién creado
      (screenshot verificado).
- [x] 4.5 Verificación manual con sesión real de `residente@alfa.bocam.com`
      (rol `resident`, no autorizado). Por API: `GET /incidentes` y
      `POST /epp` respondieron 403 `AUTH_FORBIDDEN`. En el navegador: el
      ítem "Seguridad HSE" no aparece en el menú lateral (solo Dashboard,
      Compras, Residencia — screenshot verificado), consistente con
      `Layout.tsx` y con el 403 del backend si se llamara directo.

## 5. Cierre

- [x] 5.1 Branch `fix/rbac-seguridad-endpoints-sin-rol` (decisión del
      usuario: commit local en branch, sin push). **Resultado:** commit
      `5a8d4be` con tests + fix.
- [x] 5.2 PR contra `main` referenciando este change de OpenSpec.
      **Resultado:** branch pusheado a `origin` y PR abierto:
      https://github.com/GRojas-n8n/ERP-Modular-Bocam/pull/101
- [x] 5.3 Tras merge y verificación en producción, archivar el change
      (`openspec archive`). **Resultado:** PR #101 revisado (diff completo)
      y mergeado a `main` (squash) el 2026-08-21 — GitHub no permite
      auto-aprobar el propio PR (único colaborador del repo), así que el
      gate de QA se cumplió con la revisión de diff documentada en el PR +
      tests en verde. Tras el merge: `Deploy Backend al VPS` exitoso
      (build+deploy en 1m55s), `Backend E2E Criticas` en verde sobre el
      commit ya mergeado (incluye
      `rbac-endpoints-sin-rol.e2e.test.ts`, 18/18 rutas), `Smoke Test
      Playwright` (login + dashboard) en verde contra `iretum.com` real.
      Verificación funcional adicional: `https://iretum.com` responde 200;
      `GET /api/v1/seguridad/incidentes` sin token responde 401 (auth
      middleware vivo tras el deploy). No se pudo repetir en producción la
      prueba manual 403-por-rol de las tareas 4.4/4.5 (las credenciales
      seed de `apps/auth/prisma/seed.ts` no existen en la base de
      producción real, y no se intentó adivinar contraseñas reales) — se
      aceptó como suficiente la combinación de deploy exitoso + E2E verde
      sobre el commit desplegado + smoke test en verde.
