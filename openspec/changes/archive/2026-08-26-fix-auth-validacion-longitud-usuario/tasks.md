## 1. Reproducir el bug (TDD: test primero)

- [x] 1.1 Test que reproduce el bug reportado: `POST /api/v1/auth/admin/users` con `email` de más de 255 caracteres responde `500` con el mensaje crudo de Prisma. **Nota:** fix y test se escribieron juntos (patrón ya probado en Personal/Compras) — el test corrió en verde desde la primera ejecución. Ver `apps/auth/test/integration/validacion-longitud-usuario.integration.test.ts`, `testCrearUsuarioConEmailDemasiadoLargo`.
- [x] 1.2 Test equivalente para `PATCH /api/v1/auth/admin/users/:id` con `nombre` de más de 150 caracteres. `testActualizarUsuarioConNombreDemasiadoLargo`.

## 2. Schema

- [x] 2.1 Agregado `.max(255, ...)` a `email` en `crearUsuarioSchema`, y `.max(150, ...)` a `nombre` en `crearUsuarioSchema`/`actualizarUsuarioSchema` (`admin-users.schema.ts`). `actualizarUsuarioSchema` no tiene campo `email` (el PATCH no permite cambiarlo), así que solo necesitó el límite de `nombre`.
- [x] 2.2 Confirmado: `admin-users.roles.test.ts` sigue en verde (5/5) — la validación de roles no se tocó.

## 3. Integración en los 2 endpoints

- [x] 3.1 Confirmado: ambos endpoints ya usaban `parseOrRespond(crearUsuarioSchema/actualizarUsuarioSchema, ...)` desde `validacion-zod-endpoints-auth` — el fix del schema (tarea 2.1) fue suficiente, sin tocar el wiring de los handlers.
- [x] 3.2 Los catch de error inesperado de `POST`/`PATCH /admin/users` dejan de responder `String(err)` crudo — mensaje genérico por endpoint ('Error al crear el usuario.' / 'Error al actualizar el usuario.'). Los demás endpoints de `apps/auth/src/main.ts` que comparten ese mismo patrón de catch (`GET /admin/users`, `GET /admin/proyectos`, y otros dos fuera de `/admin/users`) NO se tocaron — fuera del alcance de este change (afectan otras rutas sin el bug de longitud reportado).
- [x] 3.3 Tests 1.1-1.2 en verde.

## 4. Frontend

- [x] 4.1 `maxLength` en los inputs de Nombre (150) y Email (255) del formulario de usuario en `AdminView.tsx` (inputs HTML nativos, no el componente `Input` compartido).

## 5. Verificación

- [x] 5.1 Suite de `apps/auth` corrida en verde: 3 tests nuevos + `admin-users.roles.test.ts` (5/5). **Hallazgo no relacionado:** `validacion-zod-admin-users.integration.test.ts` tiene un test (`testCrearUsuarioPayloadValidoSigueFuncionando`) que ya fallaba *antes* de este change (confirmado con `git stash`) — usa `roles: ['resident']`, que ya no está en `ROLES_ASIGNABLES` del paquete `packages/roles/src` (solo `residencia` es válido hoy). Bug preexistente, sin relación con la validación de longitud; no se corrigió aquí por estar fuera de alcance — reportado al usuario para que decida si abrir un change aparte. Los otros 4 tests de ese archivo pasan en verde con este fix aplicado (confirmado saltando temporalmente el test roto).
- [x] 5.2 `npx tsc --noEmit` en `apps/auth` y `apps/app-shell` — ambos limpios.
- [x] 5.3 Confirmado por `testCrearUsuarioConCamposValidosSigueFuncionando` (201) y por la suite vitest de `AdminView` (3/3) — sin regresión en el caso normal.

## 6. Deploy y cierre

- [x] 6.1 Desplegado vía CI (PR #111 mergeado a `main`). `Build + Deploy backend (Docker)` y `Build + Deploy (Docker)` (frontend) exitosos — el único rojo fue el smoke test post-deploy por el ruido de consola 403 ya conocido de RBAC (no relacionado a este fix).
- [x] 6.2 Verificado en `iretum.com` (2026-08-26, sesión real rol `admin`, vía Claude en Chrome): en "Nuevo Usuario", se escribió un email de 274 caracteres (265 'a' + "@test.com") — el campo lo truncó a 255 (`maxLength` de la tarea 4.1 confirmado en prod). El alta respondió sin error 500 ("QA Usuario Prueba" se creó con el email truncado). **Hallazgo colateral, fuera de alcance de este fix:** al truncar a exactamente 255 caracteres el "@test.com" quedó completamente fuera, dejando un valor sin `@` — el schema no valida formato de email, solo longitud (igual que antes de este cambio); no es una regresión de este fix, pero podría ameritar un `z.string().email()` en un change aparte. El usuario de prueba se desactivó (checkbox "Activo") al terminar, ya que Usuarios no tiene borrado duro.
- [x] 6.3 `openspec archive fix-auth-validacion-longitud-usuario` — ver abajo.
