## 1. Política de contraseñas

- [x] 1.1 Tests primero en `apps/auth/src/password-policy.test.ts`: longitud mínima, distinta de la actual, no la de arranque, tolerancia a espacios accidentales al copiar.
- [x] 1.2 Implementar `password-policy.ts` con `LONGITUD_MINIMA_PASSWORD`, `validarPasswordNueva` y `esPasswordDeArranque`.
- [x] 1.3 Orden de los chequeos: la contraseña de arranque se comprueba **antes** que la longitud. `Bocam2026!` mide 10 caracteres, así que si no el usuario recibe «muy corta» en vez del motivo real. Lo destapó el test al fallar con `AUTH_PASSWORD_MUY_CORTA` en vez de `AUTH_PASSWORD_DE_ARRANQUE`.

## 2. Endpoints

- [x] 2.1 `POST /api/v1/auth/logout`: revoca el token presentado, o toda la cadena sin `refresh_token` / con `todas: true`. Acotado por el `user_id` del JWT.
- [x] 2.2 Idempotente: cerrar una sesión ya cerrada responde 200 con `sesiones_cerradas: 0`.
- [x] 2.3 `POST /api/v1/auth/change-password`: verifica la actual con `bcrypt.compare`, aplica la política, actualiza el hash y revoca **todas** las sesiones del usuario.
- [x] 2.4 Rate limit de 5 por ventana en el cambio de contraseña — el endpoint verifica la contraseña actual, así que sin techo es un oráculo.
- [x] 2.5 Schemas Zod en `validation/schemas/sesion.schema.ts`.
- [x] 2.6 Verificado que ninguno de los dos entra en `excludePaths`: ambos exigen JWT. Comprobado también que el `excludeByPrefix` de `/api/v1/auth/login` no captura `/logout` — el prefijo exige `path + '/'`.

## 3. Frontend

- [x] 3.1 `logoutApi` y `changePasswordApi` en `lib/api.ts`.
- [x] 3.2 `TenantContext.logout()` revoca en el servidor antes de limpiar tokens, sin esperar la respuesta: el usuario pidió salir y debe salir aunque el backend esté caído.
- [x] 3.3 `CambiarPasswordDialog` con confirmación de la contraseña nueva y aviso de que se cerrarán todas las sesiones.
- [x] 3.4 Botón «Cambiar contraseña» en el bloque de usuario del sidebar. El diálogo se monta en el `return` de nivel superior, no dentro de `renderSidebarContent()`, que se invoca dos veces (escritorio y overlay móvil) y lo duplicaría en el DOM.
- [x] 3.5 El diálogo muestra el mensaje del servidor, no uno genérico: la política real vive en el backend y el usuario necesita leer el motivo.

## 4. Verificación

- [x] 4.1 `password-policy` 8/8 · `apps/auth` 45/45 · `apps/app-shell` 245/245.
- [x] 4.2 `tsc --noEmit` limpio en `apps/auth` y `apps/app-shell`.
- [x] 4.3 Sin cambio de esquema: `RefreshToken.revoked` ya existía y `POST /auth/refresh` ya lo usaba al rotar. No hace falta migración.
- [ ] 4.4 Probar contra Postgres en CI: cerrar sesión y confirmar que el refresh token revocado devuelve 401 en `POST /auth/refresh`.
- [ ] 4.5 En `iretum.com`: que cada usuario del piloto cambie la contraseña de arranque el primer día. Mientras esté compartida, el registro de auditoría no distingue quién hizo qué.

## 5. Nota operativa

Este change da la herramienta, no resuelve el problema por sí solo. La contraseña
de arranque sigue siendo válida hasta que cada usuario la cambie, y nada lo
fuerza todavía (forzar el cambio en el primer inicio de sesión quedó fuera de
alcance). Hasta entonces, cualquier acción registrada a nombre de un usuario
pudo ejecutarla otra persona.

Si alguien pierde su contraseña durante el piloto, la vía es que un
administrador la reponga con `PATCH /api/v1/auth/admin/users/:id`, que ya acepta
`password`. No hay recuperación por correo.
