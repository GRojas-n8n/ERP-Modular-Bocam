## 1. Backend — editar email

- [x] 1.1 En `apps/auth/src/validation/schemas/admin-users.schema.ts`, agregar `email: z.string().trim().email().max(255).optional()` a `actualizarUsuarioSchema`.
- [x] 1.2 En `apps/auth/src/main.ts`, handler `PATCH /api/v1/auth/admin/users/:id`: incluir `email` en la desestructuración de `parsed` y en `updateData` (`if (email !== undefined) updateData.email = email;`).
- [x] 1.3 Envolver el `prisma.user.update` (o el bloque `createTenantContext` del PATCH) para capturar `PrismaClientKnownRequestError` con `code === 'P2002'` y responder `409 { code: 'ADMIN_EMAIL_DUPLICADO', message: 'Ese email ya está en uso por otro usuario.' }` en vez de caer al catch genérico 500.
- [x] 1.4 Test en `apps/auth/test/integration/validacion-zod-admin-users.integration.test.ts` (o archivo nuevo si el existente es solo de schema): PATCH con email válido y distinto se actualiza; PATCH con email de formato inválido devuelve 400; PATCH con email duplicado dentro del mismo tenant devuelve 409 y no modifica el usuario.
- [x] 1.5 Confirmar (con test o lectura del código, línea ~247 de `main.ts`) que el login ya rechaza `activo: false` — si no lo hiciera, agregar el chequeo aquí. (Confirmado: `if (!user || !user.activo)` ya responde 401 AUTH_INVALID_CREDENTIALS.)

## 2. Frontend — editar email

- [x] 2.1 En `AdminView.tsx` → `UserModal`, quitar la condición `!isEdit` que oculta el campo Email: mostrarlo siempre, editable en ambos modos.
- [x] 2.2 Ajustar `handleSubmit` de `UserModal` para incluir `email` en el `body` del `PATCH` cuando `isEdit` (ya se envía en el `POST` de creación).
- [x] 2.3 Manejar en la UI el error 409 de email duplicado devuelto por el backend (ya existe manejo genérico de `error.message` en el catch — verificado que el mensaje del backend se muestra tal cual, sin cambios adicionales).

## 3. Backend — sin cambios para archivar/reactivar

- [x] 3.1 Confirmar que el `PATCH` existente soporta `activo: boolean` de forma aislada (sin exigir otros campos) — ya es el caso; no se requiere código nuevo en `apps/auth` para esta parte.

## 4. Frontend — archivar / reactivar

- [x] 4.1 En la fila de cada usuario en la tabla de `AdminView.tsx` (junto al botón "Editar"), agregar un botón "Archivar" que se muestra cuando `u.activo === true`, y un botón "Reactivar" cuando `u.activo === false`.
- [x] 4.2 Agregar estado `confirmArchivarUsuario` / `confirmReactivarUsuario` (o uno combinado con la acción) y dos `ConfirmCriticalActionDialog` (variante `destructive` para Archivar, default para Reactivar), siguiendo el patrón de `confirmEliminarCategoria` ya presente en el mismo archivo.
- [x] 4.3 Implementar `handleArchivarUsuario(id)` / `handleReactivarUsuario(id)` que llaman `api.patch('/api/v1/auth/admin/users/:id', { activo: false | true })` y luego `loadAll()`.
- [x] 4.4 Impedir (deshabilitar el botón o mostrar aviso) que un admin archive su propia cuenta — comparar `u.id` contra el usuario de sesión (`useTenant().user`); si no es trivial obtener el id propio, documentar el riesgo conocido en vez de bloquear (ver design.md, sección Risks) y omitir esta tarea. (Resuelto: `useTenant().user.id` sí está disponible; el botón "Archivar" se deshabilita cuando `u.id === user?.id`.)

## 5. Tests frontend

- [x] 5.1 Nuevo archivo `apps/app-shell/src/views/AdminView.editar-archivar-usuario.test.tsx`: el modal de edición muestra y permite cambiar el campo Email; el botón "Archivar" abre confirmación y llama al PATCH con `activo: false`; el botón "Reactivar" llama al PATCH con `activo: true`; cancelar el diálogo no dispara ninguna llamada.

## 6. Verificación

- [x] 6.1 Correr suite de `apps/auth` (`npm test` o el comando del proyecto) y confirmar que pasan los tests nuevos y existentes de admin-users. (`npm test`: 45/45 unit tests; test de integración `validacion-zod-admin-users.integration.test.ts` corrido aparte contra Postgres local: 8/8 casos, incluyendo los 3 nuevos de email.)
- [x] 6.2 Correr suite de `apps/app-shell` y confirmar que pasan los tests nuevos y existentes de `AdminView`. (`npx vitest run`: 83 archivos / 288 tests, todos en verde.)
- [x] 6.3 Probar manualmente en dev (skill `run-app-shell`): editar el email de un usuario, archivar un usuario y confirmar que no puede iniciar sesión, reactivarlo y confirmar que sí puede. (Verificado en navegador real contra `apps/auth` + `apps/app-shell` corriendo localmente: cambio de email persiste y refleja en sesión; "Archivar" en Carlos R. pide confirmación con su nombre, lo marca "Inactivo" y cambia su botón a "Reactivar"; "Reactivar" lo regresa a activo. Además se confirmó en vivo que el botón "Archivar" de la propia cuenta en sesión está deshabilitado — Playwright rechazó el clic por `element is not enabled`, y el login vía API ya rechazaba credenciales del usuario archivado mientras estuvo inactivo.)
