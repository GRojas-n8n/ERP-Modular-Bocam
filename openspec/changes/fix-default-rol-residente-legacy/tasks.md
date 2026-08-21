## 1. Verificación previa

- [x] 1.1 Confirmar por lectura que ningún test existente del repo asume
      `rol_global: ['resident']` como resultado esperado de un alta sin rol
      (buscar `'resident'` en `apps/auth/test/` y `apps/*/test/`). Si algún
      test lo asume, listarlo aquí para actualizarlo en la sección 3.
      **Resultado:** ningún test depende del fallback implícito (todos los
      usos de `'resident'` en `apps/auth/test/` y `apps/{compras,finanzas,
      control-proyectos}/test/` lo mandan explícito en `roles`/`signTenantToken`,
      no dependen de que `roles` venga `undefined`) — fuera de alcance de
      este fix. Hallazgo colateral, no tocado: al correr
      `validacion-zod-admin-users.integration.test.ts` contra el código
      actual, `testCrearUsuarioPayloadValidoSigueFuncionando` (línea 70) ya
      falla hoy en rojo — 400 en vez de 201 — porque envía `roles: ['resident']`
      explícito y `crearUsuarioSchema` rechaza alias en el alta (por diseño,
      según el comentario del propio schema). Es un bug preexistente,
      independiente de este cambio (mi fix no toca la validación de roles
      explícitos, solo el default cuando `roles` viene ausente); no se
      corrige aquí por no tener spec propio — reportado al usuario.

## 2. Tests que reproducen el bug (deben fallar en rojo antes del fix)

Nuevo archivo `apps/auth/test/integration/alta-usuario-rol-default.integration.test.ts`,
mismo patrón que `validacion-zod-admin-users.integration.test.ts` (`signTenantToken`
+ `startHttpApp`/`stopHttpApp` de `test-support/e2e`, tenant y usuario de
prueba creados y limpiados por test, Postgres real).

- [x] 2.1 `POST /api/v1/auth/register` con email/password/nombre/tenant_id
      válidos y sin campo `roles` → el usuario creado en BD tiene
      `rol_global: ['residencia']` (falla hoy: es `['resident']`).
- [x] 2.2 `POST /api/v1/auth/admin/users` (con token `admin`) con
      email/password/nombre válidos y sin campo `roles` → el usuario creado
      en BD tiene `rol_global: ['residencia']` (falla hoy: es `['resident']`).
- [x] 2.3 Caso de no-regresión: `POST /api/v1/auth/admin/users` con
      `roles: ['procurement']` explícito sigue creando el usuario con
      `rol_global: ['procurement']` (el fallback no debe interferir cuando sí
      se manda un rol).
- [x] 2.4 Confirmar que 2.1 y 2.2 fallan en rojo contra el código actual
      antes de aplicar el fix. **Resultado:** confirmado —
      `testRegisterSinRolAsignaResidencia` falla con `actual: ['resident']`
      vs `expected: ['residencia']` contra el código sin el fix.

## 3. Fix

- [x] 3.1 `apps/auth/src/main.ts:391` — cambiar `roles || ['resident']` a
      `roles || ['residencia']` en `POST /api/v1/auth/register`. Además
      actualizado el comentario de `register.schema.ts` que citaba el
      default viejo.
- [x] 3.2 `apps/auth/src/main.ts:946` — cambiar
      `Array.isArray(userRoles) ? userRoles : ['resident']` a
      `Array.isArray(userRoles) ? userRoles : ['residencia']` en
      `POST /api/v1/auth/admin/users`.
- [x] 3.3 `apps/auth/prisma/seed.ts:147` — cambiar
      `rol_global: ['resident']` a `rol_global: ['residencia']` para el
      usuario semilla `residente@alfa.bocam.com` (y ajustado el
      `console.log` de la línea 156 y la tabla de cabecera del archivo, que
      también mencionaban `resident`).

## 4. Verificación

- [x] 4.1 Los tests de la sección 2 pasan en verde (2.1, 2.2, 2.3).
      **Resultado:** los 3 casos de `alta-usuario-rol-default.integration.test.ts`
      pasan (`ok`) tras el fix.
- [x] 4.2 `npx tsc --noEmit` en `apps/auth` limpio. **Resultado:** sin salida
      (limpio).
- [x] 4.3 Suite existente de `apps/auth` sigue en verde. **Resultado:**
      `npm test` (unitarios) 45/45 verdes;
      `validacion-zod-login-register-refresh.integration.test.ts` 9/9 verde;
      `validacion-zod-admin-users.integration.test.ts` sigue con el mismo
      fallo preexistente de `testCrearUsuarioPayloadValidoSigueFuncionando`
      (400 en vez de 201, documentado en 1.1) — confirmado que es
      exactamente el mismo fallo antes y después del fix (mismo mensaje,
      mismo 400), así que este cambio no lo causó ni lo empeoró. No se
      corrige aquí por estar fuera de alcance (ver 1.1).
- [x] 4.4 Test guardián de `packages/roles` sigue en verde. **Resultado:**
      `npm test` en `packages/roles` — 6/6 verde.
- [x] 4.5 Verificación manual: con `auth` levantado localmente
      (Postgres/Redis/RabbitMQ en Docker ya arriba), crear un usuario nuevo
      vía `POST /api/v1/auth/admin/users` sin `roles` y confirmar que quedó
      `residencia`. Limpiar el usuario de prueba al terminar. **Resultado:**
      login real como `admin@alfa.bocam.com`, `POST .../admin/users` con
      `{email, password, nombre}` (sin `roles`) → respuesta
      `"roles":["residencia"]`; usuario de prueba eliminado de BD al
      terminar (`prisma.user.deleteMany`, 1 fila borrada).

## 5. Cierre

- [ ] 5.1 Commit en branch `fix/default-rol-residente-legacy` (confirmar con
      el usuario si va con push directo o PR, siguiendo el patrón de
      `fix-rbac-seguridad-endpoints-sin-rol`).
- [ ] 5.2 PR contra `main` referenciando este change de OpenSpec.
- [ ] 5.3 Tras merge, archivar el change (`openspec archive`).
